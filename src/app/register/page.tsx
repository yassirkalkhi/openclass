import { Suspense } from "react"
import { RegisterForm } from "@/components/forms/register-form"
import { OpenClassLogo } from "@/components/ui/openclass-logo"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <OpenClassLogo href="/" size="lg" />
        </div>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
