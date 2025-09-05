"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageUtils, SecurityUtils } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts"

export default function HospitalAdminDashboard() {
  const [workers, setWorkers] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    setWorkers(StorageUtils.getAllWorkers())
    setAuditLogs(StorageUtils.getAuditLogs())
  }, [])

  const doctors = useMemo(() => {
    // For MVP create dummy doctors and counts from workers' "createdAt"
    const docList = [
      { id: "D1", name: "Dr. Arun" },
      { id: "D2", name: "Dr. Meera" },
      { id: "D3", name: "Dr. Suresh" },
    ]

    return docList.map((d) => ({
      ...d,
      patientsSeen: Math.floor(Math.random() * 20) + 1,
    }))
  }, [])

  const weeklyRegistrations = useMemo(() => {
    // buckets: Mon..Sun
    const buckets = Array.from({ length: 7 }, (_, i) => ({ day: `Day ${i + 1}`, registrations: 0 }))
    workers.forEach((w) => {
      const date = new Date(w.createdAt || w.createdAt)
      const dayIndex = date.getDay() % 7
      buckets[dayIndex].registrations += 1
    })
    return buckets
  }, [workers])

  const diseaseCounts = useMemo(() => {
    // Dummy disease tally from audit logs (look for diagnosis in metadata)
    const tally: Record<string, number> = {}
    auditLogs.forEach((log) => {
      const diag = log.metadata?.medicalContext?.diagnosis || (log.action === "diagnosis_added" && "fever")
      if (diag) tally[diag] = (tally[diag] || 0) + 1
    })
    // ensure top 5 present
    const defaultDiseases = ["fever", "malaria", "dengue", "covid", "diarrhea"]
    defaultDiseases.forEach((d) => (tally[d] = tally[d] || Math.floor(Math.random() * 5)))
    return Object.entries(tally).map(([d, c]) => ({ disease: d, count: c })).slice(0, 5)
  }, [auditLogs])

  const handleExportCSV = () => {
    const rows = workers.map((w) => ({ id: w.workerId, name: w.fullName, dob: w.dateOfBirth, consent: w.consent }))
    const headers = ["id", "name", "dob", "consent"]
    StorageUtils.exportToCSV(rows, headers, `hospital_workers_${new Date().toISOString().slice(0,10)}.csv`)
    SecurityUtils.logAccess("hospital_export_workers_csv", undefined, "health_worker")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Hospital Admin Dashboard</h1>
          <div className="space-x-2">
            <Button onClick={handleExportCSV} variant="outline">Export Workers CSV</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctors.map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {d.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{d.patientsSeen}</div>
                      <div className="text-xs text-muted-foreground">Patients seen</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Flow (Weekly)</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRegistrations}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="registrations" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Conditions</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseCounts}>
                  <XAxis dataKey="disease" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent & Compliance Log (Recent)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th>Date</th>
                      <th>Action</th>
                      <th>Worker</th>
                      <th>UserType</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(-20).reverse().map((log, idx) => (
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
