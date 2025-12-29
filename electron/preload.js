const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  updateSettings: (settings) => ipcRenderer.send('update-settings', settings),
  missedDaysDetected: (count) => ipcRenderer.send('missed-days-detected', count),
  onCheckMissedDays: (callback) => ipcRenderer.on('check-missed-days', callback)
})
