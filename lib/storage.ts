export type DayEntry = { task: string; startedAt: number; shipped: boolean }
export type StorageData = {
  user: { name: string; dayStart: string; dayEnd: string }
  days: Record<string, DayEntry>
}

const STORAGE_KEY = "one-thing-data"

const defaultData = (): StorageData => ({
  user: { name: "", dayStart: "09:00", dayEnd: "17:00" },
  days: {},
})

function safeParse(json: string | null): StorageData {
  if (!json) return defaultData()
  try {
    const parsed = JSON.parse(json)
    // Basic validation
    if (!parsed || typeof parsed !== "object") return defaultData()
    if (!parsed.user || !parsed.days) return defaultData()
    return parsed as StorageData
  } catch (e) {
    // Corrupt storage: return defaults
    return defaultData()
  }
}

export function getData(): StorageData {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
  return safeParse(raw)
}

export function setData(data: StorageData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore write errors for now
  }
}

export function formatDateLocal(date = new Date()): string {
  // Format YYYY-MM-DD using local date components to avoid UTC boundary issues
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getTodayKey(date?: Date) {
  return formatDateLocal(date ?? new Date())
}

export function getDayEntry(key: string): DayEntry | undefined {
  const data = getData()
  return data.days[key]
}

export function setDayEntry(key: string, entry: DayEntry) {
  const data = getData()
  data.days[key] = entry
  setData(data)
}

export function deleteDayEntry(key: string) {
  const data = getData()
  delete data.days[key]
  setData(data)
}

export function updateUser(user: StorageData['user']) {
  const data = getData()
  data.user = user
  setData(data)
}

export function resetAllData() {
  const data = defaultData()
  setData(data)
}
