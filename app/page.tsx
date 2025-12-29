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
    <div className="w-full h-screen flex flex-col bg-[#ECE1E9]/40 p-3 overflow-hidden">
      <div className="flex-1 bg-white/95 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {currentPage === "home" && <HomePage />}
          {currentPage === "graph" && <GraphPage />}
          {currentPage === "settings" && <SettingsPage />}
        </div>
        <div className="px-4 pb-4">
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
