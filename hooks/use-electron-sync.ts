"use client"

import { useEffect } from "react"
import { getData, getTodayKey } from "@/lib/storage"

export function useElectronSync() {
  useEffect(() => {
    // Check if running in Electron
    if (typeof window === "undefined" || !(window as any).electronAPI) return

    const electronAPI = (window as any).electronAPI

    // Send initial full data (settings + days)
    const data = getData()
    electronAPI.updateFullData(data)

    // Listen for data changes and send to Electron
    const checkInterval = setInterval(() => {
      const currentData = getData()
      electronAPI.updateFullData(currentData)
    }, 10000) // Check every 10 seconds

    // Listen for missed days check from Electron
    electronAPI.onCheckMissedDays(() => {
      const data = getData()
      const today = new Date()
      let missedDays = 0

      // Count consecutive missed days
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = formatDate(checkDate)

        if (!data.days[dateStr] || !data.days[dateStr].shipped) {
          missedDays++
        } else {
          break
        }
      }

      if (missedDays >= 2) {
        electronAPI.missedDaysDetected(missedDays)
      }
    })

    return () => {
      clearInterval(checkInterval)
    }
  }, [])
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
