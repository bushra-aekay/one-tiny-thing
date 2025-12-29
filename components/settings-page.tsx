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
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-[#8f867d] mb-2 uppercase tracking-widest">name</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="your name"
          className="w-full px-4 py-2 text-sm bg-[#f6f4f2] rounded-2xl text-[#3d3d3d] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#b8b1a6] mb-2 uppercase tracking-widest">
          day start time
        </label>
        <input
          type="time"
          value={user.dayStart}
          onChange={(e) => handleChange("dayStart", e.target.value)}
          className="w-full px-4 py-2 text-sm bg-[#f6f4f2] rounded-2xl text-[#3d3d3d] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#b8b1a6] mb-2 uppercase tracking-widest">day end time</label>
        <input
          type="time"
          value={user.dayEnd}
          onChange={(e) => handleChange("dayEnd", e.target.value)}
          className="w-full px-4 py-2 text-sm border border-[#e8ddf5] rounded-2xl bg-[#faf9f7] text-[#3d3d3d] focus:outline-none focus:ring-2 focus:ring-[#d9cfc4] focus:bg-white transition-all"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleResetAll}
          className="w-full px-4 py-2 text-xs font-medium text-[#7a403f] bg-[#fff6f6] rounded-2xl hover:bg-[#fff0f0] transition-colors duration-150"
        >
          reset all data
        </button>

        <p className="text-xs text-[#b8b1a6] mt-2 text-center">settings saved automatically</p>
      </div>
    </div>
  )
}
