import { BrowserWindow } from "electron";
import { closeApp, installExtensions, openWindows } from "./utils";
import { join } from "path"
import log from "electron-log/main";
import icon from '../../../resources/icon.ico?asset'
import { is } from "@electron-toolkit/utils";

export const createNewWindow = async (options) => {
  if (is.dev) await installExtensions()

  const newWindow = new BrowserWindow({
    ...options,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      ...options.webPreferences,
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
    log.info("window closed")
    if (openWindows.size === 0) closeApp()
  });

  return newWindow
}

export const closeWindow = (event) => {
  const selectedWindow = BrowserWindow.fromWebContents(event.sender)
  if (selectedWindow && !selectedWindow.isDestroyed()) {
    selectedWindow.close()
  }
}
