"use client"

import { useState, useEffect } from "react"
import { getData, formatDateLocal } from "@/lib/storage"

type DayState = "shipped" | "not-shipped" | "none"
type ViewMode = "weekly" | "monthly" | "yearly"

export default function GraphPage() {
  const [days, setDays] = useState<{ date: string; state: DayState; streak: number }[]>([])
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("weekly")

  useEffect(() => {
    setMounted(true)
    loadData(viewMode)
  }, [viewMode])

  const loadData = (mode: ViewMode) => {
    const data = getData()
    const daysCount = mode === "weekly" ? 7 : mode === "monthly" ? 30 : 365
    const allDays: { date: string; state: DayState; streak: number }[] = []
    const today = new Date()
    let currentStreak = 0

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDateLocal(date)

      let state: DayState = "none"
      if (data.days[dateStr]) {
        state = data.days[dateStr].shipped ? "shipped" : "not-shipped"
      }

      // Calculate streak: shipped = +1, unshipped or none = back to 0
      if (state === "shipped") {
        currentStreak += 1
      } else {
        currentStreak = 0
      }

      allDays.push({ date: dateStr, state, streak: currentStreak })
    }

    setDays(allDays)
  }

  if (!mounted) return null

  const maxStreak = Math.max(...days.map(d => d.streak), 1)
  const chartHeight = 160
  const chartWidth = days.length > 30 ? 350 : days.length > 7 ? 320 : 280

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-medium text-[#2E6467]">look how far you've come</h2>
        <p className="text-xs text-[#5B7785]">every little thing counts</p>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-1.5 bg-[#ECE1E9]/40 p-1 rounded-xl border border-[#5B7785]/10">
        <button
          onClick={() => setViewMode("weekly")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === "weekly"
              ? "bg-[#5B7785] text-white"
              : "text-[#5B7785] hover:bg-[#ECE1E9]/50"
          }`}
        >
          week
        </button>
        <button
          onClick={() => setViewMode("monthly")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === "monthly"
              ? "bg-[#5B7785] text-white"
              : "text-[#5B7785] hover:bg-[#ECE1E9]/50"
          }`}
        >
          month
        </button>
        <button
          onClick={() => setViewMode("yearly")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === "yearly"
              ? "bg-[#5B7785] text-white"
              : "text-[#5B7785] hover:bg-[#ECE1E9]/50"
          }`}
        >
          year
        </button>
      </div>

      {/* Line graph */}
      <div className="p-5 bg-[#ECE1E9]/30 rounded-xl border border-[#5B7785]/10 overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y = chartHeight - (i * chartHeight / 3)
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#5B7785"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                opacity="0.2"
              />
            )
          })}

          {/* Line path */}
          <polyline
            points={days.map((day, i) => {
              const x = (i / (days.length - 1)) * (chartWidth - 20) + 10
              const y = chartHeight - 20 - (day.streak / maxStreak) * (chartHeight - 40)
              return `${x},${y}`
            }).join(" ")}
            fill="none"
            stroke="#5B7785"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* Data points */}
          {days.map((day, i) => {
            const x = (i / (days.length - 1)) * (chartWidth - 20) + 10
            const y = chartHeight - 20 - (day.streak / maxStreak) * (chartHeight - 40)

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={day.state === "shipped" ? 5 : day.state === "not-shipped" ? 3 : 2}
                  fill={
                    day.state === "shipped"
                      ? "#C29762"
                      : day.state === "not-shipped"
                      ? "#5B7785"
                      : "#ECE1E9"
                  }
                  stroke="white"
                  strokeWidth="1.5"
                  opacity={day.state === "none" ? 0.3 : 1}
                >
                  <title>{`${day.date}: ${day.state === "shipped" ? "shipped" : day.state === "not-shipped" ? "skipped" : "no entry"} (streak: ${day.streak})`}</title>
                </circle>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-[#5B7785]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C29762]"></div>
          <span>shipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5B7785]"></div>
          <span>skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ECE1E9] border border-[#5B7785]/20"></div>
          <span>no entry</span>
        </div>
      </div>
    </div>
  )
}
