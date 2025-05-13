"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DoorOpen, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { UserNav } from "@/components/user-nav"
import { toast } from "@/hooks/use-toast"

import { getUserRoomsFromCookies, requireAuth } from "@/lib/auth"
import { leaveRoom } from "@/lib/rooms"
import type { User } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      const user = await requireAuth()
      setUser(user)
    }
    fetchUser()

    const fetchRooms = async () => {
      const rooms = await getUserRoomsFromCookies()
      if (rooms) {
        setRooms(rooms)
      }
    }
    fetchRooms()
  }, [])

  const handleLeaveRoom = async (roomCode: string) => {
    try {
      await leaveRoom(roomCode)
      setRooms((prevRooms) => prevRooms.filter((room) => room.roomCode !== roomCode))
      toast({
        title: "Room left",
        description: "You have successfully left the room",
      })
      setTimeout(() => {
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error("Leave room error:", error)
      toast({
        title: "Error leaving room",
        description: "An error occurred while leaving the room",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <UserNav user={user} />
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">Your Profile</h1>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">Name:</div>
                <div>{user?.name}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">Email:</div>
                <div>{user?.email}</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">User ID:</div>
                <div className="font-mono text-sm">{user?.id}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rooms</CardTitle>
              <CardDescription>Rooms you are in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Room Code</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {rooms?.map((room) => (
                    <tr
                      key={room.roomCode}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">{room.roomName || ""}</td>
                      <td className="p-4 align-middle">{room.roomCode}</td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => router.push(`/room/${room.roomCode}`)}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Open</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleLeaveRoom(room.roomCode)}>
                            <DoorOpen className="h-4 w-4" />
                            <span className="sr-only">Leave</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
