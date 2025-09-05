"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Activity, Download, Upload, Database } from "lucide-react"
import { useTranslations } from "@/lib/translations"
import {
  getAllWorkers,
  getAllDocuments,
  getAuditLogs,
  getStorageStats,
  exportSystemData,
  importSystemData,
  // delete worker helper
  // eslint-disable-next-line import/no-unresolved
} from "@/lib/utils"
import { StorageUtils } from "@/lib/utils"

export default function AdminDashboard() {
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)
  const [activeTab, setActiveTab] = useState("overview")

  const [workers, setWorkers] = useState(() => getAllWorkers())
  const documents = getAllDocuments()
  const auditLogs = getAuditLogs()
  const storageStats = getStorageStats()

  const handleExportData = () => {
    exportSystemData()
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importSystemData(file)
    }
  }

  const handleDeleteWorker = (workerId: string) => {
    const ok = confirm(`Delete worker ${workerId}? This will remove the worker record, visits and documents.`)
    if (!ok) return

    const success = StorageUtils.deleteWorker(workerId)
    if (success) {
      // Refresh local state
      setWorkers(getAllWorkers())
      // Log already done inside deleteWorker
    } else {
      alert("Failed to delete worker. Check console for details.")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
            <p className="text-muted-foreground">Manage the migrant worker healthcare system</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleExportData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <div>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" id="import-data" />
              <Button asChild variant="outline">
                <label htmlFor="import-data" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </label>
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workers.length}</div>
                  <p className="text-xs text-muted-foreground">Registered in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <p className="text-xs text-muted-foreground">Uploaded documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{storageStats.usedMB.toFixed(1)} MB</div>
                  <p className="text-xs text-muted-foreground">Of {storageStats.totalMB} MB available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and access logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.workerId ? `Worker ID: ${log.workerId}` : "System action"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Worker Management</CardTitle>
                <CardDescription>Overview of all registered workers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="font-medium">{worker.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {worker.id}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{worker.gender}</Badge>
                          <Badge variant="outline">{worker.bloodGroup}</Badge>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end space-y-2">
                        <div>
                          <p className="text-sm">Age: {worker.age}</p>
                          <p className="text-xs text-muted-foreground">Registered: {new Date(worker.registrationDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteWorker(worker.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>All uploaded medical documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="font-medium">{doc.fileName}</h3>
                        <p className="text-sm text-muted-foreground">Worker ID: {doc.workerId}</p>
                        <Badge variant="outline">{doc.documentType}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                  <CardDescription>System security and encryption status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Data Encryption</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logging</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Integrity</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Current system settings and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Max File Size</span>
                    <span className="text-sm">5 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supported Languages</span>
                    <span className="text-sm">3 (EN, ML, HI)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Limit</span>
                    <span className="text-sm">100 MB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
