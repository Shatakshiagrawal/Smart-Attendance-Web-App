"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Plus,
  Search,
  Filter,
  QrCode,
  BarChart3,
  X,
  Copy,
  Download,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
import QRCodeLib from "qrcode"

const mockClasses = [
  {
    id: "1",
    subject: "Mathematics",
    code: "MATH101",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    room: "Room 101",
    students: 45,
    nextClass: "2024-01-22 09:00",
    avgAttendance: 92,
    status: "active",
  },
  {
    id: "2",
    subject: "Physics",
    code: "PHYS201",
    schedule: "Tue, Thu - 11:00 AM",
    room: "Lab 201",
    students: 38,
    nextClass: "2024-01-23 11:00",
    avgAttendance: 85,
    status: "active",
  },
  {
    id: "3",
    subject: "Chemistry",
    code: "CHEM101",
    schedule: "Mon, Wed - 2:00 PM",
    room: "Lab 301",
    students: 42,
    nextClass: "2024-01-22 14:00",
    avgAttendance: 88,
    status: "active",
  },
  {
    id: "4",
    subject: "Biology",
    code: "BIO101",
    schedule: "Tue, Fri - 10:00 AM",
    room: "Lab 401",
    students: 31,
    nextClass: "2024-01-23 10:00",
    avgAttendance: 90,
    status: "active",
  },
]

export default function TeacherClasses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeQRClass, setActiveQRClass] = useState<{
    id: string
    subject: string
    qrCodeUrl: string
    expiresAt: number
  } | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrError, setQrError] = useState("")
  const [copied, setCopied] = useState(false)

  const filteredClasses = mockClasses.filter((classItem) => {
    const matchesSearch =
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || classItem.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const generateQRCode = async (classId: string) => {
    const classItem = mockClasses.find((c) => c.id === classId)
    if (!classItem) return

    setIsGeneratingQR(true)
    setQrError("")

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported")
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const expiryTime = new Date()
            expiryTime.setMinutes(expiryTime.getMinutes() + 15)

            const qrData = {
              classId: classId,
              timestamp: Date.now(),
              expiresAt: expiryTime.getTime(),
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              subject: classItem.subject,
            }

            const qrString = JSON.stringify(qrData)
            const qrCodeDataUrl = await QRCodeLib.toDataURL(qrString, {
              width: 300,
              margin: 2,
              color: {
                dark: "#164e63",
                light: "#ffffff",
              },
            })

            setActiveQRClass({
              id: classId,
              subject: classItem.subject,
              qrCodeUrl: qrCodeDataUrl,
              expiresAt: expiryTime.getTime(),
            })
            setIsGeneratingQR(false)
          } catch (err) {
            setQrError("Failed to generate QR code")
            setIsGeneratingQR(false)
          }
        },
        (error) => {
          setQrError("Unable to get location: " + error.message)
          setIsGeneratingQR(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    } catch (err) {
      setQrError("Failed to generate QR code")
      setIsGeneratingQR(false)
    }
  }

  const copyQRData = async () => {
    if (!activeQRClass) return
    try {
      const qrData = {
        classId: activeQRClass.id,
        subject: activeQRClass.subject,
        expiresAt: activeQRClass.expiresAt,
      }
      await navigator.clipboard.writeText(JSON.stringify(qrData))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setQrError("Failed to copy to clipboard")
    }
  }

  const downloadQRCode = () => {
    if (!activeQRClass) return
    const link = document.createElement("a")
    link.download = `qr-code-${activeQRClass.subject}-${Date.now()}.png`
    link.href = activeQRClass.qrCodeUrl
    link.click()
  }

  return (
    <div className="space-y-6">
      {activeQRClass && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">QR Code for {activeQRClass.subject}</CardTitle>
                  <CardDescription>
                    Students can scan this code to mark attendance • Valid until{" "}
                    {new Date(activeQRClass.expiresAt).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveQRClass(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <img src={activeQRClass.qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyQRData} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Data
                      </>
                    )}
                  </Button>
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  Students can scan this QR code to mark their attendance. Make sure they are within the classroom
                  location.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isGeneratingQR && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Generating QR Code...</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {qrError && (
        <Alert variant="destructive">
          <AlertDescription>{qrError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground mt-1">Manage your classes and track student engagement</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Add a new class to your schedule</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Name</Label>
                <Input id="subject" placeholder="e.g., Advanced Mathematics" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input id="code" placeholder="e.g., MATH301" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Input id="room" placeholder="e.g., Room 101" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input id="schedule" placeholder="e.g., Mon, Wed, Fri - 9:00 AM" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Class description..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{classItem.subject}</CardTitle>
                      <CardDescription>{classItem.code}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={classItem.status === "active" ? "default" : "secondary"}>{classItem.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {classItem.schedule}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {classItem.room}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {classItem.students} students enrolled
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Avg Attendance</p>
                    <p className="text-lg font-bold text-primary">{classItem.avgAttendance}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next Class</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(classItem.nextClass).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => generateQRCode(classItem.id)}
                    disabled={isGeneratingQR}
                  >
                    {isGeneratingQR ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Create your first class to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
