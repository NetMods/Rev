import { startRecording, stopRecording } from "./record"

export function setupIPC(ipcMain) {
  ipcMain.handle('ping', () => console.log('pong'))

  ipcMain.handle('record:start', () => startRecording())
  ipcMain.handle('record:stop', (_, arrayBuffer) => stopRecording(arrayBuffer))
  ipcMain.on('close-app', () => app.quit())
}
