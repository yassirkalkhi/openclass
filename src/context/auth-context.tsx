"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getSession, type SessionUser } from "@/lib/session"
import type { OrgRole } from "@/lib/jwt"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  user: SessionUser | null
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  isPlatformAdmin: boolean
  isOrgOwner: boolean
  isOrgMember: boolean
  orgRole: OrgRole | undefined
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  const fetchSession = useCallback(async () => {
    setStatus("loading")
    try {
      const session = await getSession()
      if (session) {
        setUser(session)
        setStatus("authenticated")
      } else {
        setUser(null)
        setStatus("unauthenticated")
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to fetch session:", error)
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const orgRole = user?.orgRole

  const value: AuthContextValue = {
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isPlatformAdmin: user?.platformRole === "admin",
    isOrgOwner: orgRole === "owner",
    isOrgMember: orgRole === "owner" || orgRole === "member",
    orgRole,
    refresh: fetchSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }
  return ctx
}
