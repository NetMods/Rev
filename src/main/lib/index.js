import { startMouseTracking, stopMouseTracking } from "./mouse-record";
import { closeApp, closeDrawer, openDrawer } from "./utils";
import { setupVideoRecording, saveVideoRecording } from "./video-record";
import { createProjectWithData } from "./project";
import { createNewWindow, closeWindow } from "./window";
import { anotateScreen, stopAnotating } from "./anotate-screen";
import log from 'electron-log/main'

export function setupIPC(ipcMain, mainWindow) {
  let anotatepanelWindow;

  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.on('video-record:setup', () => setupVideoRecording(mainWindow));
  ipcMain.on('video-record:save', (_, arrayBuffer) => saveVideoRecording(arrayBuffer));

  ipcMain.on('anotate:start', () => {
    const windows = anotateScreen(mainWindow);
    anotatepanelWindow = windows.anotateSidePanel;
    log.info('anotaePanelWindow is : ', anotatepanelWindow)
  });
  ipcMain.on('anotate:stop', () => stopAnotating(mainWindow));

  ipcMain.on('mouse-track:start', () => startMouseTracking());
  ipcMain.handle('mouse-track:stop', () => stopMouseTracking());

  ipcMain.handle('project:create', (_, data) => createProjectWithData(data));

  ipcMain.on('window:create', (_, options) => createNewWindow(options));
  ipcMain.on('window:close', (event) => closeWindow(event));

  ipcMain.on('openDrawer', () => openDrawer(anotatepanelWindow))
  ipcMain.on('closeDrawer', () => closeDrawer(anotatepanelWindow))

  ipcMain.on('app:close', () => closeApp());
}
