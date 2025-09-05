"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, QrCode, User, MapPin, Heart, Shield } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SecurityUtils, DataManager, type EncryptedWorkerData } from "@/lib/utils"

interface WorkerRecord {
  workerId: string
  fullName: string
  dateOfBirth: string
  gender: string
  nativeState: string
  nativeDistrict: string
  currentAddress: string
  phoneNumber: string
  healthHistory: string
  bloodGroup: string
  allergies: string
  currentMedication: string
  createdAt: string
}

export default function WorkerProfilePage() {
  const params = useParams()
  const workerId = params.id as string
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [dataIntegrityValid, setDataIntegrityValid] = useState<boolean>(true)

  useEffect(() => {
    const workerData = localStorage.getItem(`worker_${workerId}`)
    if (workerData) {
      try {
        const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)

        const integrityValid = DataManager.verifyDataIntegrity(encryptedWorker)
        setDataIntegrityValid(integrityValid)

        if (!integrityValid) {
          console.warn("Data integrity check failed for worker:", workerId)
        }

        const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
        setWorker(decryptedWorker)

        SecurityUtils.logAccess("worker_profile_view", workerId, "health_worker")

        const qrData = JSON.stringify({
          id: decryptedWorker.workerId,
          name: decryptedWorker.fullName,
          bloodGroup: decryptedWorker.bloodGroup,
          allergies: decryptedWorker.allergies,
        })
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error("Error loading worker data:", error)
        SecurityUtils.logAccess("worker_profile_view_failed", workerId, "health_worker")
      }
    }
  }, [workerId])

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      SecurityUtils.logAccess("qr_code_download", workerId, "health_worker")
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `worker-${workerId}-qr.png`
      link.click()
    }
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Worker record not found or could not be decrypted.</p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-foreground">Worker Profile</h1>
            <Badge variant={dataIntegrityValid ? "secondary" : "destructive"} className="ml-auto">
              <Shield className="h-3 w-3 mr-1" />
              {dataIntegrityValid ? "Secure" : "Integrity Warning"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{worker.fullName}</CardTitle>
                  <CardDescription>Worker ID: {worker.workerId}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Age: {calculateAge(worker.dateOfBirth)}</Badge>
                  <Badge variant="secondary">{worker.gender}</Badge>
                  {worker.bloodGroup && <Badge variant="outline">{worker.bloodGroup}</Badge>}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-foreground">{new Date(worker.dateOfBirth).toLocaleDateString()}</p>
                </div>
                {worker.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-foreground">{worker.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                  <p className="text-foreground">{new Date(worker.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Native Place</p>
                  <p className="text-foreground">
                    {worker.nativeDistrict}, {worker.nativeState}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Address</p>
                  <p className="text-foreground">{worker.currentAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Information
                  <Shield className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {worker.allergies && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                    <p className="text-foreground">{worker.allergies}</p>
                  </div>
                )}
                {worker.currentMedication && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Medications</p>
                    <p className="text-foreground">{worker.currentMedication}</p>
                  </div>
                )}
                {worker.healthHistory && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health History</p>
                    <p className="text-foreground">{worker.healthHistory}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
                <CardDescription>Scan this QR code for quick access to health information</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt="Worker QR Code"
                    className="mx-auto border border-border rounded-lg"
                  />
                )}
                <Button onClick={downloadQRCode} variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
