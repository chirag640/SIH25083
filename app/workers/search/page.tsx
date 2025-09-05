"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, User } from "lucide-react"
import Link from "next/link"

interface WorkerRecord {
  workerId: string
  fullName: string
  dateOfBirth: string
  gender: string
  nativeState: string
  nativeDistrict: string
  currentAddress: string
  phoneNumber: string
  bloodGroup: string
  createdAt: string
}

export default function SearchWorkersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [workers, setWorkers] = useState<WorkerRecord[]>([])
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerRecord[]>([])

  useEffect(() => {
    // Load all workers from localStorage
    const allWorkers: WorkerRecord[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("worker_")) {
        const workerData = localStorage.getItem(key)
        if (workerData) {
          allWorkers.push(JSON.parse(workerData))
        }
      }
    }
    setWorkers(allWorkers)
    setFilteredWorkers(allWorkers)
  }, [])

  useEffect(() => {
    // Filter workers based on search term
    if (searchTerm.trim() === "") {
      setFilteredWorkers(workers)
    } else {
      const filtered = workers.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.phoneNumber.includes(searchTerm),
      )
      setFilteredWorkers(filtered)
    }
  }, [searchTerm, workers])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
            <h1 className="text-2xl font-bold text-foreground">Search Worker Records</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Search Workers</CardTitle>
              <CardDescription>Search by name, worker ID, or phone number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Search
                  </Label>
                  <Input
                    id="search"
                    placeholder="Enter name, worker ID, or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Search Results ({filteredWorkers.length})</h2>
            </div>

            {filteredWorkers.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {workers.length === 0 ? "No worker records found." : "No workers match your search."}
                  </p>
                  {workers.length === 0 && (
                    <Button asChild className="mt-4">
                      <Link href="/workers/register">Register First Worker</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredWorkers.map((worker) => (
                  <Card key={worker.workerId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{worker.fullName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {worker.workerId}</p>
                            <p className="text-sm text-muted-foreground">
                              {worker.nativeDistrict}, {worker.nativeState}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Age: {calculateAge(worker.dateOfBirth)}</Badge>
                          <Badge variant="secondary">{worker.gender}</Badge>
                          {worker.bloodGroup && <Badge variant="outline">{worker.bloodGroup}</Badge>}
                          <Button asChild size="sm">
                            <Link href={`/workers/${worker.workerId}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
