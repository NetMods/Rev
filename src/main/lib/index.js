import { startMouseTracking, stopMouseTracking } from "./mouse-record";
import { closeApp, closeDrawer, openDrawer } from "./utils";
import { setupVideoRecording, saveVideoRecording } from "./video-record";
import { createProjectWithData } from "./project";
import log from 'electron-log/main'
import { closeWindow } from "./window-manager"
import { createEditorWindow, getProjectVideoBlob } from "./editor"
import { annotateScreen, stopAnnotating, updateAnotationStyle } from "./anotate-screen"

export function setupIPC(ipcMain, mainWindow) {
  let anotatepanelWindow;
  let anotateBackgroundWindow;

  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.on('video-record:setup', () => setupVideoRecording(mainWindow));
  ipcMain.on('video-record:save', (_, arrayBuffer) => saveVideoRecording(arrayBuffer));

  ipcMain.on('anotate:start', async () => {
    const windows = await annotateScreen(mainWindow);
    anotatepanelWindow = windows.annotationPanel;
    anotateBackgroundWindow = windows.annotationBackground
    log.info('anotaePanelWindow is : ', anotatepanelWindow)
  });
  ipcMain.on('anotate:stop', () => stopAnnotating(mainWindow));
  ipcMain.handle('update:anotationstyle', async (_, ...args) => updateAnotationStyle(...args, anotateBackgroundWindow))

  ipcMain.on('mouse-track:start', () => startMouseTracking());
  ipcMain.handle('mouse-track:stop', () => stopMouseTracking());

  ipcMain.on('openDrawer', () => openDrawer(anotatepanelWindow))
  ipcMain.on('closeDrawer', () => closeDrawer(anotatepanelWindow))
  ipcMain.on('editor-window:create', (_, data) => createEditorWindow(data))
  ipcMain.handle('editor:get-video-blob', (_, projectId) => getProjectVideoBlob(projectId))

  ipcMain.handle('project:create', (_, data) => createProjectWithData(data))

  ipcMain.on('window:close', (event) => closeWindow(event))
  ipcMain.on('app:close', () => closeApp())
}
