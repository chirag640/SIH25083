"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Search,
  Activity,
  Shield,
  User,
  Globe,
  QrCode,
  FileText,
  Calendar,
  Stethoscope,
  Download,
  Upload,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/translations"

export default function HelpPage() {
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Help & Documentation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>Get started with the Migrant Worker Healthcare System in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Register Worker</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create a new worker profile with basic information and health details
                </p>
                <Button asChild size="sm">
                  <Link href="/workers/register">Register Now</Link>
                </Button>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Generate QR Code</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create a digital health card with QR code for quick access
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/workers/dashboard">View Dashboard</Link>
                </Button>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Medical Access</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Doctors can scan QR codes or search to access health records
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/doctors">Doctor Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Documentation */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">For Workers</h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="registration">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Worker Registration
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Register as a new worker by providing:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Personal information (name, age, gender, address)</li>
                      <li>Contact details (phone, emergency contact)</li>
                      <li>Health information (blood group, allergies, medications)</li>
                      <li>Medical history and current conditions</li>
                    </ul>
                    <Badge variant="secondary">Available in 3 languages</Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dashboard">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Worker Dashboard
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Access your personal health dashboard to:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>View your complete health profile</li>
                      <li>See medical visit timeline</li>
                      <li>Download QR health card</li>
                      <li>Upload medical documents</li>
                      <li>Track prescriptions and follow-ups</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documents">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Document Upload
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Upload and manage medical documents:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Prescriptions and lab reports</li>
                      <li>Vaccination cards and certificates</li>
                      <li>Medical imaging and test results</li>
                      <li>Insurance and identification documents</li>
                    </ul>
                    <Badge variant="outline">Encrypted & Secure</Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qr-card">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Health Card
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Generate and download your digital health card:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Multiple card styles (standard, emergency, compact)</li>
                      <li>QR code for instant access</li>
                      <li>Emergency contact information</li>
                      <li>Download as PNG or PDF</li>
                      <li>Print-ready format</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">For Healthcare Providers</h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="search">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Patient Search
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Find patient records quickly using:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Worker ID or name search</li>
                      <li>Phone number lookup</li>
                      <li>QR code scanning</li>
                      <li>Blood group and gender filters</li>
                      <li>Advanced search with multiple criteria</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="records">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Health Records
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>View comprehensive patient information:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Complete medical history timeline</li>
                      <li>Current medications and allergies</li>
                      <li>Uploaded documents and test results</li>
                      <li>Emergency contact information</li>
                      <li>Previous visit summaries</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="actions">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Medical Actions
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Add new medical visits with:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Diagnosis with auto-suggestions</li>
                      <li>Prescription management</li>
                      <li>Vaccination records</li>
                      <li>Lab test recommendations</li>
                      <li>Follow-up scheduling</li>
                    </ul>
                    <Badge variant="secondary">Auto-logged for audit</Badge>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prescriptions">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Prescription Generator
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p>Generate professional prescriptions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Multilingual prescription support</li>
                      <li>QR code for verification</li>
                      <li>Doctor and hospital information</li>
                      <li>Download as PDF or print</li>
                      <li>Automatic audit trail</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* System Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>Advanced capabilities built into the healthcare system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Security</h3>
                <p className="text-sm text-muted-foreground">End-to-end encryption and audit trails</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Multilingual</h3>
                <p className="text-sm text-muted-foreground">English, Malayalam, and Hindi support</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Offline Ready</h3>
                <p className="text-sm text-muted-foreground">Downloadable QR cards and documents</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Follow-ups</h3>
                <p className="text-sm text-muted-foreground">Automated alerts and reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Additional resources and support options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/admin" className="flex flex-col items-center space-y-2">
                  <Shield className="h-6 w-6" />
                  <span>Admin Dashboard</span>
                  <span className="text-xs text-muted-foreground">System management</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/security/audit-logs" className="flex flex-col items-center space-y-2">
                  <Activity className="h-6 w-6" />
                  <span>Audit Logs</span>
                  <span className="text-xs text-muted-foreground">System activity</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/storage/management" className="flex flex-col items-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Storage Management</span>
                  <span className="text-xs text-muted-foreground">Data management</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
