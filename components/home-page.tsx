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
      <div className="flex flex-col gap-4 items-center">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-medium text-[#2E6467]">
            hey there :)
          </h1>
          <p className="text-sm text-[#5B7785]">
            what should we call you?
          </p>
        </div>

        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="your name..."
          className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] placeholder-[#5B7785]/40 focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
        />

        <button
          onClick={handleSetName}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5B7785] rounded-xl hover:bg-[#2E6467] active:scale-[0.98] transition-all"
        >
          continue
        </button>
      </div>
    )
  }

  // Step 2: If already shipped today
  if (taskData?.shipped) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-medium text-[#C29762]">
            you already shipped today {"<3"}
          </h1>
          <p className="text-sm text-[#5B7785]">
            nice work, {userName}! come back tomorrow~
          </p>
        </div>
        <div className="w-full p-4 bg-[#C29762]/10 border border-[#C29762]/20 rounded-xl">
          <p className="text-xs text-[#C29762]/70 font-medium mb-1">today's win:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>
      </div>
    )
  }

  // Step 3: Show check-in if task exists and user is returning
  if (showCheckIn && taskData) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-medium text-[#2E6467]">
            hey {userName}!
          </h1>
          <p className="text-sm text-[#5B7785]">
            did you finish your tiny thing?
          </p>
        </div>

        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">today's task:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>

        <button
          onClick={handleShipped}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#C29762] rounded-xl hover:bg-[#C29762]/90 active:scale-[0.98] transition-all"
        >
          yep, shipped it :)
        </button>

        <button
          onClick={handleNotYet}
          className="w-full px-4 py-2 text-xs font-medium text-[#5B7785] bg-transparent border border-[#5B7785]/20 rounded-xl hover:bg-[#ECE1E9]/30 transition-all"
        >
          not yet, still working on it
        </button>
      </div>
    )
  }

  // Step 4: Show confirmation after setting task
  if (showConfirmation && taskData) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-medium text-[#2E6467]">
            got it!
          </h1>
          <p className="text-sm text-[#5B7785]">
            i'll check in later to see how it went {"<3"}
          </p>
        </div>
        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">your tiny thing:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>
      </div>
    )
  }

  // Step 5: If task already set for today, offer to change it
  if (taskData && !showConfirmation) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-medium text-[#2E6467]">
            you already have a task
          </h1>
          <p className="text-sm text-[#5B7785]">
            wanna change it?
          </p>
        </div>

        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">current task:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>

        <button
          onClick={handleChangeTask}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5B7785] rounded-xl hover:bg-[#2E6467] active:scale-[0.98] transition-all"
        >
          yeah, change it
        </button>

        <button
          onClick={() => setShowCheckIn(true)}
          className="w-full px-4 py-2 text-xs font-medium text-[#5B7785] bg-transparent border border-[#5B7785]/20 rounded-xl hover:bg-[#ECE1E9]/30 transition-all"
        >
          nah, keep it
        </button>
      </div>
    )
  }

  // Step 6: Fresh task entry
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h1 className="text-lg font-medium text-[#2E6467]">
          hey {userName} :)
        </h1>
        <p className="text-sm text-[#5B7785]">
          what's the <span className="font-semibold text-[#2E6467]">tiniest</span> thing you can ship today?
        </p>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="something super small..."
        className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] placeholder-[#5B7785]/40 focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
      />

      <button
        onClick={handleStart}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#C29762] rounded-xl hover:bg-[#C29762]/90 active:scale-[0.98] transition-all"
      >
        let's do this
      </button>
    </div>
  )
}
