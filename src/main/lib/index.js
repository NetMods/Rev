import { startMouseTracking, stopMouseTracking } from "./mouse-record"
import { closeApp } from "./utils"
import { startVideoRecording, stopVideoRecording } from "./video-record"

export function setupIPC(ipcMain, mainWindow) {
  // handle-invoke,  on-send

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('video-record:start', () => startVideoRecording(mainWindow))
  ipcMain.on('video-record:stop', (_, arrayBuffer) => stopVideoRecording(arrayBuffer))

  ipcMain.on('mouse-track:start', () => startMouseTracking())
  ipcMain.handle('mouse-track:stop', () => stopMouseTracking())

  ipcMain.on('app:close', () => closeApp())
}
