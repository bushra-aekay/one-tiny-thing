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
      <div className="flex flex-col gap-6">
        {getData().user.name && (
          <p className="text-xs text-[#8f867d] mb-3 text-center">hi, {getData().user.name}</p>
        )}

        <h1 className="text-center text-base font-light tracking-wider text-[#3d3d3d] leading-relaxed">
          what's one thing you want to ship today?
        </h1>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="type here..."
          className="w-full px-4 py-3 text-sm bg-[#f6f4f2] rounded-2xl text-[#3d3d3d] placeholder-[#b8b1a6] focus:outline-none transition-colors"
        />

        <button
          onClick={handleStart}
          className="w-full px-4 py-3 text-sm font-medium text-[#3d3d3d] bg-[#efe9df] rounded-2xl hover:bg-[#eadfcf] transition-colors duration-150"
        >
          start
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-[#8f867d] mb-2 uppercase tracking-widest">today</p>
        <p className="text-sm text-[#3d3d3d] font-medium wrap-break-word">{taskData.task}</p>
      </div>

      {!taskData.shipped && (
        <button
          onClick={handleShipped}
          className="w-full px-4 py-3 text-sm font-medium text-[#2f6b45] bg-[#eaf6ef] rounded-2xl hover:bg-[#e2efe5] transition-colors duration-150"
        >
          mark as shipped
        </button>
      )}

      {taskData.shipped && (
        <div className="text-center py-3 bg-[#f5f3ef] rounded-2xl">
          <p className="text-sm text-[#6b665f] font-medium">nice. shipped.</p>
        </div>
      )}

      <button
        onClick={handleNotToday}
        className="w-full px-4 py-2 text-xs font-medium text-[#6b665f] bg-transparent rounded-2xl ring-1 ring-transparent hover:ring-[#e8e3db] transition-colors duration-150"
      >
        it's okay if not
      </button>
    </div>
  )
}
