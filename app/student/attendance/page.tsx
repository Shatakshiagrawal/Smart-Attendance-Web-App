"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, Filter, CheckCircle, XCircle, Clock, QrCode, Download } from "lucide-react"

const mockAttendanceRecords = [
  {
    id: "1",
    subject: "Mathematics",
    code: "MATH101",
    date: "2024-01-22",
    time: "09:00 AM",
    status: "present",
    markedAt: "08:58 AM",
    teacher: "Dr. Smith",
    room: "Room 101",
  },
  {
    id: "2",
    subject: "Physics",
    code: "PHYS201",
    date: "2024-01-22",
    time: "11:00 AM",
    status: "late",
    markedAt: "11:05 AM",
    teacher: "Prof. Johnson",
    room: "Lab 201",
  },
  {
    id: "3",
    subject: "Chemistry",
    code: "CHEM101",
    date: "2024-01-21",
    time: "02:00 PM",
    status: "present",
    markedAt: "01:55 PM",
    teacher: "Dr. Brown",
    room: "Lab 301",
  },
  {
    id: "4",
    subject: "Biology",
    code: "BIO101",
    date: "2024-01-21",
    time: "10:00 AM",
    status: "absent",
    markedAt: null,
    teacher: "Prof. Davis",
    room: "Lab 401",
  },
  {
    id: "5",
    subject: "English",
    code: "ENG101",
    date: "2024-01-20",
    time: "03:00 PM",
    status: "present",
    markedAt: "02:58 PM",
    teacher: "Dr. Wilson",
    room: "Room 205",
  },
]

const mockSubjectSummary = [
  { subject: "Mathematics", code: "MATH101", present: 26, absent: 2, late: 0, total: 28, percentage: 92.9 },
  { subject: "Physics", code: "PHYS201", present: 20, absent: 3, late: 1, total: 24, percentage: 83.3 },
  { subject: "Chemistry", code: "CHEM101", present: 23, absent: 2, late: 1, total: 26, percentage: 88.5 },
  { subject: "Biology", code: "BIO101", present: 20, absent: 2, late: 0, total: 22, percentage: 90.9 },
  { subject: "English", code: "ENG101", present: 28, absent: 1, late: 1, total: 30, percentage: 93.3 },
  { subject: "History", code: "HIST101", present: 24, absent: 6, late: 2, total: 32, percentage: 75.0 },
]

export default function StudentAttendance() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-chart-2" />
      case "absent":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "late":
        return <Clock className="w-4 h-4 text-chart-3" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20">Present</Badge>
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      case "late":
        return <Badge className="bg-chart-3/10 text-chart-3 hover:bg-chart-3/20">Late</Badge>
      default:
        return null
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-chart-2"
    if (percentage >= 80) return "text-chart-3"
    if (percentage >= 75) return "text-chart-4"
    return "text-destructive"
  }

  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matchesSearch =
      record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "all" || record.code === filterSubject
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your attendance records and performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR Code
          </Button>
        </div>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="summary">Subject Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          {/* Filters */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by subject or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="MATH101">Mathematics</SelectItem>
                    <SelectItem value="PHYS201">Physics</SelectItem>
                    <SelectItem value="CHEM101">Chemistry</SelectItem>
                    <SelectItem value="BIO101">Biology</SelectItem>
                    <SelectItem value="ENG101">English</SelectItem>
                    <SelectItem value="HIST101">History</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your attendance history for all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted/50 rounded-lg">
                        {getStatusIcon(record.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{record.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {record.code} • {record.teacher}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.room} • {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{record.time}</p>
                        {record.markedAt && (
                          <p className="text-xs text-muted-foreground">Marked at {record.markedAt}</p>
                        )}
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Subject-wise Summary</CardTitle>
              <CardDescription>Your attendance performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSubjectSummary.map((subject, index) => (
                  <motion.div
                    key={subject.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border border-border/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getAttendanceColor(subject.percentage)}`}>
                          {subject.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subject.present + subject.late}/{subject.total} classes
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="p-2 bg-chart-2/10 rounded">
                        <p className="text-lg font-bold text-chart-2">{subject.present}</p>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </div>
                      <div className="p-2 bg-chart-3/10 rounded">
                        <p className="text-lg font-bold text-chart-3">{subject.late}</p>
                        <p className="text-xs text-muted-foreground">Late</p>
                      </div>
                      <div className="p-2 bg-destructive/10 rounded">
                        <p className="text-lg font-bold text-destructive">{subject.absent}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold text-foreground">{subject.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
