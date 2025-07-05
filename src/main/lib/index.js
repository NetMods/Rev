import { startRecording, stopRecording } from "./record"
import { closeApp } from "./utils"
import { recordGlobalMouse, recordGlobalMouseStop, saveMouseRecords } from "./mouse-record"
import { anotateScreen } from "./anotate-screen"

export function setupIPC(ipcMain, mainWindow) {
  // handle - invokes
  ipcMain.handle('ping', () => console.log('pong'))
  ipcMain.handle('record:start', () => startRecording(mainWindow))
  ipcMain.handle('record:stop', (_, arrayBuffer) => stopRecording(arrayBuffer))
  ipcMain.handle('save:mouseRecord', () => saveMouseRecords())


  // on - send
  ipcMain.on('close:app', () => closeApp())
  ipcMain.on('record:mouse', () => recordGlobalMouse())
  ipcMain.on('record:mouse.stop', () => recordGlobalMouseStop())
  ipcMain.on('anotate:screen', () => anotateScreen(mainWindow))
}
