"use client"

import { createContext, useContext } from "react"
import type { Class, ClassMember, ClassSettings, Permission } from "@/lib/types/database"

type ClassContextValue = {
  classData: Class
  membership: ClassMember
  permissions: Permission[]
  settings: ClassSettings | null
}

const ClassContext = createContext<ClassContextValue | null>(null)

export function ClassProvider({
  value,
  children,
}: {
  value: ClassContextValue
  children: React.ReactNode
}) {
  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
}

export function useClass() {
  const ctx = useContext(ClassContext)
  if (!ctx) throw new Error("useClass must be used within ClassProvider")
  return ctx
}
