import { screen } from "electron/main"

export const createScreenshotWindow = async (data, core) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: width,
    height: height,
    frame: false,
    alwaysOnTop: true,
    path: `/screenshot`,
  }

  const screenshot = await core.window.createWindow(options, "Screenshot")

  screenshot.on("ready-to-show", () => screenshot.maximize())
}
