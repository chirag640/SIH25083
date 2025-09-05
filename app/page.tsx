"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Search, Activity, Shield, User, Globe } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/translations"

export default function HomePage() {
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
              <h1 className="text-2xl font-bold text-foreground">{t.home.title}</h1>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/workers" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.nav.workerRecords}
                </Link>
                <Link href="/doctors" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.nav.doctorDashboard}
                </Link>
              </nav>

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

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">{t.home.subtitle}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">{t.home.description}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/workers/register">
                <UserPlus className="mr-2 h-5 w-5" />
                {t.nav.registerWorker}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/workers/dashboard">
                <User className="mr-2 h-5 w-5" />
                {t.nav.workerDashboard}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/workers/search">
                <Search className="mr-2 h-5 w-5" />
                {t.nav.searchRecords}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/doctors">
                <Activity className="mr-2 h-5 w-5" />
                {t.nav.doctorDashboard}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/admin">
                <Shield className="mr-2 h-5 w-5" />
                Admin
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/help">
                <Globe className="mr-2 h-5 w-5" />
                Help
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">{t.home.keyFeatures}</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <UserPlus className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{t.home.easyRegistration}</CardTitle>
                <CardDescription>{t.home.easyRegistrationDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.home.easyRegistrationDetail}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{t.home.qrCodeAccess}</CardTitle>
                <CardDescription>{t.home.qrCodeAccessDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.home.qrCodeAccessDetail}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{t.home.securePrivate}</CardTitle>
                <CardDescription>{t.home.securePrivateDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.home.securePrivateDetail}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">{t.home.footer}</p>
        </div>
      </footer>
    </div>
  )
}
