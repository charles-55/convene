"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Participant } from "@/lib/types"
import { findMeetingOptions } from "@/lib/meeting-utils"

interface MeetingOptionsProps {
  participants: Participant[]
}

export function MeetingOptions({ participants }: MeetingOptionsProps) {
  const meetingOptions = useMemo(() => {
    return findMeetingOptions(participants)
  }, [participants])

  if (meetingOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Options</CardTitle>
          <CardDescription>No meeting options available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Once team members add their availability, meeting options will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Options</CardTitle>
        <CardDescription>Ranked by number of available participants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetingOptions.map((option, index) => (
            <div key={`${option.day}-${option.time}-${index}`} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">
                  {option.day} at {option.time}
                </h3>
                <Badge
                  variant={option.availableCount === participants.length ? "default" : "outline"}
                  className={option.availableCount === participants.length ? "bg-success text-white" : ""}
                >
                  {option.availableCount}/{participants.length} available
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Available:</p>
                <div className="flex flex-wrap gap-1">
                  {option.availableParticipants.map((name) => (
                    <Badge key={name} variant="secondary" className="bg-secondary/20 text-foreground">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
