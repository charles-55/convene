import { Logo } from "@/components/logo"
import { RoomForm } from "@/components/room-form"
import { UserNav } from "@/components/user-nav"
import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <UserNav user={user} />
        </div>
      </header>

      <main className="container py-12">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            Find the perfect meeting time for your team
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Share your availability and discover the best times for everyone to meet
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-4xl gap-6 sm:grid-cols-2 mx-auto">
          <RoomForm mode="create" />
          <RoomForm mode="join" />
        </div>
      </main>
    </div>
  )
}
