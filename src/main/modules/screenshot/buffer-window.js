import { screen } from "electron/main";


export const getBufferWindow = async (core) => {
  const point = screen.getCursorScreenPoint();
  const { bounds, scaleFactor } = screen.getDisplayNearestPoint(point);
  const BoundingRect = {
    width: process.platform === "darwin" ? bounds.width : Math.floor(bounds.width * scaleFactor),
    height: process.platform === "darwin" ? bounds.height : Math.floor(bounds.height * scaleFactor),
  }
  const options = {
    ...BoundingRect,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    movable: false,
    focusable: false,
    acceptFirstMouse: true,
    path: 'screenshotBuffer',
  }
  const bufferWindow = await core.window.createWindow(
    options,
    "Screenshot-buffer"
  );
  bufferWindow.on("ready-to-show", () => {
    bufferWindow.show()
    bufferWindow.focus()
    bufferWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    bufferWindow.setAlwaysOnTop(true, 'pop-up-menu', 10)
  });
  if (process.platform === 'darwin') bufferWindow.setWindowButtonVisibility(false)

  return bufferWindow
}
