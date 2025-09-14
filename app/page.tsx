"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  QrCode,
  Smartphone,
  CheckCircle,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider.jsx"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const attendanceData = [
  { subject: "Math", present: 85, absent: 15 },
  { subject: "Physics", present: 78, absent: 22 },
  { subject: "Chemistry", present: 92, absent: 8 },
  { subject: "English", present: 88, absent: 12 },
]

const pieData = [
  { name: "Present", value: 85, color: "#00ABE4" },
  { name: "Absent", value: 15, color: "#E9F1FA" },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user && !loading) {
      router.push(user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard")
    }
  }, [user, loading, router])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[#00ABE4] rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">AttendanceQR</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-white hover:bg-[#00ABE4] transition-colors">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#00ABE4] hover:bg-[#0095CC] text-white px-6 font-medium">Sign Up</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart QR Attendance
              <span className="text-[#00ABE4] block">Made Simple</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Eliminate proxy attendance forever with dynamic QR codes. Real-time tracking, instant verification,
              complete transparency.
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg text-gray-500 mb-8">
              Trusted by educational institutions for secure, automated attendance management that adapts to any
              classroom environment.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-[#00ABE4] hover:bg-[#0095CC] text-white px-8 py-4 text-lg font-medium">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-[#00ABE4] text-[#00ABE4] hover:bg-[#00ABE4] hover:text-white bg-transparent font-medium"
                >
                  Watch Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-[#00ABE4] via-blue-500 to-blue-600 rounded-3xl p-16 overflow-hidden">
              {/* Animated circuit background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                <div
                  className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent animate-pulse"
                  style={{ animationDelay: "1.5s" }}
                ></div>

                {/* Corner circuit elements */}
                <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-white/30 animate-pulse"></div>
                <div
                  className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-white/30 animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-white/30 animate-pulse"
                  style={{ animationDelay: "0.7s" }}
                ></div>
                <div
                  className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-white/30 animate-pulse"
                  style={{ animationDelay: "1.2s" }}
                ></div>
              </div>

              {/* Central QR code container */}
              <div className="relative z-10 bg-white rounded-2xl p-8 shadow-2xl mx-auto max-w-sm">
                <div className="relative">
                  {/* QR code with enhanced styling */}
                  <div className="w-56 h-56 mx-auto bg-white rounded-xl p-4 border-4 border-[#00ABE4]/20">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <rect x="0" y="0" width="200" height="200" fill="white" />
                      {/* Enhanced QR pattern with better visual design */}
                      <rect x="10" y="10" width="35" height="35" fill="#00ABE4" rx="4" />
                      <rect x="155" y="10" width="35" height="35" fill="#00ABE4" rx="4" />
                      <rect x="10" y="155" width="35" height="35" fill="#00ABE4" rx="4" />

                      {/* Inner corner squares */}
                      <rect x="18" y="18" width="19" height="19" fill="white" rx="2" />
                      <rect x="163" y="18" width="19" height="19" fill="white" rx="2" />
                      <rect x="18" y="163" width="19" height="19" fill="white" rx="2" />

                      {/* Center squares */}
                      <rect x="25" y="25" width="5" height="5" fill="#00ABE4" />
                      <rect x="170" y="25" width="5" height="5" fill="#00ABE4" />
                      <rect x="25" y="170" width="5" height="5" fill="#00ABE4" />

                      {/* Data pattern - more sophisticated layout */}
                      <rect x="55" y="15" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="75" y="15" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="95" y="15" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="115" y="15" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="15" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="55" y="35" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="85" y="35" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="115" y="35" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="35" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="65" y="55" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="95" y="55" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="125" y="55" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="75" y="75" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="105" y="75" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="75" width="8" height="8" fill="#00ABE4" rx="1" />

                      {/* Center alignment pattern */}
                      <rect x="85" y="85" width="30" height="30" fill="#00ABE4" rx="3" />
                      <rect x="92" y="92" width="16" height="16" fill="white" rx="2" />
                      <rect x="97" y="97" width="6" height="6" fill="#00ABE4" />

                      {/* More data patterns */}
                      <rect x="55" y="125" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="85" y="125" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="125" y="125" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="65" y="145" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="95" y="145" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="145" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="55" y="165" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="85" y="165" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="115" y="165" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="165" width="8" height="8" fill="#00ABE4" rx="1" />

                      <rect x="75" y="185" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="105" y="185" width="8" height="8" fill="#00ABE4" rx="1" />
                      <rect x="135" y="185" width="8" height="8" fill="#00ABE4" rx="1" />
                    </svg>
                  </div>

                  {/* Glowing effect around QR code */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ABE4]/20 to-blue-500/20 rounded-xl blur-xl -z-10"></div>
                </div>
              </div>

              {/* Enhanced floating elements */}
              <div
                className="absolute top-1/2 left-4 w-3 h-3 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute top-1/3 right-6 w-2 h-2 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "0.8s" }}
              ></div>
              <div
                className="absolute bottom-1/3 left-6 w-2 h-2 bg-white/50 rounded-full animate-bounce"
                style={{ animationDelay: "1.4s" }}
              ></div>
              <div
                className="absolute bottom-1/4 right-8 w-3 h-3 bg-white/30 rounded-full animate-bounce"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-[#00ABE4]">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 4-step process that revolutionizes attendance tracking with secure, automated verification.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: QrCode,
                title: "Generate QR Code",
                description:
                  "Teachers generate dynamic QR codes for each class session with location and time constraints.",
              },
              {
                step: "02",
                icon: Smartphone,
                title: "Scan & Verify",
                description:
                  "Students scan the QR code using their mobile devices. System verifies location and timing automatically.",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Mark Attendance",
                description:
                  "Attendance is marked instantly with encrypted verification, preventing any fraudulent attempts.",
              },
              {
                step: "04",
                icon: BarChart3,
                title: "Track & Analyze",
                description:
                  "Real-time dashboards show attendance patterns, generate reports, and provide actionable insights.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group cursor-pointer hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-[#00ABE4] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-[#00ABE4]" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#00ABE4] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our QR System Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our <span className="text-[#00ABE4]">QR System?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of attendance management with cutting-edge features designed for modern
              educational institutions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🛡️",
                title: "Secure Attendance",
                description:
                  "Advanced encryption and dynamic QR codes ensure maximum security for attendance tracking.",
              },
              {
                icon: "👥",
                title: "Proxy-Proof System",
                description: "Eliminate fake attendance with location-based verification and real-time authentication.",
              },
              {
                icon: "📱",
                title: "One-Tap Integration",
                description: "Seamless integration with existing systems. Quick setup and intuitive mobile interface.",
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description:
                  "Comprehensive dashboards with detailed reports and attendance insights for better decision making.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="p-8 h-full border-2 border-secondary/20 hover:border-[#00ABE4]/30 transition-all duration-300 hover:shadow-lg bg-white">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-[#00ABE4] rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AttendanceQR</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Revolutionary attendance tracking system using dynamic QR codes. Secure, efficient, and proxy-proof
                solution for modern educational institutions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 text-[#00ABE4]">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#00ABE4]" />
                  <span className="text-gray-300">contact@attendanceqr.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#00ABE4]" />
                  <span className="text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#00ABE4]" />
                  <span className="text-gray-300">123 Tech Street, Silicon Valley</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 text-[#00ABE4]">Follow Us</h3>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-[#00ABE4] rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-[#00ABE4] rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-[#00ABE4] rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-[#00ABE4] rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 AttendanceQR. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
