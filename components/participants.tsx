import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Participant, User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

interface ParticipantsProps {
  participants: Participant[]
}

export function Participants({ participants }: ParticipantsProps) {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const getUserData = async () => {
      const user = await getCurrentUser()
      if (!user) {
        redirect("/login")
      }
      setUser(user)
    }

    getUserData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>{participants.length} people in this room</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => {
            const hasAvailability = Object.values(participant.availability).flat().length > 0
            return (
              <div
                key={participant.name}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {participant.name}
                    {participant.name === user?.name && " (you)"}
                  </span>
                </div>
                <Badge
                  variant={hasAvailability ? "default" : "outline"}
                  className={hasAvailability ? "bg-success text-white" : ""}
                >
                  {hasAvailability ? "Availability set" : "No availability"}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
