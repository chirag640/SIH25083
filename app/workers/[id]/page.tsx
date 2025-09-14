"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Download, 
  QrCode, 
  User, 
  MapPin, 
  Heart, 
  Shield, 
  Calendar,
  Phone,
  FileText,
  AlertTriangle,
  Activity,
  Plus,
  Edit,
  Printer,
  Share,
  CheckCircle,
  Clock,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SecurityUtils, DataManager, type EncryptedWorkerData } from "@/lib/utils"
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
  type: "registration" | "visit" | "medication" | "emergency"
  title: string
  description: string
  details?: string
}

export default function WorkerProfilePage() {
  const params = useParams()
  const workerId = params.id as string
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [dataIntegrityValid, setDataIntegrityValid] = useState<boolean>(true)
  const [healthTimeline, setHealthTimeline] = useState<HealthEvent[]>([])
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)

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

        // Generate health timeline
        const timeline: HealthEvent[] = [
          {
            date: decryptedWorker.createdAt,
            type: "registration",
            title: "Health Record Created",
            description: "Initial registration completed",
            details: "Worker registered in the healthcare system"
          }
        ]

        if (decryptedWorker.healthHistory) {
          timeline.push({
            date: decryptedWorker.createdAt,
            type: "visit",
            title: "Medical History Recorded",
            description: decryptedWorker.healthHistory.substring(0, 50) + "...",
            details: decryptedWorker.healthHistory
          })
        }

        if (decryptedWorker.currentMedication) {
          timeline.push({
            date: decryptedWorker.createdAt,
            type: "medication",
            title: "Current Medication",
            description: decryptedWorker.currentMedication,
            details: "Ongoing medication treatment"
          })
        }

        setHealthTimeline(timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Navigation language={language} onLanguageChange={setLanguage} translations={t} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/doctors">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Badge variant={dataIntegrityValid ? "default" : "destructive"} className="bg-green-100 text-green-700 border-green-200">
                    <Shield className="h-3 w-3 mr-1" />
                    {dataIntegrityValid ? "Verified Record" : "Integrity Warning"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{worker.fullName}</h1>
                <p className="text-lg text-muted-foreground">Worker ID: {worker.workerId}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/doctors/patient/${workerId}/add-visit`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Visit
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/workers/health-card/${workerId}`}>
                    <Printer className="mr-2 h-4 w-4" />
                    Health Card
                  </Link>
                </Button>
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{calculateAge(worker.dateOfBirth)}</p>
                    <p className="text-blue-100">Years Old</p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{worker.bloodGroup || "N/A"}</p>
                    <p className="text-red-100">Blood Group</p>
                  </div>
                  <Heart className="h-10 w-10 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{healthTimeline.length}</p>
                    <p className="text-green-100">Health Records</p>
                  </div>
                  <FileText className="h-10 w-10 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{Math.floor((Date.now() - new Date(worker.createdAt).getTime()) / (1000 * 60 * 60 * 24))}</p>
                    <p className="text-purple-100">Days Registered</p>
                  </div>
                  <Activity className="h-10 w-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:block">Health</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:block">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:block">QR Code</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                        <p className="text-foreground font-medium">{worker.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                        <Badge variant="outline" className="capitalize">{worker.gender}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</p>
                        <p className="text-foreground">{new Date(worker.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Age</p>
                        <p className="text-foreground font-medium">{calculateAge(worker.dateOfBirth)} years</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <p className="text-foreground">{worker.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Registration Date</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="text-foreground">{new Date(worker.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span>Location Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Native Place</p>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-900 font-medium">{worker.nativeDistrict}</p>
                        <p className="text-green-700 text-sm">{worker.nativeState}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Current Address</p>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-900">{worker.currentAddress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span>Health Information</span>
                    <Shield className="h-4 w-4 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    Confidential medical information - access logged for security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Blood Group</p>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-lg px-3 py-1">
                            {worker.bloodGroup || "Not specified"}
                          </Badge>
                        </div>
                      </div>
                      
                      {worker.allergies && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <p className="text-yellow-900">{worker.allergies}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {worker.currentMedication && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Current Medications</p>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
                              <p className="text-blue-900">{worker.currentMedication}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {worker.healthHistory && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Health History</p>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900">{worker.healthHistory}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(!worker.allergies && !worker.currentMedication && !worker.healthHistory) && (
                    <div className="text-center py-8">
                      <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No additional health information recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>Health Timeline</span>
                  </CardTitle>
                  <CardDescription>
                    Chronological record of health-related events and visits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthTimeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className={`p-2 rounded-full ${
                          event.type === 'registration' ? 'bg-green-100 text-green-600' :
                          event.type === 'visit' ? 'bg-blue-100 text-blue-600' :
                          event.type === 'medication' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {event.type === 'registration' && <CheckCircle className="w-5 h-5" />}
                          {event.type === 'visit' && <Stethoscope className="w-5 h-5" />}
                          {event.type === 'medication' && <Heart className="w-5 h-5" />}
                          {event.type === 'emergency' && <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(event.date).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{event.description}</p>
                          {event.details && (
                            <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QR Code Tab */}
            <TabsContent value="qr" className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span>QR Code Access</span>
                  </CardTitle>
                  <CardDescription>
                    Quick access QR code for emergency situations and medical consultations
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="max-w-xs mx-auto">
                    {qrCodeUrl && (
                      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                        <img
                          src={qrCodeUrl}
                          alt="Worker QR Code"
                          className="mx-auto w-full max-w-[200px]"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>This QR code contains essential health information:</p>
                      <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                        <li>Worker identification</li>
                        <li>Blood group information</li>
                        <li>Critical allergies</li>
                        <li>Emergency contact details</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={downloadQRCode} className="bg-indigo-600 hover:bg-indigo-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                      <Button variant="outline">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
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

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}
