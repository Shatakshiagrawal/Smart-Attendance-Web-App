"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Clock, X, Calendar } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useAuth } from "@/components/AuthProvider.jsx"
import { AnimatedQrDisplay } from "@/components/AnimatedQrDisplay"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<{
    attendanceId: string;
    subject: string;
    expiresAt: string;
    animationSequence: string[];
  } | null>(null);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchTimetable();
    }
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      if (sequenceRefreshIntervalRef.current) clearInterval(sequenceRefreshIntervalRef.current);
    };
  }, [user]);

  useEffect(() => {
    if (activeQR) {
        animationIntervalRef.current = setInterval(() => {
            setCurrentFrameIndex(prev => (prev + 1) % activeQR.animationSequence.length);
        }, 800);

        sequenceRefreshIntervalRef.current = setInterval(refreshSequence, 10000);
    }
    
    return () => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        if (sequenceRefreshIntervalRef.current) clearInterval(sequenceRefreshIntervalRef.current);
    };
  }, [activeQR]);


  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetable(data.timetable);
      } else {
        toast.error("Failed to load timetable");
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const startAttendanceSession = async (semesterId: string, subjectName: string) => {
    const toastId = toast.loading("Starting attendance session...");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/attendance/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ semesterId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start session');
      }

      const sessionData = await res.json();

      setActiveQR({
        attendanceId: sessionData.attendanceId,
        subject: subjectName,
        expiresAt: sessionData.expiresAt,
        animationSequence: sessionData.animationSequence,
      });
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
            setCurrentFrameIndex(0);
            toast.success("QR sequence updated for security.", { duration: 2000 });
        } else {
            closeQrModal();
            toast.error("Session has expired.");
        }
    } catch (error) {
        console.error("Failed to refresh sequence:", error);
        closeQrModal();
    }
  };

  const closeQrModal = async () => {
    if (!activeQR) return;
    
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
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getClassStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
      return "live";
    } else if (currentTimeInMinutes < startTimeInMinutes) {
      return "upcoming";
    } else {
      return "expired";
    }
  };

  const getQrDataForCurrentFrame = () => {
    if (!activeQR) return '';
    const { attendanceId, animationSequence } = activeQR;
    const totalChunks = animationSequence.length;
    const chunkData = animationSequence[currentFrameIndex];
    return `${attendanceId}|${totalChunks}|${currentFrameIndex}|${chunkData}`;
  };

  const today = new Date();
  const todayDayName = DAYS[today.getDay()];
  const todayClasses = timetable
    .filter((entry: any) => entry.day === todayDayName)
    .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
                <CardDescription>Expires at {new Date(activeQR.expiresAt).toLocaleTimeString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AnimatedQrDisplay
                    data={getQrDataForCurrentFrame()}
                    size={280}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                todayClasses.map((classItem: any) => {
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
                          onClick={() => startAttendanceSession(classItem.semester._id, classItem.semester.subjectName)}
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