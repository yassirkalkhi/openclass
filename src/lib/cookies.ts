// lib/cookies.ts
import { cookies } from 'next/headers'

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export async function getAuthCookie() {
    const cookieStore = await cookies()
    return cookieStore.get('token')?.value
}

export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
}