import type { Participant, MeetingOption } from "./types"

export function findMeetingOptions(participants: Participant[]): MeetingOption[] {
  if (participants.length < 2) {
    return []
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const options: MeetingOption[] = []

  // For each day of the week
  daysOfWeek.forEach((day) => {
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
        options.push({
          day,
          time,
          availableParticipants,
          availableCount: availableParticipants.length,
        })
      }
    })
  })

  // Sort options by number of available participants (descending)
  return options.sort((a, b) => b.availableCount - a.availableCount)
}
