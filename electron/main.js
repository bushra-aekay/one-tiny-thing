const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron")
const isDev = require("electron-is-dev")
const path = require("path")

let mainWindow
let notificationTimers = []
let userSettings = null
let lastCheckDate = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 580,
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

  mainWindow.on("closed", () => {
    mainWindow = null
  })
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

  // Request data from renderer
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('check-missed-days')
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
    mainWindow.close()
  }
})

// IPC handlers for user settings and data
ipcMain.on('update-settings', (event, settings) => {
  userSettings = settings
  scheduleNotifications(settings)
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
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})
