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
  const [dayStartInput, setDayStartInput] = useState("09:00")
  const [dayEndInput, setDayEndInput] = useState("17:00")
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
    updateUser({
      ...data.user,
      name: nameInput.trim(),
      dayStart: dayStartInput,
      dayEnd: dayEndInput
    })
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
      <div className="flex flex-col gap-3">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-medium text-[#2E6467]">
            hi there! so glad you're here :)
          </h1>
          <p className="text-xs text-[#5B7785]">
            let's get to know each other a bit
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5B7785] mb-1">what should I call you?</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="whatever feels right..."
            className="w-full px-3 py-2 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-lg text-[#2E6467] placeholder-[#5B7785]/40 focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#5B7785] mb-1">when does your day begin?</label>
            <input
              type="time"
              value={dayStartInput}
              onChange={(e) => setDayStartInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-lg text-[#2E6467] focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all time-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5B7785] mb-1">and when does it wind down?</label>
            <input
              type="time"
              value={dayEndInput}
              onChange={(e) => setDayEndInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-lg text-[#2E6467] focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all time-input"
            />
          </div>
        </div>

        <button
          onClick={handleSetName}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5B7785] rounded-xl hover:bg-[#2E6467] active:scale-[0.98] transition-all mt-2"
        >
          let's start
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
            you did it! you really did it {"<3"}
          </h1>
          <p className="text-sm text-[#5B7785]">
            I'm so proud of you, {userName}. see you tomorrow :)
          </p>
        </div>
        <div className="w-full p-4 bg-[#C29762]/10 border border-[#C29762]/20 rounded-xl">
          <p className="text-xs text-[#C29762]/70 font-medium mb-1">what you accomplished:</p>
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
            welcome back, {userName}!
          </h1>
          <p className="text-sm text-[#5B7785]">
            how'd it go with your tiny thing?
          </p>
        </div>

        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">what you wanted to do:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleShipped}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#C29762] rounded-xl hover:bg-[#C29762]/90 active:scale-[0.98] transition-all"
          >
            yes, I did it!
          </button>
          <button
            onClick={handleNotYet}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#5B7785] bg-[#ECE1E9]/30 rounded-xl hover:bg-[#ECE1E9]/50 transition-all"
          >
            still working on it
          </button>
        </div>
      </div>
    )
  }

  // Step 4: Show confirmation after setting task
  if (showConfirmation && taskData) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-medium text-[#2E6467]">
            okay, I'm rooting for you!
          </h1>
          <p className="text-sm text-[#5B7785]">
            I'll be here when you're done {"<3"}
          </p>
        </div>
        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">what you're working on:</p>
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
            oh, you picked something earlier
          </h1>
          <p className="text-sm text-[#5B7785]">
            want to choose something different?
          </p>
        </div>

        <div className="w-full p-4 bg-[#ECE1E9]/50 border border-[#5B7785]/20 rounded-xl">
          <p className="text-xs text-[#5B7785]/70 font-medium mb-1">what you chose:</p>
          <p className="text-sm text-[#2E6467]">{taskData.task}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleChangeTask}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5B7785] rounded-xl hover:bg-[#2E6467] active:scale-[0.98] transition-all"
          >
            pick something else
          </button>
          <button
            onClick={() => setShowCheckIn(true)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#5B7785] bg-[#ECE1E9]/30 rounded-xl hover:bg-[#ECE1E9]/50 transition-all"
          >
            this is perfect
          </button>
        </div>
      </div>
    )
  }

  // Step 6: Fresh task entry
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h1 className="text-lg font-medium text-[#2E6467]">
          hi {userName}! ready for today?
        </h1>
        <p className="text-sm text-[#5B7785]">
          what's one <span className="font-semibold text-[#2E6467]">tiny</span> thing you could finish today?
        </p>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="think really small..."
        className="w-full px-4 py-2.5 text-sm bg-[#ECE1E9]/30 border border-[#5B7785]/20 rounded-xl text-[#2E6467] placeholder-[#5B7785]/40 focus:outline-none focus:border-[#5B7785]/40 focus:ring-2 focus:ring-[#5B7785]/10 transition-all"
      />

      <button
        onClick={handleStart}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#C29762] rounded-xl hover:bg-[#C29762]/90 active:scale-[0.98] transition-all"
      >
        I can do this
      </button>
    </div>
  )
}
