"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Printer, Languages } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SecurityUtils, DataManager } from "@/lib/utils"

interface WorkerRecord {
  workerId: string
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  bloodGroup: string
  allergies: string
  currentMedication: string
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
  visitType: string
}

const translations = {
  en: {
    prescription: "PRESCRIPTION",
    patientInfo: "Patient Information",
    doctorInfo: "Doctor Information",
    diagnosis: "Diagnosis",
    medicines: "Medicines",
    instructions: "Instructions",
    followUp: "Follow-up",
    name: "Name",
    age: "Age",
    gender: "Gender",
    patientId: "Patient ID",
    bloodGroup: "Blood Group",
    allergies: "Allergies",
    doctorName: "Doctor Name",
    regNo: "Registration No",
    hospital: "Hospital/Clinic",
    date: "Date",
    signature: "Doctor's Signature",
    emergency: "Emergency Contact",
    qrCode: "Scan QR for Patient Records",
    years: "years",
    male: "Male",
    female: "Female",
    other: "Other",
    none: "None",
    asDirected: "As directed by doctor",
    beforeMeals: "Before meals",
    afterMeals: "After meals",
    withFood: "With food",
    onEmptyStomach: "On empty stomach",
  },
  ml: {
    prescription: "കുറിപ്പടി",
    patientInfo: "രോഗിയുടെ വിവരങ്ങൾ",
    doctorInfo: "ഡോക്ടറുടെ വിവരങ്ങൾ",
    diagnosis: "രോഗനിർണയം",
    medicines: "മരുന്നുകൾ",
    instructions: "നിർദേശങ്ങൾ",
    followUp: "തുടർ ചികിത്സ",
    name: "പേര്",
    age: "പ്രായം",
    gender: "ലിംഗം",
    patientId: "രോഗി ഐഡി",
    bloodGroup: "രക്തഗ്രൂപ്പ്",
    allergies: "അലർജികൾ",
    doctorName: "ഡോക്ടറുടെ പേര്",
    regNo: "രജിസ്ട്രേഷൻ നമ്പർ",
    hospital: "ആശുപത്രി/ക്ലിനിക്",
    date: "തീയതി",
    signature: "ഡോക്ടറുടെ ഒപ്പ്",
    emergency: "അടിയന്തര ബന്ധം",
    qrCode: "രോഗിയുടെ രേഖകൾക്കായി QR സ്കാൻ ചെയ്യുക",
    years: "വയസ്സ്",
    male: "പുരുഷൻ",
    female: "സ്ത്രീ",
    other: "മറ്റുള്ളവ",
    none: "ഇല്ല",
    asDirected: "ഡോക്ടറുടെ നിർദേശപ്രകാരം",
    beforeMeals: "ഭക്ഷണത്തിന് മുമ്പ്",
    afterMeals: "ഭക്ഷണത്തിന് ശേഷം",
    withFood: "ഭക്ഷണത്തോടൊപ്പം",
    onEmptyStomach: "വെറും വയറ്റിൽ",
  },
  hi: {
    prescription: "नुस्खा",
    patientInfo: "मरीज़ की जानकारी",
    doctorInfo: "डॉक्टर की जानकारी",
    diagnosis: "निदान",
    medicines: "दवाइयाँ",
    instructions: "निर्देश",
    followUp: "अगली मुलाकात",
    name: "नाम",
    age: "उम्र",
    gender: "लिंग",
    patientId: "मरीज़ आईडी",
    bloodGroup: "रक्त समूह",
    allergies: "एलर्जी",
    doctorName: "डॉक्टर का नाम",
    regNo: "पंजीकरण संख्या",
    hospital: "अस्पताल/क्लिनिक",
    date: "तारीख",
    signature: "डॉक्टर के हस्ताक्षर",
    emergency: "आपातकालीन संपर्क",
    qrCode: "मरीज़ के रिकॉर्ड के लिए QR स्कैन करें",
    years: "साल",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    none: "कोई नहीं",
    asDirected: "डॉक्टर के निर्देशानुसार",
    beforeMeals: "खाने से पहले",
    afterMeals: "खाने के बाद",
    withFood: "खाने के साथ",
    onEmptyStomach: "खाली पेट",
  },
}

export default function PrescriptionGenerator() {
  const params = useParams()
  const workerId = params.id as string
  const visitId = params.visitId as string
  const prescriptionRef = useRef<HTMLDivElement>(null)

  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [visit, setVisit] = useState<MedicalVisit | null>(null)
  const [language, setLanguage] = useState<"en" | "ml" | "hi">("en")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    // Load worker data (support current encrypted format and legacy variants)
    const workerData = localStorage.getItem(`worker_${workerId}`) || localStorage.getItem(`healthrecord_worker_${workerId}`)
    if (workerData) {
      try {
        const parsed = JSON.parse(workerData)

        let decryptedWorker: any = null

        // If record is already plain (contains fullName), use it
        if (parsed && typeof parsed === "object" && parsed.fullName) {
          decryptedWorker = parsed
        } else if (parsed && typeof parsed === "object" && parsed.data && typeof parsed.data === "string") {
          // Legacy wrapper where record was stored under `data` as JSON string
          try {
            const inner = JSON.parse(parsed.data)
            decryptedWorker = inner
          } catch {
            // If that fails, attempt to decrypt assuming parsed is EncryptedWorkerData
            decryptedWorker = DataManager.decryptSensitiveData(parsed)
          }
        } else {
          // Default: assume EncryptedWorkerData and decrypt sensitive fields
          decryptedWorker = DataManager.decryptSensitiveData(parsed)
        }

        if (decryptedWorker) {
          setWorker(decryptedWorker)

          // Generate QR code URL
          const qrData = JSON.stringify({
            id: decryptedWorker.workerId,
            name: decryptedWorker.fullName,
            type: "patient_record",
          })
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`
          setQrCodeUrl(qrUrl)
        }
      } catch (error) {
        console.error("Error loading worker data:", error)
      }
    }

    // Load visit data
  const visitsData = localStorage.getItem(`medical_visits_${workerId}`) || localStorage.getItem(`healthrecord_medical_visits_${workerId}`)
  if (visitsData) {
      try {
        const visits: MedicalVisit[] = JSON.parse(visitsData)
        const foundVisit = visits.find((v) => v.id === visitId)
        if (foundVisit) {
          setVisit(foundVisit)
        }
      } catch (error) {
        console.error("Error loading visit data:", error)
      }
    }

    // Log prescription generation
    SecurityUtils.logAccess("prescription_generated", workerId, "doctor", { visitId, language })
  }, [workerId, visitId, language])

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

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    // For demo, we'll use the browser's print to PDF functionality
    window.print()
  }

  const t = translations[language]

  if (!worker || !visit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading prescription data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/doctors/patient/${workerId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patient
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Prescription Generator</h1>
                <p className="text-sm text-muted-foreground">Generate multilingual prescription</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <Select value={language} onValueChange={(value: "en" | "ml" | "hi") => setLanguage(value)}>
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
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          <div
            ref={prescriptionRef}
            className="bg-white border border-border rounded-lg p-8 print:border-0 print:rounded-none print:shadow-none"
            style={{
              fontFamily: language === "ml" ? "Malayalam, serif" : language === "hi" ? "Devanagari, serif" : "serif",
            }}
          >
            {/* Header */}
            <div className="text-center border-b-2 border-primary pb-6 mb-6">
              <h1 className="text-3xl font-bold text-primary mb-2">{t.prescription}</h1>
              <div className="text-lg text-muted-foreground">
                <p>Kerala Migrant Worker Health System</p>
                <p className="text-sm">Government of Kerala Health Department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Patient Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t.patientInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">{t.name}:</span> {worker.fullName}
                      </div>
                      <div>
                        <span className="font-medium">{t.age}:</span> {calculateAge(worker.dateOfBirth)} {t.years}
                      </div>
                      <div>
                        <span className="font-medium">{t.gender}:</span>{" "}
                        {worker.gender === "Male" ? t.male : worker.gender === "Female" ? t.female : t.other}
                      </div>
                      <div>
                        <span className="font-medium">{t.patientId}:</span> {worker.workerId}
                      </div>
                      <div>
                        <span className="font-medium">{t.bloodGroup}:</span> {worker.bloodGroup || t.none}
                      </div>
                      <div>
                        <span className="font-medium">{t.date}:</span> {new Date(visit.date).toLocaleDateString()}
                      </div>
                    </div>
                    {worker.allergies && (
                      <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded">
                        <span className="font-medium text-destructive">{t.allergies}:</span> {worker.allergies}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="border-2 border-border rounded-lg p-4 bg-muted/20">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="Patient QR Code" className="w-24 h-24" />
                  )}
                  <p className="text-xs text-center mt-2 text-muted-foreground">{t.qrCode}</p>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.doctorInfo}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{t.doctorName}:</span> {visit.doctorName}
                  </div>
                  <div>
                    <span className="font-medium">{t.regNo}:</span> {visit.doctorId}
                  </div>
                  <div>
                    <span className="font-medium">{t.hospital}:</span> Primary Health Center
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.diagnosis}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{visit.diagnosis}</p>
              </CardContent>
            </Card>

            {/* Medicines */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.medicines}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visit.prescription
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((medicine, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                        <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{medicine}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            {visit.notes && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t.instructions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Follow-up */}
            {visit.followUpDate && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t.followUp}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{new Date(visit.followUpDate).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="border-t-2 border-border pt-6 mt-8">
              <div className="flex justify-between items-end">
                <div className="text-sm text-muted-foreground">
                  <p>
                    {t.emergency}: {worker.phoneNumber || "Not provided"}
                  </p>
                  <p className="text-xs mt-1">Generated on: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-border w-48 mb-2"></div>
                  <p className="text-sm font-medium">{t.signature}</p>
                  <p className="text-xs text-muted-foreground">{visit.doctorName}</p>
                </div>
              </div>
            </div>

            {/* Prescription ID */}
            <div className="text-center mt-6 text-xs text-muted-foreground">
              <p>
                Prescription ID: RX-{visit.id}-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
