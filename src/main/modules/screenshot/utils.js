import { nativeImage, clipboard, dialog } from "electron";
import fs from 'fs'
import path from "path";

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
