"use client"

import { useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { redirect } from "next/navigation"
import { Logo } from "@/components/logo"
import { UserNav } from "@/components/user-nav"
import { RoomClient } from "@/components/room-client"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/types"

export default function RoomPage() {
  const pathname = usePathname()
  const roomCode = pathname.split("/").pop()
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const getUserData = async () => {
      const user = await getCurrentUser()
      if (!user) {
        redirect(`/login?redirect=/room/${roomCode}`)
      }
      setUser(user)
    }

    getUserData()
  }, [])

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <UserNav user={user!} />
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <RoomClient roomCode={roomCode!} />
      </main>
    </div>
  )
}
