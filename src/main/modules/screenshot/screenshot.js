import { spawnScreenshotCapture } from "./ffmpeg";
import { openEditorWindow } from "./utils";
import { screen } from 'electron'

export const createScreenshotWindow = async (data, core) => {
  const mainWindow = core.window.getMainWindow();
  await mainWindow.hide();

  const imageData = await spawnScreenshotCapture(core, data);
  openEditorWindow(core, mainWindow, imageData)
};

export const createAreaSelectionWindow = async (core) => {
  const point = screen.getCursorScreenPoint();
  const { bounds } = screen.getDisplayNearestPoint(point);

  const options = {
    width: bounds.width,
    height: bounds.height,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    movable: false,
    focusable: false,
    acceptFirstMouse: true,
    path: '/screenshot-area-selection',
  }

  const bufferWindow = await core.window.createWindow(options, "Area Selection");

  bufferWindow.on("ready-to-show", () => {
    bufferWindow.show()
    bufferWindow.focus()
    bufferWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    bufferWindow.setAlwaysOnTop(true, 'pop-up-menu', 10)
  });

  if (process.platform === 'darwin') bufferWindow.setWindowButtonVisibility(false)

  return bufferWindow
}

