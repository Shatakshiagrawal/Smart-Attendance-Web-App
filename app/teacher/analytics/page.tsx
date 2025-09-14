"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for BTech CSE subjects
const subjectAttendanceData = [
  { subject: "Data Structures", attendance: 88, total: 45 },
  { subject: "Computer Networks", attendance: 92, total: 42 },
  { subject: "Database Systems", attendance: 85, total: 38 },
  { subject: "Operating Systems", attendance: 90, total: 40 },
  { subject: "Software Engineering", attendance: 87, total: 35 },
  { subject: "Machine Learning", attendance: 94, total: 30 },
]

// Mock student attendance data
const mockStudentAttendance = [
  { id: "1", name: "John Doe", rollNo: "CS001", semester: "6", totalClasses: 45, attended: 42, percentage: 93 },
  { id: "2", name: "Jane Smith", rollNo: "CS002", semester: "6", totalClasses: 45, attended: 38, percentage: 84 },
  { id: "3", name: "Mike Johnson", rollNo: "CS003", semester: "6", totalClasses: 45, attended: 41, percentage: 91 },
  { id: "4", name: "Sarah Wilson", rollNo: "CS004", semester: "6", totalClasses: 45, attended: 35, percentage: 78 },
  { id: "5", name: "David Brown", rollNo: "CS005", semester: "6", totalClasses: 45, attended: 43, percentage: 96 },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function TeacherAnalytics() {
  const [selectedSemester, setSelectedSemester] = useState("6")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportStartDate, setExportStartDate] = useState("")
  const [exportEndDate, setExportEndDate] = useState("")
  const [exportSubject, setExportSubject] = useState("")

  const exportData = (format: "pdf" | "csv") => {
    if (!exportStartDate || !exportEndDate || !exportSubject) {
      alert("Please select date range and subject")
      return
    }
    console.log(`Exporting ${exportSubject} data from ${exportStartDate} to ${exportEndDate} as ${format}`)
    alert(
      `Exporting ${exportSubject} attendance data (${exportStartDate} to ${exportEndDate}) as ${format.toUpperCase()}`,
    )
    setIsExportDialogOpen(false)
    // Reset form
    setExportStartDate("")
    setExportEndDate("")
    setExportSubject("")
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Track your teaching performance and student insights
          </p>
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6th Semester</SelectItem>
              <SelectItem value="5">5th Semester</SelectItem>
              <SelectItem value="4">4th Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">Subject Analytics</TabsTrigger>
          <TabsTrigger value="students">Student Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          {/* Subject-wise Attendance Chart */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
            <Card className="bg-white border-gray-200 w-full">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-gray-900 text-base sm:text-lg md:text-xl truncate">
                      Subject-wise Attendance
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      BTech CSE - 6th Semester
                    </CardDescription>
                  </div>
                  <div className="flex justify-end sm:justify-start">
                    <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-xs sm:text-sm whitespace-nowrap"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Export PDF
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Export Attendance Data</DialogTitle>
                          <DialogDescription>
                            Select date range and subject to export attendance data as PDF.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-date" className="text-right">
                              Start Date
                            </Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={exportStartDate}
                              onChange={(e) => setExportStartDate(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-date" className="text-right">
                              End Date
                            </Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={exportEndDate}
                              onChange={(e) => setExportEndDate(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">
                              Subject
                            </Label>
                            <Select value={exportSubject} onValueChange={setExportSubject}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjectAttendanceData.map((subject) => (
                                  <SelectItem key={subject.subject} value={subject.subject}>
                                    {subject.subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={() => exportData("pdf")}>
                            Export PDF
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 md:px-6">
                <ChartContainer
                  config={{
                    attendance: {
                      label: "Attendance %",
                      color: "#00ABE4",
                    },
                  }}
                  className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectAttendanceData}
                      margin={{ top: 20, right: 5, left: 5, bottom: 60 }}
                      maxBarSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="subject"
                        tick={{ fontSize: 8 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        className="text-[8px] sm:text-xs"
                      />
                      <YAxis tick={{ fontSize: 8 }} className="text-[8px] sm:text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="attendance"
                        fill="#00ABE4"
                        radius={[4, 4, 0, 0]}
                        className="animate-pulse"
                        barSize={25}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Student Attendance Table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
            <Card className="bg-white border-gray-200 w-full">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-gray-900 text-base sm:text-lg md:text-xl truncate">
                      Student Attendance - Semester {selectedSemester}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Individual student attendance records
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Total Classes</TableHead>
                        <TableHead>Attended</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockStudentAttendance.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNo}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.totalClasses}</TableCell>
                          <TableCell>{student.attended}</TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                student.percentage >= 90
                                  ? "text-green-600"
                                  : student.percentage >= 75
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {student.percentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.percentage >= 90
                                  ? "bg-green-100 text-green-800"
                                  : student.percentage >= 75
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.percentage >= 90 ? "Excellent" : student.percentage >= 75 ? "Good" : "Poor"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
