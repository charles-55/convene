"use server"

import { pool } from "@/lib/config"
import type { ApiResponse, CreateRoomRequest, Participant, Room, UpdateAvailabilityRequest } from "@/lib/types"
import { getUserRoomsFromCookies, requireAuth, updateUserRooms } from "@/lib/auth"
import { generateRoomCode } from "@/lib/utils"

// Function to get a room from database
export async function getRoom(roomCode: string): Promise<ApiResponse<Room>> {
  try {
    // Check if room exists
    const room = await pool.query("SELECT * FROM rooms WHERE room_code = $1", [roomCode])
    if (!room.rows.length) {
      return { success: false, error: "Room not found" }
    }

    const roomData = room.rows[0]
    const tempRoom: Room = {
      roomCode: roomData.room_code,
      creatorId: roomData.creator_id,
      creatorName: roomData.creator_name,
      roomName: roomData.room_name,
      created: roomData.created,
    }
    return { success: true, data: tempRoom }
  } catch (error) {
    console.error("Get room error:", error)
    return { success: false, error: "An error occurred while fetching the room" }
  }
}

// Function to create room in database
export async function createRoom(request: CreateRoomRequest): Promise<ApiResponse<{ roomCode: string }>> {
  try {
    const { name } = request
    const user = await requireAuth()

    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Save room
    await pool.query("INSERT INTO rooms (room_code, creator_id, creator_name, room_name, created) VALUES ($1, $2, $3, $4, $5)", [roomCode, user.id, user.name, name, new Date().toISOString()])
    await joinRoom(roomCode)

    return { success: true, data: { roomCode } }
  } catch (error) {
    console.error("Create room error:", error)
    return { success: false, error: "An error occurred while creating the room" }
  }
}

// Function to add user to room in database
export async function joinRoom(roomCode: string): Promise<ApiResponse<void>> {
  const user = await requireAuth()
  const participants = await getParticipants(roomCode)
  if (participants?.data?.some((p) => p.userId === user.id)) {
    return { success: false, error: "User already in room" }
  }
  await pool.query("INSERT INTO participants (room_code, user_id, name, availability) VALUES ($1, $2, $3, $4)", [roomCode, user.id, user.name, {}])

  const room = await getRoom(roomCode)

  const cookieRooms: any = await getUserRoomsFromCookies()
  if (cookieRooms) {
    cookieRooms.push({ roomCode: roomCode, roomName: room?.data?.roomName || "" })
    await updateUserRooms(cookieRooms)
  }

  return { success: true }
}

// Function to leave room in database
export async function leaveRoom(roomCode: string): Promise<ApiResponse<void>> {
  const user = await requireAuth()
  await pool.query("DELETE FROM participants WHERE room_code = $1 AND user_id = $2", [roomCode, user.id])

  // check if room is empty
  const participants = await getParticipants(roomCode)
  if (participants?.data?.length === 0) {
    await pool.query("DELETE FROM rooms WHERE room_code = $1", [roomCode])
  }

  const cookieRooms: any = await getUserRoomsFromCookies()
  if (cookieRooms) {
    cookieRooms.filter((room: any) => room.roomCode !== roomCode)
    await updateUserRooms(cookieRooms)
  }

  return { success: true }
}

// Function to get user's rooms from database
export async function getUserRooms(): Promise<ApiResponse<any[]>> {
  try {
    const user = await requireAuth()
    const rooms = await pool.query("SELECT r.* FROM rooms r JOIN participants p ON r.room_code = p.room_code WHERE p.user_id = $1", [user.id])
    return { success: true, data: rooms.rows }
  } catch (error) {
    console.error("Get user rooms error:", error)
    return { success: false, error: "An error occurred while fetching the user rooms" }
  }
}

// Function to get participants from database
export async function getParticipants(roomCode: string): Promise<ApiResponse<Participant[]>> {
  try {
    const participants = await pool.query("SELECT * FROM participants WHERE room_code = $1", [roomCode])
    return { success: true, data: participants.rows }
  } catch (error) {
    console.error("Get participants error:", error)
    return { success: false, error: "An error occurred while fetching the participants" }
  }
}

// Function to get user's availability from database
export async function getUserAvailability(roomCode: string): Promise<ApiResponse<any>> {
  try {
    const user = await requireAuth()
    const availability = await pool.query("SELECT availability FROM participants WHERE room_code = $1 AND user_id = $2", [roomCode, user.id])
    return { success: true, data: availability.rows[0] }
  } catch (error) {
    console.error("Get user availability error:", error)
    return { success: false, error: "An error occurred while fetching the user availability" }
  }
}

// Function to update user's availability in database
export async function updateAvailability(request: UpdateAvailabilityRequest): Promise<ApiResponse<Room>> {
  try {
    const user = await requireAuth()
    const { roomCode, availability } = request

    // Check if room exists
    const room = await pool.query("SELECT * FROM rooms WHERE room_code = $1", [roomCode])
    if (!room.rows.length) {
      return { success: false, error: "Room not found" }
    }

    // Update participant's availability
    await pool.query("UPDATE participants SET availability = $1 WHERE room_code = $2 AND user_id = $3", [availability, roomCode, user.id])

    return { success: true, data: room.rows[0] }
  } catch (error) {
    console.error("Update availability error:", error)
    return { success: false, error: "An error occurred while updating availability" }
  }
}
