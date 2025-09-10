import { nativeImage, clipboard, dialog } from "electron";
import fs from 'fs'

export const copyImageUrl = (dataUrl) => {
  try {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
    return { status: "done" };
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return { status: "failed", error: err.message };
  }
}


export const downloadImageUrl = async (...args) => {
  const [dataUrl, filename] = args
  try {
    const { cancelled, filePath } = await dialog.showSaveDialog({
      defaultPath: filename || `revshot-${Date.now()}.png`,
      filters: [{
        name: "Images",
        extensions: ["png"]
      }]
    })

    if (cancelled || !filePath) {
      return {
        status: "failed"
      }
    }

    const image = nativeImage.createFromDataURL(dataUrl)
    const buffer = image.toPNG()

    fs.writeFileSync(filePath, buffer)

    return {
      status: "done"
    }
  } catch {
    return {
      status: "failed"
    }
  }
}

export const getFFmpegArgs = (tmpFile) => {
  const platform = process.platform;

  if (platform === "darwin") {
    return [
      "-f", "avfoundation",
      "-framerate", "30",
      "-pixel_format", "uyvy422",
      "-i", "1:none",
      "-frames:v", "1",
      "-update", "1",
      tmpFile,
    ];
  }

  if (platform === "win32") {
    return [
      "-f", "gdigrab",
      "-framerate", "30",
      "-i", "desktop",
      "-frames:v", "1",
      tmpFile,
    ];
  }

  if (platform === "linux") {
    const display = process.env.DISPLAY || ":0.0";
    return [
      "-f", "x11grab",
      "-framerate", "30",
      "-i", display,
      "-frames:v", "1",
      tmpFile,
    ];
  }

  throw new Error("Unsupported platform");
}
