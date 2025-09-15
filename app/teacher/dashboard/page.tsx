"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { QrCode, Clock, X, Calendar, Users, Edit } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useAuth } from "@/components/AuthProvider.jsx"
import { AnimatedQrDisplay } from "@/components/AnimatedQrDisplay"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Student {
  _id: string;
  name: string;
  enrollmentNo: string;
}

interface Semester {
    _id: string;
    subjectName: string;
    subjectCode: string;
    semesterNumber: number;
    students: Student[];
}

interface TimetableEntry {
    _id: string;
    semester: Semester;
    day: string;
    startTime: string;
    endTime: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function TeacherDashboard() {
  const { user, handleApiError } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<{
    attendanceId: string;
    subject: string;
    expiresAt: string;
    animationSequence: string[];
    totalStudents: number;
  } | null>(null);

  const [presentCount, setPresentCount] = useState(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [presentStudentIds, setPresentStudentIds] = useState<Set<string>>(new Set());
  const [manualSelections, setManualSelections] = useState<Set<string>>(new Set());

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleApiError(response);
        }
        throw new Error("Failed to load timetable");
      }
      
      const data = await response.json();
      setTimetable(data.timetable || []);

    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Failed to load timetable.");
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    if (user) {
      fetchTimetable();
    }
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      if (sequenceRefreshIntervalRef.current) clearInterval(sequenceRefreshIntervalRef.current);
      if (statusPollIntervalRef.current) clearInterval(statusPollIntervalRef.current);
    };
  }, [user, fetchTimetable]);

  const fetchSessionStatus = useCallback(async () => {
    if (!activeQR) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/session/${activeQR.attendanceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) handleApiError(res);
            return; 
        }

        const data = await res.json();
        setPresentCount(data.presentCount);
        setAllStudents(data.allStudents);
        setPresentStudentIds(new Set(data.presentStudentIds));
        
        setActiveQR(prev => prev ? { ...prev, totalStudents: data.allStudents.length } : null);

    } catch (error) {
        console.error("Failed to fetch session status", error);
    }
  }, [activeQR, handleApiError]);

  useEffect(() => {
    // FIX: Added a safeguard to ensure animationSequence exists and has length before starting intervals.
    if (activeQR && activeQR.animationSequence && activeQR.animationSequence.length > 0) {
        animationIntervalRef.current = setInterval(() => {
            setCurrentFrameIndex(prev => (prev + 1) % (activeQR.animationSequence.length || 1));
        }, 500);

        sequenceRefreshIntervalRef.current = setInterval(refreshSequence, 15000);
        
        fetchSessionStatus();
        statusPollIntervalRef.current = setInterval(fetchSessionStatus, 5000);
    }
    
    return () => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        if (sequenceRefreshIntervalRef.current) clearInterval(sequenceRefreshIntervalRef.current);
        if (statusPollIntervalRef.current) clearInterval(statusPollIntervalRef.current);
    };
  }, [activeQR, fetchSessionStatus]);

  const startAttendanceSession = async (semester: Semester) => {
    const toastId = toast.loading("Starting attendance session...");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ semesterId: semester._id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start session');
      }

      const sessionData = await res.json();
      
      setActiveQR({
        attendanceId: sessionData.attendanceId,
        subject: semester.subjectName,
        expiresAt: sessionData.expiresAt,
        animationSequence: sessionData.animationSequence,
        totalStudents: semester?.students?.length || 0, // FIX: Safely access length
      });

      setAllStudents(semester.students || []); // FIX: Handle potentially missing students array
      toast.success("Session started!", { id: toastId });
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    }
  };
  
  const refreshSequence = async () => {
    if (!activeQR) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/refresh-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ attendanceId: activeQR.attendanceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveQR(prev => prev ? { ...prev, animationSequence: data.newAnimationSequence } : null);
        toast.success("QR Code has been refreshed.");
      } else {
        toast.error("Failed to refresh QR code.");
      }
    } catch (error) {
      toast.error("Error refreshing QR code.");
    }
  };

  const closeQrModal = async () => {
    if (!activeQR) return;
    
    if (statusPollIntervalRef.current) clearInterval(statusPollIntervalRef.current);
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    if (sequenceRefreshIntervalRef.current) clearInterval(sequenceRefreshIntervalRef.current);
    
    const toastId = toast.loading("Closing session...");
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/attendance/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ attendanceId: activeQR.attendanceId }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to close session');
        }

        const data = await res.json();
        toast.success(data.message, { id: toastId });

    } catch (error) {
        toast.error((error as Error).message, { id: toastId });
    } finally {
        setActiveQR(null);
        setCurrentFrameIndex(0);
        setPresentCount(0);
        setAllStudents([]);
        setPresentStudentIds(new Set());
        setManualSelections(new Set());
    }
  };

  const handleManualSelectionChange = (studentId: string, checked: boolean) => {
    setManualSelections(prev => {
        const newSelections = new Set(prev);
        if (checked) {
            newSelections.add(studentId);
        } else {
            newSelections.delete(studentId);
        }
        return newSelections;
    });
  };

  const handleSaveManualAttendance = async () => {
    if (!activeQR || manualSelections.size === 0) {
        setIsManualModalOpen(false);
        return;
    }
    const toastId = toast.loading("Saving manual attendance...");
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/attendance/manual-mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ 
                attendanceId: activeQR.attendanceId,
                studentIds: Array.from(manualSelections) 
            }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success(data.message, { id: toastId });
            fetchSessionStatus();
            setManualSelections(new Set());
            setIsManualModalOpen(false);
        } else {
            throw new Error(data.message || 'Failed to save manual attendance.');
        }
    } catch (error) {
        toast.error((error as Error).message, { id: toastId });
    }
  };
    
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };
    
  const getClassStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startDate = new Date(`${todayStr}T${startTime}`);
    const endDate = new Date(`${todayStr}T${endTime}`);

    if (now >= startDate && now <= endDate) return 'live';
    if (now > endDate) return 'completed';
    return 'upcoming';
  };
    
  const getQrDataForCurrentFrame = () => {
    if (!activeQR || !activeQR.animationSequence || activeQR.animationSequence.length === 0) return "";
    const { attendanceId, animationSequence } = activeQR;
    const total = animationSequence.length;
    const data = animationSequence[currentFrameIndex];
    return `${attendanceId}|${total}|${currentFrameIndex}|${data}`;
  };

  const sortedStudents = useMemo(() => {
    return [...allStudents].sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents]);

  const today = new Date();
  const todayDayName = DAYS[today.getDay()];
  const todayClasses = timetable
    .filter((entry: TimetableEntry) => entry.day === todayDayName)
    .sort((a: TimetableEntry, b: TimetableEntry) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <AnimatePresence>
        {activeQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Attendance - {activeQR.subject}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={closeQrModal}><X className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Expires at {new Date(activeQR.expiresAt).toLocaleTimeString()}</span>
                    <Badge variant="secondary" className="text-base">
                        <Users className="w-4 h-4 mr-2" />
                        {presentCount} / {activeQR.totalStudents} Present
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <AnimatedQrDisplay
                    data={getQrDataForCurrentFrame()}
                    size={280}
                />
                <Button variant="outline" onClick={() => setIsManualModalOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Manual Attendance
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Manual Attendance</DialogTitle>
                <DialogDescription>Select students who are present but unable to scan.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                {sortedStudents.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No students in this class.</p>
                ) : (
                    sortedStudents.map(student => (
                        <div key={student._id} className="flex items-center space-x-3">
                            <Checkbox 
                                id={student._id}
                                checked={presentStudentIds.has(student._id) || manualSelections.has(student._id)}
                                disabled={presentStudentIds.has(student._id)}
                                onCheckedChange={(checked) => handleManualSelectionChange(student._id, !!checked)}
                            />
                            <Label htmlFor={student._id} className="flex flex-col">
                                <span>{student.name}</span>
                                <span className="text-xs text-muted-foreground">{student.enrollmentNo}</span>
                            </Label>
                        </div>
                    ))
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsManualModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveManualAttendance}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">View today's classes and generate QR codes</p>
      </div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Clock className="w-5 h-5" />
              <span>Today's Classes</span>
            </CardTitle>
            <CardDescription className="text-sm">Your schedule for {todayDayName}, {today.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No classes scheduled for today.</p>
                </div>
              ) : (
                todayClasses.map((classItem) => {
                  const status = getClassStatus(classItem.startTime, classItem.endTime);
                  const isLive = status === 'live';

                  return (
                    <div
                      key={classItem._id}
                      className="flex items-center justify-between p-3 sm:p-4 border border-border/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                          <h4 className="font-medium text-foreground text-sm sm:text-base">{classItem.semester.subjectName}</h4>
                          <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{classItem.semester.subjectCode}</Badge>
                          <Badge variant="outline" className="text-xs">Sem {classItem.semester.semesterNumber}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </p>
                      </div>
                      {isLive && !activeQR && (
                        <Button
                          size="sm"
                          onClick={() => startAttendanceSession(classItem.semester)}
                          className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}