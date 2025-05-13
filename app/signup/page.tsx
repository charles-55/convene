import { Logo } from "@/components/logo"
import { AuthForm } from "@/components/auth-form"

export default function SignupPage() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <AuthForm mode="signup" />
    </div>
  )
}
