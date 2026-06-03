import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
    const state = uuidv4()

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'online',
        prompt: 'select_account',
    })

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    const response = NextResponse.redirect(googleAuthUrl)

    // Store state in a short-lived HttpOnly cookie for CSRF validation on callback
    response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10, // 10 minutes
    })

    return response
}
