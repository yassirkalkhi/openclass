 

export const BILLING_PLANS = {
  BASE: {
    name: "Base Plan",
    priceMonthly: 200, // 200 DH
    currency: "MAD",
    features: {
      baseAccess: true,
      videoChat: false,
      aiCapabilities: false,
    },
  },
  VIDEO: {
    name: "Video Add-on",
    priceMonthly: 150, // 150 DH
    currency: "MAD",
    features: {
      baseAccess: false,
      videoChat: true,
      aiCapabilities: false,
    },
  },
  AI: {
    name: "AI Add-on",
    priceMonthly: 150, // 150 DH
    currency: "MAD",
    features: {
      baseAccess: false,
      videoChat: false,
      aiCapabilities: true,
    },
  },
} as const

export function calculateMonthlyTotal(
  videoEnabled: boolean,
  aiEnabled: boolean
): number {
  let total = BILLING_PLANS.BASE.priceMonthly
  if (videoEnabled) total += BILLING_PLANS.VIDEO.priceMonthly
  if (aiEnabled) total += BILLING_PLANS.AI.priceMonthly
  return total
}
