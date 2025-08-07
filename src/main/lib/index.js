import { startMouseTracking, stopMouseTracking } from "./mouse-record"
import { closeApp } from "./utils"
import { setupVideoRecording, saveVideoRecording } from "./video-record"
import { createProjectWithData } from "./project"
import { closeWindow } from "./window-manager"
import { annotateScreen, stopAnnotating } from "./anotate-screen"
import { createEditorWindow } from "./editor"

export function setupIPC(ipcMain, mainWindow) {
  // handle-invoke,  on-send

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('video-record:setup', () => setupVideoRecording(mainWindow))
  ipcMain.on('video-record:save', (_, arrayBuffer) => saveVideoRecording(arrayBuffer))

  ipcMain.on('anotate:start', () => annotateScreen(mainWindow))
  ipcMain.on('anotate:stop', () => stopAnnotating(mainWindow))

  ipcMain.on('mouse-track:start', () => startMouseTracking())
  ipcMain.handle('mouse-track:stop', () => stopMouseTracking())

  ipcMain.on('editor-window:create', (_, data) => createEditorWindow(data))

  ipcMain.handle('project:create', (_, data) => createProjectWithData(data))

  ipcMain.on('window:close', (event) => closeWindow(event))
  ipcMain.on('app:close', () => closeApp())
}
