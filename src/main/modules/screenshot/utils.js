import { nativeImage, clipboard, dialog, screen } from "electron";
import fs from 'fs'
import path from "path";
import { getConfig, updateConfig } from "../../core/config";
import log from "electron-log/main"

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


export const getFFmpegArgs = (tmpFile, screenIndex, ...args) => {
  const platform = process.platform;
  const [cropCords] = args
  log.info("value for  : ", cropCords)
  let x, y, width, height;

  if (cropCords) {
    const { sx, sy, sw, sh } = getConstraints(cropCords)
    x = sx;
    y = sy;
    width = sw;
    height = sh
  }



  if (platform === "darwin") {
    const display = `${Math.abs(screenIndex)}:none`
    if (!cropCords) {
      return [
        "-f", "avfoundation",
        "-framerate", "30",
        "-pixel_format", "uyvy422",
        "-i", display,
        "-frames:v", "1",
        "-update", "1",
        tmpFile,
      ];
    } else {
      const crop = `crop=${width}:${height}:${x}:${y}`
      return [
        "-f", "avfoundation",
        "-framerate", "30",
        "-pixel_format", "uyvy422",
        "-i", display,
        "-frames:v", "1",
        "-vf", crop,
        "-update", "1",
        tmpFile,
      ];
    }
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
    if (!cropCords) {
      return [
        "-f", "x11grab",
        "-framerate", "30",
        "-i", display,
        "-frames:v", "1",
        tmpFile,
      ];
    } else {
      return [
        "-f", "x11grab",
        "-framerate", "30",
        "-video_size", `${width}x${height}`,
        "-i", `${display}+${x},${y}`,
        "-frames:v", "1",
        tmpFile,
      ];
    }

  }
  throw new Error("Unsupported platform");
}

export const openEditorWindow = async (core, mainWindow, imageData) => {
  mainWindow.show();
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

  const centerPoint = { x: Math.round(x0 + w / 2), y: Math.round(y0 + h / 2) };
  const display = screen.getDisplayNearestPoint(centerPoint);
  const scale = display.scaleFactor || 1;

  // convert to device pixels for ffmpeg
  const sx = Math.round(x0 * scale);
  const sy = Math.round(y0 * scale);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);

  return {
    sx,
    sy,
    sw,
    sh
  }

}

