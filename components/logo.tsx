"use client"

import Link from "next/link"
import { CalendarClock } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
        <CalendarClock className="h-5 w-5" />
      </div>
      <span className={`font-bold tracking-tight text-foreground ${sizeClasses[size]}`}>
        <span className="text-primary">Con</span>
        <span className="text-accent">vene</span>
      </span>
    </Link>
  )
}
