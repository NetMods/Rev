import { getCropedImageData, openEditorWindow } from "./utils";
import { screen } from 'electron'
import { getImageData } from "./utils";




export const createScreenshotWindow = async (data, core, imageData) => {
  let newimageData = null;
  if (imageData) {
    newimageData = await getCropedImageData(imageData, data)
  } else {
    newimageData = await getImageData(core, data)
  }
  openEditorWindow(core, newimageData)
};




export const createAreaSelectionWindow = async (core, data) => {
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
    kiosk: true,
    path: '/screenshot-area-selection',
  }


  const imageData = await getImageData(core, data)
  const bufferWindow = await core.window.createWindow(options, "Area Selection");

  bufferWindow.on("ready-to-show", () => {
    bufferWindow.show()
    bufferWindow.focus()
    bufferWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    bufferWindow.setAlwaysOnTop(true, 'pop-up-menu', 10)
  });

  if (process.platform === 'darwin') bufferWindow.setWindowButtonVisibility(false)

  return { bufferWindow, imageData }
}

