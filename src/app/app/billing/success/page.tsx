"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { autoSyncSubscriptionAction } from "@/app/actions/sync-subscription"

type SyncState = "syncing" | "done" | "error"

export default function BillingSuccessPage() {
  const [syncState, setSyncState] = useState<SyncState>("syncing")
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 5
    const delayMs = 2000

    async function trySync() {
      try {
        const result = await autoSyncSubscriptionAction()
        if (result.success && result.data?.synced) {
          setSynced(true)
          setSyncState("done")
          return
        }
        // Subscription not active in Polar yet — retry
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(trySync, delayMs)
        } else {
          // Give up polling but still show success (webhook will catch up)
          setSyncState("done")
        }
      } catch {
        setSyncState("error")
      }
    }

    trySync()
  }, [])

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              {syncState === "syncing" ? (
                <Loader2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-spin" />
              ) : syncState === "error" ? (
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              ) : (
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {syncState === "syncing"
                ? "Activating your subscription…"
                : "Subscription Activated!"}
            </CardTitle>
            <CardDescription>
              {syncState === "syncing"
                ? "Syncing your subscription — this only takes a moment."
                : synced
                ? "Your subscription is active and ready to use."
                : "Payment received. Your subscription will be active shortly."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {syncState === "syncing" ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activating features…</span>
              </div>
            ) : (
              <>
                <div className="text-center text-sm text-muted-foreground">
                  <p>Thank you for subscribing to OpenClass.</p>
                  <p className="mt-2">You can manage your billing details from the billing page.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/app">Go to Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/app/billing">View Billing Details</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
