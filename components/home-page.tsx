"use client"

import { useState, useEffect } from "react"
import type { DayEntry } from "@/lib/storage"
import { getData, getTodayKey, setDayEntry, updateUser } from "@/lib/storage"

export default function HomePage() {
  const [taskData, setTaskData] = useState<DayEntry | null>(null)
  const [input, setInput] = useState("")
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const todayKey = getTodayKey()
    const data = getData()
    setUserName(data.user.name)
    const todayTask = data.days[todayKey] ?? null
    setTaskData(todayTask)

    // Show check-in if task exists but not confirmed yet
    if (todayTask && !todayTask.shipped) {
      setShowCheckIn(true)
    }
  }, [])


  const handleSetName = () => {
    if (!nameInput.trim()) return
    const data = getData()
    updateUser({ ...data.user, name: nameInput.trim() })
    setUserName(nameInput.trim())
    setNameInput("")
  }

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
    setShowConfirmation(true)
    setShowCheckIn(false)
  }

  const handleChangeTask = () => {
    setTaskData(null)
    setShowConfirmation(false)
    setShowCheckIn(false)
  }

  const handleShipped = () => {
    if (!taskData) return

    const todayKey = getTodayKey()
    const updated: DayEntry = { ...taskData, shipped: true }
    setDayEntry(todayKey, updated)
    setTaskData(updated)
    setShowCheckIn(false)
  }

  const handleNotYet = () => {
    setShowCheckIn(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!userName) {
        handleSetName()
      } else {
        handleStart()
      }
    }
  }

  if (!mounted) return null

  // Step 1: Ask for username if not set
  if (!userName) {
    return (
      <div className="flex flex-col gap-8 items-center">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2">✨</div>
          <h1 className="text-2xl font-semibold text-purple-900 leading-tight">
            hey there!
          </h1>
          <p className="text-base text-purple-700 leading-relaxed">
            what should we call you?
          </p>
        </div>

        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="your name..."
          className="w-full px-5 py-3.5 text-base bg-white/70 border-2 border-purple-200 rounded-2xl text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
        />

        <button
          onClick={handleSetName}
          className="w-full px-5 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl hover:from-purple-500 hover:to-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-200"
        >
          let's goooo 🚀
        </button>
      </div>
    )
  }

  // Step 2: If already shipped today
  if (taskData?.shipped) {
    return (
      <div className="flex flex-col gap-8 items-center text-center">
        <div className="text-6xl mb-2">🎉</div>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-emerald-900 leading-tight">
            you already shipped today!
          </h1>
          <p className="text-base text-emerald-700 leading-relaxed">
            amazing work, {userName}! come back tomorrow for another tiny win ✨
          </p>
        </div>
        <div className="w-full p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
          <p className="text-sm text-emerald-600 font-medium mb-2">today's achievement:</p>
          <p className="text-base text-emerald-900">{taskData.task}</p>
        </div>
      </div>
    )
  }

  // Step 3: Show check-in if task exists and user is returning
  if (showCheckIn && taskData) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2">👀</div>
          <h1 className="text-2xl font-semibold text-purple-900 leading-tight">
            hey {userName}!
          </h1>
          <p className="text-base text-purple-700 leading-relaxed">
            did you finish your tiny thing?
          </p>
        </div>

        <div className="w-full p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl">
          <p className="text-sm text-purple-600 font-medium mb-2">today's task:</p>
          <p className="text-base text-purple-900">{taskData.task}</p>
        </div>

        <button
          onClick={handleShipped}
          className="w-full px-5 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-200"
        >
          yep, shipped it! ✓
        </button>

        <button
          onClick={handleNotYet}
          className="w-full px-4 py-3 text-sm font-medium text-purple-600 bg-transparent border-2 border-purple-200 rounded-2xl hover:bg-purple-50 transition-all"
        >
          not yet, still working on it
        </button>
      </div>
    )
  }

  // Step 4: Show confirmation after setting task
  if (showConfirmation && taskData) {
    return (
      <div className="flex flex-col gap-8 items-center text-center">
        <div className="text-6xl mb-2">🌟</div>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-purple-900 leading-tight">
            ok bet!
          </h1>
          <p className="text-base text-purple-700 leading-relaxed">
            i'll check in with you later to see how it went~ good luck! 💜
          </p>
        </div>
        <div className="w-full p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl">
          <p className="text-sm text-purple-600 font-medium mb-2">your tiny thing:</p>
          <p className="text-base text-purple-900">{taskData.task}</p>
        </div>
      </div>
    )
  }

  // Step 5: If task already set for today, offer to change it
  if (taskData && !showConfirmation) {
    return (
      <div className="flex flex-col gap-8 text-center">
        <div className="text-5xl mb-2">📝</div>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-purple-900 leading-tight">
            you already have a task!
          </h1>
          <p className="text-base text-purple-700 leading-relaxed">
            wanna change it?
          </p>
        </div>

        <div className="w-full p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl">
          <p className="text-sm text-purple-600 font-medium mb-2">current task:</p>
          <p className="text-base text-purple-900">{taskData.task}</p>
        </div>

        <button
          onClick={handleChangeTask}
          className="w-full px-5 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl hover:from-purple-500 hover:to-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-200"
        >
          yeah, let me change it
        </button>

        <button
          onClick={() => setShowCheckIn(true)}
          className="w-full px-4 py-3 text-sm font-medium text-purple-600 bg-transparent border-2 border-purple-200 rounded-2xl hover:bg-purple-50 transition-all"
        >
          nah, keep it
        </button>
      </div>
    )
  }

  // Step 6: Fresh task entry
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-3">
        <div className="text-5xl mb-2">✨</div>
        <h1 className="text-2xl font-semibold text-purple-900 leading-tight">
          hey {userName}!
        </h1>
        <p className="text-base text-purple-700 leading-relaxed">
          what's the <span className="font-bold text-purple-900">tiniest</span> thing you can ship today?
        </p>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="something super small & doable..."
        className="w-full px-5 py-3.5 text-base bg-white/70 border-2 border-purple-200 rounded-2xl text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
      />

      <button
        onClick={handleStart}
        className="w-full px-5 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl hover:from-emerald-500 hover:to-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-200"
      >
        let's do this! 🔥
      </button>
    </div>
  )
}
