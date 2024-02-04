// src/electron/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
import path = require("path")


const isDev = process.env.npm_lifecycle_event === 'app:dev'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/')
    mainWindow.webContents.openDevTools() // Open the DevTools.
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('write-to-file', (event, { date, content }) => {
  const filePath = path.join(app.getPath('documents'), 'TimeLine', `${date}.txt`)
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Failed to write file', err)
    } else {
      console.log(`Entries for ${date} were saved to ${filePath}`)
    }
  })
})
