import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export interface User {
  id: string
  email: string
  role: "teacher" | "student"
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthSession {
  user: User
  token: string
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // In a real app, you'd fetch the user from the database
  // For now, we'll return the payload data
  return {
    user: {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
    },
    token,
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireRole(role: "teacher" | "student"): Promise<AuthSession> {
  const session = await requireAuth()
  if (session.user.role !== role) {
    redirect("/unauthorized")
  }
  return session
}
