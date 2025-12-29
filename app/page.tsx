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
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f1e8]">
      <div className="w-80 flex flex-col bg-[#fbf8f5] rounded-3xl shadow-sm ring-1 ring-[#f0eae2] overflow-hidden">
        <div className="px-6 py-10 flex-1">
          {currentPage === "home" && <HomePage />}
          {currentPage === "graph" && <GraphPage />}
          {currentPage === "settings" && <SettingsPage />}
        </div>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}
