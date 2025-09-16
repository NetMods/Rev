import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export class ExportingSession {
  constructor() {
    this.ffmpegProc = null;
    this.ffmpegStdin = null;
    this.isReady = false;
    this.frameQueue = [];
    this.processing = false;
    this.expectedFrameNumber = 0;
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
    const fileName = `rev-${Date.now()}.${opts.format}`;
    const outputPath = await this._getOutputPath(fileName);

    console.log(`Starting export to: ${outputPath}`);

    const ffmpegpath = await core.paths.getFFmpegPath();

    const { width, height, fps, projectId } = opts;
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.outputPath = outputPath;
    this.format = path.extname(this.outputPath).substring(1);
    this.projectId = projectId;
    this.expectedFrameNumber = 0;
    this.frameQueue = [];
    this.processing = false;

    return new Promise((resolve, reject) => {
      this.ffmpegProc = spawn(ffmpegpath, [
        '-y', // Overwrite output file
        '-f', 'image2pipe', // Input format
        '-framerate', String(this.fps),
        '-i', '-', // Input from stdin
        '-c:v', 'libx264', // Video codec
        '-crf', '18', // Quality (lower = better quality)
        '-preset', 'medium', // Changed from 'slow' for better performance
        '-tune', 'stillimage', // Better for frame-by-frame input
        '-pix_fmt', 'yuv420p', // Better compatibility
        '-fflags', '+genpts', // Generate presentation timestamps
        '-r', String(this.fps), // Output framerate
        this.outputPath,
      ]);

      this.ffmpegStdin = this.ffmpegProc.stdin;

      // Handle FFmpeg stderr for monitoring
      this.ffmpegProc.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('FFmpeg output:', output);

        // Check if FFmpeg is ready to receive frames
        if (!this.isReady && (output.includes('Press [q] to stop') || output.includes('Stream mapping:'))) {
          this.isReady = true;
          console.log('FFmpeg is ready to receive frames');
          resolve(true);
        }
      });

      this.ffmpegProc.on('close', (code) => {
        console.log(`FFmpeg closed with code: ${code}`);
        this.isReady = false;
      });

      this.ffmpegProc.on('error', (error) => {
        console.error('FFmpeg error:', error);
        this.isReady = false;
        reject(error);
      });

      // Timeout fallback - assume ready after 2 seconds if no confirmation
      setTimeout(() => {
        if (!this.isReady) {
          console.log('FFmpeg ready timeout - assuming ready');
          this.isReady = true;
          resolve(true);
        }
      }, 2000);
    });
  }

  async pushFrame(obj) {
    const { frameNumber, data } = obj;

    if (!this.ffmpegStdin || !data) {
      return false;
    }

    // Wait for FFmpeg to be ready
    if (!this.isReady) {
      console.log('Waiting for FFmpeg to be ready...');
      let waitCount = 0;
      while (!this.isReady && waitCount < 100) { // 5 second timeout
        await new Promise(resolve => setTimeout(resolve, 50));
        waitCount++;
      }
      if (!this.isReady) {
        console.error('FFmpeg not ready after timeout');
        return false;
      }
    }

    try {
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");

      // Write frame synchronously and wait for drain if needed
      const writeSuccess = this.ffmpegStdin.write(buffer);

      if (!writeSuccess) {
        // Wait for drain event if buffer is full
        await new Promise((resolve) => {
          this.ffmpegStdin.once('drain', resolve);
        });
      }

      console.log(`Frame ${frameNumber} written successfully`);
      this.expectedFrameNumber++;
      return true;
    } catch (error) {
      console.error(`Error writing frame ${frameNumber}:`, error);
      return false;
    }
  }

  async stop(data) {
    console.log('Stopping export...');

    return new Promise((resolve) => {
      if (this.ffmpegStdin) {
        // Properly close the input stream
        this.ffmpegStdin.end();

        // Wait for FFmpeg to finish processing
        this.ffmpegProc.on('close', (code) => {
          console.log(`Export finished with code: ${code}`);
          resolve({
            success: code === 0,
            outputPath: this.outputPath,
            totalFrames: data?.totalFrames || 0
          });
        });
      } else {
        resolve({ success: false });
      }
    });
  }

  cancel() {
    console.log('Cancelling export...');
    if (this.ffmpegProc) {
      this.ffmpegProc.kill('SIGTERM');
      // Force kill if it doesn't respond
      setTimeout(() => {
        if (this.ffmpegProc && !this.ffmpegProc.killed) {
          this.ffmpegProc.kill('SIGKILL');
        }
      }, 3000);
    }
    this.isReady = false;
  }
}
