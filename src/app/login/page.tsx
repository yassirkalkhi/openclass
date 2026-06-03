import { Suspense } from "react"
import { LoginForm } from "@/components/forms/login-form"
import { OpenClassLogo } from "@/components/ui/openclass-logo"

export default function Page() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-center">
                    <OpenClassLogo href="/" size="lg" />
                </div>
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}