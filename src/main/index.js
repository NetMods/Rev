import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import { setupIPC } from './lib'
import { closeApp, installExtensions, isDev, openWindows } from './lib/utils'
import log from 'electron-log/main';


log.initialize();

async function createMainWindow() {
  if (isDev) await installExtensions()

  const controlsWindow = new BrowserWindow({
    width: 10,
    height: 260,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    backgroundColor: '#2e2c29',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === "darwin") controlsWindow.setWindowButtonVisibility(false)

  controlsWindow.on('ready-to-show', () => {
    controlsWindow.show()
    controlsWindow.setSize(50, 299);
    controlsWindow.focus()

    // so that the window comes in all the workSpaces and on top of all the apps
    controlsWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    controlsWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  })

  openWindows.add(controlsWindow)

  controlsWindow.on('closed', () => {
    openWindows.delete(controlsWindow);
    if (openWindows.size === 0) closeApp()
  });

  controlsWindow.webContents.setWindowOpenHandler((details) => {
    log.warn(`Denied opening window with url ${details.url}`)
    return { action: 'deny' };
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    controlsWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    controlsWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return controlsWindow
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const controlsWindow = await createMainWindow()
  log.info('Created Main window');

  setupIPC(ipcMain, controlsWindow)
  log.info('Setuped IPC');

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
