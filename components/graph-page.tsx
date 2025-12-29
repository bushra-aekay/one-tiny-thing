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
  const chartHeight = 200
  const chartWidth = days.length > 30 ? 350 : days.length > 7 ? 320 : 280

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-2xl font-semibold text-purple-900">your streak</h2>
        <p className="text-sm text-purple-600">tracking your tiny wins</p>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2 bg-white/70 p-1.5 rounded-2xl border-2 border-purple-200">
        <button
          onClick={() => setViewMode("weekly")}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            viewMode === "weekly"
              ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md"
              : "text-purple-600 hover:bg-purple-50"
          }`}
        >
          week
        </button>
        <button
          onClick={() => setViewMode("monthly")}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            viewMode === "monthly"
              ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md"
              : "text-purple-600 hover:bg-purple-50"
          }`}
        >
          month
        </button>
        <button
          onClick={() => setViewMode("yearly")}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            viewMode === "yearly"
              ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md"
              : "text-purple-600 hover:bg-purple-50"
          }`}
        >
          year
        </button>
      </div>

      {/* Line graph */}
      <div className="p-6 bg-white/70 rounded-2xl border-2 border-purple-200 shadow-lg shadow-purple-100 overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = chartHeight - (i * chartHeight / 4)
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#E9D5FF"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Line path */}
          <polyline
            points={days.map((day, i) => {
              const x = (i / (days.length - 1)) * (chartWidth - 20) + 10
              const y = chartHeight - 30 - (day.streak / maxStreak) * (chartHeight - 60)
              return `${x},${y}`
            }).join(" ")}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {days.map((day, i) => {
            const x = (i / (days.length - 1)) * (chartWidth - 20) + 10
            const y = chartHeight - 30 - (day.streak / maxStreak) * (chartHeight - 60)

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={day.state === "shipped" ? 6 : day.state === "not-shipped" ? 4 : 3}
                  fill={
                    day.state === "shipped"
                      ? "#10B981"
                      : day.state === "not-shipped"
                      ? "#C4B5FD"
                      : "#E9D5FF"
                  }
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-md"
                >
                  <title>{`${day.date}: ${day.state === "shipped" ? "shipped ✓" : day.state === "not-shipped" ? "skipped" : "no entry"} (streak: ${day.streak})`}</title>
                </circle>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 text-xs font-medium text-purple-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
          <span>shipped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-300 ring-2 ring-white"></div>
          <span>skipped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-100 ring-2 ring-white"></div>
          <span>no entry</span>
        </div>
      </div>
    </div>
  )
}
