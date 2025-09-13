import { spawn } from 'child_process';
import os from 'os';  // For os.tmpdir()
import fs from 'fs';  // For file writing and mkdir
import path from 'path';  // For path joining

export class ExportingSession {
  constructor() {
    this.ffmpegProc = null;
    this.ffmpegStdin = null;
    this.tempDir = null;  // Will hold the temp directory path
  }

  async start(opts, core) {
    const ffmpegpath = await core.paths.getFFmpegPath();

    const { width = 1920, height = 1080, fps = 30, format = 'png', outputPath = '/home/ninjafire/out.mkv' } = opts;  // Changed default to 'png' for lossless debugging
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.format = format;
    this.outputPath = outputPath;

    // Create unique temp dir for frames
    this.tempDir = path.join(os.tmpdir(), `export_frames_${Date.now()}`);
    fs.mkdirSync(this.tempDir, { recursive: true });

    console.log(`Saving frames to temporary directory: ${this.tempDir}`);

    this.ffmpegProc = spawn(ffmpegpath, [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(this.fps),
      '-i', '-',
      '-c:v', 'libx264',
      '-crf', '18',  // Adjust to 0-23; lower for better quality
      '-preset', 'slow',  // Or 'veryslow' for max quality
      '-tune', 'animation',  // Optimizes for screen-like content
      '-pix_fmt', 'yuv444p',  // Full chroma for sharp edges/text
      this.outputPath,
    ]);

    this.ffmpegStdin = this.ffmpegProc.stdin;

    this.ffmpegProc.stderr.on('data', (data) => {
      console.error('FFmpeg error:', data.toString());
    });
    this.ffmpegProc.on('close', (code) => {
      console.log(`FFmpeg closed with code: ${code}`);
      if (this.tempDir) {
        console.log(`Frames saved to: ${this.tempDir}. Inspect them for quality, then delete the directory manually if needed.`);
      }
    });
  }

  pushFrame(obj) {
    const { data, frameNumber } = obj;
    if (this.ffmpegStdin && data) {
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");

      // Save frame to temp dir
      if (this.tempDir) {
        const framePath = path.join(this.tempDir, `frame_${frameNumber}.${this.format}`);
        fs.writeFileSync(framePath, buffer);
        console.log(`Saved frame ${frameNumber} to ${framePath}`);
      }

      // Continue writing to FFmpeg
      this.ffmpegStdin.write(buffer);
    }
  }

  stop() {
    if (this.ffmpegStdin) {
      this.ffmpegStdin.end();
    }
    // Optional: Add fs.rmSync here if you want auto-cleanup after stop
  }

  cancel() {
    if (this.ffmpegProc) {
      this.ffmpegProc.kill('SIGINT');
    }
    // Optional: Add fs.rmSync here if you want auto-cleanup after cancel
  }
}
