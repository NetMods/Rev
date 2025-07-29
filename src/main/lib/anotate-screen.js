import { BrowserWindow, screen } from "electron/main"
import icon from '../../../resources/icon.ico?asset'
import { join } from 'path'
// import { is } from "@electron-toolkit/utils"



let anotateSidePanel = null
let backgroundwindow = null


const createPanel = (mainWindow) => {
  const anotateSidePanel = new BrowserWindow({
    width: 50,
    height: 50,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === "darwin") anotateSidePanel.setWindowButtonVisibility(false)

  anotateSidePanel.on('ready-to-show', () => {
    mainWindow.hide()
    anotateSidePanel.show()
  })


  // TODO : find a way to make get hot reloads like mainWindow



  anotateSidePanel.loadFile(join(__dirname, '../renderer/anotatePanel.html'))
  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   anotateSidePanel.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
  //   anotateSidePanel.loadFile(join(__dirname, '../../renderer/anotatePanel.html'))
  // }

  return anotateSidePanel
}


const createBackgroundScreen = (mainWindow) => {
  const primaryDisplayinfo = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplayinfo.workAreaSize
  const backgroundwindow = new BrowserWindow({
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
      sandbox: false
    }
  })

  // backgroundwindow.setIgnoreMouseEvents(true, { forward: true })

  backgroundwindow.on('ready-to-show', () => {
    mainWindow.hide()
    backgroundwindow.show()
  })


  // TODO : find a way to make get hot reloads like mainWindow
  backgroundwindow.loadFile(join(__dirname, '../renderer/background.html'))



  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  //   anotateSidePanel.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
  //   anotateSidePanel.loadFile(join(__dirname, '../../renderer/anotatePanel.html'))
  // }

  backgroundwindow.maximize()

  return backgroundwindow
}


export const anotateScreen = (mainWindow) => {
  backgroundwindow = createBackgroundScreen(mainWindow)
  anotateSidePanel = createPanel(mainWindow)
}


export const stopAnotating = (mainWindow) => {
  if (!backgroundwindow && !anotateSidePanel) {
    console.log('Either backgroundwindow or sidepanel is missing')
    return;
  }
  backgroundwindow.close()
  anotateSidePanel.close()
  mainWindow.show()
}

