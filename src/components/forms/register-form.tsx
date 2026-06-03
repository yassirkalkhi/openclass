"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registerAction } from "@/app/actions/auth"
import type { ActionResult } from "@/lib/actions/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"

const initialState: ActionResult | null = null

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState)
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t.auth.createAccount}</CardTitle>
        <CardDescription>{t.auth.joinAfterRegister}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state && !state.success && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">{t.auth.fullName}</Label>
            <Input id="fullName" name="fullName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.auth.creatingAccount : t.auth.createAccountBtn}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t.auth.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
