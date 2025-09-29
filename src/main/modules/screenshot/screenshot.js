import { screen } from "electron/main";
import { spawnScreenshotCapture } from "./ffmpeg";

export const createScreenshotWindow = async (data, core) => {
  const image = await spawnScreenshotCapture(core);

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const options = {
    width,
    height,
    resizable: true,
    minWidth: (width / 12) * 11,
    minHeight: (height / 12) * 11,
    frame: false,
    alwaysOnTop: false,
    path: `/screenshot`,
  };

  const screenshotWindow = await core.window.createWindow(
    options,
    "Screenshot"
  );

  screenshotWindow.on("ready-to-show", () => {
    screenshotWindow.setBounds({ x: 0, y: 0, width, height });
    screenshotWindow.setMinimumSize(
      Math.floor((width / 12) * 11),
      Math.floor((height / 12) * 11)
    );
  });

  screenshotWindow.webContents.on("did-finish-load", () => {
    screenshotWindow.webContents.send("screenshot:image-data", image);
  });
};
