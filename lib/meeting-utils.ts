import type { Participant, MeetingOption } from "./types"

// Helper function to parse time string into hours
function parseTime(timeString: string): number {
  const [hourStr, period] = timeString.split(" ")
  const [hour] = hourStr.split(":")
  let hourNum = Number.parseInt(hour, 10)

  if (period === "PM" && hourNum !== 12) {
    hourNum += 12
  } else if (period === "AM" && hourNum === 12) {
    hourNum = 0
  }

  return hourNum
}

// Helper function to format hour number to time string
function formatTime(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:00 ${period}`
}

// Helper function to check if two time slots are consecutive
function areConsecutive(time1: string, time2: string): boolean {
  const hour1 = parseTime(time1)
  const hour2 = parseTime(time2)
  return hour2 - hour1 === 1
}

export function findMeetingOptions(participants: Participant[]): MeetingOption[] {
  if (participants.length < 2) {
    return []
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayOptions: Record<string, { time: string; participants: string[] }[]> = {}

  // For each day of the week
  daysOfWeek.forEach((day) => {
    dayOptions[day] = []

    // Get all unique time slots across all participants for this day
    const allTimeSlots = new Set<string>()
    participants.forEach((participant) => {
      const dayAvailability = participant.availability[day] || []
      dayAvailability.forEach((time) => allTimeSlots.add(time))
    })

    // For each time slot, check who's available
    allTimeSlots.forEach((time) => {
      const availableParticipants: string[] = []

      participants.forEach((participant) => {
        const dayAvailability = participant.availability[day] || []
        if (dayAvailability.includes(time)) {
          availableParticipants.push(participant.name)
        }
      })

      // Only include options with at least 2 participants available
      if (availableParticipants.length >= 2) {
        dayOptions[day].push({
          time,
          participants: availableParticipants,
        })
      }
    })

    // Sort time slots for this day
    dayOptions[day].sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time)
    })
  })

  // Group consecutive time slots with the same participants
  const groupedOptions: MeetingOption[] = []

  Object.entries(dayOptions).forEach(([day, timeSlots]) => {
    if (timeSlots.length === 0) return

    let currentGroup: {
      startTime: string
      endTime: string
      participants: string[]
    } | null = null

    timeSlots.forEach((slot, index) => {
      if (!currentGroup) {
        // Start a new group
        currentGroup = {
          startTime: slot.time,
          endTime: slot.time,
          participants: slot.participants,
        }
      } else if (
        areConsecutive(currentGroup.endTime, slot.time) &&
        JSON.stringify(currentGroup.participants.sort()) === JSON.stringify(slot.participants.sort())
      ) {
        // Extend the current group
        currentGroup.endTime = slot.time
      } else {
        // Finish the current group and start a new one
        const startHour = parseTime(currentGroup.startTime)
        const endHour = parseTime(currentGroup.endTime) + 1 // Add 1 to get the end of the range

        groupedOptions.push({
          day,
          timeRange: `${formatTime(startHour)} - ${formatTime(endHour)}`,
          availableParticipants: currentGroup.participants,
          availableCount: currentGroup.participants.length,
        })

        currentGroup = {
          startTime: slot.time,
          endTime: slot.time,
          participants: slot.participants,
        }
      }

      // If this is the last slot, add the current group
      if (index === timeSlots.length - 1 && currentGroup) {
        const startHour = parseTime(currentGroup.startTime)
        const endHour = parseTime(currentGroup.endTime) + 1 // Add 1 to get the end of the range

        groupedOptions.push({
          day,
          timeRange: `${formatTime(startHour)} - ${formatTime(endHour)}`,
          availableParticipants: currentGroup.participants,
          availableCount: currentGroup.participants.length,
        })
      }
    })
  })

  // Sort options by number of available participants (descending)
  return groupedOptions.sort((a, b) => b.availableCount - a.availableCount)
}
