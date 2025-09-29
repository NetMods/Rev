import { ipcMain } from "electron/main";
import { spawnScreenshotCapture } from "./ffmpeg";
import log from 'electron-log/main'
import { getBufferWindow } from "./buffer-window";
import { openEditorWindow } from "./utils";

export const createScreenshotWindow = async (data, core) => {
  let imageData = null;
  if (data.deviceIndex < 0) {
    await getBufferWindow(core)
    ipcMain.on('screenshot:create-buffer', async (_, cord_data) => {
      imageData = await spawnScreenshotCapture(core, data.deviceIndex, cord_data);
      openEditorWindow(core, mainWindow, imageData)
    })
  } else {
    log.info("taking the whole screen")
    imageData = await spawnScreenshotCapture(core, data.deviceIndex);
    openEditorWindow(core, mainWindow, imageData)
  }
};
