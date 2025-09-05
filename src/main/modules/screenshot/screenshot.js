import { desktopCapturer } from "electron"
import { screen } from "electron/main"

export const createScreenshotWindow = async (data, core) => {
  const image = await captureScreenshot();

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: width,
    height: height,
    resizable: true,
    minWidth: (width / 12) * 9,
    minHeight: (height / 12) * 9,
    frame: false,
    alwaysOnTop: false,
    path: `/screenshot`,
  }

  const screenshotWindow = await core.window.createWindow(options, "Screenshot")

  screenshotWindow.on("ready-to-show", () => {
    screenshotWindow.setBounds({ x: 0, y: 0, width, height })
    screenshotWindow.setMinimumSize(
      Math.floor((width / 12) * 9),
      Math.floor((height / 12) * 9)
    );
  })

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
