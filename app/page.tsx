"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { 
  UserPlus, 
  Search, 
  Activity, 
  Shield, 
  User, 
  Globe,
  Heart,
  Users,
  FileText,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Hospital,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/translations"

export default function HomePage() {
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Navigation */}
      <Navigation 
        language={language} 
        onLanguageChange={setLanguage} 
        translations={t} 
      />

      {/* Hero Section - Redesigned */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5" />
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
              <Heart className="w-4 h-4 mr-2" />
              Healthcare • Dignity • Support
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              {t.home.subtitle}
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              {t.home.description}
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                <Link href="/workers/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t.nav.registerWorker}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50">
                <Link href="/workers/search">
                  <Search className="mr-2 h-5 w-5" />
                  {t.nav.searchRecords}
                </Link>
              </Button>
            </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Worker Portal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Access your health records and services</p>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/workers/dashboard">
                      Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Doctor Portal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Manage patient records and consultations</p>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/doctors">
                      Access Portal <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get help when you need it most</p>
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/help">
                      Get Help <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <p className="text-muted-foreground">Registered Workers</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">2.5K+</div>
              <p className="text-muted-foreground">Healthcare Providers</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">150K+</div>
              <p className="text-muted-foreground">Health Records</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              Key Features
            </Badge>
            <h3 className="text-3xl font-bold text-foreground mb-4">{t.home.keyFeatures}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed for migrant workers and healthcare providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{t.home.easyRegistration}</CardTitle>
                <CardDescription className="text-base">{t.home.easyRegistrationDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.home.easyRegistrationDetail}</p>
                <div className="flex items-center mt-4 text-blue-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{t.home.qrCodeAccess}</CardTitle>
                <CardDescription className="text-base">{t.home.qrCodeAccessDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.home.qrCodeAccessDetail}</p>
                <div className="flex items-center mt-4 text-green-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{t.home.securePrivate}</CardTitle>
                <CardDescription className="text-base">{t.home.securePrivateDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.home.securePrivateDetail}</p>
                <div className="flex items-center mt-4 text-purple-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Hospital className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Healthcare Network</CardTitle>
                <CardDescription className="text-base">Connected healthcare providers nationwide</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Access to a comprehensive network of healthcare facilities and medical professionals across the country.</p>
                <div className="flex items-center mt-4 text-orange-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">24/7 Emergency Support</CardTitle>
                <CardDescription className="text-base">Round-the-clock medical assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Emergency medical support and helpline services available 24 hours a day, 7 days a week.</p>
                <div className="flex items-center mt-4 text-teal-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Multilingual Support</CardTitle>
                <CardDescription className="text-base">Available in multiple regional languages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Complete platform support in English, Hindi, Malayalam, and other regional languages for better accessibility.</p>
                <div className="flex items-center mt-4 text-indigo-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of migrant workers who have already registered for comprehensive healthcare support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/workers/register">
                <UserCheck className="mr-2 h-5 w-5" />
                Register Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/help">
                <Phone className="mr-2 h-5 w-5" />
                Get Support
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Healthcare System</h3>
                  <p className="text-slate-400 text-sm">For Migrant Workers</p>
                </div>
              </div>
              <p className="text-slate-400">
                Providing comprehensive healthcare solutions and support for migrant workers across the nation.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/workers/register" className="block text-slate-400 hover:text-white transition-colors">
                  Worker Registration
                </Link>
                <Link href="/doctors" className="block text-slate-400 hover:text-white transition-colors">
                  Doctor Portal
                </Link>
                <Link href="/workers/search" className="block text-slate-400 hover:text-white transition-colors">
                  Search Records
                </Link>
                <Link href="/help" className="block text-slate-400 hover:text-white transition-colors">
                  Help & Support
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Support</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Phone className="h-4 w-4" />
                  <span>+91 1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span>Available Nationwide</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Emergency Support</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Languages</h4>
              <div className="space-y-2">
                <div className="text-slate-400">English</div>
                <div className="text-slate-400">हिंदी (Hindi)</div>
                <div className="text-slate-400">മലയാളം (Malayalam)</div>
                <div className="text-slate-400">+ More Regional Languages</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">
              © 2025 Migrant Worker Healthcare System. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
