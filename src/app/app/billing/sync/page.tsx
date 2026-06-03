"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { diagnoseSubscriptionAction, syncSubscriptionFromPolarAction } from "@/app/actions/sync-subscription"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function BillingSyncPage() {
  const [diagnosing, setDiagnosing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleDiagnose = async () => {
    setDiagnosing(true)
    setSyncResult(null)
    try {
      const result = await diagnoseSubscriptionAction()
      if (result.success) {
        setDiagnosis(result.data)
      } else {
        setDiagnosis({ error: result.error })
      }
    } catch (error) {
      setDiagnosis({ error: String(error) })
    } finally {
      setDiagnosing(false)
    }
  }

  const handleSync = async (polarSubscriptionId: string) => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await syncSubscriptionFromPolarAction(polarSubscriptionId)
      if (result.success) {
        setSyncResult({ success: true, message: result.data.message })
        // Re-diagnose after sync
        await handleDiagnose()
      } else {
        setSyncResult({ success: false, message: result.error })
      }
    } catch (error) {
      setSyncResult({ success: false, message: String(error) })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Billing Sync Diagnostic</CardTitle>
          <CardDescription>
            Check for subscription sync issues between Polar and your local database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button
              onClick={handleDiagnose}
              disabled={diagnosing}
              className="w-full sm:w-auto"
            >
              {diagnosing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Run Diagnostic
                </>
              )}
            </Button>
          </div>

          {syncResult && (
            <Alert variant={syncResult.success ? "default" : "destructive"}>
              <AlertDescription>
                {syncResult.success ? (
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {syncResult.message}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4" />
                    {syncResult.message}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {diagnosis && (
            <div className="space-y-4">
              {diagnosis.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{diagnosis.error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Diagnostic Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Organization ID:</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {diagnosis.organizationId}
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">User Email:</span>
                          <span className="text-sm">{diagnosis.userEmail}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Local Subscription:</span>
                          {diagnosis.hasLocalSubscription ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Found
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <XCircle className="mr-1 h-4 w-4" />
                              Not Found
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Polar Subscriptions ({diagnosis.polarSubscriptions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {diagnosis.polarSubscriptions.length === 0 ? (
                        <Alert>
                          <AlertDescription>
                            No subscriptions found in Polar for this email address.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {diagnosis.polarSubscriptions.map((sub: any) => (
                            <Card key={sub.id} className="border-2">
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span
                                      className={`px-2 py-1 rounded text-sm ${
                                        sub.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {sub.status}
                                    </span>
                                  </div>
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-medium">Subscription ID:</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded break-all text-right">
                                      {sub.id}
                                    </code>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Period End:</span>
                                    <span className="text-sm">
                                      {new Date(sub.currentPeriodEnd * 1000).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {sub.metadata && (
                                    <div className="space-y-2">
                                      <span className="font-medium">Features:</span>
                                      <div className="text-sm space-y-1 ml-4">
                                        <div>
                                          Video:{" "}
                                          {sub.metadata.videoEnabled === "true" ? "✓" : "✗"}
                                        </div>
                                        <div>
                                          AI: {sub.metadata.aiEnabled === "true" ? "✓" : "✗"}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {!diagnosis.hasLocalSubscription && sub.status === "active" && (
                                    <div className="pt-4">
                                      <Button
                                        onClick={() => handleSync(sub.id)}
                                        disabled={syncing}
                                        className="w-full"
                                        variant="default"
                                      >
                                        {syncing ? (
                                          <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Syncing...
                                          </>
                                        ) : (
                                          <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Sync This Subscription
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {!diagnosis.hasLocalSubscription &&
                    diagnosis.polarSubscriptions.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You have {diagnosis.polarSubscriptions.length} subscription(s) in Polar,
                          but they are not synced to your local database. Click "Sync This
                          Subscription" on an active subscription to fix this issue.
                        </AlertDescription>
                      </Alert>
                    )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
