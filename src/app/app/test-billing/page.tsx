"use client"

import { useEffect, useState } from "react"
import { testBillingStatusAction } from "@/app/actions/test-billing"
import { manuallyActivateFeaturesAction, manuallyDeactivateFeaturesAction } from "@/app/actions/test-billing-fix"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBillingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const result = await testBillingStatusAction()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Unknown error")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const activateFeatures = async (ai: boolean, video: boolean) => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const result = await manuallyActivateFeaturesAction(ai, video)
      if (result.success) {
        setMessage(result.data?.message || "Features activated")
        await runTest()
      } else {
        setError(result.error || "Unknown error")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const deactivateFeatures = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const result = await manuallyDeactivateFeaturesAction()
      if (result.success) {
        setMessage(result.data?.message || "Features deactivated")
        await runTest()
      } else {
        setError(result.error || "Unknown error")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Billing Status Test & Fix</h1>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={runTest} disabled={loading} variant="outline">
          {loading ? "Loading..." : "Refresh Test"}
        </Button>
        <Button onClick={() => activateFeatures(true, true)} disabled={loading} variant="default">
          Activate AI + Video
        </Button>
        <Button onClick={() => activateFeatures(true, false)} disabled={loading} variant="secondary">
          Activate AI Only
        </Button>
        <Button onClick={() => activateFeatures(false, true)} disabled={loading} variant="secondary">
          Activate Video Only
        </Button>
        <Button onClick={deactivateFeatures} disabled={loading} variant="destructive">
          Deactivate All
        </Button>
      </div>

      {message && (
        <Card className="mb-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{message}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User & Organization IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify({ userId: data.userId, orgId: data.orgId }, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.organization, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.subscription, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={data.aiAccess.hasAccess ? "text-green-600" : "text-red-600"}>
                AI Access Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.aiAccess, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={data.videoAccess.hasAccess ? "text-green-600" : "text-red-600"}>
                Video Access Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.videoAccess, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.subscriptionStatus, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
