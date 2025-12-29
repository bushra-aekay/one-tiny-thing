"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import HomePage from "@/components/home-page"
import GraphPage from "@/components/graph-page"
import SettingsPage from "@/components/settings-page"
import WindowControls from "@/components/window-controls"
import { useElectronSync } from "@/hooks/use-electron-sync"

export default function Page() {
  const [currentPage, setCurrentPage] = useState<"home" | "graph" | "settings">("home")
  const [mounted, setMounted] = useState(false)

  // Sync with Electron for notifications
  useElectronSync()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#ECE1E9]/40 p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-xl overflow-hidden flex flex-col relative" style={{ height: '520px' }}>
        <WindowControls />
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-4 scrollbar-hide">
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
