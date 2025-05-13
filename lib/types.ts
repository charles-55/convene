export interface User {
  id: string
  name: string
  email: string
}

export interface Room {
  roomCode: string
  creatorId: string
  creatorName: string
  roomName: string
  created: string
}

export interface Participant {
  roomId: string
  userId: string
  name: string
  availability: Record<string, string[]>
}

export interface MeetingOption {
  day: string
  time: string
  availableParticipants: string[]
  availableCount: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
}

export interface CreateRoomRequest {
  name: string
}

export interface UpdateAvailabilityRequest {
  roomCode: string
  availability: Record<string, string[]>
}
