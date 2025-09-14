"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Download,
  Calendar,
  MapPin,
  Phone,
  Heart,
  AlertTriangle,
  Shield,
  Grid,
  List,
  ChevronDown,
  FileText,
  Printer,
  User,
  Clock,
  CreditCard
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { StorageUtils } from "@/lib/utils"

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

interface WorkerCardProps {
  worker: WorkerRecord
  viewMode: "grid" | "list"
  calculateAge: (dateOfBirth: string) => number
}

function WorkerCard({ worker, viewMode, calculateAge }: WorkerCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {worker.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg">{worker.fullName}</h3>
                  <Badge variant="outline" className="text-xs">
                    ID: {worker.workerId}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {calculateAge(worker.dateOfBirth)} years
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {worker.nativeDistrict}, {worker.nativeState}
                  </span>
                  {worker.bloodGroup && (
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                      {worker.bloodGroup}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/workers/health-card/${worker.workerId}`}>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/workers/${worker.workerId}`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-200 border-0 group">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-100">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {worker.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {worker.fullName}
              </CardTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                ID: {worker.workerId}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {worker.allergies && worker.allergies.trim() && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Alert
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Allergies: {worker.allergies}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{calculateAge(worker.dateOfBirth)} years old</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2 text-green-500" />
              <span className="capitalize">{worker.gender}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-orange-500" />
              <span>{worker.nativeDistrict}</span>
            </div>
            {worker.phoneNumber && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-purple-500" />
                <span>{worker.phoneNumber}</span>
              </div>
            )}
          </div>

          {worker.bloodGroup && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm font-medium">Blood Group</span>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                {worker.bloodGroup}
              </Badge>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Registered: {new Date(worker.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Link href={`/workers/health-card/${worker.workerId}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Health Card
              </Button>
            </Link>
            <Link href={`/workers/${worker.workerId}`} className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WorkersIndexPage() {
  const [workers, setWorkers] = useState<WorkerRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const allWorkers = StorageUtils.getAllWorkers()
    setWorkers(allWorkers)
  }, [])

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

  const uniqueStates = useMemo(() => {
    const states = [...new Set(workers.map(w => w.nativeState).filter(Boolean))]
    return states.sort()
  }, [workers])

  const uniqueBloodGroups = useMemo(() => {
    const bloodGroups = [...new Set(workers.map(w => w.bloodGroup).filter(Boolean))]
    return bloodGroups.sort()
  }, [workers])

  const filteredAndSortedWorkers = useMemo(() => {
    let filtered = workers.filter(worker => {
      const matchesSearch = 
        worker.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.workerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phoneNumber?.includes(searchTerm) ||
        worker.nativeDistrict?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesState = selectedState === "all" || worker.nativeState === selectedState
      const matchesBloodGroup = selectedBloodGroup === "all" || worker.bloodGroup === selectedBloodGroup
      
      return matchesSearch && matchesState && matchesBloodGroup
    })

    // Sort workers
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "name":
          return (a.fullName || "").localeCompare(b.fullName || "")
        case "age":
          return calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth)
        default:
          return 0
      }
    })
  }, [workers, searchTerm, selectedState, selectedBloodGroup, sortBy])

  const exportWorkersList = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Worker ID,Full Name,Age,Gender,Native State,District,Blood Group,Phone,Registration Date\n" +
      filteredAndSortedWorkers.map(w => 
        `${w.workerId},"${w.fullName}",${calculateAge(w.dateOfBirth)},${w.gender},"${w.nativeState}","${w.nativeDistrict}",${w.bloodGroup || "N/A"},"${w.phoneNumber || "N/A"}","${new Date(w.createdAt).toLocaleDateString()}"`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `workers-list-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Workers Registry</h1>
                <p className="text-sm text-muted-foreground">
                  {workers.length} registered workers • {filteredAndSortedWorkers.length} matching filters
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={exportWorkersList}>
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
              <Link href="/workers/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Worker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-600" />
                <span>Search & Filter</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, phone, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {uniqueStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Blood Group</Label>
                    <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blood Groups</SelectItem>
                        {uniqueBloodGroups.map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recently Registered</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="age">Age (Youngest First)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workers List */}
        {filteredAndSortedWorkers.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Workers Found</h3>
              <p className="text-muted-foreground mb-6">
                {workers.length === 0 
                  ? "No worker records found. Start by registering your first worker."
                  : "No workers match your current search criteria. Try adjusting your filters."
                }
              </p>
              <Link href="/workers/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Worker
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }>
            {filteredAndSortedWorkers.map((worker) => (
              <WorkerCard 
                key={worker.workerId} 
                worker={worker} 
                viewMode={viewMode}
                calculateAge={calculateAge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
