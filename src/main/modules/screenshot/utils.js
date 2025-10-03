import { nativeImage, clipboard, dialog, screen } from "electron";
import fs from 'fs'
import path from "path";
import { getConfig, updateConfig } from "../../core/config";
import log from "electron-log/main"
import { spawnScreenshotCapture } from "./ffmpeg";
import sharp from "sharp";

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

export const backgroundImagePath = (...args) => {
  const [filePath] = args
  if (!filePath) return null;
  try {
    // Prefer nativeImage (works with many image formats)
    const img = nativeImage.createFromPath(filePath);

    // nativeImage.isEmpty() may be true for some invalid paths
    if (!img.isEmpty && img.toDataURL) {
      return img.toDataURL(); // "data:image/png;base64,...."
    }

    // Fallback: read file and convert to base64 (detect mime by extension)
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase() || 'png';
    const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch (err) {
    console.error('read-image-dataurl error:', err);
    return null;
  }
}


export const getUsersPreset = async () => {
  const data = await getConfig()
  const key = "presets"
  if (data[key] === null || undefined) return null;
  return data[key]
}

export const updateUserPreset = async (...args) => {
  const [newPreset] = args
  log.info("in the main", newPreset)
  await updateConfig(newPreset)
  const res = await getUsersPreset()
  if (res === null) return {}
  return res
}


export const getFFmpegArgs = (tmpFile, screenIndex) => {
  const platform = process.platform;

  if (platform === "darwin") {
    const display = `${Math.abs(screenIndex)}:none`
    return [
      "-f", "avfoundation",
      "-framerate", "30",
      "-pixel_format", "uyvy422",
      "-i", display,
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

export const getImageData = async (core, data) => {
  const mainWindow = core.window.getMainWindow();
  await mainWindow.hide();
  const image = await spawnScreenshotCapture(core, data);
  mainWindow.show()
  return image
}

export const getCropedImageData = async (base64Image, cropCoords) => {
  if (!cropCoords || !cropCoords.origin || !cropCoords.rectPos) {
    throw new Error('Invalid crop coordinates');
  }
  const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
  let { sx, sy, sw, sh } = getConstraints(cropCoords);
  const point = { x: sx, y: sy };
  const displayObj = screen.getDisplayNearestPoint(point);
  const scaleFactor = displayObj.scaleFactor;
  const bounds = displayObj.bounds;
  sx = sx - bounds.x;
  sy = sy - bounds.y;
  sx = Math.floor(sx * scaleFactor);
  sy = Math.floor(sy * scaleFactor);
  sw = Math.floor(sw * scaleFactor);
  sh = Math.floor(sh * scaleFactor);
  const croppedBuffer = await sharp(buffer)
    .extract({ left: sx, top: sy, width: sw, height: sh })
    .toBuffer();
  return `data:image/png;base64,${croppedBuffer.toString('base64')}`;
}

export const openEditorWindow = async (core, imageData) => {
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
    screenshotWindow.webContents.send("screenshot:image-data", imageData);
  });

}


const getConstraints = (cropCords) => {
  const x0 = Math.min(cropCords.origin.x, cropCords.rectPos.x);
  const y0 = Math.min(cropCords.origin.y, cropCords.rectPos.y);
  const w = Math.abs(cropCords.rectPos.x - cropCords.origin.x);
  const h = Math.abs(cropCords.rectPos.y - cropCords.origin.y);

  const sx = Math.round(x0);
  const sy = Math.round(y0);
  const sw = Math.round(w);
  const sh = Math.round(h);

  return { sx, sy, sw, sh }

}

