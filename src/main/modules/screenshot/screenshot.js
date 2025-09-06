import { screen } from "electron/main"
const { execFile } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");


export const createScreenshotWindow = async (data, core) => {
  const mainWindow = core.window.getMainWindow()
  mainWindow.hide()
  const image = await captureScreenshot();
  mainWindow.show()

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
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
    let ffmpegCmd;
    let ffmpegArgs;

    const platform = os.platform();

    if (platform === "darwin") {
      ffmpegCmd = "ffmpeg";
      ffmpegArgs = [
        "-f", "avfoundation",
        "-framerate", "30",
        "-i", "3:none",
        "-frames:v", "1",
        tmpFile
      ];
    } else if (platform === "win32") {
      ffmpegCmd = "ffmpeg";
      ffmpegArgs = [
        "-f", "gdigrab",
        "-framerate", "30",
        "-i", "desktop",
        "-frames:v", "1",
        tmpFile
      ];
    } else if (platform === "linux") {
      const display = process.env.DISPLAY || ":0.0";
      ffmpegCmd = "ffmpeg";
      ffmpegArgs = [
        "-f", "x11grab",
        "-framerate", "30",
        "-i", display,
        "-frames:v", "1",
        tmpFile
      ];
    } else {
      return reject(new Error("Unsupported platform"));
    }

    execFile(ffmpegCmd, ffmpegArgs, (error) => {
      if (error) return reject(error);

      fs.readFile(tmpFile, (err, buffer) => {
        if (err) return reject(err);

        const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
        fs.unlink(tmpFile, () => { });
        resolve(dataUrl);
      });
    });
  });
}
