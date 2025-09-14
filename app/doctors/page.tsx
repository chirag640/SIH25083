"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  QrCode,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  Heart,
  Phone,
  MapPin,
  Shield,
  Filter,
  Calendar,
  Bell,
  Stethoscope,
  CalendarDays,
  TrendingUp,
  Syringe,
  UserPlus,
  FileText,
  MessageSquare,
  ChevronRight,
  Star,
  Award,
  BarChart3,
  User,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { SecurityUtils, DataManager, type EncryptedWorkerData } from "@/lib/utils"
import { Navigation } from "@/components/navigation"
import { useTranslations } from "@/lib/translations"

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
}

interface TodayPatient {
  workerId: string
  fullName: string
  lastVisitTime: string
  visitType: string
  diagnosis: string
  bloodGroup: string
  allergies: string
}

interface FollowUpAlert {
  workerId: string
  fullName: string
  followUpDate: string
  originalDiagnosis: string
  daysPastDue: number
  priority: "high" | "medium" | "low"
}

interface Notification {
  id: string
  type: "follow-up" | "vaccination" | "chronic-condition" | "emergency"
  title: string
  message: string
  count: number
  priority: "high" | "medium" | "low"
  timestamp: string
}

export default function DoctorDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [workers, setWorkers] = useState<WorkerRecord[]>([])
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerRecord[]>([])
  const [recentWorkers, setRecentWorkers] = useState<WorkerRecord[]>([])
  const [searchFilter, setSearchFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [todayPatients, setTodayPatients] = useState<TodayPatient[]>([])
  const [followUpAlerts, setFollowUpAlerts] = useState<FollowUpAlert[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [chronicConditionWorkers, setChronicConditionWorkers] = useState<WorkerRecord[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [language, setLanguage] = useState("en")
  
  const t = useTranslations(language)

  // Helper function for badge variants
  const getBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  useEffect(() => {
    const allWorkers: WorkerRecord[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("worker_")) {
        const workerData = localStorage.getItem(key)
        if (workerData) {
          try {
            const encryptedWorker: EncryptedWorkerData = JSON.parse(workerData)

            if (!DataManager.verifyDataIntegrity(encryptedWorker)) {
              console.warn("Data integrity check failed for worker:", encryptedWorker.workerId)
              continue
            }

            const decryptedWorker = DataManager.decryptSensitiveData(encryptedWorker)
            allWorkers.push(decryptedWorker)
          } catch (error) {
            console.error("Error processing worker data:", error)
          }
        }
      }
    }

    allWorkers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setWorkers(allWorkers)
    setFilteredWorkers(allWorkers)
    setRecentWorkers(allWorkers.slice(0, 5))

    loadTodayPatients(allWorkers)
    loadFollowUpAlerts(allWorkers)
    loadChronicConditionWorkers(allWorkers)
    generateNotifications(allWorkers)

    SecurityUtils.logAccess("doctor_dashboard_access", undefined, "doctor")
  }, [])

  const loadTodayPatients = (allWorkers: WorkerRecord[]) => {
    const today = new Date().toISOString().split("T")[0]
    const todayPatientsData: TodayPatient[] = []

    allWorkers.forEach((worker) => {
      const visitsData = localStorage.getItem(`medical_visits_${worker.workerId}`)
      if (visitsData) {
        try {
          const visits: MedicalVisit[] = JSON.parse(visitsData)
          const todayVisits = visits.filter((visit) => visit.date === today)

          todayVisits.forEach((visit) => {
            todayPatientsData.push({
              workerId: worker.workerId,
              fullName: worker.fullName,
              lastVisitTime: visit.date,
              visitType: visit.visitType,
              diagnosis: visit.diagnosis,
              bloodGroup: worker.bloodGroup,
              allergies: worker.allergies,
            })
          })
        } catch (error) {
          console.error("Error loading visits for worker:", worker.workerId, error)
        }
      }
    })

    setTodayPatients(todayPatientsData)
  }

  const loadFollowUpAlerts = (allWorkers: WorkerRecord[]) => {
    const today = new Date()
    const alerts: FollowUpAlert[] = []

    allWorkers.forEach((worker) => {
      const visitsData = localStorage.getItem(`medical_visits_${worker.workerId}`)
      if (visitsData) {
        try {
          const visits: MedicalVisit[] = JSON.parse(visitsData)
          visits.forEach((visit) => {
            if (visit.followUpDate) {
              const followUpDate = new Date(visit.followUpDate)
              const daysDiff = Math.floor((today.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24))

              if (daysDiff >= 0) {
                // Follow-up is due or overdue
                alerts.push({
                  workerId: worker.workerId,
                  fullName: worker.fullName,
                  followUpDate: visit.followUpDate,
                  originalDiagnosis: visit.diagnosis,
                  daysPastDue: daysDiff,
                  priority: daysDiff > 7 ? "high" : daysDiff > 3 ? "medium" : "low",
                })
              }
            }
          })
        } catch (error) {
          console.error("Error loading follow-up alerts for worker:", worker.workerId, error)
        }
      }
    })

    // Sort by priority and days past due
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.daysPastDue - a.daysPastDue
    })

    setFollowUpAlerts(alerts)
  }

  const loadChronicConditionWorkers = (allWorkers: WorkerRecord[]) => {
    const chronicConditions = [
      "diabetes",
      "hypertension",
      "heart disease",
      "kidney disease",
      "liver disease",
      "chronic pain",
      "arthritis",
      "asthma",
      "copd",
      "epilepsy",
    ]

    const chronicWorkers = allWorkers.filter((worker) => {
      const healthHistory = worker.healthHistory.toLowerCase()
      const currentMedication = worker.currentMedication.toLowerCase()

      return (
        chronicConditions.some(
          (condition) => healthHistory.includes(condition) || currentMedication.includes(condition),
        ) || worker.currentMedication.trim() !== ""
      )
    })

    setChronicConditionWorkers(chronicWorkers)
  }

  const generateNotifications = (allWorkers: WorkerRecord[]) => {
    const notificationList: Notification[] = []

    // Follow-up notifications
    const overdueFollowUps = followUpAlerts.filter((alert) => alert.daysPastDue > 0).length
    if (overdueFollowUps > 0) {
      notificationList.push({
        id: "follow-up-overdue",
        type: "follow-up",
        title: "Overdue Follow-ups",
        message: `${overdueFollowUps} patients have missed their follow-up appointments`,
        count: overdueFollowUps,
        priority: "high",
        timestamp: new Date().toISOString(),
      })
    }

    // Vaccination due notifications (simulated)
    const vaccinationDue = Math.floor(allWorkers.length * 0.15) // 15% need vaccination follow-up
    if (vaccinationDue > 0) {
      notificationList.push({
        id: "vaccination-due",
        type: "vaccination",
        title: "Vaccination Follow-ups",
        message: `${vaccinationDue} workers due for vaccination follow-up this week`,
        count: vaccinationDue,
        priority: "medium",
        timestamp: new Date().toISOString(),
      })
    }

    // Chronic condition monitoring
    const chronicCount = chronicConditionWorkers.length
    if (chronicCount > 0) {
      notificationList.push({
        id: "chronic-monitoring",
        type: "chronic-condition",
        title: "Chronic Condition Monitoring",
        message: `${chronicCount} workers with chronic conditions require regular monitoring`,
        count: chronicCount,
        priority: "medium",
        timestamp: new Date().toISOString(),
      })
    }

    setNotifications(notificationList)
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWorkers(applyFiltersAndSort(workers))
    } else {
      const filtered = workers.filter((worker) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesName = worker.fullName.toLowerCase().includes(searchLower)
        const matchesId = worker.workerId.toLowerCase().includes(searchLower)
        const matchesPhone = worker.phoneNumber.includes(searchTerm)
        const matchesBloodGroup = worker.bloodGroup.toLowerCase().includes(searchLower)
        const matchesLocation = `${worker.nativeDistrict} ${worker.nativeState}`.toLowerCase().includes(searchLower)

        switch (searchFilter) {
          case "name":
            return matchesName
          case "id":
            return matchesId
          case "phone":
            return matchesPhone
          case "location":
            return matchesLocation
          case "blood":
            return matchesBloodGroup
          default:
            return matchesName || matchesId || matchesPhone || matchesBloodGroup || matchesLocation
        }
      })
      setFilteredWorkers(applyFiltersAndSort(filtered))
    }
  }, [searchTerm, workers, searchFilter, sortBy, bloodGroupFilter, genderFilter])

  const applyFiltersAndSort = (workerList: WorkerRecord[]) => {
    let filtered = [...workerList]

    if (bloodGroupFilter !== "all") {
      filtered = filtered.filter((worker) => worker.bloodGroup === bloodGroupFilter)
    }

    if (genderFilter !== "all") {
      filtered = filtered.filter((worker) => worker.gender === genderFilter)
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName))
        break
      case "age":
        filtered.sort((a, b) => {
          const ageA = calculateAge(a.dateOfBirth)
          const ageB = calculateAge(b.dateOfBirth)
          return ageA - ageB
        })
        break
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "blood":
        filtered.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup))
        break
    }

    return filtered
  }

  const getUniqueBloodGroups = () => {
    const bloodGroups = workers.map((w) => w.bloodGroup).filter((bg) => bg && bg.trim() !== "")
    return [...new Set(bloodGroups)].sort()
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

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
      <Navigation language={language} onLanguageChange={setLanguage} translations={t} />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Dashboard</h1>
              <p className="text-lg text-muted-foreground">Migrant Worker Healthcare Management</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Link href="/doctors/qr-scanner">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Scanner
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/security/audit-logs">
                  <Shield className="mr-2 h-4 w-4" />
                  Audit Logs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{workers.length}</p>
                  <p className="text-blue-100">Total Workers</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{todayPatients.length}</p>
                  <p className="text-green-100">Today's Patients</p>
                </div>
                <Calendar className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{followUpAlerts.length}</p>
                  <p className="text-orange-100">Follow-ups</p>
                </div>
                <Clock className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{chronicConditionWorkers.length}</p>
                  <p className="text-purple-100">Chronic Cases</p>
                </div>
                <Heart className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{notifications.length}</p>
                  <p className="text-red-100">Active Alerts</p>
                </div>
                <Bell className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Banner */}
        {notifications.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-500 bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Priority Alerts</h3>
                  <p className="text-orange-800">You have {notifications.length} important notifications requiring attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:block">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:block">Patients</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:block">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:block">Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Patients */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Recent Patients</span>
                  </CardTitle>
                  <CardDescription>Latest registered workers in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentWorkers.slice(0, 5).map((worker) => (
                      <div key={worker.workerId} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{worker.fullName}</p>
                            <p className="text-sm text-muted-foreground">ID: {worker.workerId}</p>
                            <p className="text-xs text-muted-foreground">{worker.nativeState}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {worker.bloodGroup && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 mb-2">
                              {worker.bloodGroup}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/workers/${worker.workerId}`}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <Button variant="outline" asChild>
                      <Link href="#patients">View All Patients</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Tools */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <Link href="/doctors/qr-scanner">
                      <QrCode className="w-8 h-8" />
                      <span>Scan Patient QR</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/workers/search">
                      <Search className="w-8 h-8 text-green-600" />
                      <span>Search Patients</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/workers/register">
                      <UserPlus className="w-8 h-8 text-purple-600" />
                      <span>Register New Patient</span>
                    </Link>
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-3">Today's Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Consultations</span>
                        <span className="font-medium">{todayPatients.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Follow-ups</span>
                        <span className="font-medium">{followUpAlerts.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium text-green-600">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Health Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patients with Chronic Conditions</span>
                        <span>{Math.round((chronicConditionWorkers.length / workers.length) * 100)}%</span>
                      </div>
                      <Progress value={(chronicConditionWorkers.length / workers.length) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patients with Known Allergies</span>
                        <span>{Math.round((workers.filter(w => w.allergies).length / workers.length) * 100)}%</span>
                      </div>
                      <Progress value={(workers.filter(w => w.allergies).length / workers.length) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patients on Medication</span>
                        <span>{Math.round((workers.filter(w => w.currentMedication).length / workers.length) * 100)}%</span>
                      </div>
                      <Progress value={(workers.filter(w => w.currentMedication).length / workers.length) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Patients Helped</p>
                        <p className="text-2xl font-bold text-green-700">{workers.length}</p>
                      </div>
                      <div className="text-green-600">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">System Usage</p>
                        <p className="text-2xl font-bold text-blue-700">98%</p>
                      </div>
                      <div className="text-blue-600">
                        <Activity className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">Response Time</p>
                        <p className="text-2xl font-bold text-yellow-700">&lt; 5min</p>
                      </div>
                      <div className="text-yellow-600">
                        <Clock className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Patient Management</span>
                </CardTitle>
                <CardDescription>Search, filter, and manage patient records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search patients by name, ID, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                    <SelectTrigger className="w-full sm:w-48 h-12">
                      <SelectValue placeholder="Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blood Groups</SelectItem>
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
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white h-12">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredWorkers.slice(0, 10).map((worker) => (
                    <Card key={worker.workerId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{worker.fullName}</h3>
                              <p className="text-sm text-muted-foreground">ID: {worker.workerId}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{worker.gender}</Badge>
                                {worker.bloodGroup && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200">
                                    {worker.bloodGroup}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Age: {new Date().getFullYear() - new Date(worker.dateOfBirth).getFullYear()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/workers/${worker.workerId}`}>
                                View Details
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/doctors/patient/${worker.workerId}/add-visit`}>
                                Add Visit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Today's Schedule</span>
                </CardTitle>
                <CardDescription>Manage your appointments and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {todayPatients.length > 0 ? (
                  <div className="space-y-4">
                    {todayPatients.map((patient, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{patient.fullName}</p>
                            <p className="text-sm text-muted-foreground">{patient.lastVisitTime} • {patient.visitType}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {patient.visitType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No appointments today</h3>
                    <p className="text-muted-foreground">Your schedule is clear for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <span>Follow-up Alerts</span>
                </CardTitle>
                <CardDescription>Patients requiring attention or follow-up care</CardDescription>
              </CardHeader>
              <CardContent>
                {followUpAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {followUpAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-900">{alert.fullName}</p>
                            <p className="text-sm text-orange-700">{alert.originalDiagnosis}</p>
                            <p className="text-xs text-orange-600">Due: {alert.followUpDate}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                          Take Action
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending follow-ups or alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emergency Contact */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Medical Emergency Hotline</h3>
                  <p className="text-red-700">For urgent medical consultations and emergency support</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-700">1800-XXX-XXXX</p>
                <p className="text-sm text-red-600">24/7 Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
