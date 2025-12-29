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
      <div className="text-center space-y-1">
        <h2 className="text-xl font-normal text-gray-900">your progress</h2>
        <p className="text-sm text-gray-500">last 42 days</p>
      </div>

      <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
        <div className="grid grid-cols-7 gap-2.5">
          {days.map((state, index) => {
            const today = new Date()
            const offset = 41 - index
            const date = new Date(today)
            date.setDate(date.getDate() - offset)
            const dateStr = formatDateLocal(date)

            const classes =
              state === "shipped"
                ? "bg-green-400 ring-2 ring-green-200"
                : state === "not-shipped"
                ? "bg-red-300 ring-2 ring-red-100"
                : "bg-gray-200"

            const title = state === "shipped" ? "shipped" : state === "not-shipped" ? "skipped" : "no entry"

            return (
              <div
                key={index}
                title={`${dateStr} — ${title}`}
                aria-label={`${dateStr} ${title}`}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${classes}`}
              />
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
            <span>shipped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-300"></div>
            <span>skipped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
            <span>no entry</span>
          </div>
        </div>
      </div>
    </div>
  )
}
