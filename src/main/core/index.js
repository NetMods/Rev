import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import log from 'electron-log/main';

import { createWindow, createMainWindow, closeWindow } from './window';
import { loadModules } from '../modules';
import { registerIPCRouter } from './ipc-router';
import config from './config';
import paths from "./path"

log.initialize();
log.transports.console.format = '\x1b[33m{h}:{i}:{s} \x1b[36m[{level}] \x1b[30m› \x1b[0m{text}';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] › {text}';

app.whenReady().then(async () => {
  // Set app user model for Windows notifications
  electronApp.setAppUserModelId('com.electron');

  // Optimize window shortcuts
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = await createMainWindow();

  const coreServices = {
    window: {
      createWindow: createWindow,
      closeWindow: closeWindow,
      getMainWindow: () => mainWindow,
    },
    config,
    paths,
    modules: {},
    ipcHandlers: {
      'window:close': (event) => closeWindow(event),
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
