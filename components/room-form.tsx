"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createRoom, joinRoom } from "@/lib/rooms"
import { useToast } from "@/hooks/use-toast"

interface RoomFormProps {
  mode: "create" | "join"
}

export function RoomForm({ mode }: RoomFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState("")
  const [roomName, setRoomName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === "create") {
        if (!roomName.trim()) {
          setError("Room name is required")
          setIsLoading(false)
          return
        }
        const result = await createRoom({ name: roomName })

        if (result.success && result.data) {
          toast({
            title: "Room created",
            description: "Your room has been created successfully",
          })
          router.push(`/room/${result.data.roomCode}`)
        } else {
          setError(result.error || "An error occurred while creating the room")
        }
      } else {
        if (!roomCode.trim()) {
          setError("Room code is required")
          setIsLoading(false)
          return
        }

        const result = await joinRoom(roomCode)
        if (result.success) {
          toast({
            title: "Room joined",
            description: "You have successfully joined the room",
          })
          router.push(`/room/${roomCode}`)
        } else {
          setError(result.error || "An error occurred while joining the room")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create a New Room" : "Join an Existing Room"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Start a new availability room and invite your team"
            : "Enter a room code to join your team"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "create" && (
            <div className="space-y-2">
              <Input placeholder="Enter room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>
          )}
          {mode === "join" && (
            <div className="space-y-2">
              <Input placeholder="Enter room code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : mode === "create" ? "Create Room" : "Join Room"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
