import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export class ExportingSession {
  constructor() {
    this.ffmpegProc = null;
    this.ffmpegStdin = null;
  }

  async _getOutputPath(fileName) {
    const homeDir = os.homedir();
    const desktopPath = path.join(homeDir, 'Desktop');
    const videosPath = path.join(homeDir, 'Videos');

    try {
      await fs.access(desktopPath);
      console.log(`Desktop found. Saving to: ${desktopPath}`);
      return path.join(desktopPath, fileName);
    } catch {
      console.log('Desktop not found or accessible. Trying Videos folder.');
      try {
        await fs.mkdir(videosPath, { recursive: true });
        console.log(`Using Videos folder. Saving to: ${videosPath}`);
        return path.join(videosPath, fileName);
      } catch (mkdirError) {
        console.error(`Could not create Videos directory: ${mkdirError.message}. Falling back to home directory.`);
        return path.join(homeDir, fileName);
      }
    }
  }

  async start(opts, core) {
    const fileName = `shikibidi.${opts.format}`;
    const outputPath = await this._getOutputPath(fileName);

    console.log(`Starting export to: ${outputPath}`);

    const ffmpegpath = await core.paths.getFFmpegPath();

    const { width, height, fps } = opts;
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.outputPath = outputPath;
    this.format = path.extname(this.outputPath).substring(1);

    this.ffmpegProc = spawn(ffmpegpath, [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(this.fps),
      '-i', '-',
      '-c:v', 'libx264',
      '-crf', '18',
      '-preset', 'slow',
      '-tune', 'animation',
      '-pix_fmt', 'yuv444p',
      this.outputPath,
    ]);

    this.ffmpegStdin = this.ffmpegProc.stdin;

    this.ffmpegProc.stderr.on('data', (data) => {
      console.error('FFmpeg error:', data.toString());
    });
    this.ffmpegProc.on('close', (code) => {
      console.log(`FFmpeg closed with code: ${code}`);
      if (code === 0) {
        console.log(`✅ Export successful: ${this.outputPath}`);
      } else {
        console.error(`❌ Export failed.`);
      }
    });
  }

  pushFrame(obj) {
    const { data } = obj;
    if (this.ffmpegStdin && data) {
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");
      this.ffmpegStdin.write(buffer);
    }
  }

  stop() {
    if (this.ffmpegStdin) {
      this.ffmpegStdin.end();
    }
  }

  cancel() {
    if (this.ffmpegProc) {
      this.ffmpegProc.kill('SIGINT');
    }
  }
}
