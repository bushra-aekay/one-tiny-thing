const { app, BrowserWindow, Menu } = require("electron")
const isDev = require("electron-is-dev")
const path = require("path")

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 650,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "../public/icon.png"),
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

app.on("ready", createWindow)

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

// Remove menu in production
if (!isDev) {
  Menu.setApplicationMenu(null)
}
