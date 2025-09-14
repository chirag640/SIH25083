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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  AlertTriangle, 
  Globe, 
  User, 
  MapPin, 
  Phone, 
  Heart, 
  FileText, 
  CheckCircle,
  ArrowRight,
  UserPlus,
  Calendar,
  Home
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SecurityUtils, DataManager } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/translations"
import { Navigation } from "@/components/navigation"

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
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement | null>(null)
  const { toast } = useToast()

  const progressPercentage = (currentStep / totalSteps) * 100

  const stepTitles = [
    "Personal Information",
    "Contact & Location",
    "Health Information", 
    "Review & Submit"
  ]

  const stepIcons = [User, MapPin, Heart, CheckCircle]

  // Live validation for individual fields
  const validateField = (field: keyof WorkerData, value: string | boolean): string => {
    switch (field) {
      case "fullName":
        if (!value || typeof value !== "string") return t.registration.errors.fullNameRequired
        if (!SecurityUtils.validateName(value)) return t.registration.errors.fullNameInvalid
        return ""
      case "dateOfBirth":
        if (!value || typeof value !== "string") return t.registration.errors.dobRequired
        const birthDate = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 16 || age > 100) return t.registration.errors.ageRange
        return ""
      case "gender":
        if (!value || typeof value !== "string") return t.registration.errors.genderRequired
        return ""
      case "nativeState":
        if (!value || typeof value !== "string") return t.registration.errors.nativeStateRequired
        return ""
      case "nativeDistrict":
        if (!value || typeof value !== "string") return t.registration.errors.nativeDistrictRequired
        return ""
      case "currentAddress":
        if (!value || typeof value !== "string") return t.registration.errors.currentAddressRequired
        return ""
      case "phoneNumber":
        if (value && typeof value === "string" && !SecurityUtils.validatePhoneNumber(value)) {
          return t.registration.errors.phoneInvalid
        }
        return ""
      case "consent":
        if (!value) return t.registration.errors.consentRequired
        return ""
      default:
        return ""
    }
  }

  const validateForm = (): boolean => {
    const errors: string[] = []
    const newFieldErrors: Record<string, string> = {}

    // Validate all required fields
    const fieldsToValidate: (keyof WorkerData)[] = [
      "fullName", "dateOfBirth", "gender", "nativeState", 
      "nativeDistrict", "currentAddress", "phoneNumber", "consent"
    ]

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        errors.push(error)
        newFieldErrors[field] = error
      }
    })

    setValidationErrors(errors)
    setFieldErrors(newFieldErrors)

    // Show toast for validation errors
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} before proceeding`,
        variant: "destructive"
      })
    }

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
      toast({
        title: "Registration Successful! 🎉",
        description: `Welcome ${formData.fullName}! Your Worker ID is ${workerId}`,
      })

      // Brief delay to show the success message
      setTimeout(() => {
        router.push(`/workers/${workerId}`)
      }, 1500)
    } catch (error) {
      console.error("Error saving worker record:", error)
      toast({
        title: "Registration Failed",
        description: "We couldn't save your registration. Please try again or contact support if the problem persists.",
        variant: "destructive"
      })
      SecurityUtils.logAccess("worker_registration_failed", undefined, "health_worker")
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitClicked = () => {
    console.log("Register button clicked")
    toast({ 
      title: "Processing Registration...", 
      description: "Please wait while we save your information securely"
    })
    void handleSubmit()
  }

  const updateFormData = (field: keyof WorkerData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Live validation - validate field after user input
    const error = validateField(field, value)
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    // Clear general validation errors when user starts fixing issues
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const validateCurrentStep = (): boolean => {
    let stepFields: (keyof WorkerData)[] = []
    
    switch (currentStep) {
      case 1:
        stepFields = ["fullName", "dateOfBirth", "gender"]
        break
      case 2:
        stepFields = ["nativeState", "nativeDistrict", "currentAddress", "phoneNumber"]
        break
      case 3:
        // Health information is optional
        return true
      case 4:
        stepFields = ["consent"]
        break
    }

    const errors: string[] = []
    const newFieldErrors: Record<string, string> = {}

    stepFields.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        errors.push(error)
        newFieldErrors[field] = error
      }
    })

    setFieldErrors(prev => ({ ...prev, ...newFieldErrors }))

    if (errors.length > 0) {
      toast({
        title: "Please complete this step",
        description: `Fix ${errors.length} error${errors.length > 1 ? 's' : ''} before continuing`,
        variant: "destructive"
      })
    }

    return errors.length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      toast({
        title: "Step completed",
        description: `Proceeding to ${stepTitles[currentStep]}`,
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Personal Information</h3>
              <p className="text-muted-foreground">Let's start with your basic details</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium">{t.registration.fullName} *</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    required
                    maxLength={100}
                    className={`h-12 text-lg pr-10 ${
                      fieldErrors.fullName 
                        ? 'border-destructive focus:border-destructive' 
                        : formData.fullName && !fieldErrors.fullName 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formData.fullName && !fieldErrors.fullName && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {fieldErrors.fullName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-base font-medium">{t.registration.dateOfBirth} *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className={`h-12 ${fieldErrors.dateOfBirth ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {fieldErrors.dateOfBirth && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {fieldErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-base font-medium">{t.registration.gender} *</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger className={`h-12 ${fieldErrors.gender ? 'border-destructive focus:border-destructive' : ''}`}>
                      <SelectValue placeholder={t.registration.selectGender} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.registration.male}</SelectItem>
                      <SelectItem value="female">{t.registration.female}</SelectItem>
                      <SelectItem value="other">{t.registration.other}</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.gender && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {fieldErrors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Contact & Location</h3>
              <p className="text-muted-foreground">Where can we reach you?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-base font-medium">{t.registration.phoneNumber} *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                  maxLength={15}
                  className={`h-12 text-lg ${fieldErrors.phoneNumber ? 'border-destructive focus:border-destructive' : ''}`}
                  placeholder="+91 XXXXX XXXXX"
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {fieldErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nativeState" className="text-base font-medium">{t.registration.nativeState} *</Label>
                  <Input
                    id="nativeState"
                    value={formData.nativeState}
                    onChange={(e) => updateFormData("nativeState", e.target.value)}
                    required
                    maxLength={50}
                    className={`h-12 ${fieldErrors.nativeState ? 'border-destructive focus:border-destructive' : ''}`}
                    placeholder="Your home state"
                  />
                  {fieldErrors.nativeState && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {fieldErrors.nativeState}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nativeDistrict" className="text-base font-medium">{t.registration.nativeDistrict} *</Label>
                  <Input
                    id="nativeDistrict"
                    value={formData.nativeDistrict}
                    onChange={(e) => updateFormData("nativeDistrict", e.target.value)}
                    required
                    maxLength={50}
                    className={`h-12 ${fieldErrors.nativeDistrict ? 'border-destructive focus:border-destructive' : ''}`}
                    placeholder="Your home district"
                  />
                  {fieldErrors.nativeDistrict && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {fieldErrors.nativeDistrict}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAddress" className="text-base font-medium">{t.registration.currentAddressKerala} *</Label>
                <Textarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => updateFormData("currentAddress", e.target.value)}
                  required
                  maxLength={500}
                  className={`min-h-[120px] ${fieldErrors.currentAddress ? 'border-destructive focus:border-destructive' : ''}`}
                  placeholder="Enter your current address where you're working"
                />
                {fieldErrors.currentAddress && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {fieldErrors.currentAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Health Information</h3>
              <p className="text-muted-foreground">Your health data is encrypted and secure</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Data Security</span>
              </div>
              <p className="text-sm text-blue-800">All health information is encrypted and stored securely. Only authorized healthcare providers can access this data.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-base font-medium">{t.registration.bloodGroup}</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
                  <SelectTrigger className="h-12">
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

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-base font-medium">{t.registration.allergies}</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => updateFormData("allergies", e.target.value)}
                  placeholder={t.registration.allergiesPlaceholder}
                  maxLength={1000}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedication" className="text-base font-medium">{t.registration.currentMedication}</Label>
                <Textarea
                  id="currentMedication"
                  value={formData.currentMedication}
                  onChange={(e) => updateFormData("currentMedication", e.target.value)}
                  placeholder={t.registration.currentMedicationPlaceholder}
                  maxLength={1000}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthHistory" className="text-base font-medium">{t.registration.healthHistory}</Label>
                <Textarea
                  id="healthHistory"
                  value={formData.healthHistory}
                  onChange={(e) => updateFormData("healthHistory", e.target.value)}
                  placeholder={t.registration.healthHistoryPlaceholder}
                  maxLength={2000}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">Please review your information before submitting</p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Personal Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {formData.fullName}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {formData.dateOfBirth}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {formData.gender}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {formData.phoneNumber}</div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Location Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Native State:</span> {formData.nativeState}</div>
                  <div><span className="text-muted-foreground">Native District:</span> {formData.nativeDistrict}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Current Address:</span> {formData.currentAddress}</div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Heart className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Health Information</h4>
                </div>
                <div className="text-sm">
                  <div className="mb-2"><span className="text-muted-foreground">Blood Group:</span> {formData.bloodGroup || 'Not specified'}</div>
                  {formData.allergies && <div className="mb-2"><span className="text-muted-foreground">Allergies:</span> {formData.allergies}</div>}
                  {formData.currentMedication && <div className="mb-2"><span className="text-muted-foreground">Current Medication:</span> {formData.currentMedication}</div>}
                  {formData.healthHistory && <div><span className="text-muted-foreground">Health History:</span> {formData.healthHistory}</div>}
                </div>
              </Card>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">{t.registration.dataPrivacySecurity}</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {t.registration.privacyPoints.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>

              <div className={`flex items-start space-x-3 p-4 bg-white border rounded-lg ${fieldErrors.consent ? 'border-destructive' : 'border-border'}`}>
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => updateFormData("consent", checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="consent" className="text-sm font-medium">
                    {t.registration.consentText}
                  </Label>
                  {fieldErrors.consent && (
                    <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      {fieldErrors.consent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Navigation language={language} onLanguageChange={setLanguage} translations={t} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <UserPlus className="w-4 h-4 mr-2" />
              Worker Registration
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.registration.title}</h1>
            <p className="text-lg text-muted-foreground">Secure healthcare registration for migrant workers</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {stepTitles.map((title, index) => {
                const StepIcon = stepIcons[index]
                const stepNumber = index + 1
                const isActive = stepNumber === currentStep
                const isCompleted = stepNumber < currentStep

                return (
                  <div key={index} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {title}
                      </p>
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className={`hidden md:block w-16 h-0.5 ml-4 ${
                        stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Main Form Card */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitClicked}
                    disabled={isSubmitting || !formData.consent}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Register Worker</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-2">Need help with registration?</p>
            <Button variant="ghost" asChild>
              <Link href="/help" className="text-blue-600 hover:text-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                Contact Support: 1800-XXX-XXXX
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
