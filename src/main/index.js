import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.ico?asset';
import { setupIPC } from './lib';
import { createNewWindow } from './lib/window-manager';
import log from 'electron-log/main';

log.initialize();

async function createMainWindow() {
  const options = {
    width: 10,
    height: 260,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  };

  const controlsWindow = await createNewWindow(options);

  controlsWindow.on("ready-to-show", () => {
    controlsWindow.show();
    controlsWindow.setSize(50, 299);
    controlsWindow.focus();
    controlsWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    controlsWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    if (process.platform === 'darwin') controlsWindow.setWindowButtonVisibility(false);
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    controlsWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    controlsWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  log.info('Created Main window');
  return controlsWindow;
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const controlsWindow = await createMainWindow();
  setupIPC(ipcMain, controlsWindow);
  log.info('Setup IPC');

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
