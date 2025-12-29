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
    <div className="w-full h-screen flex items-center justify-center overflow-hidden bg-transparent">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col relative" style={{ height: '420px' }}>
        <WindowControls />
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="min-h-full flex items-center py-10">
            {currentPage === "home" && <HomePage />}
            {currentPage === "graph" && <GraphPage />}
            {currentPage === "settings" && <SettingsPage />}
          </div>
        </div>
        <div className="px-4 pb-4 flex-shrink-0">
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
