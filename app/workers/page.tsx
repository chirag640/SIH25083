"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageUtils } from "@/lib/utils"
import { Users } from "lucide-react"

export default function WorkersIndexPage() {
  const [workers, setWorkers] = useState<any[]>([])

  useEffect(() => {
    setWorkers(StorageUtils.getAllWorkers())
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Workers</h1>
          </div>
          <div>
            <Link href="/workers/register">
              <Button>Register Worker</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {workers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No workers found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No worker records in local storage yet. Use Register Worker to add one.</p>
              </CardContent>
            </Card>
          ) : (
            workers.map((w: any) => (
              <Card key={w.workerId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{w.fullName || "Unnamed"}</span>
                    <Link href={`/workers/${w.workerId}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">ID: {w.workerId}</div>
                  <div className="text-sm text-muted-foreground">Registered: {new Date(w.createdAt).toLocaleString()}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
