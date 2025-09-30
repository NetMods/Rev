import { screen } from 'electron'
import log from 'electron-log/main'
import { isValidWindow } from './utils'

export const annotateScreen = async (core) => {
  const mainWindow = core.window.getMainWindow()

  const annotationBackground = await createAnnotationBackground(core)
  const annotationPanel = await createAnnotationPanel(core)

  annotationBackground.on('closed', () => {
    stopAnnotating(mainWindow, { annotationBackground, annotationPanel })
  })

  annotationPanel.on('closed', () => {
    stopAnnotating(mainWindow, { annotationBackground, annotationPanel })
  })

  annotationBackground.on('focus', () => {
    annotationPanel.moveTop()
  })

  if (annotationPanel?.isVisible() && annotationBackground?.isVisible()) {
    if (isValidWindow(mainWindow)) {
      mainWindow.hide()
    }
  }
  return { annotationBackground, annotationPanel }
}

const createAnnotationPanel = async (core) => {
  const options = {
    width: 50,
    height: 343,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    transparent: true,
    fullscreenable: false,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    path: '/annotation-panel'
  }

  const panelWindow = await core.window.createWindow(options, 'Annotation Panel')

  panelWindow.on('ready-to-show', () => {
    panelWindow.show()
    panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    panelWindow.setAlwaysOnTop(true, 'pop-up-menu', 10)
  })

  if (process.platform === 'darwin') panelWindow.setWindowButtonVisibility(false)

  return panelWindow
}

const createAnnotationBackground = async (core) => {
  const point = screen.getCursorScreenPoint();
  const { bounds, scaleFactor } = screen.getDisplayNearestPoint(point);
  console.log("the screen points are : ", bounds, scaleFactor)
  const BoundingRect = {
    width: process.platform === "darwin" ? bounds.width : Math.floor(bounds.width * scaleFactor),
    height: process.platform === "darwin" ? bounds.height : Math.floor(bounds.height * scaleFactor),
  }
  const options = {
    ...BoundingRect,
    autoHideMenuBar: true,
    frame: false,
    path: '/annotation-background',
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: true,
    movable: false,
    webPreferences: {
      backgroundThrottling: false
    }
  }

  const backgroundWindow = await core.window.createWindow(options, 'Annotation Background')

  backgroundWindow.on('ready-to-show', () => {
    backgroundWindow.show()
    backgroundWindow.setAlwaysOnTop(true, 'normal', 1)
    backgroundWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  })

  return backgroundWindow
}

export const stopAnnotating = (mainWindow, { annotationBackground, annotationPanel }) => {
  if (isValidWindow(annotationBackground)) {
    annotationBackground.close()
  }
  if (isValidWindow(annotationPanel)) {
    annotationPanel.close()
  }
  if (isValidWindow(mainWindow)) {
    mainWindow.show()
  }
}

export const updateAnnotationConfig = (...args) => {
  const [style, window] = args
  if (!window) log.warn('window not found')
  window.webContents.send('annotation-config:set', {
    color: style.color,
    size: style.size,
    freeze: style.freeze,
    freezeTime: style.freezeTime,
    tool: style.tool
  })
}
