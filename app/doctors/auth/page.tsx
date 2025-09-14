"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/translations"
import { Navigation } from "@/components/navigation"
import { Stethoscope, LogIn, UserPlus, Shield, Lock, LogOut } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  isVerified: boolean
}

interface LoginFormData {
  email: string
  password: string
}

export default function DoctorAuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [language, setLanguage] = useState("en")
  const t = useTranslations(language)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: "",
    password: ""
  })

  // Check if user is already logged in
  useEffect(() => {
    const authTokens = localStorage.getItem('authTokens')
    const userData = localStorage.getItem('currentUser')
    
    if (authTokens && userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'doctor') {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authTokens')
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      if (result.user.role !== 'doctor') {
        throw new Error('Access denied. Doctor credentials required.')
      }

      // Store authentication data
      localStorage.setItem('authTokens', JSON.stringify(result.tokens))
      localStorage.setItem('currentUser', JSON.stringify(result.user))
      
      setCurrentUser(result.user)

      toast({
        title: "Login Successful! 🎉",
        description: `Welcome back, Dr. ${result.user.name}!`,
      })

      // Redirect to actual doctor dashboard
      setTimeout(() => {
        router.push('/doctors/dashboard')
      }, 1000)

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Login failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authTokens')
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handleRegister = () => {
    router.push('/doctors/register')
  }

  // If user is logged in as doctor, show dashboard options
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
        <Navigation 
          language={language}
          onLanguageChange={setLanguage}
          translations={t}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, Dr. {currentUser.name}
              </h1>
              <p className="text-gray-600">Doctor Dashboard - Migrant Worker Healthcare System</p>
              
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  onClick={() => router.push('/doctors/dashboard')}
                  className="flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Enter Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/doctors/qr-scanner')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    QR Scanner
                  </CardTitle>
                  <CardDescription>
                    Scan worker QR codes for quick access
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/workers/search')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Search Patients
                  </CardTitle>
                  <CardDescription>
                    Search and view patient records
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/doctors/dashboard')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-purple-600" />
                    Full Dashboard
                  </CardTitle>
                  <CardDescription>
                    Access complete doctor dashboard
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* User Info */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-gray-600">{currentUser.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-600">{currentUser.email}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="text-sm text-gray-600 capitalize">{currentUser.role}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${currentUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-gray-600">
                        {currentUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show login/register form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Navigation 
        language={language}
        onLanguageChange={setLanguage}
        translations={t}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Access</h1>
            <p className="text-gray-600">Login or register to access the doctor dashboard</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Doctor Login
                  </CardTitle>
                  <CardDescription>
                    Enter your credentials to access the doctor dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => handleLoginChange('email', e.target.value)}
                        placeholder="doctor@hospital.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => handleLoginChange('password', e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    New Doctor Registration
                  </CardTitle>
                  <CardDescription>
                    Create a new doctor account to join our healthcare network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800">Doctor Registration</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Register as a healthcare provider to access patient records and provide care for migrant workers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleRegister}
                      className="w-full"
                    >
                      Register as Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
