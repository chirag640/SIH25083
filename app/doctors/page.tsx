"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import Link from "next/link"
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
                <p className="text-sm text-muted-foreground">Migrant Worker Health Records</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
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
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{workers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Workers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-8 w-8 text-chart-1" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayPatients.length}</p>
                    <p className="text-sm text-muted-foreground">Today's Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{followUpAlerts.length}</p>
                    <p className="text-sm text-muted-foreground">Follow-up Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-chart-2" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{chronicConditionWorkers.length}</p>
                    <p className="text-sm text-muted-foreground">Chronic Conditions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bell className="h-8 w-8 text-chart-3" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {notifications.length > 0 && (
            <Card className="border-l-4 border-l-chart-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Active Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {notification.type === "follow-up" && <Clock className="h-4 w-4" />}
                          {notification.type === "vaccination" && <Syringe className="h-4 w-4" />}
                          {notification.type === "chronic-condition" && <TrendingUp className="h-4 w-4" />}
                          {notification.type === "emergency" && <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadgeVariant(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{notification.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="today" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="today">Today's Patients</TabsTrigger>
              <TabsTrigger value="search">Search Records</TabsTrigger>
              <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
              <TabsTrigger value="chronic">Chronic Conditions</TabsTrigger>
              <TabsTrigger value="alerts">Medical Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>Today's Patients</span>
                  </CardTitle>
                  <CardDescription>Patients seen today for quick access and follow-up</CardDescription>
                </CardHeader>
                <CardContent>
                  {todayPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No patients seen today yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayPatients.map((patient, index) => (
                        <Card key={`${patient.workerId}-${index}`} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
                                    <p className="text-sm text-muted-foreground">ID: {patient.workerId}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Badge variant="outline" className="capitalize">
                                      {patient.visitType}
                                    </Badge>
                                    {patient.bloodGroup && <Badge variant="destructive">{patient.bloodGroup}</Badge>}
                                  </div>
                                </div>
                                <p className="text-sm text-foreground">
                                  <strong>Diagnosis:</strong> {patient.diagnosis}
                                </p>
                                {patient.allergies && (
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm text-destructive">
                                      <strong>Allergies:</strong> {patient.allergies}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/doctors/patient/${patient.workerId}`}>View Details</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Patient Search</CardTitle>
                  <CardDescription>Advanced search with filters and sorting options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search">Search Term</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Enter name, ID, phone, location..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="searchFilter">Search In</Label>
                      <Select value={searchFilter} onValueChange={setSearchFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fields</SelectItem>
                          <SelectItem value="name">Name Only</SelectItem>
                          <SelectItem value="id">Worker ID Only</SelectItem>
                          <SelectItem value="phone">Phone Only</SelectItem>
                          <SelectItem value="location">Location Only</SelectItem>
                          <SelectItem value="blood">Blood Group Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodFilter">Blood Group</Label>
                      <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Blood Groups</SelectItem>
                          {getUniqueBloodGroups().map((bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sortBy">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                          <SelectItem value="age">Age (Youngest First)</SelectItem>
                          <SelectItem value="blood">Blood Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {filteredWorkers.length} of {workers.length} workers
                      {searchTerm && ` for "${searchTerm}"`}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span>Filters: {searchFilter !== "all" ? searchFilter : "all fields"}</span>
                      {bloodGroupFilter !== "all" && <Badge variant="outline">{bloodGroupFilter}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredWorkers.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {workers.length === 0
                          ? "No worker records available."
                          : "No workers match your search criteria."}
                      </p>
                      {searchTerm && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("")
                            setSearchFilter("all")
                            setBloodGroupFilter("all")
                          }}
                          className="mt-2"
                        >
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredWorkers.map((worker) => (
                      <Card key={worker.workerId} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">{worker.fullName}</h3>
                                  <p className="text-sm text-muted-foreground">ID: {worker.workerId}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge variant="secondary">
                                    {calculateAge(worker.dateOfBirth)}y, {worker.gender}
                                  </Badge>
                                  {worker.bloodGroup && (
                                    <Badge
                                      variant="outline"
                                      className="bg-destructive/10 text-destructive border-destructive/20"
                                    >
                                      {worker.bloodGroup}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {worker.phoneNumber && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{worker.phoneNumber}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {worker.nativeDistrict}, {worker.nativeState}
                                  </span>
                                </div>
                              </div>

                              {(worker.allergies || worker.currentMedication) && (
                                <div className="space-y-1">
                                  {worker.allergies && (
                                    <div className="flex items-center space-x-2">
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                      <span className="text-sm text-destructive font-medium">
                                        Allergies: {worker.allergies}
                                      </span>
                                    </div>
                                  )}
                                  {worker.currentMedication && (
                                    <div className="flex items-center space-x-2">
                                      <Heart className="h-4 w-4 text-chart-1" />
                                      <span className="text-sm text-chart-1 font-medium">
                                        Medication: {worker.currentMedication}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <Button asChild>
                              <Link href={`/doctors/patient/${worker.workerId}`}>View Details</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="follow-ups" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Follow-up Alerts</span>
                  </CardTitle>
                  <CardDescription>Patients with missed or upcoming follow-up appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {followUpAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No follow-up alerts at this time</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followUpAlerts.map((alert) => (
                        <Card
                          key={`${alert.workerId}-${alert.followUpDate}`}
                          className={`hover:shadow-md transition-shadow ${
                            alert.priority === "high"
                              ? "border-l-4 border-l-destructive bg-destructive/5"
                              : alert.priority === "medium"
                                ? "border-l-4 border-l-yellow-500 bg-yellow-50"
                                : "border-l-4 border-l-blue-500 bg-blue-50"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-semibold text-foreground">{alert.fullName}</h3>
                                    <p className="text-sm text-muted-foreground">ID: {alert.workerId}</p>
                                  </div>
                                  <Badge variant={getPriorityBadgeVariant(alert.priority)}>
                                    {alert.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground">
                                  <strong>Original Diagnosis:</strong> {alert.originalDiagnosis}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Follow-up Date:</strong> {new Date(alert.followUpDate).toLocaleDateString()}
                                  {alert.daysPastDue > 0 && (
                                    <span className="text-destructive ml-2">({alert.daysPastDue} days overdue)</span>
                                  )}
                                </p>
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/doctors/patient/${alert.workerId}`}>Schedule Follow-up</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chronic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Chronic Condition Monitoring</span>
                  </CardTitle>
                  <CardDescription>Workers with chronic conditions requiring regular monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  {chronicConditionWorkers.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No workers with chronic conditions identified</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chronicConditionWorkers.map((worker) => (
                        <Card key={worker.workerId} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h3 className="font-semibold text-foreground">{worker.fullName}</h3>
                                    <p className="text-sm text-muted-foreground">ID: {worker.workerId}</p>
                                  </div>
                                  {worker.bloodGroup && <Badge variant="destructive">{worker.bloodGroup}</Badge>}
                                </div>
                                {worker.currentMedication && (
                                  <div className="flex items-center space-x-2">
                                    <Heart className="h-4 w-4 text-chart-1" />
                                    <span className="text-sm text-chart-1">
                                      <strong>Current Medication:</strong> {worker.currentMedication}
                                    </span>
                                  </div>
                                )}
                                {worker.allergies && (
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm text-destructive">
                                      <strong>Allergies:</strong> {worker.allergies}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Button size="sm" asChild>
                                <Link href={`/doctors/patient/${worker.workerId}`}>Monitor Progress</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span>Workers with Allergies</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workers.filter((w) => w.allergies && w.allergies.trim() !== "").length === 0 ? (
                      <p className="text-muted-foreground">No workers with recorded allergies.</p>
                    ) : (
                      <div className="space-y-2">
                        {workers
                          .filter((w) => w.allergies && w.allergies.trim() !== "")
                          .map((worker) => (
                            <div
                              key={worker.workerId}
                              className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-foreground">{worker.fullName}</p>
                                <p className="text-sm text-destructive">Allergies: {worker.allergies}</p>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/doctors/patient/${worker.workerId}`}>View Details</Link>
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-chart-1" />
                      <span>Workers on Medication</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workers.filter((w) => w.currentMedication && w.currentMedication.trim() !== "").length === 0 ? (
                      <p className="text-muted-foreground">No workers with recorded medications.</p>
                    ) : (
                      <div className="space-y-2">
                        {workers
                          .filter((w) => w.currentMedication && w.currentMedication.trim() !== "")
                          .map((worker) => (
                            <div
                              key={worker.workerId}
                              className="flex items-center justify-between p-3 bg-chart-1/5 border border-chart-1/20 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-foreground">{worker.fullName}</p>
                                <p className="text-sm text-chart-1">Medication: {worker.currentMedication}</p>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/doctors/patient/${worker.workerId}`}>View Details</Link>
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
