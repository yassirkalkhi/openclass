/**
 * Prefix used to tag billing-related errors so the UI can distinguish them
 * from generic errors and show the appropriate payment notice instead of a
 * plain error message.
 *
 * Safe to import in both client and server code — no server-only imports.
 */
export const BILLING_ERROR_PREFIX = "BILLING_LOCKED:"

export function makeBillingError(reason: string): string {
  return `${BILLING_ERROR_PREFIX}${reason}`
}

export function isBillingError(error: string | undefined | null): boolean {
  return typeof error === "string" && error.startsWith(BILLING_ERROR_PREFIX)
}

export function extractBillingReason(error: string): string {
  return error.replace(BILLING_ERROR_PREFIX, "")
}
