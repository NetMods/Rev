import { screen } from 'electron';
import { createNewWindow } from './window-manager';
import { join } from 'path';
import icon from '../../../resources/icon.ico?asset';
import log from "electron-log/main"

// Global variables to track annotation windows
let annotationPanel = null;
let annotationBackground = null;

const createAnnotationPanel = async (mainWindow) => {
  const options = {
    width: 50,
    height: 360,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    backgroundColor: '#000000',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  };

  const panelWindow = await createNewWindow(options);
  log.info("annotate panel created")

  panelWindow.on('ready-to-show', () => {
    mainWindow.hide();
    panelWindow.show();
    panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  });

  if (process.platform === 'darwin') panelWindow.setWindowButtonVisibility(false);

  // Load the annotation panel HTML file
  panelWindow.loadFile(
    join(__dirname, '../renderer/src/windows/anotatePanel/index.html')
  )

  return panelWindow;
};

const createAnnotationBackground = async (mainWindow) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const options = {
    width,
    height,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  };

  const backgroundWindow = await createNewWindow(options);
  log.info("annotate background panel created")

  backgroundWindow.on('ready-to-show', () => {
    mainWindow.hide();
    backgroundWindow.show();
    backgroundWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  });

  backgroundWindow.loadFile(
    join(__dirname, '../renderer/src/windows/anotateBackground/index.html')
  )

  backgroundWindow.maximize();

  return backgroundWindow;
};

export const annotateScreen = async (mainWindow) => {
  if (annotationBackground || annotationPanel) {
    stopAnnotating(mainWindow);
  }
  annotationBackground = await createAnnotationBackground(mainWindow);
  annotationPanel = await createAnnotationPanel(mainWindow);
  return {
    annotationBackground, annotationPanel
  }
}

export const stopAnnotating = (mainWindow) => {
  if (annotationBackground && !annotationBackground.isDestroyed()) {
    annotationBackground.close();
    annotationBackground = null;
  }
  if (annotationPanel && !annotationPanel.isDestroyed()) {
    annotationPanel.close();
    annotationPanel = null;
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
};


export const updateAnotationStyle = (...args) => {
  const [style, window] = args
  if (!window) {
    log.warn("window not found")
    return {
      msg: 'failed'
    }
  }
  window.webContents.send('set:anotationstyle', { color: style.color, size: style.size });
  return {
    msg: 'success'
  }
}
