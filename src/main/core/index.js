import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';

import { createWindow, createMainWindow, closeWindow, minimizeWindow, toggleMaximizeWindow } from './window';
import { loadModules } from '../modules';
import { registerIPCRouter } from './ipc-router';
import config from './config';
import paths from "./path"
import { handleProtocolRequests, registerProtocolScheme } from './protocol';
import { initializeLogger, restartApp } from './utils';
import input from './input';
import { initErrorHandling, showError } from './error';
import { FFmpegManager } from "./ffmpeg"

const log = initializeLogger()

const SCHEME_NAME = "app"

registerProtocolScheme(SCHEME_NAME)

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

app.whenReady().then(async () => {
  await initErrorHandling()

  // Set app user model for Windows notifications
  electronApp.setAppUserModelId('com.electron');

  // Optimize window shortcuts
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // For enabling deep links
  app.setAsDefaultProtocolClient("rev")

  handleProtocolRequests(SCHEME_NAME)

  const mainWindow = await createMainWindow();
  const coreServices = {
    window: {
      createWindow: createWindow,
      closeWindow: closeWindow,
      getMainWindow: () => mainWindow,
    },
    config,
    paths,
    ffmpegManager: new FFmpegManager(this),
    input,
    modules: {},
    ipcHandlers: {
      'devices:get': async (_, ...args) => input.getInputDevices(this, ...args),
      'app:restart': () => restartApp(),
      'window:error': (_, ...args) => showError(...args),
      'window:close': (event) => closeWindow(event),
      'window:minimize': (event) => minimizeWindow(event),
      'window:maximize': (event) => toggleMaximizeWindow(event),
      'config:get': async () => config.getConfig(),
      'config:update': async (_, ...args) => config.updateConfig(...args),
    },
  };

  const modules = await loadModules(coreServices);
  coreServices.modules = modules;

  registerIPCRouter(coreServices);

  log.info('Core ready, modules loaded');

  Object.freeze(coreServices)

  // Handle macOS activate (reopen window if none exist)
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });

});

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
