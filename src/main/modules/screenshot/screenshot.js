import { desktopCapturer } from "electron"
import { screen } from "electron/main"

export const createScreenshotWindow = async (data, core) => {
  const image = await captureScreenshot();

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: width,
    height: height,
    frame: false,
    alwaysOnTop: true,
    path: `/screenshot`,
  }

  const screenshotWindow = await core.window.createWindow(options, "Screenshot")

  screenshotWindow.on("ready-to-show", () => screenshotWindow.maximize())

  screenshotWindow.webContents.on("did-finish-load", () => {
    screenshotWindow.webContents.send("screenshot:image-data", image);
  });
}

async function captureScreenshot() {
  const { screen } = require("electron");

  const { width, height } = screen.getPrimaryDisplay().size;

  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width, height }
  });

  const primary = sources[0];
  const screenshot = primary.thumbnail.toDataURL();
  return screenshot;
}
