"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, QrCode, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function QRScannerPage() {
  const router = useRouter()
  const [manualId, setManualId] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleManualSearch = () => {
    if (!manualId.trim()) {
      setError("Please enter a Worker ID")
      return
    }

    // Check if worker exists in localStorage
    const workerData = localStorage.getItem(`worker_${manualId}`)
    if (workerData) {
      router.push(`/doctors/patient/${manualId}`)
    } else {
      setError("Worker ID not found")
    }
  }

  const simulateQRScan = () => {
    // Simulate scanning a QR code - in real implementation, this would use camera
    // For demo, let's get the first worker from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("worker_")) {
        const workerData = localStorage.getItem(key)
        if (workerData) {
          const worker = JSON.parse(workerData)
          const qrData = {
            id: worker.workerId,
            name: worker.fullName,
            bloodGroup: worker.bloodGroup,
            allergies: worker.allergies,
          }
          setScanResult(qrData)
          setError("")
          return
        }
      }
    }
    setError("No worker records available for demo scan")
  }

  const viewPatientDetails = () => {
    if (scanResult) {
      router.push(`/doctors/patient/${scanResult.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/doctors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">QR Code Scanner</h1>
              <p className="text-sm text-muted-foreground">Scan patient QR codes for quick access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* QR Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-6 w-6" />
                <span>QR Code Scanner</span>
              </CardTitle>
              <CardDescription>Position the QR code within the camera frame to scan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Simulated Camera View */}
              <div className="aspect-square max-w-sm mx-auto bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Camera view would appear here</p>
                  <Button onClick={simulateQRScan} className="mt-4">
                    Simulate QR Scan
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Result */}
          {scanResult && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">QR Code Scanned Successfully</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-lg">{scanResult.name}</p>
                  <p className="text-muted-foreground">Worker ID: {scanResult.id}</p>

                  <div className="flex flex-wrap gap-2">
                    {scanResult.bloodGroup && <Badge variant="destructive">Blood: {scanResult.bloodGroup}</Badge>}
                  </div>

                  {scanResult.allergies && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive font-medium">Allergies:</span>
                      </div>
                      <p className="text-destructive mt-1">{scanResult.allergies}</p>
                    </div>
                  )}
                </div>

                <Button onClick={viewPatientDetails} className="w-full">
                  View Full Patient Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manual ID Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Manual Worker ID Entry</span>
              </CardTitle>
              <CardDescription>Enter Worker ID manually if QR code is not available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workerId">Worker ID</Label>
                <Input
                  id="workerId"
                  placeholder="Enter Worker ID (e.g., MW12345678)"
                  value={manualId}
                  onChange={(e) => {
                    setManualId(e.target.value)
                    setError("")
                  }}
                />
              </div>
              <Button onClick={handleManualSearch} className="w-full">
                Search Worker Record
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Ask the patient to show their QR code card</p>
              <p>2. Position the QR code within the camera frame</p>
              <p>3. Wait for automatic scanning and recognition</p>
              <p>4. Review the basic information displayed</p>
              <p>5. Click "View Full Patient Details" for complete medical record</p>
              <p className="text-destructive font-medium mt-4">
                ⚠️ Always verify patient identity before accessing medical records
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
