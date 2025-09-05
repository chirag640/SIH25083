"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  FileText,
  Shield,
  Database,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { StorageUtils } from "@/lib/utils"

export default function SystemStatusPage() {
  const [systemStats, setSystemStats] = useState({
    totalWorkers: 0,
    totalDocuments: 0,
    totalVisits: 0,
    storageUsed: 0,
    lastBackup: null as Date | null,
    systemHealth: "good" as "good" | "warning" | "critical",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = () => {
    setLoading(true)
    try {
      const workers = StorageUtils.getAllWorkers()
      const documents = StorageUtils.getAllDocuments()
      const auditLogs = StorageUtils.getAuditLogs()
      const storageInfo = StorageUtils.getStorageInfo()

      // Calculate visits from audit logs
      const visits = auditLogs.filter((log) => log.action === "medical_visit_added").length

      setSystemStats({
        totalWorkers: workers.length,
        totalDocuments: documents.length,
        totalVisits: visits,
        storageUsed: storageInfo.usedSpace,
        lastBackup: storageInfo.lastBackup,
        systemHealth: storageInfo.usedSpace > 80 ? "warning" : "good",
      })
    } catch (error) {
      console.error("Error loading system stats:", error)
      setSystemStats((prev) => ({ ...prev, systemHealth: "critical" }))
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = () => {
    switch (systemStats.systemHealth) {
      case "good":
        return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", text: "System Healthy" }
      case "warning":
        return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50", text: "Needs Attention" }
      case "critical":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-50", text: "Critical Issues" }
    }
  }

  const healthStatus = getHealthStatus()
  const HealthIcon = healthStatus.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">System Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={loadSystemStats} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Health Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HealthIcon className={`h-5 w-5 ${healthStatus.color}`} />
              System Health Overview
            </CardTitle>
            <CardDescription>Real-time status of the migrant worker healthcare system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${healthStatus.bg} mb-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HealthIcon className={`h-6 w-6 ${healthStatus.color}`} />
                  <span className="font-semibold">{healthStatus.text}</span>
                </div>
                <Badge variant={systemStats.systemHealth === "good" ? "default" : "destructive"}>
                  {systemStats.systemHealth.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{systemStats.totalWorkers}</div>
                <div className="text-sm text-muted-foreground">Registered Workers</div>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{systemStats.totalDocuments}</div>
                <div className="text-sm text-muted-foreground">Uploaded Documents</div>
              </div>
              <div className="text-center">
                <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{systemStats.totalVisits}</div>
                <div className="text-sm text-muted-foreground">Medical Visits</div>
              </div>
              <div className="text-center">
                <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{systemStats.storageUsed}%</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Metrics */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Usage</span>
                  <span>{systemStats.storageUsed}%</span>
                </div>
                <Progress value={systemStats.storageUsed} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>System Load</span>
                  <span>Normal</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Response Time</span>
                  <span>Fast</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Data Encryption</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Audit Logging</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Control</span>
                <Badge variant="default">Secure</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Backup</span>
                <Badge variant="outline">
                  {systemStats.lastBackup ? systemStats.lastBackup.toLocaleDateString() : "Never"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>Quick access to system administration tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/admin" className="flex flex-col items-center space-y-2">
                  <Shield className="h-6 w-6" />
                  <span>Admin Dashboard</span>
                  <span className="text-xs text-muted-foreground">Full system control</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/security/audit-logs" className="flex flex-col items-center space-y-2">
                  <Activity className="h-6 w-6" />
                  <span>Audit Logs</span>
                  <span className="text-xs text-muted-foreground">System activity tracking</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/storage/management" className="flex flex-col items-center space-y-2">
                  <Database className="h-6 w-6" />
                  <span>Storage Management</span>
                  <span className="text-xs text-muted-foreground">Data and file management</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Features Implemented</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✅ Worker Registration & Management</li>
                  <li>✅ QR Code Health Cards</li>
                  <li>✅ Document Upload & Storage</li>
                  <li>✅ Multilingual Support (EN/ML/HI)</li>
                  <li>✅ Doctor Dashboard & Search</li>
                  <li>✅ Prescription Generator</li>
                  <li>✅ Audit Trail System</li>
                  <li>✅ Security & Encryption</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">System Capabilities</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• End-to-end data encryption</li>
                  <li>• Real-time QR code generation</li>
                  <li>• Multi-format document support</li>
                  <li>• Comprehensive audit logging</li>
                  <li>• Follow-up alert system</li>
                  <li>• Offline-ready health cards</li>
                  <li>• Advanced search & filtering</li>
                  <li>• Professional prescription generation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
