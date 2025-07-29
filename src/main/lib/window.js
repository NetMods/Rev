import { BrowserWindow } from "electron";
import { closeApp, installExtensions, isDev, openWindows } from "./utils";
import { join } from "path"
import { log } from "electron-log/main";
import icon from '../../../resources/icon.ico?asset'

export const createNewWindow = async (options) => {
  if (isDev) await installExtensions()

  const newWindow = new BrowserWindow({
    ...options,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  newWindow.webContents.setWindowOpenHandler((details) => {
    log.warn(`Denied opening window with url ${details.url}`)
    return { action: 'deny' };
  })

  newWindow.on('ready-to-show', () => {
    newWindow.show()
    newWindow.focus()
  })

  openWindows.add(newWindow)

  newWindow.on('closed', () => {
    openWindows.delete(newWindow);
    if (openWindows.size === 0) closeApp()
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + options.path)
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export const closeWindow = (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window && !window.isDestroyed()) {
    window.close()
  }
}
