"use client"

import { createContext, useContext, useState } from "react"

export type MainView = "chat" | "resources" | "assignments"
export type RightPanelTab = "members" | "notifications" | "invitations"

type WorkspaceUIContextValue = {
  rightPanelTab: RightPanelTab
  setRightPanelTab: (tab: RightPanelTab) => void
  rightPanelOpen: boolean
  setRightPanelOpen: (open: boolean) => void
}

const WorkspaceUIContext = createContext<WorkspaceUIContextValue | null>(null)

export function WorkspaceUIProvider({ children }: { children: React.ReactNode }) {
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("members")
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  return (
    <WorkspaceUIContext.Provider
      value={{ rightPanelTab, setRightPanelTab, rightPanelOpen, setRightPanelOpen }}
    >
      {children}
    </WorkspaceUIContext.Provider>
  )
}

export function useWorkspaceUI() {
  const ctx = useContext(WorkspaceUIContext)
  if (!ctx) throw new Error("useWorkspaceUI must be used within WorkspaceUIProvider")
  return ctx
}
