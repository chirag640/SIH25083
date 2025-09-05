"use client"

import { Alert, AlertTitle } from "@/components/ui/alert"
import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Shield, AlertTriangle, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SecurityUtils, DataManager } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/translations"

interface WorkerData {
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
  consent: boolean
}

export default function RegisterWorkerPage() {
  const router = useRouter()
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)

  const [formData, setFormData] = useState<WorkerData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nativeState: "",
    nativeDistrict: "",
    currentAddress: "",
    phoneNumber: "",
    healthHistory: "",
    bloodGroup: "",
    allergies: "",
    currentMedication: "",
    consent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement | null>(null)
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const errors: string[] = []

    // Validate required fields
    if (!formData.fullName.trim()) {
      errors.push(t.registration.errors.fullNameRequired)
    } else if (!SecurityUtils.validateName(formData.fullName)) {
      errors.push(t.registration.errors.fullNameInvalid)
    }

    if (!formData.dateOfBirth) {
      errors.push(t.registration.errors.dobRequired)
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 16 || age > 100) {
        errors.push(t.registration.errors.ageRange)
      }
    }

    if (!formData.gender) {
      errors.push(t.registration.errors.genderRequired)
    }

    if (!formData.nativeState.trim()) {
      errors.push(t.registration.errors.nativeStateRequired)
    }

    if (!formData.nativeDistrict.trim()) {
      errors.push(t.registration.errors.nativeDistrictRequired)
    }

    if (!formData.currentAddress.trim()) {
      errors.push(t.registration.errors.currentAddressRequired)
    }

    if (formData.phoneNumber && !SecurityUtils.validatePhoneNumber(formData.phoneNumber)) {
      errors.push(t.registration.errors.phoneInvalid)
    }

    if (!formData.consent) {
      errors.push(t.registration.errors.consentRequired)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
  if (isSubmitting) return
  if (e && typeof (e as any).preventDefault === "function") {
      ;(e as React.FormEvent).preventDefault()
    }
    console.log("Register worker submit invoked", formData)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Sanitize all input data
      const sanitizedData = {
        ...formData,
        fullName: SecurityUtils.sanitizeInput(formData.fullName),
        nativeState: SecurityUtils.sanitizeInput(formData.nativeState),
        nativeDistrict: SecurityUtils.sanitizeInput(formData.nativeDistrict),
        currentAddress: SecurityUtils.sanitizeInput(formData.currentAddress),
        phoneNumber: SecurityUtils.sanitizeInput(formData.phoneNumber),
        healthHistory: SecurityUtils.sanitizeInput(formData.healthHistory),
        allergies: SecurityUtils.sanitizeInput(formData.allergies),
        currentMedication: SecurityUtils.sanitizeInput(formData.currentMedication),
      }

      // Generate secure worker ID
      const workerId = SecurityUtils.generateSecureId()

      // Create worker record with metadata
      const workerRecord = {
        ...sanitizedData,
        workerId,
        createdAt: new Date().toISOString(),
      }

      // Encrypt sensitive data before storage
      const encryptedRecord = DataManager.encryptSensitiveData(workerRecord)

      // Verify data integrity
      if (!SecurityUtils.checkDataIntegrity(encryptedRecord)) {
        throw new Error("Data integrity check failed")
      }

      // Store encrypted data
      localStorage.setItem(`worker_${workerId}`, JSON.stringify(encryptedRecord))

      // Log the registration action
      SecurityUtils.logAccess("worker_registration", workerId, "health_worker")

  // Show success toast
  toast({ title: "Registration saved", description: "Worker registered successfully" })

      // Redirect to worker profile
      router.push(`/workers/${workerId}`)
    } catch (error) {
      console.error("Error saving worker record:", error)
      setValidationErrors([t.registration.errors.savingError])
  toast({ title: "Registration failed", description: "Unable to save worker record" , variant: "destructive"})
      SecurityUtils.logAccess("worker_registration_failed", undefined, "health_worker")
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitClicked = () => {
    console.log("Register button clicked")
    toast({ title: "Submitting", description: "Saving registration..." })
    void handleSubmit()
  }

  const updateFormData = (field: keyof WorkerData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
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
                  {t.common.backToHome}
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{t.registration.title}</h1>
            </div>

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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t.registration.formTitle}</span>
            </CardTitle>
            <CardDescription>{t.registration.formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {validationErrors.length > 0 && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>{(t.registration.errors as any).title}</AlertTitle>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-destructive text-sm">
                      {error}
                    </p>
                  ))}
                </div>
              </Alert>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">{t.registration.personalInfo}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.registration.fullName} *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t.registration.dateOfBirth} *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t.registration.gender} *</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.registration.selectGender} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t.registration.male}</SelectItem>
                        <SelectItem value="female">{t.registration.female}</SelectItem>
                        <SelectItem value="other">{t.registration.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t.registration.phoneNumber}</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">{t.registration.locationInfo}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nativeState">{t.registration.nativeState} *</Label>
                    <Input
                      id="nativeState"
                      value={formData.nativeState}
                      onChange={(e) => updateFormData("nativeState", e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nativeDistrict">{t.registration.nativeDistrict} *</Label>
                    <Input
                      id="nativeDistrict"
                      value={formData.nativeDistrict}
                      onChange={(e) => updateFormData("nativeDistrict", e.target.value)}
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAddress">{t.registration.currentAddressKerala} *</Label>
                  <Textarea
                    id="currentAddress"
                    value={formData.currentAddress}
                    onChange={(e) => updateFormData("currentAddress", e.target.value)}
                    required
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{t.registration.healthInfoEncrypted}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">{t.registration.bloodGroup}</Label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.registration.selectBloodGroup} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">{t.registration.allergies}</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => updateFormData("allergies", e.target.value)}
                    placeholder={t.registration.allergiesPlaceholder}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedication">{t.registration.currentMedication}</Label>
                  <Textarea
                    id="currentMedication"
                    value={formData.currentMedication}
                    onChange={(e) => updateFormData("currentMedication", e.target.value)}
                    placeholder={t.registration.currentMedicationPlaceholder}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthHistory">{t.registration.healthHistory}</Label>
                  <Textarea
                    id="healthHistory"
                    value={formData.healthHistory}
                    onChange={(e) => updateFormData("healthHistory", e.target.value)}
                    placeholder={t.registration.healthHistoryPlaceholder}
                    maxLength={2000}
                  />
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">{t.registration.dataPrivacySecurity}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {t.registration.privacyPoints.map((point, index) => (
                      <li key={index}>• {point}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => updateFormData("consent", checked as boolean)}
                  />
                  <Label htmlFor="consent" className="text-sm">
                    {t.registration.consentText}
                  </Label>
                </div>
              </div>

              <Button type="button" className="w-full" disabled={isSubmitting} onClick={submitClicked}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? t.registration.savingSecurely : t.registration.registerWorker}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
