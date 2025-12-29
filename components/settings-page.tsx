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
      <div className="text-center space-y-1">
        <h2 className="text-xl font-normal text-gray-900">settings</h2>
        <p className="text-sm text-gray-500">customize your experience</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="your name"
            className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            day start time
          </label>
          <input
            type="time"
            value={user.dayStart}
            onChange={(e) => handleChange("dayStart", e.target.value)}
            className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">day end time</label>
          <input
            type="time"
            value={user.dayEnd}
            onChange={(e) => handleChange("dayEnd", e.target.value)}
            className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={handleResetAll}
          className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-150"
        >
          reset all data
        </button>

        <p className="text-xs text-gray-500 text-center">changes save automatically</p>
      </div>
    </div>
  )
}
