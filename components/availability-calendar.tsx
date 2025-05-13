"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { updateAvailability } from "@/lib/rooms"

interface AvailabilityCalendarProps {
  roomCode: string
  initialAvailability: Record<string, string[]>
  setError: (error: string | null) => void
}

export function AvailabilityCalendar({ roomCode, initialAvailability, setError }: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<Record<string, string[]>>(initialAvailability)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12
    const period = i < 12 ? "AM" : "PM"
    return `${hour}:00 ${period}`
  })

  const toggleTimeSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = [...(prev[day] || [])]

      if (daySlots.includes(time)) {
        return {
          ...prev,
          [day]: daySlots.filter((t) => t !== time),
        }
      } else {
        return {
          ...prev,
          [day]: [...daySlots, time].sort(),
        }
      }
    })
  }

  const handleMouseDown = (day: string, time: string) => {
    const isAvailable = availability[day]?.includes(time)
    setIsSelecting(!isAvailable)
    setIsRemoving(isAvailable)
    toggleTimeSlot(day, time)
  }

  const handleMouseEnter = (day: string, time: string) => {
    if (!isSelecting && !isRemoving) return

    const isAvailable = availability[day]?.includes(time)

    if ((isSelecting && !isAvailable) || (isRemoving && isAvailable)) {
      toggleTimeSlot(day, time)
    }
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
    setIsRemoving(false)
  }

  const isTimeSlotSelected = (day: string, time: string) => {
    return availability[day]?.includes(time) || false
  }

  const handleAvailabilityChange = async () => {
    setError(null)

    try {
      const result = await updateAvailability({
        roomCode: roomCode,
        availability,
      })

      if (result.success && result.data) {
        toast({
          title: "Availability updated",
          description: "Your availability has been saved",
        })
      } else {
        setError(result.error || "Failed to update availability")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    }
  }

  return (
    <div className="select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Weekly Availability</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAvailability({})}>
            Clear All
          </Button>
          <Button size="sm" onClick={handleAvailabilityChange}>
            Save
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[800px] grid-cols-[auto_repeat(7,1fr)]">
          {/* Time labels */}
          <div className="sticky left-0 bg-background pr-4">
            <div className="h-10"></div> {/* Empty cell for corner */}
            {timeSlots.map((time, index) => (
              <div key={time} className="flex h-10 items-center justify-end text-xs text-muted-foreground">
                {time}
              </div>
            ))}
          </div>

          {/* Days and time slots */}
          {daysOfWeek.map((day) => (
            <div key={day} className="min-w-[100px]">
              <div className="h-10 border-b px-2 text-center font-medium">{day}</div>
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={`${day}-${time}`}
                  className={cn(
                    "h-10 border-b border-r p-1",
                    isTimeSlotSelected(day, time) ? "bg-success/20" : "hover:bg-muted/50",
                  )}
                  onMouseDown={() => handleMouseDown(day, time)}
                  onMouseEnter={() => handleMouseEnter(day, time)}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">Click and drag to select or deselect time slots</p>
      </div>
    </div>
  )
}
