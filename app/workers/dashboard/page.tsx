"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import Link from "next/link"
import { SecurityUtils, DataManager, type EncryptedWorkerData, DocumentManager } from "@/lib/utils"

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

  // Language translations
  const translations = {
    en: {
      title: "Worker Dashboard",
      enterWorkerId: "Enter your Worker ID",
      loadProfile: "Load My Profile",
      personalInfo: "Personal Information",
      locationInfo: "Location Information",
      healthInfo: "Health Information",
      healthTimeline: "Health Timeline",
      qrCode: "My Health Card",
      documents: "My Documents",
      downloadCard: "Download Health Card",
      uploadDocument: "Upload Document",
      age: "Age",
      bloodGroup: "Blood Group",
      allergies: "Allergies",
      medications: "Current Medications",
      healthHistory: "Health History",
      nativePlace: "Native Place",
      currentAddress: "Current Address",
      registrationDate: "Registration Date",
      noAllergies: "No known allergies",
      noMedications: "No current medications",
      noHealthHistory: "No health history recorded",
      edit: "Edit Profile",
      save: "Save Changes",
      cancel: "Cancel",
    },
    ml: {
      title: "തൊഴിലാളി ഡാഷ്ബോർഡ്",
      enterWorkerId: "നിങ്ങളുടെ തൊഴിലാളി ഐഡി നൽകുക",
      loadProfile: "എന്റെ പ്രൊഫൈൽ ലോഡ് ചെയ്യുക",
      personalInfo: "വ്യക്തിഗത വിവരങ്ങൾ",
      locationInfo: "സ്ഥാന വിവരങ്ങൾ",
      healthInfo: "ആരോഗ്യ വിവരങ്ങൾ",
      healthTimeline: "ആരോഗ്യ ചരിത്രം",
      qrCode: "എന്റെ ആരോഗ്യ കാർഡ്",
      documents: "എന്റെ രേഖകൾ",
      downloadCard: "ആരോഗ്യ കാർഡ് ഡൗൺലോഡ് ചെയ്യുക",
      uploadDocument: "രേഖ അപ്‌ലോഡ് ചെയ്യുക",
      age: "പ്രായം",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      allergies: "അലർജികൾ",
      medications: "നിലവിലെ മരുന്നുകൾ",
      healthHistory: "ആരോഗ്യ ചരിത്രം",
      nativePlace: "ജന്മസ്ഥലം",
      currentAddress: "നിലവിലെ വിലാസം",
      registrationDate: "രജിസ്ട്രേഷൻ തീയതി",
      noAllergies: "അറിയപ്പെടുന്ന അലർജികൾ ഇല്ല",
      noMedications: "നിലവിലെ മരുന്നുകൾ ഇല്ല",
      noHealthHistory: "ആരോഗ്യ ചരിത്രം രേഖപ്പെടുത്തിയിട്ടില്ല",
      edit: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക",
      save: "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
      cancel: "റദ്ദാക്കുക",
    },
    hi: {
      title: "श्रमिक डैशबोर्ड",
      enterWorkerId: "अपना श्रमिक आईडी दर्ज करें",
      loadProfile: "मेरी प्रोफ़ाइल लोड करें",
      personalInfo: "व्यक्तिगत जानकारी",
      locationInfo: "स्थान की जानकारी",
      healthInfo: "स्वास्थ्य जानकारी",
      healthTimeline: "स्वास्थ्य इतिहास",
      qrCode: "मेरा स्वास्थ्य कार्ड",
      documents: "मेरे दस्तावेज़",
      downloadCard: "स्वास्थ्य कार्ड डाउनलोड करें",
      uploadDocument: "दस्तावेज़ अपलोड करें",
      age: "उम्र",
      bloodGroup: "रक्त समूह",
      allergies: "एलर्जी",
      medications: "वर्तमान दवाएं",
      healthHistory: "स्वास्थ्य इतिहास",
      nativePlace: "मूल स्थान",
      currentAddress: "वर्तमान पता",
      registrationDate: "पंजीकरण तिथि",
      noAllergies: "कोई ज्ञात एलर्जी नहीं",
      noMedications: "कोई वर्तमान दवाएं नहीं",
      noHealthHistory: "कोई स्वास्थ्य इतिहास दर्ज नहीं",
      edit: "प्रोफ़ाइल संपादित करें",
      save: "परिवर्तन सहेजें",
      cancel: "रद्द करें",
    },
  }

  const t = translations[language as keyof typeof translations]

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">മലയാളം</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!worker ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.enterWorkerId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workerId">Worker ID</Label>
                <Input
                  id="workerId"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  placeholder="MW12345678..."
                />
              </div>
              <Button onClick={loadWorkerProfile} className="w-full">
                {t.loadProfile}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{worker.fullName}</CardTitle>
                    <CardDescription>ID: {worker.workerId}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {t.age}: {calculateAge(worker.dateOfBirth)}
                    </Badge>
                    <Badge variant="secondary">{worker.gender}</Badge>
                    {worker.bloodGroup && <Badge variant="outline">{worker.bloodGroup}</Badge>}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t.personalInfo}
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
                      <p className="text-sm font-medium text-muted-foreground">{t.registrationDate}</p>
                      <p className="text-foreground">{new Date(worker.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t.locationInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.nativePlace}</p>
                      <p className="text-foreground">
                        {worker.nativeDistrict}, {worker.nativeState}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.currentAddress}</p>
                      <p className="text-foreground">{worker.currentAddress}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      {t.healthInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.bloodGroup}</p>
                      <p className="text-foreground">{worker.bloodGroup || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.allergies}</p>
                      <p className="text-foreground">{worker.allergies || t.noAllergies}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.medications}</p>
                      <p className="text-foreground">{worker.currentMedication || t.noMedications}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.healthHistory}</p>
                      <p className="text-foreground">{worker.healthHistory || t.noHealthHistory}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t.healthTimeline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthTimeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-primary/10 p-2 rounded-full">{getTimelineIcon(event.type)}</div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{event.description}</p>
                            <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                            {event.details && <p className="text-sm text-muted-foreground mt-1">{event.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - QR Code & Actions */}
              <div className="space-y-6">
                {/* QR Code Health Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      {t.qrCode}
                    </CardTitle>
                    <CardDescription>Show this to doctors for quick access</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="Health QR Code"
                        className="mx-auto border border-border rounded-lg"
                      />
                    )}
                    <div className="space-y-2">
                      <Button onClick={downloadHealthCard} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {t.downloadCard}
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href={`/workers/health-card/${worker.workerId}`}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Generate Professional Card
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      {t.documents}
                    </CardTitle>
                    <CardDescription>Upload prescriptions, lab reports, vaccination cards</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/workers/documents/${worker.workerId}`}>
                        <Upload className="mr-2 h-4 w-4" />
                        {t.uploadDocument}
                      </Link>
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const docCount = DocumentManager.getDocumentsByWorkerId(worker.workerId).length
                          return docCount > 0 ? `${docCount} documents uploaded` : "No documents yet"
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/workers/edit/${worker.workerId}`}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        {t.edit}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
