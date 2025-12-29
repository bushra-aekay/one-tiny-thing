"use client"

import { useState, useEffect } from "react"
import { getData, formatDateLocal } from "@/lib/storage"

type DayState = "shipped" | "not-shipped" | "none"

export default function GraphPage() {
  const [days, setDays] = useState<DayState[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const data = getData()

    const allDays: DayState[] = []
    const today = new Date()

    for (let i = 41; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDateLocal(date)

      if (data.days[dateStr]) {
        allDays.push(data.days[dateStr].shipped ? "shipped" : "not-shipped")
      } else {
        allDays.push("none")
      }
    }

    setDays(allDays)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-2">📊</div>
        <h2 className="text-2xl font-semibold text-purple-900">your streak</h2>
        <p className="text-sm text-purple-600">last 42 days of tiny wins</p>
      </div>

      <div className="p-6 bg-white/70 rounded-2xl border-2 border-purple-200 shadow-lg shadow-purple-100">
        <div className="grid grid-cols-7 gap-2.5">
          {days.map((state, index) => {
            const today = new Date()
            const offset = 41 - index
            const date = new Date(today)
            date.setDate(date.getDate() - offset)
            const dateStr = formatDateLocal(date)

            const classes =
              state === "shipped"
                ? "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md shadow-emerald-200"
                : state === "not-shipped"
                ? "bg-purple-200"
                : "bg-purple-50 border-2 border-purple-100"

            const title = state === "shipped" ? "shipped ✓" : state === "not-shipped" ? "skipped" : "no entry"

            return (
              <div
                key={index}
                title={`${dateStr} — ${title}`}
                aria-label={`${dateStr} ${title}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${classes}`}
              />
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-5 mt-6 text-xs font-medium text-purple-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500"></div>
            <span>shipped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-purple-200"></div>
            <span>skipped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-purple-50 border-2 border-purple-100"></div>
            <span>no entry</span>
          </div>
        </div>
      </div>
    </div>
  )
}
