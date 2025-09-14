"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, BookOpen, Edit, Save, X } from "lucide-react"
import { useAuth } from "@/components/AuthProvider.jsx"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function StudentProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    enrollmentNo: "CSE2021001",
    program: "BTech Computer Science Engineering",
    semester: "6th Semester",
    year: "3rd Year",
    address: "123 Student Housing, University Campus",
    dateOfBirth: "2002-05-15",
    bloodGroup: "O+",
    emergencyContact: "+1 (555) 987-6543",
  })

  const handleSave = () => {
    // Here you would typically save to API
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and academic details</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card className="bg-gradient-to-r from-[#00ABE4] to-[#0ea5e9] text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                  {profileData.firstName[0]}
                  {profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-blue-100 mb-2">{profileData.program}</p>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">{profileData.enrollmentNo}</Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">{profileData.semester}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Details */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="academic">Academic Details</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#00ABE4]" />
                  <span className="text-gray-900">Personal Information</span>
                </CardTitle>
                <CardDescription className="text-gray-600">Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#00ABE4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#00ABE4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#00ABE4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#00ABE4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#00ABE4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-gray-700">
                      Blood Group
                    </Label>
                    <Select
                      value={profileData.bloodGroup}
                      onValueChange={(value) => setProfileData({ ...profileData, bloodGroup: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#00ABE4]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                    className="border-gray-300 focus:border-[#00ABE4]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-gray-700">
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                    className="border-gray-300 focus:border-[#00ABE4]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#00ABE4]" />
                  <span className="text-gray-900">Academic Information</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your academic program and enrollment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNo" className="text-gray-700">
                      Enrollment Number
                    </Label>
                    <Input
                      id="enrollmentNo"
                      value={profileData.enrollmentNo}
                      disabled
                      className="border-gray-300 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program" className="text-gray-700">
                      Program
                    </Label>
                    <Input id="program" value={profileData.program} disabled className="border-gray-300 bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-gray-700">
                      Current Semester
                    </Label>
                    <Input id="semester" value={profileData.semester} disabled className="border-gray-300 bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-gray-700">
                      Academic Year
                    </Label>
                    <Input id="year" value={profileData.year} disabled className="border-gray-300 bg-gray-50" />
                  </div>
                </div>

                {/* Current Subjects */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Data Structures",
                      "Computer Networks",
                      "Database Systems",
                      "Operating Systems",
                      "Software Engineering",
                      "Machine Learning",
                    ].map((subject, index) => (
                      <div key={subject} className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">{subject}</h4>
                        <p className="text-sm text-gray-600">BTech CSE - 6th Semester</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
