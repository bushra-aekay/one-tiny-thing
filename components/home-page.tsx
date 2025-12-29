"use client"

import { useState, useEffect } from "react"
import type { DayEntry } from "@/lib/storage"
import { getData, getTodayKey, setDayEntry } from "@/lib/storage"

export default function HomePage() {
  const [taskData, setTaskData] = useState<DayEntry | null>(null)
  const [input, setInput] = useState("")  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const todayKey = getTodayKey()
    const data = getData()
    setTaskData(data.days[todayKey] ?? null)
  }, [])


  const handleStart = () => {
    if (!input.trim()) return

    const todayKey = getTodayKey()
    const newTask: DayEntry = {
      task: input.trim(),
      startedAt: Date.now(),
      shipped: false,
    }

    setDayEntry(todayKey, newTask)
    setTaskData(newTask)
    setInput("")
  }

  const handleShipped = () => {
    if (!taskData) return

    const todayKey = getTodayKey()
    const updated: DayEntry = { ...taskData, shipped: true }
    setDayEntry(todayKey, updated)
    setTaskData(updated)
  }

  const handleNotToday = () => {
    if (!taskData) return

    const todayKey = getTodayKey()
    const updated: DayEntry = { ...taskData, shipped: false }
    setDayEntry(todayKey, updated)
    setTaskData(updated)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart()
    }
  }

  if (!mounted) return null

  if (!taskData) {
    return (
      <div className="flex flex-col gap-8">
        {getData().user.name && (
          <p className="text-sm text-gray-500 text-center font-light">hey {getData().user.name} 👋</p>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-normal text-gray-900 leading-tight">
            one tiny thing
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            what's the <span className="font-medium text-gray-700">smallest</span> thing you can ship today?
          </p>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="something small & achievable..."
          className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />

        <button
          onClick={handleStart}
          className="w-full px-4 py-3 text-base font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-150 shadow-sm"
        >
          let's do this
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">today's tiny thing</p>
        <p className="text-lg text-gray-900 font-normal leading-relaxed break-words">{taskData.task}</p>
      </div>

      {!taskData.shipped && (
        <button
          onClick={handleShipped}
          className="w-full px-4 py-3 text-base font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-150 shadow-sm"
        >
          ✓ mark as shipped
        </button>
      )}

      {taskData.shipped && (
        <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-base text-green-700 font-medium">🎉 shipped!</p>
          <p className="text-sm text-green-600 mt-1">great work today</p>
        </div>
      )}

      <button
        onClick={handleNotToday}
        className="w-full px-4 py-2 text-sm font-normal text-gray-500 bg-transparent border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors duration-150"
      >
        skip today
      </button>
    </div>
  )
}
