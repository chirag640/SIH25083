"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  MapPin,
  Heart,
  AlertTriangle,
  Phone,
  Calendar,
  Activity,
  FileText,
  QrCode,
  Shield,
  Clock,
  Stethoscope,
  Pill,
  Syringe,
  TestTube,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Plus,
} from "lucide-react"
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

interface MedicalVisit {
  id: string
  date: string
  doctorName: string
  doctorId: string
  diagnosis: string
  prescription: string
  notes: string
  followUpDate?: string
  visitType: "consultation" | "emergency" | "follow-up" | "vaccination"
}

interface UploadedDocument {
  id: string
  name: string
  type: "prescription" | "lab-report" | "vaccination-card" | "medical-certificate" | "other"
  uploadDate: string
  size: string
  url: string
}

export default function DoctorPatientView() {
  const params = useParams()
  const workerId = params.id as string
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [dataIntegrityValid, setDataIntegrityValid] = useState<boolean>(true)
  const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>([])
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set())

  useEffect(() => {
    const workerData = localStorage.getItem(`worker_${workerId}`)
    if (workerData) {
      try {
        const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)

        // Verify data integrity
        const integrityValid = DataManager.verifyDataIntegrity(encryptedWorker)
        setDataIntegrityValid(integrityValid)

        if (!integrityValid) {
          console.warn("Data integrity check failed for worker:", workerId)
        }

        // Decrypt sensitive data
        const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
        setWorker(decryptedWorker)

        // Log doctor access
        SecurityUtils.logAccess("doctor_patient_view", workerId, "doctor")

        // Generate QR code URL
        const qrData = JSON.stringify({
          id: decryptedWorker.workerId,
          name: decryptedWorker.fullName,
          bloodGroup: decryptedWorker.bloodGroup,
          allergies: decryptedWorker.allergies,
        })
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`
        setQrCodeUrl(qrUrl)

        loadMedicalHistory(workerId)
        loadDocuments(workerId)
      } catch (error) {
        console.error("Error loading worker data:", error)
        SecurityUtils.logAccess("doctor_patient_view_failed", workerId, "doctor")
      }
    }
  }, [workerId])

  const loadMedicalHistory = (workerId: string) => {
    const visitsData = localStorage.getItem(`medical_visits_${workerId}`)
    if (visitsData) {
      try {
        const visits: MedicalVisit[] = JSON.parse(visitsData)
        visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setMedicalVisits(visits)
      } catch (error) {
        console.error("Error loading medical visits:", error)
      }
    } else {
      const sampleVisits: MedicalVisit[] = [
        {
          id: "visit_1",
          date: "2024-01-15",
          doctorName: "Dr. Priya Sharma",
          doctorId: "DOC001",
          diagnosis: "Upper Respiratory Infection",
          prescription: "Amoxicillin 500mg - 3 times daily for 7 days, Paracetamol 650mg - as needed for fever",
          notes:
            "Patient presented with cough and mild fever. Chest clear on examination. Advised rest and plenty of fluids.",
          followUpDate: "2024-01-22",
          visitType: "consultation",
        },
        {
          id: "visit_2",
          date: "2024-01-22",
          doctorName: "Dr. Priya Sharma",
          doctorId: "DOC001",
          diagnosis: "Follow-up - Recovered",
          prescription: "No medication required",
          notes: "Patient has recovered well. No fever, cough resolved. Cleared for work.",
          visitType: "follow-up",
        },
      ]
      setMedicalVisits(sampleVisits)
      localStorage.setItem(`medical_visits_${workerId}`, JSON.stringify(sampleVisits))
    }
  }

  const loadDocuments = (workerId: string) => {
    const documentsData = localStorage.getItem(`documents_${workerId}`)
    if (documentsData) {
      try {
        const docs: UploadedDocument[] = JSON.parse(documentsData)
        docs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        setDocuments(docs)
      } catch (error) {
        console.error("Error loading documents:", error)
      }
    }
  }

  const toggleVisitExpansion = (visitId: string) => {
    const newExpanded = new Set(expandedVisits)
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId)
    } else {
      newExpanded.add(visitId)
    }
    setExpandedVisits(newExpanded)
  }

  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />
      case "follow-up":
        return <Clock className="h-4 w-4" />
      case "vaccination":
        return <Syringe className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <Pill className="h-4 w-4" />
      case "lab-report":
        return <TestTube className="h-4 w-4" />
      case "vaccination-card":
        return <Syringe className="h-4 w-4" />
      case "medical-certificate":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Patient record not found or could not be decrypted.</p>
            <Button asChild className="mt-4">
              <Link href="/doctors">Return to Dashboard</Link>
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
              <Link href="/doctors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Patient Details</h1>
              <p className="text-sm text-muted-foreground">Comprehensive Medical Record View</p>
            </div>
            <Badge variant={dataIntegrityValid ? "secondary" : "destructive"} className="ml-auto">
              <Shield className="h-3 w-3 mr-1" />
              {dataIntegrityValid ? "Secure" : "Integrity Warning"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Patient Header */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{worker.fullName}</CardTitle>
                    <CardDescription className="text-base">Patient ID: {worker.workerId}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {calculateAge(worker.dateOfBirth)} years old
                  </Badge>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {worker.gender}
                  </Badge>
                  {worker.bloodGroup && (
                    <Badge variant="destructive" className="text-base px-3 py-1">
                      Blood: {worker.bloodGroup}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Critical Medical Information */}
          {(worker.allergies || worker.currentMedication) && (
            <div className="grid md:grid-cols-2 gap-4">
              {worker.allergies && (
                <Card className="border-l-4 border-l-destructive bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      <span>ALLERGIES - CRITICAL</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-medium">{worker.allergies}</p>
                  </CardContent>
                </Card>
              )}

              {worker.currentMedication && (
                <Card className="border-l-4 border-l-chart-1 bg-chart-1/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-chart-1">
                      <Heart className="h-5 w-5" />
                      <span>CURRENT MEDICATION</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-medium">{worker.currentMedication}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Medical Timeline</TabsTrigger>
              <TabsTrigger value="profile">Patient Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Medical History Timeline</span>
                  </CardTitle>
                  <CardDescription>Chronological view of all medical visits and treatments</CardDescription>
                </CardHeader>
                <CardContent>
                  {medicalVisits.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No medical visits recorded yet</p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Visit
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medicalVisits.map((visit, index) => (
                        <div key={visit.id} className="relative">
                          {/* Timeline line */}
                          {index < medicalVisits.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                          )}

                          <Collapsible>
                            <CollapsibleTrigger onClick={() => toggleVisitExpansion(visit.id)} className="w-full">
                              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                  <div className="flex items-start space-x-4">
                                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                                      {getVisitTypeIcon(visit.visitType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <h3 className="font-semibold text-foreground">{visit.diagnosis}</h3>
                                          <Badge variant="outline" className="capitalize">
                                            {visit.visitType}
                                          </Badge>
                                        </div>
                                        {expandedVisits.has(visit.id) ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                        <span>{new Date(visit.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{visit.doctorName}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <Card className="mt-2 ml-12 border-l-4 border-l-primary/20">
                                <CardContent className="p-4 space-y-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-foreground mb-2">Prescription</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {visit.prescription}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground mb-2">Doctor's Notes</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.notes}</p>
                                    </div>
                                  </div>

                                  {visit.followUpDate && (
                                    <div className="pt-2 border-t border-border">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <Calendar className="h-4 w-4 text-chart-1" />
                                        <span className="text-chart-1 font-medium">
                                          Follow-up scheduled: {new Date(visit.followUpDate).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <div className="text-xs text-muted-foreground">Doctor ID: {visit.doctorId}</div>
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={`/doctors/patient/${workerId}/prescription/${visit.id}`}>
                                        <FileText className="h-3 w-3 mr-1" />
                                        Generate Prescription
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-foreground flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(worker.dateOfBirth).toLocaleDateString()}</span>
                        </p>
                      </div>
                      {worker.phoneNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p className="text-foreground flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{worker.phoneNumber}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                      <p className="text-foreground">{new Date(worker.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Location Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Native Place</p>
                      <p className="text-foreground">
                        {worker.nativeDistrict}, {worker.nativeState}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Address in Kerala</p>
                      <p className="text-foreground">{worker.currentAddress}</p>
                    </div>
                  </CardContent>
                </Card>

                {worker.healthHistory && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Initial Medical History</span>
                        <Shield className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">{worker.healthHistory}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Uploaded Documents</span>
                  </CardTitle>
                  <CardDescription>Medical documents, lab reports, and certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents uploaded yet</p>
                      <Button className="mt-4" asChild>
                        <Link href={`/workers/documents/${worker.workerId}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                                {getDocumentTypeIcon(doc.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                                <p className="text-sm text-muted-foreground capitalize">{doc.type.replace("-", " ")}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.uploadDate).toLocaleDateString()} • {doc.size}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="h-5 w-5" />
                      <span>Quick Access QR</span>
                    </CardTitle>
                    <CardDescription>Scan for emergency access</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="Patient QR Code"
                        className="mx-auto border border-border rounded-lg"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">Contains: ID, Name, Blood Group, Allergies</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Doctor Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="default" asChild>
                      <Link href={`/doctors/patient/${workerId}/add-visit`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Visit
                      </Link>
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/doctors/patient/${workerId}/add-visit?mode=prescribe`}>
                        <Pill className="h-4 w-4 mr-2" />
                        Prescribe Medication
                      </Link>
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/doctors/patient/${workerId}/add-visit?mode=lab`}>
                        <TestTube className="h-4 w-4 mr-2" />
                        Order Lab Tests
                      </Link>
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/doctors/patient/${workerId}/add-visit?mode=vaccination`}>
                        <Syringe className="h-4 w-4 mr-2" />
                        Record Vaccination
                      </Link>
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline" asChild>
                      <Link href={`/workers/${worker.workerId}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Contact Info */}
                <Card className="border-destructive/20 bg-destructive/5 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-destructive text-sm">Emergency Protocol</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-foreground">
                      <strong>Blood Group:</strong> {worker.bloodGroup || "Not specified"}
                    </p>
                    {worker.allergies && (
                      <p className="text-destructive">
                        <strong>⚠️ Allergies:</strong> {worker.allergies}
                      </p>
                    )}
                    {worker.currentMedication && (
                      <p className="text-chart-1">
                        <strong>💊 Current Meds:</strong> {worker.currentMedication}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
