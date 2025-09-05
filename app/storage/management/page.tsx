"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Database,
  Download,
  Upload,
  Trash2,
  Shield,
  AlertTriangle,
  HardDrive,
  FileText,
  Users,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { EnhancedStorageManager, SecurityUtils } from "@/lib/utils"

export default function StorageManagementPage() {
  const [storageStats, setStorageStats] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<string>("")

  useEffect(() => {
    loadStorageStats()
  }, [])

  const loadStorageStats = () => {
    const stats = EnhancedStorageManager.getStorageStats()
    setStorageStats(stats)
  }

  const handleExportData = () => {
    setIsExporting(true)
    try {
      const exportData = EnhancedStorageManager.exportAllData()
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `healthrecord-export-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      SecurityUtils.logAccess("data_export", undefined, "health_worker")
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const result = EnhancedStorageManager.importData(jsonData)

        if (result.success) {
          setImportResult(`Successfully imported ${result.imported} records`)
          loadStorageStats()
        } else {
          setImportResult(`Import failed: ${result.message}`)
        }
      } catch (error) {
        setImportResult("Import failed: Invalid file format")
      } finally {
        setIsImporting(false)
      }
    }

    reader.readAsText(file)
  }

  const handleCleanupStorage = () => {
    const success = EnhancedStorageManager.performStorageCleanup()
    if (success) {
      loadStorageStats()
      setImportResult("Storage cleanup completed successfully")
    } else {
      setImportResult("Storage cleanup failed")
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Storage Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Storage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Overview
              </CardTitle>
              <CardDescription>Current storage usage and system statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {storageStats && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Used</span>
                      <span>
                        {formatBytes(storageStats.used)} / {formatBytes(50 * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress value={storageStats.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {storageStats.percentage.toFixed(1)}% of available storage used
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{storageStats.workerCount}</p>
                      <p className="text-sm text-muted-foreground">Workers</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="h-8 w-8 text-chart-1" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{storageStats.documentCount}</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Database className="h-8 w-8 text-chart-2" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{storageStats.itemCount}</p>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-8 w-8 text-chart-3" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{formatBytes(storageStats.available)}</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </div>

                  {storageStats.percentage > 80 && (
                    <Alert className="border-destructive/20 bg-destructive/5">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        Storage is running low. Consider cleaning up old data or exporting records.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Tabs defaultValue="export" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export Data</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Export all worker records, documents, and audit logs for backup or transfer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Export includes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All worker health records (encrypted)</li>
                      <li>• All uploaded documents (encrypted)</li>
                      <li>• System audit logs</li>
                      <li>• Data integrity checksums</li>
                    </ul>
                  </div>

                  <Button onClick={handleExportData} disabled={isExporting} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export All Data"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Data
                  </CardTitle>
                  <CardDescription>Import previously exported data to restore records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Notice
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Only import data from trusted sources</li>
                      <li>• Data integrity will be verified before import</li>
                      <li>• Existing records may be overwritten</li>
                      <li>• Import process is logged for security</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="import-file" className="text-sm font-medium">
                      Select Export File
                    </label>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="w-full p-2 border border-border rounded-md"
                    />
                  </div>

                  {importResult && (
                    <Alert
                      className={
                        importResult.includes("failed")
                          ? "border-destructive/20 bg-destructive/5"
                          : "border-primary/20 bg-primary/5"
                      }
                    >
                      <AlertDescription
                        className={importResult.includes("failed") ? "text-destructive" : "text-primary"}
                      >
                        {importResult}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Storage Maintenance
                  </CardTitle>
                  <CardDescription>Clean up temporary data and optimize storage usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Cleanup will remove:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Old audit log entries (keeping last 500)</li>
                      <li>• Temporary cache files</li>
                      <li>• Orphaned data entries</li>
                      <li>• System temporary files</li>
                    </ul>
                  </div>

                  <Button onClick={handleCleanupStorage} variant="outline" className="w-full bg-transparent">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clean Up Storage
                  </Button>

                  {storageStats && (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Usage</p>
                        <p className="text-lg font-semibold text-foreground">{storageStats.percentage.toFixed(1)}%</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Available Space</p>
                        <p className="text-lg font-semibold text-foreground">{formatBytes(storageStats.available)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
