"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageUtils, SecurityUtils } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"]

export default function GovtDashboard() {
  const [workers, setWorkers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    setWorkers(StorageUtils.getAllWorkers())
    setAuditLogs(StorageUtils.getAuditLogs())
  }, [])

  const diseaseTrend = useMemo(() => {
    // weekly counts for top diseases (dummy)
    const weeks = Array.from({ length: 8 }, (_, i) => ({ week: `W${i + 1}`, dengue: 0, malaria: 0, fever: 0 }))
    auditLogs.forEach((log) => {
      const diag = log.metadata?.medicalContext?.diagnosis as string | undefined
      if (!diag) return
      const weekIndex = Math.floor(Math.random() * weeks.length)
      const key = diag as keyof (typeof weeks)[0]
      if (key && key in weeks[weekIndex]) {
        ;(weeks[weekIndex] as any)[key] = ((weeks[weekIndex] as any)[key] || 0) + 1
      }
    })
    // fill with random small numbers if empty
    weeks.forEach((w) => {
      w.dengue = w.dengue || Math.floor(Math.random() * 5)
      w.malaria = w.malaria || Math.floor(Math.random() * 5)
      w.fever = w.fever || Math.floor(Math.random() * 10)
    })
    return weeks
  }, [auditLogs])

  const vaccinationCoverage = useMemo(() => {
    // compute % vaccinated by disease (dummy)
    const total = workers.length || 1
    return [
      { name: "Hepatitis B", percent: Math.round((Math.random() * 60) + 20) },
      { name: "Tetanus", percent: Math.round((Math.random() * 60) + 20) },
      { name: "Polio", percent: Math.round((Math.random() * 60) + 20) },
    ]
  }, [workers])

  const handleExportFilteredCSV = () => {
    // simple export of audit logs
    const rows = auditLogs.map((a) => ({ timestamp: a.timestamp, action: a.action, workerId: a.workerId, userType: a.userType }))
    const headers = ["timestamp", "action", "workerId", "userType"]
    StorageUtils.exportToCSV(rows, headers, `govt_audit_${new Date().toISOString().slice(0,10)}.csv`)
    SecurityUtils.logAccess("govt_export_audit_csv", undefined, "health_worker")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Government Health Dashboard</h1>
            <p className="text-sm text-muted-foreground">Disease trends, vaccination coverage and geographic overview</p>
          </div>
          <div>
            <Button onClick={handleExportFilteredCSV} variant="outline">Export Audit CSV</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Disease Trends (Last 8 weeks)</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diseaseTrend}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="dengue" stroke="#ff4d4f" />
                  <Line type="monotone" dataKey="malaria" stroke="#36cfc9" />
                  <Line type="monotone" dataKey="fever" stroke="#597ef7" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaccination Coverage</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="percent" data={vaccinationCoverage} outerRadius={80} label>
                    {vaccinationCoverage.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Utilization</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ hospital: "H1", count: Math.floor(Math.random()*50) }, { hospital: "H2", count: Math.floor(Math.random()*50) }, { hospital: "H3", count: Math.floor(Math.random()*50) }] }>
                  <XAxis dataKey="hospital" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Logs (for demo)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th>Date</th>
                      <th>Action</th>
                      <th>Worker</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(-50).reverse().map((log, idx) => (
                      <tr key={idx} className="border-t">
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.action}</td>
                        <td>{log.workerId}</td>
                        <td>{log.userType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
