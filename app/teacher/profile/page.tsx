"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { User, Edit, Save, X } from "lucide-react"
import { useAuth } from "@/components/AuthProvider.jsx"
import TimetableManager from "@/components/time-table-manager"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function TeacherProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  // FIX: Use the consistent firstName and lastName from the AuthProvider
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    address: "456 Faculty Housing, University Campus",
    dateOfBirth: "1985-08-20",
    bio: "Passionate educator with expertise in machine learning and data science. Committed to fostering innovation and critical thinking in students.",
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your personal information</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white text-sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-[#00ABE4] hover:bg-[#0ea5e9] text-white text-sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card className="bg-gradient-to-r from-[#00ABE4] to-[#0ea5e9] text-white border-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-xl sm:text-2xl font-bold">
                  {(profileData.firstName?.[0] || '')}{(profileData.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">Teacher</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
        <TimetableManager />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <User className="w-5 h-5 text-[#00ABE4]" />
              <span className="text-gray-900">Personal Information</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">Your basic personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 text-sm">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="border-gray-300 focus:border-[#00ABE4] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 text-sm">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="border-gray-300 focus:border-[#00ABE4] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="border-gray-300 focus:border-[#00ABE4] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="border-gray-300 focus:border-[#00ABE4] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-gray-700 text-sm">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                  className="border-gray-300 focus:border-[#00ABE4] text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 text-sm">
                Address
              </Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!isEditing}
                className="border-gray-300 focus:border-[#00ABE4] text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 text-sm">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                disabled={!isEditing}
                className="border-gray-300 focus:border-[#00ABE4] min-h-[100px] text-sm"
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}