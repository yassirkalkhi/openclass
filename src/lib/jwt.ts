import { SignJWT, jwtVerify } from "jose"

function getSecret() {
  const authSecret = process.env.AUTH_SECRET
  if (!authSecret) {
    throw new Error("AUTH_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(authSecret)
}

export type OrgRole = "owner" | "member"

export type JWTPayload = {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  platformRole?: "admin"
  activeOrganizationId?: string
  orgRole?: OrgRole
}

function sanitizePayload(payload: JWTPayload): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(sanitizePayload(payload))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}
