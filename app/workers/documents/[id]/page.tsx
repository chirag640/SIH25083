"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, FileText, Download, Trash2, AlertTriangle, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SecurityUtils, DataManager } from "@/lib/utils"

interface DocumentRecord {
  id: string
  workerId: string
  fileName: string
  fileType: string
  documentType: "prescription" | "lab_report" | "vaccination" | "medical_certificate" | "other"
  uploadDate: string
  fileSize: number
  description: string
  isEncrypted: boolean
  fileData: string // Base64 encoded file data
}

interface WorkerRecord {
  workerId: string
  fullName: string
  dateOfBirth: string
  gender: string
}

export default function WorkerDocumentsPage() {
  const params = useParams()
  const workerId = params.id as string
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [consent, setConsent] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    // Load worker data
    const workerData = localStorage.getItem(`worker_${workerId}`)
    if (workerData) {
      try {
        const encryptedWorker = JSON.parse(workerData)
        const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
        setWorker(decryptedWorker)
      } catch (error) {
        console.error("Error loading worker data:", error)
      }
    }

    // Load documents
    loadDocuments()
  }, [workerId])

  const loadDocuments = () => {
    const allDocuments: DocumentRecord[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`document_${workerId}_`)) {
        const docData = localStorage.getItem(key)
        if (docData) {
          try {
            const parsedDoc = JSON.parse(docData)
            allDocuments.push(parsedDoc)
          } catch (error) {
            console.error("Error parsing document:", error)
          }
        }
      }
    }
    // Sort by upload date (newest first)
    allDocuments.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    setDocuments(allDocuments)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Only PDF, JPG, and PNG files are allowed")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      setUploadError("")
    }
  }

  const uploadDocument = async () => {
    if (!selectedFile || !documentType || !consent) {
      setUploadError("Please fill all required fields and provide consent")
      return
    }

    setIsUploading(true)
    setUploadError("")

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      // Create document record
      const documentId = SecurityUtils.generateSecureId()
      const document: DocumentRecord = {
        id: documentId,
        workerId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        documentType: documentType as any,
        uploadDate: new Date().toISOString(),
        fileSize: selectedFile.size,
        description: SecurityUtils.sanitizeInput(description),
        isEncrypted: true,
        fileData: SecurityUtils.encrypt(fileData), // Encrypt file data
      }

      // Store document
      localStorage.setItem(`document_${workerId}_${documentId}`, JSON.stringify(document))

      // Log the upload
      SecurityUtils.logAccess("document_upload", workerId, "health_worker")

      // Reset form
      setSelectedFile(null)
      setDocumentType("")
      setDescription("")
      setConsent(false)

      // Reload documents
      loadDocuments()

      // Reset file input
  const fileInputEl = window.document.getElementById("file-upload") as HTMLInputElement
  if (fileInputEl) fileInputEl.value = ""
    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadError("Error uploading document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadDocument = (document: DocumentRecord) => {
    try {
      // Decrypt file data
      const decryptedData = SecurityUtils.decrypt(document.fileData)

  // Create download link
  const linkEl = window.document.createElement("a")
  linkEl.href = decryptedData
  linkEl.download = document.fileName
  linkEl.click()

      SecurityUtils.logAccess("document_download", workerId, "health_worker")
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Error downloading document")
    }
  }

  const deleteDocument = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      localStorage.removeItem(`document_${workerId}_${documentId}`)
      SecurityUtils.logAccess("document_delete", workerId, "health_worker")
      loadDocuments()
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      prescription: "Prescription",
      lab_report: "Lab Report",
      vaccination: "Vaccination Card",
      medical_certificate: "Medical Certificate",
      other: "Other",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      prescription: "bg-blue-100 text-blue-800",
      lab_report: "bg-green-100 text-green-800",
      vaccination: "bg-purple-100 text-purple-800",
      medical_certificate: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Worker not found.</p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/workers/dashboard`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Medical Documents</h1>
            <Badge variant="secondary">{worker.fullName}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Medical Document
              </CardTitle>
              <CardDescription>
                Upload prescriptions, lab reports, vaccination cards, and other medical documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadError && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{uploadError}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File *</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType} disabled={isUploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="vaccination">Vaccination Card</SelectItem>
                      <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document..."
                  maxLength={200}
                  disabled={isUploading}
                />
              </div>

              {/* Consent Section */}
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Document Security & Privacy
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                  <li>• Documents are encrypted before storage</li>
                  <li>• Only you and authorized healthcare providers can access your documents</li>
                  <li>• All document access is logged for security</li>
                  <li>• You can delete documents at any time</li>
                </ul>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="document-consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    disabled={isUploading}
                  />
                  <Label htmlFor="document-consent" className="text-sm">
                    I consent to uploading this medical document and understand the security measures in place
                  </Label>
                </div>
              </div>

              <Button
                onClick={uploadDocument}
                disabled={!selectedFile || !documentType || !consent || isUploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents ({documents.length})
              </CardTitle>
              <CardDescription>Your uploaded medical documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload your first medical document above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-foreground">{document.fileName}</h4>
                            <Badge className={getDocumentTypeColor(document.documentType)}>
                              {getDocumentTypeLabel(document.documentType)}
                            </Badge>
                          </div>

                          {document.description && (
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(document.uploadDate).toLocaleDateString()}
                            </span>
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Encrypted
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadDocument(document)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDocument(document.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
