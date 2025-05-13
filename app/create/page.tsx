import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function CreateRoomPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // This page is now just a redirect to the home page
  // since we're handling room creation directly from there
  redirect("/")
}
