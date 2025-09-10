import { execFile } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";
import { getFFmpegArgs } from "./utils";

export const spawnScreenshotCapture = async (core) => {
  const ffmpegCmd = await core.paths.getFFmpegPath()

  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
    const ffmpegArgs = getFFmpegArgs(tmpFile);

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
