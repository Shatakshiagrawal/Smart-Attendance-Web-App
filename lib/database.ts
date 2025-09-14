import { Pool } from "pg"

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test database connection on startup
pool.on("connect", () => {
  console.log("[v0] Database connected successfully")
})

pool.on("error", (err) => {
  console.error("[v0] Database connection error:", err)
})

export async function query(text: string, params?: any[]) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const client = await pool.connect()
  try {
    console.log("[v0] Executing query:", text.substring(0, 50) + "...")
    const result = await client.query(text, params)
    console.log("[v0] Query successful, rows returned:", result.rows.length)
    return result
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

// User operations
export async function createUser(userData: {
  email: string
  passwordHash: string
  role: "teacher" | "student"
  firstName: string
  lastName: string
  phone?: string
}) {
  const result = await query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, role, first_name, last_name, phone, created_at`,
    [userData.email, userData.passwordHash, userData.role, userData.firstName, userData.lastName, userData.phone],
  )
  return result.rows[0]
}

export async function getUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0]
}

export async function getUserById(id: string) {
  const result = await query("SELECT id, email, role, first_name, last_name, phone FROM users WHERE id = $1", [id])
  return result.rows[0]
}

// Subject operations
export async function getSubjectsByTeacher(teacherId: string) {
  const result = await query("SELECT * FROM subjects WHERE teacher_id = $1 ORDER BY name", [teacherId])
  return result.rows
}

export async function getSubjectsByStudent(studentId: string) {
  const result = await query(
    `SELECT s.* FROM subjects s
     JOIN enrollments e ON s.id = e.subject_id
     WHERE e.student_id = $1
     ORDER BY s.name`,
    [studentId],
  )
  return result.rows
}

// Attendance operations
export async function getAttendanceByStudent(studentId: string, subjectId?: string) {
  let queryText = `
    SELECT a.*, c.class_date, c.start_time, c.end_time, s.name as subject_name, s.code as subject_code
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE a.student_id = $1
  `
  const params = [studentId]

  if (subjectId) {
    queryText += " AND c.subject_id = $2"
    params.push(subjectId)
  }

  queryText += " ORDER BY c.class_date DESC, c.start_time DESC"

  const result = await query(queryText, params)
  return result.rows
}

export async function getAttendanceByClass(classId: string) {
  const result = await query(
    `SELECT a.*, u.first_name, u.last_name, u.email
     FROM attendance a
     JOIN users u ON a.student_id = u.id
     WHERE a.class_id = $1
     ORDER BY u.last_name, u.first_name`,
    [classId],
  )
  return result.rows
}
