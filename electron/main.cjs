const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')
function createWindow() {
  const win = new BrowserWindow({
    width: 1180, height: 800, minWidth: 370, minHeight: 580,
    backgroundColor: '#0c101b', title: 'Taskflow', autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
  })
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'https:' && parsed.hostname === 'github.com') shell.openExternal(parsed.toString())
    } catch { /* Reject invalid URLs */ }
    return { action: 'deny' }
  })
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow() }) })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
