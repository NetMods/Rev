import { execFile } from "child_process";
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

    execFile(ffmpegCmd, ffmpegArgs, (error) => {
      if (error) return reject(error);

      fs.readFile(tmpFile, (err, buffer) => {
        if (err) return reject(err);

        const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
        fs.unlink(tmpFile, () => { }); // cleanup
        resolve(dataUrl);
      });
    });

  });
};
