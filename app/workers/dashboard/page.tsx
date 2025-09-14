"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  MapPin,
  Heart,
  QrCode,
  Upload,
  Download,
  Calendar,
  Clock,
  Globe,
  Edit3,
  CreditCard,
  Activity,
  FileText,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle,
  Users,
  Stethoscope,
  Pill,
  Clipboard
} from "lucide-react"
import Link from "next/link"
import { SecurityUtils, DataManager, type EncryptedWorkerData, DocumentManager } from "@/lib/utils"
import { Navigation } from "@/components/navigation"
import { useTranslations } from "@/lib/translations"

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

interface HealthEvent {
  date: string
  type: "registration" | "doctor_visit" | "medication" | "allergy"
  description: string
  details?: string
}

export default function WorkerDashboardPage() {
  const [workerId, setWorkerId] = useState("")
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [language, setLanguage] = useState("en")
  const [healthTimeline, setHealthTimeline] = useState<HealthEvent[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const t = useTranslations(language)

  useEffect(() => {
    if (worker) {
      // Generate health timeline
      const timeline: HealthEvent[] = [
        {
          date: worker.createdAt,
          type: "registration",
          description: "Health record created",
          details: "Initial registration completed",
        },
      ]

      if (worker.allergies) {
        timeline.push({
          date: worker.createdAt,
          type: "allergy",
          description: "Allergies recorded",
          details: worker.allergies,
        })
      }

      if (worker.currentMedication) {
        timeline.push({
          date: worker.createdAt,
          type: "medication",
          description: "Current medications recorded",
          details: worker.currentMedication,
        })
      }

      // Sort by date (newest first)
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setHealthTimeline(timeline)

      // Generate QR code
      const qrData = JSON.stringify({
        id: worker.workerId,
        name: worker.fullName,
        bloodGroup: worker.bloodGroup,
        allergies: worker.allergies,
        emergency: true,
      })
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
      setQrCodeUrl(qrUrl)
    }
  }, [worker])

  const loadWorkerProfile = () => {
    if (!workerId.trim()) return

    const workerData = localStorage.getItem(`worker_${workerId}`)
    if (workerData) {
      try {
        const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)
        const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
        setWorker(decryptedWorker)
        SecurityUtils.logAccess("worker_dashboard_access", workerId, "health_worker")
      } catch (error) {
        console.error("Error loading worker data:", error)
        alert("Error loading profile. Please check your Worker ID.")
      }
    } else {
      alert("Worker ID not found. Please check and try again.")
    }
  }

  const downloadHealthCard = () => {
    if (!worker || !qrCodeUrl) return

    // Create a canvas to generate the health card
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Header
    ctx.fillStyle = "#0891b2"
    ctx.fillRect(20, 20, canvas.width - 40, 60)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("HEALTH RECORD CARD", canvas.width / 2, 55)

    // Worker info
    ctx.fillStyle = "#475569"
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Name: ${worker.fullName}`, 40, 120)
    ctx.fillText(`ID: ${worker.workerId}`, 40, 150)
    ctx.fillText(`Blood Group: ${worker.bloodGroup || "Not specified"}`, 40, 180)

    if (worker.allergies) {
      ctx.font = "16px Arial"
      ctx.fillStyle = "#be123c"
      ctx.fillText(`⚠ Allergies: ${worker.allergies}`, 40, 210)
    }

    // QR Code placeholder text
    ctx.fillStyle = "#6b7280"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("QR Code for Digital Access", 450, 250)
    ctx.strokeStyle = "#e5e7eb"
    ctx.strokeRect(380, 120, 140, 140)

    // Download
    const link = document.createElement("a")
    link.download = `health-card-${worker.workerId}.png`
    link.href = canvas.toDataURL()
    link.click()

    SecurityUtils.logAccess("health_card_download", workerId, "health_worker")
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

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <User className="h-4 w-4" />
      case "doctor_visit":
        return <Heart className="h-4 w-4" />
      case "medication":
        return <Calendar className="h-4 w-4" />
      case "allergy":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Navigation language={language} onLanguageChange={setLanguage} translations={t} />

      <main className="container mx-auto px-4 py-8">
        {!worker ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Worker Dashboard</h1>
              <p className="text-muted-foreground">Access your health records and information</p>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Access Your Profile</CardTitle>
                <CardDescription>Enter your Worker ID to view your health dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workerId" className="text-base font-medium">Worker ID</Label>
                  <Input
                    id="workerId"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    placeholder="MW12345678..."
                    className="h-12 text-lg"
                  />
                </div>
                <Button 
                  onClick={loadWorkerProfile} 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                  disabled={!workerId.trim()}
                >
                  <User className="mr-2 h-5 w-5" />
                  Load My Profile
                </Button>
                
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Don't have a Worker ID?</p>
                  <Button variant="ghost" asChild>
                    <Link href="/workers/register" className="text-blue-600 hover:text-blue-700">
                      Register as a new worker
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="mb-8">
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">{worker.fullName}</h1>
                        <p className="text-blue-100">Worker ID: {worker.workerId}</p>
                        <p className="text-blue-100 text-sm">
                          Registered on {new Date(worker.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                        Age: {calculateAge(worker.dateOfBirth)}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                        {worker.gender}
                      </Badge>
                      {worker.bloodGroup && (
                        <Badge className="bg-red-500/80 text-white border-red-300 px-3 py-1">
                          {worker.bloodGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white shadow-sm">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:block">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:block">Health</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:block">Documents</span>
                </TabsTrigger>
                <TabsTrigger value="qr-card" className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:block">Health Card</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Personal Info</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-foreground font-medium">{new Date(worker.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      {worker.phoneNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p className="text-foreground font-medium">{worker.phoneNumber}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Location Information */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <span>Location</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Native Place</p>
                        <p className="text-foreground font-medium">{worker.nativeDistrict}, {worker.nativeState}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Address</p>
                        <p className="text-foreground font-medium">{worker.currentAddress}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health Status */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-4 h-4 text-red-600" />
                        </div>
                        <span>Health Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Overall Status</span>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Good
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Checkup</span>
                        <span className="text-sm font-medium">Not recorded</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Link href={`/workers/edit/${worker.workerId}`}>
                          <Edit3 className="w-6 h-6 text-blue-600" />
                          <span>Update Profile</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Link href={`/workers/documents/${worker.workerId}`}>
                          <Upload className="w-6 h-6 text-green-600" />
                          <span>Upload Document</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Link href="/help">
                          <Phone className="w-6 h-6 text-orange-600" />
                          <span>Get Support</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                        <Link href="/doctors">
                          <Stethoscope className="w-6 h-6 text-purple-600" />
                          <span>Find Doctor</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Health Tab */}
              <TabsContent value="health" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Health Information */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        <span>Health Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                          <p className="text-2xl font-bold text-red-600">{worker.bloodGroup || "N/A"}</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Age</p>
                          <p className="text-2xl font-bold text-blue-600">{calculateAge(worker.dateOfBirth)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Known Allergies</span>
                          </Label>
                          <p className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                            {worker.allergies || "No known allergies"}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                            <Pill className="w-4 h-4" />
                            <span>Current Medications</span>
                          </Label>
                          <p className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            {worker.currentMedication || "No current medications"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health History */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clipboard className="w-5 h-5 text-blue-600" />
                        <span>Health History</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm">
                            {worker.healthHistory || "No health history recorded"}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">Health Timeline</h4>
                          {healthTimeline.length > 0 ? (
                            <div className="space-y-3">
                              {healthTimeline.map((event, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    {getTimelineIcon(event.type)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{event.description}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No health events recorded yet
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>My Documents</span>
                    </CardTitle>
                    <CardDescription>
                      Upload and manage your health documents, prescriptions, and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No documents uploaded yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Upload prescriptions, lab reports, vaccination certificates, and other health documents
                      </p>
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <Link href={`/workers/documents/${worker.workerId}`}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Your First Document
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* QR Card Tab */}
              <TabsContent value="qr-card" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-blue-600" />
                        <span>Digital Health Card</span>
                      </CardTitle>
                      <CardDescription>
                        Show this QR code to healthcare providers for instant access to your records
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                      <div className="mx-auto w-48 h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="Health QR Code"
                            className="w-40 h-40 border border-border rounded-lg"
                          />
                        ) : (
                          <QrCode className="w-20 h-20 text-blue-400" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          onClick={downloadHealthCard} 
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download QR Code
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/workers/health-card/${worker.workerId}`}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Generate Professional Card
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle>How to Use Your Health Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <span className="text-xs font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Show to Doctor</h4>
                            <p className="text-sm text-muted-foreground">Present your QR code to any healthcare provider</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <span className="text-xs font-bold text-blue-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Instant Access</h4>
                            <p className="text-sm text-muted-foreground">They can scan and access your health information immediately</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <span className="text-xs font-bold text-blue-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Emergency Use</h4>
                            <p className="text-sm text-muted-foreground">Crucial during emergencies when you can't communicate</p>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-yellow-900">Important</span>
                          </div>
                          <p className="text-sm text-yellow-800">
                            Keep your QR code saved in your phone and also carry a printed copy for emergencies.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Emergency Contact */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900">24/7 Emergency Support</h3>
                      <p className="text-red-700">For medical emergencies and immediate assistance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">1800-XXX-XXXX</p>
                    <p className="text-sm text-red-600">Toll-free helpline</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
