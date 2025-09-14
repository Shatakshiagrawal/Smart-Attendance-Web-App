"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, GraduationCap, User } from "lucide-react"

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRole: (role: "teacher" | "student") => void
  title: string
}

export function RoleSelectionModal({ isOpen, onClose, onSelectRole, title }: RoleSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => onSelectRole("teacher")}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 text-lg font-medium"
                >
                  <GraduationCap className="w-6 h-6" />
                  Teacher
                </Button>

                <Button
                  onClick={() => onSelectRole("student")}
                  variant="outline"
                  className="w-full h-16 border-primary text-primary hover:bg-primary/5 flex items-center justify-center gap-3 text-lg font-medium"
                >
                  <User className="w-6 h-6" />
                  Student
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
