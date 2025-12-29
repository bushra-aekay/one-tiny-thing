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
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-light text-[#3d3d3d] text-center">last 42 days</h2>

      <div className="p-4 bg-[#fbf8f5] rounded-2xl shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {days.map((state, index) => {
            const today = new Date()
            const offset = 41 - index
            const date = new Date(today)
            date.setDate(date.getDate() - offset)
            const dateStr = formatDateLocal(date)

            const classes =
              state === "shipped"
                ? "bg-[#d9cfc4]"
                : state === "not-shipped"
                ? "bg-[#f7dcd9] ring-1 ring-[#efe6e4]"
                : "bg-[#f3f2ef]"

            const title = state === "shipped" ? "shipped" : state === "not-shipped" ? "not shipped" : "no entry"

            return (
              <div
                key={index}
                title={`${dateStr} — ${title}`}
                aria-label={`${dateStr} ${title}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${classes}`}
              />
            )
          })}
        </div>

        <p className="text-xs text-[#8f867d] text-center mt-2">legend: shipped • not shipped • no entry</p>
      </div>
    </div>
  )
}
