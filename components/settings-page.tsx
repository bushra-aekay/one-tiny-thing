"use client"

import { useState, useEffect } from "react"
import type { StorageData } from "@/lib/storage"
import { getData, updateUser, resetAllData } from "@/lib/storage"

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "",
    dayStart: "09:00",
    dayEnd: "17:00",
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const data = getData()
    setUser(data.user)
  }, [])

  const handleChange = (key: keyof typeof user, value: string) => {
    const updated = { ...user, [key]: value }
    setUser(updated)
    updateUser(updated)
  }

  const handleResetAll = () => {
    resetAllData()
    const defaults: StorageData['user'] = { name: "", dayStart: "09:00", dayEnd: "17:00" }
    setUser(defaults)
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-2">⚙️</div>
        <h2 className="text-2xl font-semibold text-purple-900">settings</h2>
        <p className="text-sm text-purple-600">make it yours~</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-purple-700 mb-2">your name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="your name"
            className="w-full px-5 py-3 text-base bg-white/70 border-2 border-purple-200 rounded-2xl text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-700 mb-2">
            day start time
          </label>
          <input
            type="time"
            value={user.dayStart}
            onChange={(e) => handleChange("dayStart", e.target.value)}
            className="w-full px-5 py-3 text-base bg-white/70 border-2 border-purple-200 rounded-2xl text-purple-900 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-700 mb-2">day end time</label>
          <input
            type="time"
            value={user.dayEnd}
            onChange={(e) => handleChange("dayEnd", e.target.value)}
            className="w-full px-5 py-3 text-base bg-white/70 border-2 border-purple-200 rounded-2xl text-purple-900 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={handleResetAll}
          className="w-full px-5 py-3 text-sm font-semibold text-purple-700 bg-purple-50 border-2 border-purple-200 rounded-2xl hover:bg-purple-100 active:scale-95 transition-all"
        >
          reset all data 🗑️
        </button>

        <p className="text-xs text-purple-500 text-center font-medium">everything saves automatically ✨</p>
      </div>
    </div>
  )
}
