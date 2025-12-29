const { app, BrowserWindow, Menu, ipcMain, Notification, Tray, nativeImage, session } = require("electron")
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

// ========== SECURITY UTILITIES ==========

// Rate limiting for IPC calls
const ipcRateLimits = new Map()
const IPC_RATE_LIMIT = 10 // calls per second
const IPC_RATE_WINDOW = 1000 // 1 second

function checkRateLimit(channel) {
  const now = Date.now()
  const key = channel

  if (!ipcRateLimits.has(key)) {
    ipcRateLimits.set(key, { count: 1, resetTime: now + IPC_RATE_WINDOW })
    return true
  }

  const limit = ipcRateLimits.get(key)

  if (now > limit.resetTime) {
    limit.count = 1
    limit.resetTime = now + IPC_RATE_WINDOW
    return true
  }

  if (limit.count >= IPC_RATE_LIMIT) {
    console.warn(`Rate limit exceeded for IPC channel: ${channel}`)
    return false
  }

  limit.count++
  return true
}

// Input validation for IPC messages
function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') return false

  // Validate structure
  if (settings.name && typeof settings.name !== 'string') return false
  if (settings.dayStart && !/^\d{2}:\d{2}$/.test(settings.dayStart)) return false
  if (settings.dayEnd && !/^\d{2}:\d{2}$/.test(settings.dayEnd)) return false

  // Prevent injection attacks - sanitize strings
  if (settings.name && settings.name.length > 100) return false

  if (settings.notifications && typeof settings.notifications !== 'object') return false
  if (settings.notifications) {
    if (typeof settings.notifications.enableReminders !== 'boolean') return false
    if (typeof settings.notifications.enableCheckIns !== 'boolean') return false
  }

  return true
}

function validateFullData(data) {
  if (!data || typeof data !== 'object') return false
  if (!data.user || !validateSettings(data.user)) return false

  // Validate days data structure
  if (data.days && typeof data.days !== 'object') return false
  if (data.days) {
    for (const [key, entry] of Object.entries(data.days)) {
      // Validate date format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false

      // Validate entry structure
      if (!entry || typeof entry !== 'object') return false
      if (typeof entry.task !== 'string' || entry.task.length > 500) return false
      if (typeof entry.startedAt !== 'number') return false
      if (typeof entry.shipped !== 'boolean') return false
    }
  }

  return true
}

// Sanitize file paths to prevent directory traversal
function sanitizePath(filePath) {
  const normalized = path.normalize(filePath)
  const resolved = path.resolve(normalized)

  // Ensure path is within userData directory
  if (!resolved.startsWith(userDataPath)) {
    throw new Error('Invalid file path')
  }

  return resolved
}

// ========== END SECURITY UTILITIES ==========

// Load settings from file
function loadSettings() {
  try {
    const safePath = sanitizePath(settingsPath)
    if (fs.existsSync(safePath)) {
      const data = fs.readFileSync(safePath, 'utf8')
      const parsed = JSON.parse(data)

      // Validate loaded data
      if (!validateFullData(parsed)) {
        console.error('Invalid settings file format')
        return null
      }

      return parsed
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return null
}

// Save settings to file
function saveSettings(settings) {
  try {
    // Validate before saving
    if (!validateFullData(settings)) {
      console.error('Invalid settings data, not saving')
      return
    }

    const safePath = sanitizePath(settingsPath)

    // Atomic write using temp file
    const tempPath = `${safePath}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(settings, null, 2), { mode: 0o600 })
    fs.renameSync(tempPath, safePath)
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
      sandbox: true, // Enable sandbox for additional security
      webviewTag: false, // Disable webview tag
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, "../public/icon.ico"),
    backgroundColor: '#00000000',
    title: '🌱 one tiny thing',
  })

  // Security: Set CSP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* ws://localhost:*; img-src 'self' data: blob:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';"
        ],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block']
      }
    })
  })

  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Security: Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    const validOrigins = isDev
      ? ['localhost', '127.0.0.1']
      : ['file:']

    const isValid = validOrigins.some(origin =>
      parsedUrl.protocol.startsWith('file') || parsedUrl.hostname === origin
    )

    if (!isValid) {
      console.warn('Navigation blocked:', navigationUrl)
      event.preventDefault()
    }
  })

  // Security: Prevent opening new windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.warn('Window open blocked:', url)
    return { action: 'deny' }
  })

  // Security: Disable web requests to external domains
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    const url = new URL(details.url)
    const allowedProtocols = ['file:', 'http:', 'https:', 'devtools:', 'chrome-extension:']
    const allowedHosts = isDev ? ['localhost', '127.0.0.1'] : []

    if (!allowedProtocols.includes(url.protocol)) {
      return callback({ cancel: true })
    }

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const isAllowed = allowedHosts.includes(url.hostname)
      if (!isAllowed && !isDev) {
        console.warn('External request blocked:', details.url)
        return callback({ cancel: true })
      }
    }

    callback({})
  })

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
  // Security: Rate limiting
  if (!checkRateLimit('update-settings')) return

  // Security: Validate input
  if (!validateSettings(settings)) {
    console.error('Invalid settings received via IPC')
    return
  }

  userSettings = settings
  saveSettings(settings)
  scheduleNotifications(settings)
})

ipcMain.on('update-full-data', (event, data) => {
  // Security: Rate limiting
  if (!checkRateLimit('update-full-data')) return

  // Security: Validate input
  if (!validateFullData(data)) {
    console.error('Invalid full data received via IPC')
    return
  }

  if (data && data.user) {
    userSettings = data
    saveSettings(data)
    scheduleNotifications(data.user)
  }
})

ipcMain.on('missed-days-detected', (event, count) => {
  // Security: Rate limiting
  if (!checkRateLimit('missed-days-detected')) return

  // Security: Validate input
  if (typeof count !== 'number' || count < 0 || count > 365) {
    console.error('Invalid missed days count')
    return
  }

  if (count >= 2) {
    showNotification(
      "hey, I miss you!",
      `it's been ${count} days since we last chatted. everything okay? :)`
    )
  }
})

app.on("ready", () => {
  // Security: Set app-wide security defaults
  app.on('web-contents-created', (event, contents) => {
    // Disable navigation to any external content
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      const isLocalhost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1'
      const isFile = parsedUrl.protocol === 'file:'

      if (!isLocalhost && !isFile && !isDev) {
        event.preventDefault()
      }
    })

    // Prevent new window creation
    contents.setWindowOpenHandler(() => {
      return { action: 'deny' }
    })
  })

  // Security: Set permission request handler
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['notifications'] // Only allow notifications

    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      console.warn(`Permission denied: ${permission}`)
      callback(false)
    }
  })

  // Security: Block all permission checks except notifications
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return permission === 'notifications'
  })

  // Security: Prevent downloads
  session.defaultSession.on('will-download', (event, item, webContents) => {
    event.preventDefault()
    console.warn('Download blocked:', item.getFilename())
  })

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
