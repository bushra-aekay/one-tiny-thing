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
      <div className="text-center space-y-1">
        <h2 className="text-lg font-medium text-[#2E6467]">settings</h2>
        <p className="text-xs text-[#5B7785]">make this yours</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#5B7785] mb-1.5">what should I call you?</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="whatever feels right..."
            className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] placeholder-[#5B7785]/40 focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5B7785] mb-1.5">
            when does your day begin?
          </label>
          <input
            type="time"
            value={user.dayStart}
            onChange={(e) => handleChange("dayStart", e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5B7785] mb-1.5">and when does it wind down?</label>
          <input
            type="time"
            value={user.dayEnd}
            onChange={(e) => handleChange("dayEnd", e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleResetAll}
          className="w-full px-4 py-2.5 text-xs font-medium text-[#5B7785] bg-[#5B7785]/5 border border-[#5B7785]/20 rounded-xl hover:bg-[#5B7785]/10 active:scale-[0.98] transition-all"
        >
          start fresh
        </button>

        <p className="text-xs text-[#5B7785]/60 text-center">everything saves as you go</p>
      </div>
    </div>
  )
}
