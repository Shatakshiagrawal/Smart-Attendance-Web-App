"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Trash2, BookOpen } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useAuth } from "@/components/AuthProvider.jsx"

interface TimetableEntry {
  _id: string;
  semester: {
    _id: string;
    subjectName: string;
    subjectCode: string;
    semesterNumber: number;
  };
  day: string;
  startTime: string;
  endTime: string;
}

const DAYS = [
  { value: 'Monday', label: "Monday" },
  { value: 'Tuesday', label: "Tuesday" },
  { value: 'Wednesday', label: "Wednesday" },
  { value: 'Thursday', label: "Thursday" },
  { value: 'Friday', label: "Friday" },
  { value: 'Saturday', label: "Saturday" },
  { value: 'Sunday', label: "Sunday" },
]

export default function TimetableManager() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newEntry, setNewEntry] = useState({
    subjectName: "",
    subjectCode: "",
    semesterNumber: "",
    day: "",
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    if (user) {
      fetchTimetable();
    }
  }, [user])

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTimetable(data.timetable)
      } else {
        toast.error("Failed to load timetable")
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
      toast.error("Failed to load timetable")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async () => {
    if (
      !newEntry.subjectName ||
      !newEntry.subjectCode ||
      !newEntry.semesterNumber ||
      !newEntry.day ||
      !newEntry.startTime ||
      !newEntry.endTime
    ) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const semesterResponse = await fetch(`/api/semesters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectName: newEntry.subjectName,
          subjectCode: newEntry.subjectCode,
          semesterNumber: parseInt(newEntry.semesterNumber),
        }),
      });

      if (!semesterResponse.ok) {
        const errorData = await semesterResponse.json();
        toast.error(errorData.message || "Failed to create semester");
        return;
      }
      
      const semesterData = await semesterResponse.json();
      const semesterId = semesterData._id;

      const timetableResponse = await fetch(`/api/timetable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semesterId: semesterId,
          day: newEntry.day,
          startTime: newEntry.startTime,
          endTime: newEntry.endTime,
        }),
      });

      if (timetableResponse.ok) {
        toast.success("Timetable entry added successfully")
        setNewEntry({
          subjectName: "",
          subjectCode: "",
          semesterNumber: "",
          day: "",
          startTime: "",
          endTime: "",
        })
        setIsAdding(false)
        fetchTimetable()
      } else {
        const error = await timetableResponse.json()
        toast.error(error.message || "Failed to add timetable entry")
      }
    } catch (error) {
      console.error("Error adding timetable entry:", error)
      toast.error("Failed to add timetable entry")
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })

      if (response.ok) {
        toast.success("Timetable entry removed successfully")
        fetchTimetable()
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to remove timetable entry")
      }
    } catch (error) {
      console.error("Error deleting timetable entry:", error)
      toast.error("Failed to remove timetable entry")
    }
  }

  const getDayName = (dayOfWeek: string) => {
    return DAYS.find((day) => day.value === dayOfWeek)?.label || ""
  }

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Calendar className="w-5 h-5 text-[#00ABE4]" />
                <span className="text-gray-900">My Timetable</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">Manage your weekly teaching schedule</CardDescription>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <h3 className="font-semibold text-gray-900">Add New Class</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName" className="text-gray-700 text-sm">Subject Name *</Label>
                  <Input
                    id="subjectName"
                    value={newEntry.subjectName}
                    onChange={(e) => setNewEntry({ ...newEntry, subjectName: e.target.value })}
                    placeholder="e.g., Data Structures"
                    className="border-gray-300 focus:border-[#00ABE4] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectCode" className="text-gray-700 text-sm">Subject Code *</Label>
                  <Input
                    id="subjectCode"
                    value={newEntry.subjectCode}
                    onChange={(e) => setNewEntry({ ...newEntry, subjectCode: e.target.value })}
                    placeholder="e.g., CS201"
                    className="border-gray-300 focus:border-[#00ABE4] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semesterNumber" className="text-gray-700 text-sm">Semester Number *</Label>
                  <Input
                    id="semesterNumber"
                    type="number"
                    value={newEntry.semesterNumber}
                    onChange={(e) => setNewEntry({ ...newEntry, semesterNumber: e.target.value })}
                    placeholder="e.g., 5"
                    className="border-gray-300 focus:border-[#00ABE4] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-gray-700 text-sm">Day of Week *</Label>
                  <Select
                    value={newEntry.day}
                    onValueChange={(value) => setNewEntry({ ...newEntry, day: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-[#00ABE4] text-sm">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-gray-700 text-sm">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    className="border-gray-300 focus:border-[#00ABE4] text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-gray-700 text-sm">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    className="border-gray-300 focus:border-[#00ABE4] text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddEntry} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white text-sm">Add to Timetable</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {timetable.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No classes scheduled yet. Add your first class to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS.map((day) => {
                const dayClasses = timetable.filter((entry) => entry.day === day.value)
                if (dayClasses.length === 0) return null

                return (
                  <div key={day.value} className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{day.label}</h4>
                    <div className="space-y-2">
                      {dayClasses
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((entry) => (
                          <motion.div
                            key={entry._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-[#00ABE4]" />
                                <span className="font-medium text-gray-900 text-sm">{entry.semester.subjectName}</span>
                                <Badge variant="secondary" className="text-xs">{entry.semester.subjectCode}</Badge>
                                <Badge variant="outline" className="text-xs">Sem {entry.semester.semesterNumber}</Badge>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}