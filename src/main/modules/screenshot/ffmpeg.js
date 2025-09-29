import os from "os";
import path from "path";
import fs from "fs";
import { getFFmpegArgs } from "./utils";

export const spawnScreenshotCapture = async (core, deviceIndex, ...args) => {
  const ffmpegCmd = await core.paths.getFFmpegPath()
  let screenIndex = deviceIndex

  if (screenIndex === undefined || null) {
    const { videoDevices } = await core.input.getInputDevices()
    const screenDevice = videoDevices.find(device => device.name.toLowerCase().includes('capture screen'));
    screenIndex = screenDevice ? screenDevice.id : null
  }
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
    const ffmpegArgs = getFFmpegArgs(tmpFile, screenIndex, ...args);

    core.ffmpegManager.spawn(ffmpegArgs, {
      onClose: (code) => {
        if (code !== 0) {
          return reject(new Error(`FFmpeg screenshot capture failed with exit code ${code}`));
        }

        fs.readFile(tmpFile, (err, buffer) => {
          if (err) {
            return reject(new Error(`Failed to read screenshot file: ${err.message}`));
          }

          try {
            const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

            fs.unlink(tmpFile, (unlinkErr) => {
              if (unlinkErr) {
                console.warn(`Failed to cleanup temporary screenshot file: ${unlinkErr.message}`);
              }
            });

            resolve(dataUrl);
          } catch (conversionErr) {
            reject(new Error(`Failed to convert screenshot to base64: ${conversionErr.message}`));
          }
        });
      },
      dialogOnError: true // Show error dialog if screenshot fails
    }).catch(err => {
      reject(new Error(`Failed to start FFmpeg for screenshot: ${err.message}`));
    });
  });
};
