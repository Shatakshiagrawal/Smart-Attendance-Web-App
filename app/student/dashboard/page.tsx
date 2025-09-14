"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, QrCode, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/AuthProvider.jsx" 
import { useRouter } from "next/navigation"
import Link from "next/link" // Import the Link component
import toast, { Toaster } from "react-hot-toast"

// Mock data
const mockStudentStats = {
  overallAttendance: 87.5,
  classesAttended: 142,
  totalClasses: 162,
}

const mockUpcomingClasses = [
  { id: "1", subject: "Mathematics", time: "09:00 AM", room: "Room 101", teacher: "Dr. Smith", date: "Today" },
  { id: "2", subject: "Physics", time: "11:00 AM", room: "Lab 201", teacher: "Prof. Johnson", date: "Today" },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function StudentDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500"
    if (percentage >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Track your attendance and academic progress</p>
      </div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* FIX: Change the Button to a Link that navigates to the scanner page */}
        <Link href="/student/scanner">
            <Button
                size="lg"
                className="h-20 w-64 md:h-24 md:w-80 text-lg md:text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <QrCode className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                Scan QR Code
            </Button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div variants={fadeInUp}>
          <Card className="border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Overall Attendance</p>
                  <p className={`text-xl md:text-2xl font-bold ${getAttendanceColor(mockStudentStats.overallAttendance)}`}>
                    {mockStudentStats.overallAttendance}%
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <Progress value={mockStudentStats.overallAttendance} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Card className="border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Classes Attended</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {mockStudentStats.classesAttended}/{mockStudentStats.totalClasses}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Classes */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Clock className="w-5 h-5" />
              <span>Upcoming Classes</span>
            </CardTitle>
            <CardDescription className="text-sm">Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUpcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground text-sm md:text-base">{classItem.subject}</h4>
                      <Badge variant={classItem.date === "Today" ? "default" : "secondary"} className="text-xs">
                        {classItem.date}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {classItem.time} • {classItem.room} • {classItem.teacher}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}