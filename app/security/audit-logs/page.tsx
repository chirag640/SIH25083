"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Shield,
  Download,
  Eye,
  AlertTriangle,
  User,
  FileText,
  Stethoscope,
  Pill,
  Filter,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface AuditLog {
  timestamp: string
  action: string
  workerId: string
  userType: "health_worker" | "doctor"
  sessionId: string
  ipAddress: string
  metadata?: any
  severity?: "low" | "medium" | "high" | "critical"
  category?: string
}

interface CriticalAuditLog extends AuditLog {
  alertLevel: string
  notificationSent: boolean
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [criticalLogs, setCriticalLogs] = useState<CriticalAuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterUserType, setFilterUserType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = () => {
    // Load regular audit logs
    const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]")
    setLogs(auditLogs.reverse()) // Show most recent first
    setFilteredLogs(auditLogs.reverse())

    // Load critical audit logs
    const criticalAuditLogs = JSON.parse(localStorage.getItem("critical_audit_logs") || "[]")
    setCriticalLogs(criticalAuditLogs.reverse())
  }

  useEffect(() => {
    // Apply filters
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.metadata?.doctorName && log.metadata.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.metadata?.doctorId && log.metadata.doctorId.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action.includes(filterAction))
    }

    if (filterUserType !== "all") {
      filtered = filtered.filter((log) => log.userType === filterUserType)
    }

    if (filterSeverity !== "all") {
      filtered = filtered.filter((log) => log.severity === filterSeverity)
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((log) => log.category === filterCategory)
    }

    if (dateRange !== "all") {
      const now = new Date()
      let cutoffDate = new Date()

      switch (dateRange) {
        case "1h":
          cutoffDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case "7d":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      filtered = filtered.filter((log) => new Date(log.timestamp) > cutoffDate)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, filterAction, filterUserType, filterSeverity, filterCategory, dateRange])

  const exportLogs = () => {
    const csvContent = [
      [
        "Timestamp",
        "Action",
        "Worker ID",
        "User Type",
        "Session ID",
        "IP Address",
        "Severity",
        "Category",
        "Doctor Name",
        "Doctor ID",
        "Medical Context",
      ].join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.action,
          log.workerId,
          log.userType,
          log.sessionId,
          log.ipAddress,
          log.severity || "unknown",
          log.category || "general",
          log.metadata?.doctorName || "",
          log.metadata?.doctorId || "",
          log.metadata?.medicalContext ? JSON.stringify(log.metadata.medicalContext).replace(/,/g, ";") : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `enhanced-audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getActionBadgeVariant = (action: string, severity?: string) => {
    if (severity === "critical") return "destructive"
    if (severity === "high") return "default"
    if (action.includes("failed")) return "destructive"
    if (action.includes("prescription") || action.includes("diagnosis")) return "default"
    if (action.includes("view")) return "secondary"
    return "outline"
  }

  const getSeverityBadgeVariant = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getActionIcon = (action: string, category?: string) => {
    if (action.includes("failed")) return <AlertTriangle className="h-3 w-3" />
    if (category === "clinical" || action.includes("diagnosis")) return <Stethoscope className="h-3 w-3" />
    if (category === "medication" || action.includes("prescription")) return <Pill className="h-3 w-3" />
    if (action.includes("view")) return <Eye className="h-3 w-3" />
    if (action.includes("registration")) return <User className="h-3 w-3" />
    if (action.includes("document")) return <FileText className="h-3 w-3" />
    return <Shield className="h-3 w-3" />
  }

  const getCategoryStats = () => {
    const stats: Record<string, number> = {}
    logs.forEach((log) => {
      const category = log.category || "general"
      stats[category] = (stats[category] || 0) + 1
    })
    return stats
  }

  const getSeverityStats = () => {
    const stats: Record<string, number> = {}
    logs.forEach((log) => {
      const severity = log.severity || "unknown"
      stats[severity] = (stats[severity] || 0) + 1
    })
    return stats
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/doctors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Enhanced Security Audit Logs</h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive system access and medical activity monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadAuditLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Critical Alerts */}
          {criticalLogs.length > 0 && (
            <Card className="border-l-4 border-l-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Critical Security Alerts ({criticalLogs.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-destructive">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()} - Worker: {log.workerId}
                        </p>
                      </div>
                      <Badge variant="destructive">CRITICAL</Badge>
                    </div>
                  ))}
                  {criticalLogs.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{criticalLogs.length - 3} more critical alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="medical">Medical Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              {/* Enhanced Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Advanced Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Worker ID, action, doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Range</label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="1h">Last Hour</SelectItem>
                          <SelectItem value="24h">Last 24 Hours</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Severity</label>
                      <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="clinical">Clinical</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="access">Access</SelectItem>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">User Type</label>
                      <Select value={filterUserType} onValueChange={setFilterUserType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="health_worker">Health Workers</SelectItem>
                          <SelectItem value="doctor">Doctors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action Type</label>
                      <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="prescription">Prescriptions</SelectItem>
                          <SelectItem value="diagnosis">Diagnoses</SelectItem>
                          <SelectItem value="view">View Access</SelectItem>
                          <SelectItem value="registration">Registrations</SelectItem>
                          <SelectItem value="failed">Failed Actions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">{filteredLogs.length}</div>
                    <div className="text-sm text-muted-foreground">Filtered Events</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-destructive">
                      {filteredLogs.filter((log) => log.severity === "critical").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical Events</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">
                      {filteredLogs.filter((log) => log.userType === "doctor").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Doctor Actions</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-chart-1">
                      {filteredLogs.filter((log) => log.category === "clinical").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Clinical Actions</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-chart-2">
                      {new Set(filteredLogs.map((log) => log.sessionId)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Sessions</div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Logs Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Audit Log Entries ({filteredLogs.length})</CardTitle>
                  <CardDescription>Comprehensive record of all system access and medical activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No audit logs match your filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.map((log, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                  <Badge
                                    variant={getActionBadgeVariant(log.action, log.severity)}
                                    className="flex items-center space-x-1"
                                  >
                                    {getActionIcon(log.action, log.category)}
                                    <span>{log.action.replace(/_/g, " ")}</span>
                                  </Badge>
                                  {log.severity && (
                                    <Badge variant={getSeverityBadgeVariant(log.severity)}>
                                      {log.severity.toUpperCase()}
                                    </Badge>
                                  )}
                                  {log.category && <Badge variant="outline">{log.category}</Badge>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Worker ID:</span> {log.workerId}
                                  </div>
                                  <div>
                                    <span className="font-medium">User Type:</span> {log.userType.replace("_", " ")}
                                  </div>
                                  {log.metadata?.doctorName && (
                                    <div>
                                      <span className="font-medium">Doctor:</span> {log.metadata.doctorName}
                                    </div>
                                  )}
                                  {log.metadata?.doctorId && (
                                    <div>
                                      <span className="font-medium">Doctor ID:</span> {log.metadata.doctorId}
                                    </div>
                                  )}
                                </div>

                                {log.metadata?.medicalContext && (
                                  <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                                    <h4 className="font-medium text-sm mb-2">Medical Context:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      {log.metadata.medicalContext.diagnosis && (
                                        <div>
                                          <span className="font-medium">Diagnosis:</span>{" "}
                                          {log.metadata.medicalContext.diagnosis}
                                        </div>
                                      )}
                                      {log.metadata.medicalContext.visitType && (
                                        <div>
                                          <span className="font-medium">Visit Type:</span>{" "}
                                          {log.metadata.medicalContext.visitType}
                                        </div>
                                      )}
                                      {log.metadata.medicalContext.medications && (
                                        <div>
                                          <span className="font-medium">Medications:</span>{" "}
                                          {log.metadata.medicalContext.medications.length} prescribed
                                        </div>
                                      )}
                                      {log.metadata.medicalContext.followUpDate && (
                                        <div>
                                          <span className="font-medium">Follow-up:</span>{" "}
                                          {log.metadata.medicalContext.followUpDate}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="text-xs text-muted-foreground text-right">
                                <div>Session: {log.sessionId.slice(-8)}</div>
                                <div>IP: {log.ipAddress}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(getCategoryStats()).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize">{category.replace("_", " ")}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(getSeverityStats()).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <span className="capitalize">{severity}</span>
                          <Badge variant={getSeverityBadgeVariant(severity)}>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Medical Actions Audit Trail</span>
                  </CardTitle>
                  <CardDescription>Detailed tracking of all clinical activities and prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredLogs
                      .filter(
                        (log) =>
                          log.category === "clinical" ||
                          log.category === "medication" ||
                          log.action.includes("prescription") ||
                          log.action.includes("diagnosis"),
                      )
                      .map((log, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="default" className="flex items-center space-x-1">
                                    {getActionIcon(log.action, log.category)}
                                    <span>{log.action.replace(/_/g, " ")}</span>
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Patient:</span> {log.workerId}
                                  </div>
                                  <div>
                                    <span className="font-medium">Doctor:</span> {log.metadata?.doctorName || "Unknown"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Doctor ID:</span>{" "}
                                    {log.metadata?.doctorId || "Unknown"}
                                  </div>
                                </div>

                                {log.metadata?.medicalContext && (
                                  <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      {log.metadata.medicalContext.diagnosis && (
                                        <div>
                                          <span className="font-medium text-primary">Diagnosis:</span>
                                          <p className="text-foreground">{log.metadata.medicalContext.diagnosis}</p>
                                        </div>
                                      )}
                                      {log.metadata.medicalContext.visitType && (
                                        <div>
                                          <span className="font-medium text-primary">Visit Type:</span>
                                          <p className="text-foreground capitalize">
                                            {log.metadata.medicalContext.visitType}
                                          </p>
                                        </div>
                                      )}
                                      {log.metadata.medicalContext.medications &&
                                        log.metadata.medicalContext.medications.length > 0 && (
                                          <div className="md:col-span-2">
                                            <span className="font-medium text-primary">Medications Prescribed:</span>
                                            <p className="text-foreground">
                                              {log.metadata.medicalContext.medications.length} medications
                                            </p>
                                          </div>
                                        )}
                                      {log.metadata.medicalContext.followUpDate && (
                                        <div>
                                          <span className="font-medium text-primary">Follow-up Scheduled:</span>
                                          <p className="text-foreground">{log.metadata.medicalContext.followUpDate}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
