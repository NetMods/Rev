import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { join } from 'path'

import icon from '../../../resources/icon.ico?asset'
import { installExtensions } from './utils'

// Keep track of all open windows
export const openWindows = new Set()
export const hiddenWindows = new Set()

export const createWindow = async (options, name = 'unnamed') => {
  if (is.dev) await installExtensions()

  const windowOptions = {
    ...options,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      ...options.webPreferences
    }
  }

  if (!options.transparent) {
    windowOptions.backgroundColor = '#0a0a0a'
  }

  const window = new BrowserWindow(windowOptions)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + `#${options.path}`)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'), { hash: options.path })
  }

  window.webContents.on(`did-finish-load`, () => {
    window.setTitle(`Rev - ${name} Window`)
  })

  window.webContents.setWindowOpenHandler((details) => {
    log.warn(`Denied opening window with url ${details.url}`)
    return { action: 'deny' }
  })

  window.on('ready-to-show', () => {
    window.show()
    window.focus()
  })

  window.on('show', () => {
    openWindows.add(window)
    hiddenWindows.delete(window)
    log.info(`Showed ${name} window`)
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`)
  })

  window.on('hide', () => {
    hiddenWindows.add(window)
    openWindows.delete(window)
    log.info(`Hid ${name} window`)
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`)
  })

  window.on('closed', () => {
    openWindows.delete(window)
    hiddenWindows.delete(window)
    log.info(`Closed ${name} window`)
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`)

    if (openWindows.size === 0) {
      if (hiddenWindows.size === 0) {
        app.quit()
      } else {
        hiddenWindows.forEach((window) => window.show())
      }
    }
  })

  log.info(`Created ${name} window`)
  return window
}

export async function createMainWindow() {
  const options = {
    width: 50,
    height: 265,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    fullscreenable: false,
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    skipTaskbar: false,
    focusable: true,
    alwaysOnTop: true,
    visibleOnAllWorkspaces: true,
    type: process.platform === 'darwin' ? 'panel' : 'toolbar',
    webPreferences: {
      backgroundThrottling: false
    }
  }
  const recorderWindow = await createWindow(options, 'Recorder')

  recorderWindow.on('ready-to-show', () => {
    recorderWindow.show()
    recorderWindow.focus()
    recorderWindow.setContentProtection(true)
    try {
      recorderWindow.setAlwaysOnTop(true, 'pop-up-menu', 50)
      recorderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      if (process.platform === 'darwin') {
        recorderWindow.setWindowButtonVisibility(false)
      }
    } catch (error) {
      log.error('Error setting workspace visibility on show:', error)
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    recorderWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    recorderWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return recorderWindow
}

export const closeWindow = (event) => {
  const selectedWindow = BrowserWindow.fromWebContents(event.sender)
  if (selectedWindow && !selectedWindow.isDestroyed()) {
    selectedWindow.close()
  }
}

export const toggleMaximizeWindow = (event) => {
  const selectedWindow = BrowserWindow.fromWebContents(event.sender);
  if (selectedWindow && !selectedWindow.isDestroyed()) {
    if (selectedWindow.isMaximized()) {
      selectedWindow.unmaximize();
    } else {
      selectedWindow.maximize();
    }
  }
};

export const minimizeWindow = (event) => {
  const selectedWindow = BrowserWindow.fromWebContents(event.sender);
  if (selectedWindow && !selectedWindow.isDestroyed()) {
    selectedWindow.minimize();
  }
};
