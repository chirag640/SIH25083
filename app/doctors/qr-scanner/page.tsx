"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, QrCode, Search, AlertTriangle, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DataManager, SecurityUtils, type EncryptedWorkerData } from "@/lib/utils"

export default function QRScannerPage() {
  const router = useRouter()
  const [manualId, setManualId] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [workerPreview, setWorkerPreview] = useState<any>(null)
  const [qrUrl, setQrUrl] = useState<string>("")
  const [error, setError] = useState("")
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const detectorRef = useRef<any>(null)

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
            try {
              const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)

              const integrity = DataManager.verifyDataIntegrity(encryptedWorker)
              const decrypted = integrity ? DataManager.decryptSensitiveData(encryptedWorker) : encryptedWorker

              // Build QR image URL matching health-card generator
              const qrData = JSON.stringify({
                id: decrypted.workerId,
                name: decrypted.fullName,
                bloodGroup: decrypted.bloodGroup,
                allergies: decrypted.allergies,
                type: "health_record",
              })
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

              setScanResult({ id: decrypted.workerId, name: decrypted.fullName })
              setWorkerPreview({ ...decrypted })
              setQrUrl(qrImageUrl)
              setError("")
              SecurityUtils.logAccess("qr_scan_simulated", decrypted.workerId, "doctor")
              return
            } catch (e) {
              // fallback to raw parse
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
    }
    setError("No worker records available for demo scan")
  }

  const stopCamera = () => {
    setScanning(false)
    try {
      const video = videoRef.current
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
        video.srcObject = null
      }
    } catch (e) {
      // ignore
    }
  }

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDetected = (rawValue: string) => {
    if (!rawValue) return
    let parsed: any = null
    try {
      parsed = JSON.parse(rawValue)
    } catch (e) {
      // raw text, not JSON
      parsed = { raw: rawValue }
    }

    // If payload contains a health_record deep link, navigate to printable card
    if (parsed && parsed.id && parsed.type === "health_record") {
      SecurityUtils.logAccess("qr_scan_live", parsed.id, "doctor")
      // Prefer showing the health-card deep link
      router.push(`/workers/health-card/${parsed.id}`)
      setScanResult(parsed)
      setWorkerPreview(parsed)
      return
    }

    // If payload looks like {id, name}, route to doctor patient view
    if (parsed && parsed.id) {
      SecurityUtils.logAccess("qr_scan_live", parsed.id, "doctor")
      setScanResult(parsed)
      setWorkerPreview(parsed)
      // don't auto-navigate to full patient record here — leave user to click
      return
    }

    setError("Unrecognized QR payload")
  }

  const startCamera = async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)

      // Use BarcodeDetector when available
      const BarcodeDetectorClass = (window as any).BarcodeDetector
      if (BarcodeDetectorClass) {
        try {
          detectorRef.current = new BarcodeDetectorClass({ formats: ["qr_code"] })
          const detectLoop = async () => {
            if (!scanning) return
            try {
              if (!videoRef.current) return
              const detections = await detectorRef.current.detect(videoRef.current)
              if (detections && detections.length > 0) {
                handleDetected(detections[0].rawValue)
                stopCamera()
                return
              }
            } catch (e) {
              // detection may throw intermittently; ignore
            }
            requestAnimationFrame(detectLoop)
          }
          detectLoop()
          return
        } catch (e) {
          // fall through to fallback
        }
      }

      // Fallback: inform user and keep camera running for manual capture via simulate
      setError("Live QR scanning not supported in this browser; using camera preview. Use 'Simulate QR Scan' as fallback.")
    } catch (e) {
      setError("Camera permission denied or not available")
    }
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
              <div className="aspect-square max-w-sm mx-auto bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center relative">
                <div className="text-center space-y-4 w-full h-full flex flex-col items-center justify-center">
                  {/* Video preview for live scanning */}
                  <video ref={videoRef} className="w-full h-full object-cover rounded" playsInline />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!scanning && <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {!scanning ? (
                      <Button onClick={startCamera}>Start Camera</Button>
                    ) : (
                      <Button variant="outline" onClick={stopCamera}>Stop Camera</Button>
                    )}
                    <Button onClick={simulateQRScan}>Simulate QR Scan</Button>
                  </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={viewPatientDetails} className="w-full">
                      View Full Patient Details
                    </Button>
                    <Button asChild variant="outline" onClick={() => { if (scanResult) window.open(`/workers/health-card/${scanResult.id}`, "_blank") }}>
                      <a>Open Health Card</a>
                    </Button>
                  </div>
              </CardContent>
            </Card>
          )}

            {/* Health card preview when workerPreview is available */}
            {workerPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Health Card Preview</CardTitle>
                  <CardDescription>Quick preview of the worker's health card</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0">
                      {qrUrl && <img src={qrUrl} alt="qr" className="w-32 h-32 border border-border rounded" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{workerPreview.fullName}</h3>
                      <p className="text-sm text-muted-foreground">ID: {workerPreview.workerId}</p>
                      <div className="flex gap-2 mt-2">
                        {workerPreview.bloodGroup && <Badge variant="destructive">{workerPreview.bloodGroup}</Badge>}
                        {workerPreview.gender && <Badge variant="secondary">{workerPreview.gender}</Badge>}
                      </div>
                      {workerPreview.allergies && (
                        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive font-medium">Allergies</span>
                          </div>
                          <p className="text-destructive mt-1">{workerPreview.allergies}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-4 gap-2">
                    <Button onClick={viewPatientDetails}>Open Patient Record</Button>
                    <Button variant="outline" asChild>
                      <a href={`/workers/health-card/${workerPreview.workerId}`} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" /> View/Download Card
                      </a>
                    </Button>
                  </div>
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
