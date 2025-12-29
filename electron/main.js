const { app, BrowserWindow, Menu, ipcMain, Notification, Tray, nativeImage } = require("electron")
const isDev = require("electron-is-dev")
const path = require("path")
const fs = require("fs")

let mainWindow
let tray = null
let notificationTimers = []
let userSettings = null
let lastCheckDate = null

// Path to store settings persistently
const userDataPath = app.getPath('userData')
const settingsPath = path.join(userDataPath, 'user-settings.json')

// Load settings from file
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return null
}

// Save settings to file
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

// Create tray icon
function createTray() {
  // Create a simple tray icon
  const iconPath = path.join(__dirname, '../public/icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath)

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'open',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: 'quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('🌱 one tiny thing')
  tray.setContextMenu(contextMenu)

  // Click on tray icon to show window
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 480,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, "../public/icon.png"),
    backgroundColor: '#00000000',
    title: '🌱 one tiny thing',
  })

  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Prevent window from closing, hide it instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      return false
    }
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Load saved settings and schedule notifications
  const savedSettings = loadSettings()
  if (savedSettings) {
    userSettings = savedSettings
    scheduleNotifications(savedSettings)
  }
}

// Helper functions for notifications
function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, "../public/icon.svg")
    })
    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
      }
    })
    notification.show()
  }
}

function openWindow() {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

function getNextOccurrence(timeStr) {
  const { hours, minutes } = parseTime(timeStr)
  const now = new Date()
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)

  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

function scheduleNotifications(settings) {
  // Clear existing timers
  notificationTimers.forEach(timer => clearTimeout(timer))
  notificationTimers = []

  if (!settings || !settings.dayStart || !settings.dayEnd) return

  // Schedule day start
  const dayStartNext = getNextOccurrence(settings.dayStart)
  const dayStartDelay = dayStartNext - new Date()
  notificationTimers.push(setTimeout(() => {
    openWindow()
    showNotification("good morning :)", "ready to pick your tiny thing for today?")
    scheduleNotifications(settings) // Reschedule for next day
  }, dayStartDelay))

  // Schedule day end
  const dayEndNext = getNextOccurrence(settings.dayEnd)
  const dayEndDelay = dayEndNext - new Date()
  notificationTimers.push(setTimeout(() => {
    openWindow()
    showNotification("checking in!", "how'd your tiny thing go today?")
    scheduleNotifications(settings) // Reschedule for next day
  }, dayEndDelay))

  // Schedule reminders if enabled
  if (settings.notifications && settings.notifications.enableReminders) {
    const { hours: startH, minutes: startM } = parseTime(settings.dayStart)
    const { hours: endH, minutes: endM } = parseTime(settings.dayEnd)

    const startMs = startH * 60 + startM
    const endMs = endH * 60 + endM
    const dayDuration = endMs > startMs ? endMs - startMs : (24 * 60 - startMs) + endMs

    // Schedule 2 reminders during the day
    for (let i = 1; i <= 2; i++) {
      const offsetMinutes = Math.floor(dayDuration * i / 3)
      const reminderTime = new Date()
      reminderTime.setHours(startH, startM + offsetMinutes, 0, 0)

      if (reminderTime > new Date()) {
        const delay = reminderTime - new Date()
        notificationTimers.push(setTimeout(() => {
          showNotification("hey there!", "just wanted to remind you about your tiny thing :)")
        }, delay))
      }
    }
  }
}

function checkMissedDays(data) {
  if (!data || !data.notifications || !data.notifications.enableCheckIns) return

  const today = new Date()
  const todayStr = formatDate(today)

  // Check if we already checked today
  if (lastCheckDate === todayStr) return
  lastCheckDate = todayStr

  // Check if we have days data
  if (data.days) {
    let missedDays = 0

    // Count consecutive missed days
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = formatDate(checkDate)

      if (!data.days[dateStr] || !data.days[dateStr].shipped) {
        missedDays++
      } else {
        break
      }
    }

    if (missedDays >= 2) {
      showNotification(
        "hey, I miss you!",
        `it's been ${missedDays} days since we last chatted. everything okay? :)`
      )
    }
  }
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// IPC handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.hide() // Hide instead of close to keep running in background
  }
})

// IPC handlers for user settings and data
ipcMain.on('update-settings', (event, settings) => {
  userSettings = settings
  saveSettings(settings) // Persist settings to file
  scheduleNotifications(settings)
})

ipcMain.on('update-full-data', (event, data) => {
  // Receive full data including days for missed day checking
  if (data && data.user) {
    userSettings = data
    saveSettings(data)
    scheduleNotifications(data.user)
  }
})

ipcMain.on('missed-days-detected', (event, count) => {
  if (count >= 2) {
    showNotification(
      "hey, I miss you!",
      `it's been ${count} days since we last chatted. everything okay? :)`
    )
  }
})

app.on("ready", () => {
  Menu.setApplicationMenu(null)
  createTray() // Create system tray icon
  createWindow()

  // Also schedule a daily check for missed days at midnight
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const timeUntilMidnight = tomorrow - now

  setTimeout(() => {
    if (userSettings && userSettings.notifications && userSettings.notifications.enableCheckIns) {
      checkMissedDays(userSettings)
    }
    // Reschedule for next midnight
    setInterval(() => {
      if (userSettings && userSettings.notifications && userSettings.notifications.enableCheckIns) {
        checkMissedDays(userSettings)
      }
    }, 24 * 60 * 60 * 1000) // Every 24 hours
  }, timeUntilMidnight)
})

app.on("window-all-closed", () => {
  // Don't quit - keep running in background with tray
  // Only quit on macOS if explicitly requested
  if (process.platform === "darwin" && app.isQuitting) {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
})

// Quit all windows when app quits
app.on("before-quit", () => {
  app.isQuitting = true
})
