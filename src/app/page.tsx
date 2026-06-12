import type { Metadata } from "next"
import { LandingPage } from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "OpenClass — The Modern Learning Workspace",
  description:
    "Bring your classes, channels, assignments, and AI assistant together in one vibrant collaborative space.",
}

export default function HomePage() {
  return <LandingPage />
}
