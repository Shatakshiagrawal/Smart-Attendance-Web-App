"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Users, BookOpen, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider.jsx';

// FIX: A simple, universally compatible function to generate a unique ID.
const createIdentifier = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "student" as "student" | "teacher",
    enrollmentNumber: "",
    currentSemester: "", 
    courseProgram: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [deviceIdentifier, setDeviceIdentifier] = useState<string | null>(null);
  const router = useRouter()
  const { setUser } = useAuth();

  useEffect(() => {
    let deviceId = localStorage.getItem('deviceIdentifier');
    if (!deviceId) {
      // Use the new, compatible function instead of crypto.randomUUID
      deviceId = createIdentifier();
      localStorage.setItem('deviceIdentifier', deviceId);
    }
    setDeviceIdentifier(deviceId);
  }, []);


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (role: "student" | "teacher") => {
    setFormData((prev) => ({ ...prev, role }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.role === "student") {
      if (!formData.enrollmentNumber || !formData.currentSemester) { 
        setError("Please fill in enrollment number and current semester")
        return false
      }
      if (!deviceIdentifier) {
        setError("Could not determine device ID. Please refresh and try again.");
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)
    
    const apiUrl = `/api/auth/register`;

    const body: { [key: string]: any } = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
    };

    if (formData.role === 'student') {
        body.enrollmentNo = formData.enrollmentNumber;
        body.currentSemester = parseInt(formData.currentSemester, 10);
        body.deviceIdentifier = deviceIdentifier;
    }

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to create account.');
        }

        setUser(data);
        localStorage.setItem('token', data.token);

        router.push(formData.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }

  const passwordRequirements = [
    { met: formData.password.length >= 6, text: "At least 6 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AttendEase</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join thousands of educators and students</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">Choose your role and create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={formData.role}
              onValueChange={(value) => handleRoleChange(value as "student" | "teacher")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-4"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track your attendance and stay updated with class schedules
                  </p>
                </motion.div>
              </TabsContent>

              <TabsContent value="teacher">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-4"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">Manage your classes and track student engagement</p>
                </motion.div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {formData.role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNumber">Enrollment Number *</Label>
                    <Input
                      id="enrollmentNumber"
                      placeholder="e.g., 2024CSE001"
                      value={formData.enrollmentNumber}
                      onChange={(e) => handleInputChange("enrollmentNumber", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentSemester">Current Semester *</Label>
                    <Input
                      id="currentSemester"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.currentSemester}
                      onChange={(e) => handleInputChange("currentSemester", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseProgram">Course/Program</Label>
                    <Select
                      value={formData.courseProgram}
                      onValueChange={(value) => handleInputChange("courseProgram", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your course/program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="btech-cse">B.Tech Computer Science Engineering</SelectItem>
                        <SelectItem value="btech-it">B.Tech Information Technology</SelectItem>
                        <SelectItem value="btech-ece">B.Tech Electronics & Communication</SelectItem>
                        <SelectItem value="btech-me">B.Tech Mechanical Engineering</SelectItem>
                        <SelectItem value="btech-ce">B.Tech Civil Engineering</SelectItem>
                        <SelectItem value="mtech-cse">M.Tech Computer Science Engineering</SelectItem>
                        <SelectItem value="mtech-it">M.Tech Information Technology</SelectItem>
                        <SelectItem value="mca">Master of Computer Applications</SelectItem>
                        <SelectItem value="bca">Bachelor of Computer Applications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {formData.password && (
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`w-3 h-3 ${req.met ? "text-green-500" : "text-muted-foreground"}`} />
                        <span className={req.met ? "text-green-600" : "text-muted-foreground"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}