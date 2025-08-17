import { app, BrowserWindow } from "electron";
import log from "electron-log/main";
import { is } from "@electron-toolkit/utils";
import { join } from "path"

import { installExtensions } from "./utils";
import icon from '../../../resources/icon.ico?asset'

// Keep track of all open windows
export const openWindows = new Set();
export const hiddenWindows = new Set();

export const createWindow = async (options, name = "unnamed") => {
  if (is.dev) await installExtensions();

  const window = new BrowserWindow({
    ...options,
    backgroundColor: '#0a0a0a',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      ...options.webPreferences,
    }
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + `#${options.path}`)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'), { hash: options.path })
  }

  window.webContents.setWindowOpenHandler((details) => {
    log.warn(`Denied opening window with url ${details.url}`);
    return { action: 'deny' };
  });


  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });

  window.on('show', () => {
    openWindows.add(window);
    hiddenWindows.delete(window);

    log.info(`Showed ${name} window`);
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`);
  });

  window.on('hide', () => {
    hiddenWindows.add(window);
    openWindows.delete(window);

    log.info(`Hided ${name} window`);
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`);
  });

  window.on('closed', () => {
    openWindows.delete(window);
    hiddenWindows.delete(window);

    log.info(`Closed ${name} window`);
    log.info(`${openWindows.size} window(s) open, ${hiddenWindows.size} window(s) hidden`);

    if (openWindows.size === 0) {
      if (hiddenWindows.size === 0) {
        app.quit();
      } else {
        hiddenWindows.forEach((window) => window.show())
      }
    }
  });

  log.info(`Created ${name} window`);
  return window;
};

export async function createMainWindow() {
  const options = {
    width: 10,
    height: 260,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    fullscreenable: false,
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
  };

  const recorderWindow = await createWindow(options, "Recorder");

  recorderWindow.on("ready-to-show", () => {
    recorderWindow.setSize(50, 266);
    recorderWindow.show();
    recorderWindow.focus();
    recorderWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    recorderWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    if (process.platform === 'darwin') recorderWindow.setWindowButtonVisibility(false);
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    recorderWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    recorderWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return recorderWindow;
}

export const closeWindow = (event) => {
  const selectedWindow = BrowserWindow.fromWebContents(event.sender)
  if (selectedWindow && !selectedWindow.isDestroyed()) {
    selectedWindow.close()
  }
}
