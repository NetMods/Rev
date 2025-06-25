import { app } from "electron"

export function setupIPC(ipcMain) {
  ipcMain.handle('ping', () => console.log('pong'))
  ipcMain.on('close-app', () => {
    app.quit()
  })
}
