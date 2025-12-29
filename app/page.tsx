"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import HomePage from "@/components/home-page"
import GraphPage from "@/components/graph-page"
import SettingsPage from "@/components/settings-page"

export default function Page() {
  const [currentPage, setCurrentPage] = useState<"home" | "graph" | "settings">("home")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-white/90 shadow-lg overflow-hidden min-h-screen">
      <div className="px-6 py-8 flex-1">
        {currentPage === "home" && <HomePage />}
        {currentPage === "graph" && <GraphPage />}
        {currentPage === "settings" && <SettingsPage />}
      </div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}
