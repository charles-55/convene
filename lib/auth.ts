"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import { pool } from "@/lib/config"
import type { ApiResponse, LoginCredentials, Room, SignupCredentials, User } from "@/lib/types"
import { getUserRooms } from "@/lib/rooms"

const SESSION_COOKIE_USER = process.env.NEXT_PUBLIC_SESSION_COOKIE_USER || "convene-user"
const SESSION_COOKIE_ROOMS = process.env.NEXT_PUBLIC_SESSION_COOKIE_ROOMS || "convene-rooms"

// Helper to get users from database
async function getUsers(): Promise<(User & { password: string })[]> {
  const users = await pool.query("SELECT * FROM users")
  return users.rows as (User & { password: string })[]
}

// Helper to save user to database
async function saveUser(user: User & { password: string }): Promise<void> {
  await pool.query("INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)", [
    user.id,
    user.name,
    user.email,
    user.password,
  ])
}

// Helper to hash passwords
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

// Helper to compare passwords
function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// Helper to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function signup(credentials: SignupCredentials): Promise<ApiResponse<User>> {
  try {
    const { name, email, password } = credentials

    // Validate input
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    // Get existing users
    const users = await getUsers()

    // Check if email already exists
    if (users.find((user) => user.email === email)) {
      return { success: false, error: "Email already in use" }
    }

    // Create new user
    const userId = generateId()
    const newUser: User & { password: string } = {
      id: userId,
      name,
      email,
      password: hashPassword(password),
    }

    // Save user
    await saveUser(newUser)

    // Set session cookies
    const { password: _, ...userWithoutPassword } = newUser
    const cookiesStore = await cookies()
    cookiesStore.set({
      name: SESSION_COOKIE_USER,
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    cookiesStore.set({
      name: SESSION_COOKIE_ROOMS,
      value: JSON.stringify([]),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "An error occurred during signup" }
  }
}

export async function login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
  try {
    const { email, password } = credentials

    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    // Get users
    const users = await getUsers()

    // Check if user exists and password matches
    const user = users.find((user) => user.email === email)
    if (!user || !comparePassword(password, user.password)) {
      return { success: false, error: "Invalid email or password" }
    }

    const { password: _, ...userWithoutPassword } = user
    const cookiesStore = await cookies()
    cookiesStore.set({
      name: SESSION_COOKIE_USER,
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Get user's rooms
    const rooms = await getUserRooms()
    const userRooms = rooms?.data?.map((room) => ({
      roomCode: room.room_code,
      roomName: room.room_name,
    })) || []

    cookiesStore.set({
      name: SESSION_COOKIE_ROOMS,
      value: JSON.stringify(userRooms),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function logout(): Promise<void> {
  const cookiesStore = await cookies()
  cookiesStore.delete(SESSION_COOKIE_USER)
  cookiesStore.delete(SESSION_COOKIE_ROOMS)
  redirect("/login")
}

export async function getCurrentUser(): Promise<User | null> {
  const cookiesStore = await cookies()
  const sessionCookie = cookiesStore.get(SESSION_COOKIE_USER)

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as User
  } catch {
    return null
  }
}

export async function getUserRoomsFromCookies(): Promise<Room[] | null> {
  const cookiesStore = await cookies()
  const sessionCookie = cookiesStore.get(SESSION_COOKIE_ROOMS)

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as Room[]
  } catch {
    return null
  }
}

export async function updateUserRooms(rooms: Room[]): Promise<void> {
  const cookiesStore = await cookies()
  cookiesStore.set({
    name: SESSION_COOKIE_ROOMS,
    value: JSON.stringify(rooms),
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
