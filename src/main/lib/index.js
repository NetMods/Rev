import { startRecording, stopRecording } from "./record"
import { closeApp } from "./utils"
import { recordGlobalMouse } from "./mouse-record"

export function setupIPC(ipcMain, mainWindow) {
  // handle - invokes
  ipcMain.handle('ping', () => console.log('pong'))
  ipcMain.handle('record:start', () => startRecording(mainWindow))
  ipcMain.handle('record:stop', (_, arrayBuffer) => stopRecording(arrayBuffer))


  // on - send
  ipcMain.on('close:app', () => closeApp())
  ipcMain.on('record:mouse', () => recordGlobalMouse())
}
