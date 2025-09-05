"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, QrCode, CreditCard, Printer, Globe, Shield } from "lucide-react"
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

export default function HealthCardGeneratorPage() {
  const params = useParams()
  const workerId = params.id as string
  const [worker, setWorker] = useState<WorkerRecord | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [language, setLanguage] = useState("en")
  const [cardStyle, setCardStyle] = useState("standard")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Language translations
  const translations = {
    en: {
      title: "Health Card Generator",
      healthCard: "HEALTH RECORD CARD",
      emergencyCard: "EMERGENCY HEALTH CARD",
      workerName: "Name",
      workerId: "Worker ID",
      bloodGroup: "Blood Group",
      allergies: "Allergies",
      emergencyContact: "Emergency Contact",
      issuedBy: "Issued by Kerala Health Department",
      scanForDetails: "Scan QR code for complete health record",
      noAllergies: "No known allergies",
      downloadPNG: "Download as PNG",
      downloadPDF: "Download as PDF",
      printCard: "Print Card",
      cardStyle: "Card Style",
      standard: "Standard",
      emergency: "Emergency",
      compact: "Compact",
    },
    ml: {
      title: "ആരോഗ്യ കാർഡ് ജനറേറ്റർ",
      healthCard: "ആരോഗ്യ രേഖ കാർഡ്",
      emergencyCard: "അടിയന്തര ആരോഗ്യ കാർഡ്",
      workerName: "പേര്",
      workerId: "തൊഴിലാളി ഐഡി",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      allergies: "അലർജികൾ",
      emergencyContact: "അടിയന്തര ബന്ധം",
      issuedBy: "കേരള ആരോഗ്യ വകുപ്പ് നൽകിയത്",
      scanForDetails: "പൂർണ്ണ ആരോഗ്യ രേഖയ്ക്കായി QR കോഡ് സ്കാൻ ചെയ്യുക",
      noAllergies: "അറിയപ്പെടുന്ന അലർജികൾ ഇല്ല",
      downloadPNG: "PNG ആയി ഡൗൺലോഡ് ചെയ്യുക",
      downloadPDF: "PDF ആയി ഡൗൺലോഡ് ചെയ്യുക",
      printCard: "കാർഡ് പ്രിന്റ് ചെയ്യുക",
      cardStyle: "കാർഡ് ശൈലി",
      standard: "സാധാരണ",
      emergency: "അടിയന്തര",
      compact: "ചെറുത്",
    },
    hi: {
      title: "स्वास्थ्य कार्ड जेनरेटर",
      healthCard: "स्वास्थ्य रिकॉर्ड कार्ड",
      emergencyCard: "आपातकालीन स्वास्थ्य कार्ड",
      workerName: "नाम",
      workerId: "श्रमिक आईडी",
      bloodGroup: "रक्त समूह",
      allergies: "एलर्जी",
      emergencyContact: "आपातकालीन संपर्क",
      issuedBy: "केरल स्वास्थ्य विभाग द्वारा जारी",
      scanForDetails: "पूर्ण स्वास्थ्य रिकॉर्ड के लिए QR कोड स्कैन करें",
      noAllergies: "कोई ज्ञात एलर्जी नहीं",
      downloadPNG: "PNG के रूप में डाउनलोड करें",
      downloadPDF: "PDF के रूप में डाउनलोड करें",
      printCard: "कार्ड प्रिंट करें",
      cardStyle: "कार्ड शैली",
      standard: "मानक",
      emergency: "आपातकालीन",
      compact: "संक्षिप्त",
    },
  }

  const t = translations[language as keyof typeof translations]

  useEffect(() => {
    // Load worker data
    const workerData = localStorage.getItem(`worker_${workerId}`)
    if (workerData) {
      try {
        const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)
        const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
        setWorker(decryptedWorker)
        SecurityUtils.logAccess("health_card_generator_access", workerId, "health_worker")
      } catch (error) {
        console.error("Error loading worker data:", error)
      }
    }
  }, [workerId])

  useEffect(() => {
    if (worker) {
      // Generate QR code with emergency data
      const qrData = JSON.stringify({
        id: worker.workerId,
        name: worker.fullName,
        bloodGroup: worker.bloodGroup,
        allergies: worker.allergies,
        emergency: true,
        phone: worker.phoneNumber,
        type: "health_record",
      })
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
      setQrCodeUrl(qrUrl)
    }
  }, [worker])

  useEffect(() => {
    if (worker && qrCodeUrl) {
      generateHealthCard()
    }
  }, [worker, qrCodeUrl, language, cardStyle])

  const generateHealthCard = () => {
    const canvas = canvasRef.current
    if (!canvas || !worker) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on card style
    const cardDimensions = {
      standard: { width: 600, height: 380 },
      emergency: { width: 400, height: 250 },
      compact: { width: 350, height: 220 },
    }

    const { width, height } = cardDimensions[cardStyle as keyof typeof cardDimensions]
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Border
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 3
    ctx.strokeRect(5, 5, width - 10, height - 10)

    // Header background
    const headerHeight = cardStyle === "compact" ? 40 : 50
    ctx.fillStyle = "#0891b2"
    ctx.fillRect(10, 10, width - 20, headerHeight)

    // Header text
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${cardStyle === "compact" ? "16" : "20"}px Arial`
    ctx.textAlign = "center"
    const headerText = cardStyle === "emergency" ? t.emergencyCard : t.healthCard
    ctx.fillText(headerText, width / 2, cardStyle === "compact" ? 35 : 40)

    // Worker information
    ctx.fillStyle = "#1f2937"
    ctx.textAlign = "left"

    const startY = headerHeight + 30
    const lineHeight = cardStyle === "compact" ? 18 : 22
    let currentY = startY

    // Name
    ctx.font = `bold ${cardStyle === "compact" ? "14" : "16"}px Arial`
    ctx.fillText(`${t.workerName}: ${worker.fullName}`, 20, currentY)
    currentY += lineHeight

    // Worker ID
    ctx.font = `${cardStyle === "compact" ? "12" : "14"}px Arial`
    ctx.fillText(`${t.workerId}: ${worker.workerId}`, 20, currentY)
    currentY += lineHeight

    // Blood Group
    if (worker.bloodGroup) {
      ctx.font = `bold ${cardStyle === "compact" ? "12" : "14"}px Arial`
      ctx.fillStyle = "#dc2626"
      ctx.fillText(`${t.bloodGroup}: ${worker.bloodGroup}`, 20, currentY)
      currentY += lineHeight
    }

    // Allergies (if any)
    if (worker.allergies && cardStyle !== "compact") {
      ctx.fillStyle = "#dc2626"
      ctx.font = `bold ${cardStyle === "compact" ? "11" : "12"}px Arial`
      const allergiesText = `⚠ ${t.allergies}: ${worker.allergies}`
      const maxWidth = width - 180
      const words = allergiesText.split(" ")
      let line = ""

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 20, currentY)
          line = words[i] + " "
          currentY += lineHeight - 2
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 20, currentY)
      currentY += lineHeight
    }

    // Emergency contact
    if (worker.phoneNumber && cardStyle !== "compact") {
      ctx.fillStyle = "#1f2937"
      ctx.font = `${cardStyle === "compact" ? "11" : "12"}px Arial`
      ctx.fillText(`${t.emergencyContact}: ${worker.phoneNumber}`, 20, currentY)
      currentY += lineHeight
    }

    // QR Code area
    const qrSize = cardStyle === "compact" ? 80 : cardStyle === "emergency" ? 100 : 120
    const qrX = width - qrSize - 20
    const qrY = startY

    // QR Code border
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)

    // QR Code placeholder (will be replaced with actual image)
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(qrX, qrY, qrSize, qrSize)

    // QR Code text
    ctx.fillStyle = "#6b7280"
    ctx.font = `${cardStyle === "compact" ? "8" : "10"}px Arial`
    ctx.textAlign = "center"
    ctx.fillText("QR Code", qrX + qrSize / 2, qrY + qrSize + 15)

    // Footer
    ctx.fillStyle = "#6b7280"
    ctx.font = `${cardStyle === "compact" ? "8" : "10"}px Arial`
    ctx.textAlign = "center"
    ctx.fillText(t.issuedBy, width / 2, height - 15)

    if (cardStyle !== "compact") {
      ctx.fillText(t.scanForDetails, width / 2, height - 5)
    }

    // Load and draw QR code image
    if (qrCodeUrl) {
      const qrImage = new Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = () => {
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
      }
      qrImage.src = qrCodeUrl
    }
  }

  const downloadAsPNG = () => {
    const canvas = canvasRef.current
    if (!canvas || !worker) return

    const link = document.createElement("a")
    link.download = `health-card-${worker.workerId}-${cardStyle}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    SecurityUtils.logAccess("health_card_download_png", workerId, "health_worker")
  }

  const downloadAsPDF = () => {
    const canvas = canvasRef.current
    if (!canvas || !worker) return

    // Create a new canvas for PDF (higher resolution)
    const pdfCanvas = document.createElement("canvas")
    const pdfCtx = pdfCanvas.getContext("2d")
    if (!pdfCtx) return

    // Scale up for better PDF quality
    const scale = 2
    pdfCanvas.width = canvas.width * scale
    pdfCanvas.height = canvas.height * scale
    pdfCtx.scale(scale, scale)

    // Redraw on high-res canvas
    pdfCtx.drawImage(canvas, 0, 0)

    // Convert to PDF-friendly format
    const imgData = pdfCanvas.toDataURL("image/jpeg", 0.95)

    // Create download link
    const link = document.createElement("a")
    link.download = `health-card-${worker.workerId}-${cardStyle}.jpg`
    link.href = imgData
    link.click()

    SecurityUtils.logAccess("health_card_download_pdf", workerId, "health_worker")
  }

  const printCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const imgData = canvas.toDataURL("image/png")

    printWindow.document.write(`
      <html>
        <head>
          <title>Health Card - ${worker?.fullName}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              background: white;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              border: 1px solid #ccc;
            }
            @media print {
              body { padding: 0; }
              img { border: none; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Health Card" />
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    SecurityUtils.logAccess("health_card_print", workerId, "health_worker")
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/workers/dashboard`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              <Badge variant="secondary">{worker.fullName}</Badge>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Health Card Options
              </CardTitle>
              <CardDescription>Customize and download your health card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.cardStyle}</label>
                  <Select value={cardStyle} onValueChange={setCardStyle}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t.standard}</SelectItem>
                      <SelectItem value="emergency">{t.emergency}</SelectItem>
                      <SelectItem value="compact">{t.compact}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-end">
                  <Button onClick={downloadAsPNG} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadPNG}
                  </Button>
                  <Button onClick={downloadAsPDF} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadPDF}
                  </Button>
                  <Button onClick={printCard} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    {t.printCard}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Card Preview
              </CardTitle>
              <CardDescription>Preview of your health card in {cardStyle} style</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="border border-border rounded-lg p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded shadow-sm"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Worker Information Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Card Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.workerName}</p>
                    <p className="text-foreground">{worker.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.workerId}</p>
                    <p className="text-foreground">{worker.workerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-foreground">{calculateAge(worker.dateOfBirth)} years</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.bloodGroup}</p>
                    <p className="text-foreground">{worker.bloodGroup || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.allergies}</p>
                    <p className="text-foreground">{worker.allergies || t.noAllergies}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.emergencyContact}</p>
                    <p className="text-foreground">{worker.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
