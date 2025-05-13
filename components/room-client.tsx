"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { MeetingOptions } from "@/components/meeting-options"
import { Participants } from "@/components/participants"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getParticipants, getUserAvailability } from "@/lib/rooms"
import type { Participant } from "@/lib/types"

interface RoomClientProps {
  roomCode: string
}

export function RoomClient({ roomCode }: RoomClientProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("availability")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAvailability, setCurrentAvailability] = useState<Record<string, string[]>>({})
  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>([])

  useEffect(() => {
    const fetchUserAvailability = async () => {
      const availability = await getUserAvailability(roomCode)
      if (availability.success && availability.data) {
        setCurrentAvailability(availability.data)
      }
    }

    const fetchParticipants = async () => {
      const participants = await getParticipants(roomCode)
      if (participants.success && participants.data) {
        setCurrentParticipants(participants.data)
      }
    }

    fetchUserAvailability()
    fetchParticipants()
  }, [roomCode])

  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomCode}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Room link copied to clipboard",
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-muted-foreground">
            Room Code: <span className="font-mono">{roomCode}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyRoomLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="availability">My Availability</TabsTrigger>
            <TabsTrigger value="options">Meeting Options</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Availability</CardTitle>
                <CardDescription>Click and drag on the calendar to select times when you're available</CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar initialAvailability={currentAvailability || {}} setError={setError} roomCode={roomCode}/>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options">
            <MeetingOptions participants={currentParticipants} />
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <Participants participants={currentParticipants || []} />
        </div>
      </div>
    </>
  )
}
