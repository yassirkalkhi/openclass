import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/services/auth-service"
import { finalizeLogin } from "@/lib/auth/finalize-login"

const authService = new AuthService()

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

function redirectWithError(error: string, detail?: string) {
  const params = new URLSearchParams({ error })
  if (detail && process.env.NODE_ENV === "development") {
    params.set("detail", detail.slice(0, 200))
  }
  return NextResponse.redirect(`${APP_URL}/login?${params.toString()}`)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error")

  if (errorParam === "access_denied") {
    return redirectWithError("access_denied")
  }

  if (!code || !state) {
    return redirectWithError("google_auth_failed")
  }

  const storedState = request.cookies.get("oauth_state")?.value
  if (!storedState || storedState !== state) {
    return redirectWithError("invalid_state")
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange failed:", await tokenRes.text())
      return redirectWithError("google_auth_failed")
    }

    const tokenData = await tokenRes.json()
    const accessToken: string = tokenData.access_token
    if (!accessToken) {
      return redirectWithError("google_auth_failed")
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoRes.ok) {
      console.error("[Google OAuth] UserInfo fetch failed:", await userInfoRes.text())
      return redirectWithError("google_auth_failed")
    }

    const googleUser = await userInfoRes.json()
    const email: string | undefined = googleUser.email
    if (!email) {
      return redirectWithError("google_auth_failed")
    }

    const profile = await authService.findOrCreateOAuthProfile({
      email,
      fullName: googleUser.name ?? email.split("@")[0],
      avatarUrl: googleUser.picture,
    })

    const { redirectPath, token } = await finalizeLogin(profile.id)

    const response = NextResponse.redirect(`${APP_URL}${redirectPath}`)
    response.cookies.delete("oauth_state")
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Google OAuth] Unexpected error:", error)
    return redirectWithError("server_error", message)
  }
}
