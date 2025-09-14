"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Save, Stethoscope, Pill, Syringe, TestTube, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SecurityUtils } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useEffect as _useEffect, EffectCallback, DependencyList } from "react"

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
  vaccinations?: Vaccination[]
  labTests?: LabTest[]
}

interface Vaccination {
  id: string
  name: string
  date: string
  batchNumber?: string
  nextDueDate?: string
}

interface LabTest {
  id: string
  name: string
  reason: string
  urgency: "routine" | "urgent" | "stat"
  instructions?: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

const commonDiagnoses = [
  "Upper Respiratory Infection",
  "Hypertension",
  "Diabetes Type 2",
  "Gastroenteritis",
  "Migraine",
  "Back Pain",
  "Skin Infection",
  "Fever of Unknown Origin",
  "Allergic Reaction",
  "Wound Care",
  "Routine Check-up",
  "Follow-up Visit",
]

const commonMedicines = [
  { name: "Paracetamol", commonDosage: "650mg", commonFrequency: "3 times daily" },
  { name: "Amoxicillin", commonDosage: "500mg", commonFrequency: "3 times daily" },
  { name: "Ibuprofen", commonDosage: "400mg", commonFrequency: "2 times daily" },
  { name: "Cetirizine", commonDosage: "10mg", commonFrequency: "Once daily" },
  { name: "Omeprazole", commonDosage: "20mg", commonFrequency: "Once daily before meals" },
  { name: "Metformin", commonDosage: "500mg", commonFrequency: "2 times daily with meals" },
  { name: "Amlodipine", commonDosage: "5mg", commonFrequency: "Once daily" },
  { name: "Azithromycin", commonDosage: "500mg", commonFrequency: "Once daily" },
]

const commonVaccines = [
  "Hepatitis B",
  "Tetanus",
  "Influenza",
  "COVID-19",
  "Typhoid",
  "Japanese Encephalitis",
  "Pneumococcal",
  "Meningococcal",
]

const commonLabTests = [
  { name: "Complete Blood Count (CBC)", category: "Blood Test" },
  { name: "Blood Sugar (Fasting)", category: "Blood Test" },
  { name: "Liver Function Test", category: "Blood Test" },
  { name: "Kidney Function Test", category: "Blood Test" },
  { name: "Chest X-Ray", category: "Imaging" },
  { name: "ECG", category: "Cardiac" },
  { name: "Urine Analysis", category: "Urine Test" },
  { name: "Stool Examination", category: "Stool Test" },
]

export default function AddVisitPage() {
  const params = useParams()
  const router = useRouter()
  const workerId = params.id as string

  const [visitType, setVisitType] = useState<string>("consultation")
  const [diagnosis, setDiagnosis] = useState("")
  const [customDiagnosis, setCustomDiagnosis] = useState("")
  const [medications, setMedications] = useState<Medication[]>([])
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [doctorName, setDoctorName] = useState("Dr. Priya Sharma")
  const [doctorId, setDoctorId] = useState("DOC001")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ])
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const addVaccination = () => {
    setVaccinations([
      ...vaccinations,
      {
        id: `vacc_${Date.now()}`,
        name: "",
        date: new Date().toISOString().split("T")[0],
        batchNumber: "",
        nextDueDate: "",
      },
    ])
  }

  const updateVaccination = (index: number, field: keyof Vaccination, value: string) => {
    const updated = [...vaccinations]
    updated[index] = { ...updated[index], [field]: value }
    setVaccinations(updated)
  }

  const removeVaccination = (index: number) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index))
  }

  const addLabTest = () => {
    setLabTests([
      ...labTests,
      {
        id: `lab_${Date.now()}`,
        name: "",
        reason: "",
        urgency: "routine",
        instructions: "",
      },
    ])
  }

  const searchParams = useSearchParams()

  // Auto-open mode if provided: "prescribe" | "lab" | "vaccination"
  const mode = searchParams?.get("mode")

  // On mount, if mode present, pre-add a row and scroll to that section
  useEffect(() => {
    if (!mode) return
    if (mode === "prescribe") {
      if (medications.length === 0) addMedication()
      setTimeout(() => {
        document.querySelector('#prescription')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
    if (mode === "lab") {
      if (labTests.length === 0) addLabTest()
      setTimeout(() => {
        document.querySelector('#labtests')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
    if (mode === "vaccination") {
      if (vaccinations.length === 0) addVaccination()
      setTimeout(() => {
        document.querySelector('#vaccinations')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateLabTest = (index: number, field: keyof LabTest, value: string) => {
    const updated = [...labTests]
    updated[index] = { ...updated[index], [field]: value }
    setLabTests(updated)
  }

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!diagnosis && !customDiagnosis) {
      alert("Please enter a diagnosis")
      return
    }

    setIsSubmitting(true)

    try {
      const finalDiagnosis = diagnosis === "custom" ? customDiagnosis : diagnosis

      const prescriptionText = medications
        .map(
          (med) =>
            `${med.name} ${med.dosage} - ${med.frequency} for ${med.duration}${med.instructions ? ` (${med.instructions})` : ""}`,
        )
        .join("\n")

      const newVisit: MedicalVisit = {
        id: `visit_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        doctorName,
        doctorId,
        diagnosis: finalDiagnosis,
        prescription: prescriptionText,
        notes,
        followUpDate: followUpDate || undefined,
        visitType: visitType as any,
        vaccinations: vaccinations.filter((v) => v.name),
        labTests: labTests.filter((l) => l.name),
      }

      // Load existing visits
      const existingVisitsData = localStorage.getItem(`medical_visits_${workerId}`)
      const existingVisits: MedicalVisit[] = existingVisitsData ? JSON.parse(existingVisitsData) : []

      // Add new visit
      const updatedVisits = [newVisit, ...existingVisits]
      localStorage.setItem(`medical_visits_${workerId}`, JSON.stringify(updatedVisits))

      // Persist vaccinations as documents so they appear in documents list
      if (newVisit.vaccinations && newVisit.vaccinations.length > 0) {
        const existingDocsRaw = localStorage.getItem(`documents_${workerId}`)
        const existingDocs = existingDocsRaw ? JSON.parse(existingDocsRaw) : []
        const newDocs = newVisit.vaccinations.map((v) => ({
          id: `vacc_doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: `${v.name} - Vaccination`,
          type: "vaccination-card",
          uploadDate: v.date,
          size: 0,
          url: "",
          description: `Batch: ${v.batchNumber || "n/a"}`,
        }))
        const combinedDocs = [...newDocs, ...existingDocs]
        localStorage.setItem(`documents_${workerId}`, JSON.stringify(combinedDocs))
      }

      // Persist lab orders for follow-up (simple storage)
      if (newVisit.labTests && newVisit.labTests.length > 0) {
        const existingLabRaw = localStorage.getItem(`lab_orders_${workerId}`)
        const existingLab = existingLabRaw ? JSON.parse(existingLabRaw) : []
        const newOrders = newVisit.labTests.map((l) => ({
          id: `labord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: l.name,
          reason: l.reason,
          urgency: l.urgency,
          instructions: l.instructions || "",
          orderedAt: new Date().toISOString(),
        }))
        const combinedOrders = [...newOrders, ...existingLab]
        localStorage.setItem(`lab_orders_${workerId}`, JSON.stringify(combinedOrders))
      }

      SecurityUtils.logDoctorAction("doctor_add_visit", workerId, doctorId, doctorName, {
        diagnosis: finalDiagnosis,
        prescription: prescriptionText,
        visitType,
        followUpDate,
        medications: medications.filter((m) => m.name),
        vaccinations: vaccinations.filter((v) => v.name),
        labTests: labTests.filter((l) => l.name),
      })

      // Redirect back to patient view
  toast({ title: "Visit saved", description: "Medical visit recorded successfully" })
  router.push(`/doctors/patient/${workerId}`)
    } catch (err) {
      console.error("Error saving visit:", err)
      const error = err as Error
      SecurityUtils.logAccess("doctor_add_visit_failed", workerId, "doctor", {
        error: error.message,
        doctorId,
        doctorName,
      })
      toast({ title: "Save failed", description: error.message || "Error saving visit", variant: "destructive" })
      alert("Error saving visit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <header className="border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50">
              <Link href={`/doctors/patient/${workerId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">New Medical Visit</h1>
                  <p className="text-sm text-muted-foreground">Record diagnosis, prescriptions, and treatment plan</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live Session</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Visit Type and Basic Info */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <span>Visit Information</span>
              </CardTitle>
              <CardDescription>
                Basic details about this medical consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visitType" className="text-sm font-semibold text-foreground">Visit Type</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Regular Consultation</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="emergency">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Emergency Visit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="follow-up">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Follow-up Visit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="vaccination">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Vaccination</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName" className="text-sm font-semibold text-foreground">Doctor Name</Label>
                  <Input 
                    id="doctorName" 
                    value={doctorName} 
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId" className="text-sm font-semibold text-foreground">Doctor ID</Label>
                  <Input 
                    id="doctorId" 
                    value={doctorId} 
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Diagnosis</span>
              </CardTitle>
              <CardDescription>Primary diagnosis and clinical assessment</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="diagnosis" className="text-sm font-semibold text-foreground">Primary Diagnosis</Label>
                <Select value={diagnosis} onValueChange={setDiagnosis}>
                  <SelectTrigger className="h-12 border-2 focus:border-red-500">
                    <SelectValue placeholder="Select diagnosis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonDiagnoses.map((diag) => (
                      <SelectItem key={diag} value={diag}>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>{diag}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">Custom Diagnosis</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {diagnosis === "custom" && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="customDiagnosis" className="text-sm font-semibold text-blue-900">Custom Diagnosis</Label>
                  <Input
                    id="customDiagnosis"
                    placeholder="Enter detailed diagnosis..."
                    value={customDiagnosis}
                    onChange={(e) => setCustomDiagnosis(e.target.value)}
                    className="h-12 border-2 border-blue-300 focus:border-blue-500 bg-white"
                  />
                </div>
              )}
              
              {(diagnosis && diagnosis !== "custom") && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Selected:</span> {diagnosis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription */}
          <Card className="shadow-lg border-0">
            <div id="prescription" />
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-green-600" />
                  <span>Prescription</span>
                  <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {medications.length} {medications.length === 1 ? 'medication' : 'medications'}
                  </div>
                </div>
                <Button 
                  onClick={addMedication} 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </CardTitle>
              <CardDescription>
                Prescribed medications, dosages, and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {medications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Pill className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">No medications prescribed yet</p>
                  <Button 
                    onClick={addMedication}
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Medication
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {medications.map((med, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <h4 className="font-semibold text-lg text-foreground">Medication {index + 1}</h4>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Medicine Name</Label>
                            <Select
                              value={med.name}
                              onValueChange={(value) => {
                                updateMedication(index, "name", value)
                                const commonMed = commonMedicines.find((m) => m.name === value)
                                if (commonMed) {
                                  updateMedication(index, "dosage", commonMed.commonDosage)
                                  updateMedication(index, "frequency", commonMed.commonFrequency)
                                }
                              }}
                            >
                              <SelectTrigger className="h-12 border-2 focus:border-green-500">
                                <SelectValue placeholder="Select medicine..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonMedicines.map((medicine) => (
                                  <SelectItem key={medicine.name} value={medicine.name}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{medicine.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {medicine.commonDosage} • {medicine.commonFrequency}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Dosage</Label>
                            <Input
                              placeholder="e.g., 500mg"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                              className="h-12 border-2 focus:border-green-500"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Frequency</Label>
                            <Input
                              placeholder="e.g., 3 times daily"
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                              className="h-12 border-2 focus:border-green-500"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Duration</Label>
                            <Input
                              placeholder="e.g., 7 days"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, "duration", e.target.value)}
                              className="h-12 border-2 focus:border-green-500"
                            />
                          </div>

                          <div className="space-y-3 md:col-span-2">
                            <Label className="text-sm font-semibold text-foreground">Special Instructions</Label>
                            <Input
                              placeholder="e.g., Take with food, Before meals, Avoid alcohol"
                              value={med.instructions}
                              onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                              className="h-12 border-2 focus:border-green-500"
                            />
                          </div>
                        </div>
                        
                        {med.name && med.dosage && med.frequency && med.duration && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              <span className="font-semibold">Prescription:</span> {med.name} {med.dosage}, {med.frequency} for {med.duration}
                              {med.instructions && ` (${med.instructions})`}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card className="shadow-lg border-0">
            <div id="vaccinations" />
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5 text-purple-600" />
                  <span>Vaccinations</span>
                  <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {vaccinations.length} {vaccinations.length === 1 ? 'vaccine' : 'vaccines'}
                  </div>
                </div>
                <Button 
                  onClick={addVaccination} 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vaccination
                </Button>
              </CardTitle>
              <CardDescription>
                Record administered vaccines and immunizations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {vaccinations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Syringe className="h-12 w-12 text-purple-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">No vaccinations recorded yet</p>
                  <Button 
                    onClick={addVaccination}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vaccination Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {vaccinations.map((vacc, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <h4 className="font-semibold text-lg text-foreground">Vaccination {index + 1}</h4>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeVaccination(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Vaccine Name</Label>
                            <Select
                              value={vacc.name}
                              onValueChange={(value) => updateVaccination(index, "name", value)}
                            >
                              <SelectTrigger className="h-12 border-2 focus:border-purple-500">
                                <SelectValue placeholder="Select vaccine..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonVaccines.map((vaccine) => (
                                  <SelectItem key={vaccine} value={vaccine}>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <span>{vaccine}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Date Given</Label>
                            <Input
                              type="date"
                              value={vacc.date}
                              onChange={(e) => updateVaccination(index, "date", e.target.value)}
                              className="h-12 border-2 focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Batch Number</Label>
                            <Input
                              placeholder="Optional batch/lot number"
                              value={vacc.batchNumber}
                              onChange={(e) => updateVaccination(index, "batchNumber", e.target.value)}
                              className="h-12 border-2 focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Next Due Date</Label>
                            <Input
                              type="date"
                              value={vacc.nextDueDate}
                              onChange={(e) => updateVaccination(index, "nextDueDate", e.target.value)}
                              className="h-12 border-2 focus:border-purple-500"
                            />
                          </div>
                        </div>
                        
                        {vacc.name && vacc.date && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800">
                              <span className="font-semibold">Vaccine Record:</span> {vacc.name} administered on {new Date(vacc.date).toLocaleDateString()}
                              {vacc.batchNumber && ` (Batch: ${vacc.batchNumber})`}
                              {vacc.nextDueDate && ` • Next due: ${new Date(vacc.nextDueDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Tests */}
          <Card className="shadow-lg border-0">
            <div id="labtests" />
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-orange-600" />
                  <span>Lab Test Recommendations</span>
                  <div className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {labTests.length} {labTests.length === 1 ? 'test' : 'tests'}
                  </div>
                </div>
                <Button 
                  onClick={addLabTest} 
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lab Test
                </Button>
              </CardTitle>
              <CardDescription>
                Recommended laboratory tests and diagnostic procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {labTests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <TestTube className="h-12 w-12 text-orange-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">No lab tests recommended yet</p>
                  <Button 
                    onClick={addLabTest}
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Recommend Lab Test
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {labTests.map((test, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <h4 className="font-semibold text-lg text-foreground">Lab Test {index + 1}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              test.urgency === 'stat' ? 'bg-red-100 text-red-700' :
                              test.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {test.urgency.toUpperCase()}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeLabTest(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Test Name</Label>
                            <Select value={test.name} onValueChange={(value) => updateLabTest(index, "name", value)}>
                              <SelectTrigger className="h-12 border-2 focus:border-orange-500">
                                <SelectValue placeholder="Select test..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonLabTests.map((labTest) => (
                                  <SelectItem key={labTest.name} value={labTest.name}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{labTest.name}</span>
                                      <span className="text-xs text-muted-foreground">{labTest.category}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Urgency Level</Label>
                            <Select value={test.urgency} onValueChange={(value) => updateLabTest(index, "urgency", value)}>
                              <SelectTrigger className="h-12 border-2 focus:border-orange-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Routine (within 24-48 hours)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="urgent">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>Urgent (within 2-4 hours)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="stat">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>STAT (immediately)</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3 md:col-span-2">
                            <Label className="text-sm font-semibold text-foreground">Reason for Test</Label>
                            <Input
                              placeholder="Clinical indication for this test"
                              value={test.reason}
                              onChange={(e) => updateLabTest(index, "reason", e.target.value)}
                              className="h-12 border-2 focus:border-orange-500"
                            />
                          </div>

                          <div className="space-y-3 md:col-span-2">
                            <Label className="text-sm font-semibold text-foreground">Special Instructions</Label>
                            <Input
                              placeholder="Special instructions or fasting requirements"
                              value={test.instructions}
                              onChange={(e) => updateLabTest(index, "instructions", e.target.value)}
                              className="h-12 border-2 focus:border-orange-500"
                            />
                          </div>
                        </div>
                        
                        {test.name && test.reason && (
                          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-orange-800">
                              <span className="font-semibold">Lab Order:</span> {test.name} ({test.urgency.toUpperCase()}) - {test.reason}
                              {test.instructions && ` • Instructions: ${test.instructions}`}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes and Follow-up */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5 text-gray-600" />
                <span>Additional Notes & Follow-up</span>
              </CardTitle>
              <CardDescription>
                Clinical observations and follow-up recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Clinical observations, patient condition, treatment response, recommendations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border-2 focus:border-gray-500 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="followUp" className="text-sm font-semibold text-foreground">Follow-up Date (Optional)</Label>
                <Input
                  id="followUp"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="h-12 border-2 focus:border-gray-500"
                />
                {followUpDate && (
                  <p className="text-sm text-muted-foreground">
                    Follow-up scheduled for {new Date(followUpDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Security & Audit</p>
                    <p className="text-sm text-muted-foreground">
                      All entries are automatically timestamped and logged for audit trail
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" asChild className="h-12 px-6">
                    <Link href={`/doctors/patient/${workerId}`}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving Visit..." : "Save Medical Visit"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
function useEffect(effect: EffectCallback, deps?: DependencyList) {
  // Delegate to React's built-in hook so the component behaves as expected.
  return _useEffect(effect, deps)
}

