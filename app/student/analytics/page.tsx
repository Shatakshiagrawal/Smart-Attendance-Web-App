"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingUp, Calendar } from "lucide-react"

const btechCSESubjects = [
  { subject: "Data Structures", attendance: 88, present: 22, absent: 3, total: 25 },
  { subject: "Computer Networks", attendance: 92, present: 23, absent: 2, total: 25 },
  { subject: "Database Systems", attendance: 85, present: 21, absent: 4, total: 25 },
  { subject: "Operating Systems", attendance: 90, present: 22, absent: 2, total: 24 },
  { subject: "Software Engineering", attendance: 87, present: 20, absent: 3, total: 23 },
  { subject: "Machine Learning", attendance: 94, present: 23, absent: 1, total: 24 },
]

const overallAttendanceData = [
  { name: "Present", value: 85, color: "#22c55e" }, // Brighter green
  { name: "Absent", value: 15, color: "#ef4444" }, // Bright red
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium" style={{ color: data.payload.color }}>
          {data.name}: {data.value}%
        </p>
      </div>
    )
  }
  return null
}

export default function StudentAnalytics() {
  // const [selectedSemester, setSelectedSemester] = useState("current")

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"
      >
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Track your attendance performance and insights</p>
        </div>
      </motion.div>

      {/* Analytics Header Card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card className="bg-gradient-to-r from-[#00ABE4] to-[#0ea5e9] text-white border-0">
          <CardContent className="p-4 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-2">Analytics Dashboard</h2>
                <p className="text-blue-100 text-sm md:text-base">Track your attendance performance and insights</p>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold">85%</div>
                <div className="text-blue-100 text-sm md:text-base">Average Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Average Attendance</p>
                  <p className="text-xl md:text-2xl font-bold text-[#00ABE4]">85%</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E9F1FA] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#00ABE4]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Classes Attended</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">131</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Classes Missed</p>
                  <p className="text-xl md:text-2xl font-bold text-red-600">15</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-gray-900">Attendance Distribution</CardTitle>
            <CardDescription className="text-sm text-gray-600">Overall present vs absent ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                present: { label: "Present", color: "#22c55e" }, // Brighter green
                absent: { label: "Absent", color: "#ef4444" }, // Bright red
              }}
              className="h-[250px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallAttendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {overallAttendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 md:gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Present: 85%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">Absent: 15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Subject Analysis */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.7 }}>
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Detailed Subject Analysis</CardTitle>
            <CardDescription className="text-gray-600">
              Comprehensive breakdown of attendance for each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {btechCSESubjects.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#00ABE4] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{subject.subject}</h3>
                      <p className="text-sm text-gray-600">BTech CSE</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${subject.attendance >= 90 ? "text-green-600" : subject.attendance >= 80 ? "text-[#00ABE4]" : "text-red-600"}`}
                      >
                        {subject.attendance}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {subject.present}/{subject.total} classes
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-lg font-bold text-green-600">{subject.present}</p>
                      <p className="text-xs text-gray-600">Present</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="text-lg font-bold text-red-600">{subject.absent}</p>
                      <p className="text-xs text-gray-600">Absent</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">{subject.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
