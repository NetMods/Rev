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
