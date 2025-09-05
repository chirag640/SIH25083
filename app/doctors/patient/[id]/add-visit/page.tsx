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
import { useParams, useRouter } from "next/navigation"
import { SecurityUtils } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/doctors/patient/${workerId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Medical Visit</h1>
              <p className="text-sm text-muted-foreground">Record new diagnosis, prescription, and treatment</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Visit Type and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Visit Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitType">Visit Type</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <Input id="doctorName" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor ID</Label>
                  <Input id="doctorId" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
              <CardDescription>Select from common diagnoses or enter custom diagnosis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Select value={diagnosis} onValueChange={setDiagnosis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diagnosis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonDiagnoses.map((diag) => (
                      <SelectItem key={diag} value={diag}>
                        {diag}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Diagnosis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {diagnosis === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDiagnosis">Custom Diagnosis</Label>
                  <Input
                    id="customDiagnosis"
                    placeholder="Enter custom diagnosis..."
                    value={customDiagnosis}
                    onChange={(e) => setCustomDiagnosis(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5" />
                  <span>Prescription</span>
                </div>
                <Button onClick={addMedication} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No medications added yet</p>
              ) : (
                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <Card key={index} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Medication {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Medicine Name</Label>
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
                              <SelectTrigger>
                                <SelectValue placeholder="Select medicine..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonMedicines.map((medicine) => (
                                  <SelectItem key={medicine.name} value={medicine.name}>
                                    {medicine.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input
                              placeholder="e.g., 500mg"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input
                              placeholder="e.g., 3 times daily"
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              placeholder="e.g., 7 days"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, "duration", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Special Instructions</Label>
                            <Input
                              placeholder="e.g., Take with food, Before meals"
                              value={med.instructions}
                              onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5" />
                  <span>Vaccinations</span>
                </div>
                <Button onClick={addVaccination} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vaccination
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaccinations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No vaccinations added yet</p>
              ) : (
                <div className="space-y-4">
                  {vaccinations.map((vacc, index) => (
                    <Card key={index} className="border-l-4 border-l-chart-1/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Vaccination {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeVaccination(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Vaccine Name</Label>
                            <Select
                              value={vacc.name}
                              onValueChange={(value) => updateVaccination(index, "name", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vaccine..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonVaccines.map((vaccine) => (
                                  <SelectItem key={vaccine} value={vaccine}>
                                    {vaccine}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Date Given</Label>
                            <Input
                              type="date"
                              value={vacc.date}
                              onChange={(e) => updateVaccination(index, "date", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Batch Number</Label>
                            <Input
                              placeholder="Optional"
                              value={vacc.batchNumber}
                              onChange={(e) => updateVaccination(index, "batchNumber", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Next Due Date</Label>
                            <Input
                              type="date"
                              value={vacc.nextDueDate}
                              onChange={(e) => updateVaccination(index, "nextDueDate", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Lab Test Recommendations</span>
                </div>
                <Button onClick={addLabTest} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lab Test
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {labTests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No lab tests recommended yet</p>
              ) : (
                <div className="space-y-4">
                  {labTests.map((test, index) => (
                    <Card key={index} className="border-l-4 border-l-chart-2/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Lab Test {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeLabTest(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Test Name</Label>
                            <Select value={test.name} onValueChange={(value) => updateLabTest(index, "name", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select test..." />
                              </SelectTrigger>
                              <SelectContent>
                                {commonLabTests.map((labTest) => (
                                  <SelectItem key={labTest.name} value={labTest.name}>
                                    {labTest.name} ({labTest.category})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Urgency</Label>
                            <Select
                              value={test.urgency}
                              onValueChange={(value) => updateLabTest(index, "urgency", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="stat">STAT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Reason for Test</Label>
                            <Input
                              placeholder="Clinical indication for the test"
                              value={test.reason}
                              onChange={(e) => updateLabTest(index, "reason", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label>Special Instructions</Label>
                            <Input
                              placeholder="e.g., Fasting required, Morning sample"
                              value={test.instructions}
                              onChange={(e) => updateLabTest(index, "instructions", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes and Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes & Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Doctor's Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Clinical observations, patient condition, treatment response, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Date (Optional)</Label>
                <Input
                  id="followUp"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>All entries will be automatically timestamped and logged for audit trail</span>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" asChild>
                    <Link href={`/doctors/patient/${workerId}`}>Cancel</Link>
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Visit"}
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
