import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export class ExportingSession {
  constructor(core) {
    this.reset();
    this.core = core
  }

  reset() {
    this.ffmpegProc = null;
    this.isReady = false;
    this.frameQueue = [];
    this.processing = false;
    this.expectedFrameNumber = 0;
    this.isExporting = false;
    this.tempVideoPath = null;
    this.finalOutputPath = null;
    this.audioPath = null;
    this.framesDir = null;
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

  async _checkAudioExists(audioPath) {
    try {
      await fs.access(audioPath);
      const stats = await fs.stat(audioPath);
      return stats.size > 0;
    } catch {
      return false;
    }
  }

  async start(opts) {
    this.reset();

    const fileName = `rev-${Date.now()}.${opts.format}`;
    this.finalOutputPath = await this._getOutputPath(fileName);

    const tempFileName = `temp_${Date.now()}.mp4`;
    this.tempVideoPath = path.join(os.tmpdir(), tempFileName);

    const framesDirName = `frames_${Date.now()}`;
    this.framesDir = path.join(os.tmpdir(), framesDirName);
    await fs.mkdir(this.framesDir, { recursive: true });

    console.log(`Starting export - frames dir: ${this.framesDir}, temp video: ${this.tempVideoPath}, final: ${this.finalOutputPath}`);

    const { width, height, fps, projectId, audioPath } = opts;
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.format = path.extname(this.finalOutputPath).substring(1);
    this.audioPath = audioPath.slice(6)
    this.projectId = projectId;
    this.expectedFrameNumber = 0;
    this.frameQueue = [];
    this.processing = false;
    this.isExporting = true;

    const hasAudio = await this._checkAudioExists(this.audioPath);
    console.log(`Audio file ${hasAudio ? 'found' : 'not found'} at: ${this.audioPath}`);

    this.hasAudio = hasAudio;
    this.isReady = true;

    return true;
  }

  async pushFrame(obj) {
    const { frameNumber, data } = obj;

    if (!data || !this.isExporting || !this.isReady) {
      console.log(`Frame ${frameNumber} rejected - not ready or not exporting`);
      return false;
    }

    try {
      const framePath = path.join(this.framesDir, `frame_${frameNumber.toString().padStart(6, '0')}.png`);
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await fs.writeFile(framePath, buffer);

      console.log(`Frame ${frameNumber} saved successfully`);
      this.expectedFrameNumber++;
      return true;
    } catch (error) {
      console.error(`Error saving frame ${frameNumber}:`, error);
      return false;
    }
  }

  async _muxWithAudio() {
    if (!this.hasAudio) {
      console.log('No audio to mux, moving temp video to final location');
      await fs.copyFile(this.tempVideoPath, this.finalOutputPath);
      await this._cleanupTempVideo();
      return { success: true };
    }

    console.log('Starting audio muxing process...');
    const ffmpegpath = await this.core.paths.getFFmpegPath();

    return new Promise((resolve) => {
      const muxProc = spawn(ffmpegpath, [
        '-y', // Overwrite output file
        '-i', this.tempVideoPath, // Video input
        '-i', this.audioPath, // Audio input
        '-c:v', 'copy', // Copy video stream (no re-encoding)
        '-c:a', 'aac', // Audio codec
        '-map', '0:v:0', // Map first video stream
        '-map', '1:a:0', // Map first audio stream
        '-shortest', // End when shortest stream ends
        this.finalOutputPath
      ]);

      muxProc.stderr.on('data', (data) => {
        console.log('FFmpeg mux output:', data.toString());
      });

      muxProc.on('close', async (code) => {
        console.log(`Audio muxing finished with code: ${code}`);
        if (code === 0) {
          await this._cleanupTempVideo();
        }
        resolve({
          success: code === 0,
          hasMuxedAudio: this.hasAudio
        });
      });

      muxProc.on('error', async (error) => {
        console.error('Audio muxing error:', error);

        try {
          await fs.copyFile(this.tempVideoPath, this.finalOutputPath);
          console.log('Saved video without audio due to muxing error');
          await this._cleanupTempVideo();
        } catch (moveError) {
          console.error('Failed to save video after mux error:', moveError);
        }

        resolve({
          success: false,
          error: error.message
        });
      });
    });
  }

  async _createVideoFromFrames() {
    console.log('Creating video from frames...');
    const ffmpegpath = await this.core.paths.getFFmpegPath();

    return new Promise((resolve, reject) => {
      try {
        this.ffmpegProc = spawn(ffmpegpath, [
          '-y', // Overwrite output file
          '-framerate', String(this.fps),
          '-i', path.join(this.framesDir, 'frame_%06d.png'), // Input pattern
          '-c:v', 'libx264', // Video codec
          '-crf', '18', // Quality (lower = better quality)
          '-preset', 'medium', // Performance vs quality balance
          '-tune', 'stillimage', // Better for frame-by-frame input
          '-pix_fmt', 'yuv420p', // Better compatibility
          '-fflags', '+genpts', // Generate presentation timestamps
          '-r', String(this.fps), // Output framerate
          this.tempVideoPath, // Export to temp location
        ]);

        this.ffmpegProc.stderr.on('data', (data) => {
          console.log('FFmpeg video creation output:', data.toString());
        });

        this.ffmpegProc.on('close', (code) => {
          console.log(`FFmpeg video creation closed with code: ${code}`);
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(`FFmpeg video creation failed with code: ${code}`));
          }
        });

        this.ffmpegProc.on('error', (error) => {
          console.error('FFmpeg video creation error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error starting FFmpeg for video creation:', error);
        reject(error);
      }
    });
  }

  async stop(data) {
    console.log('Stopping export...');
    this.isExporting = false;
    this.isReady = false;

    try {
      await this._createVideoFromFrames();
      await this._cleanupFrames();
      const muxResult = await this._muxWithAudio();
      return {
        success: muxResult.success,
        outputPath: this.finalOutputPath,
        totalFrames: data?.totalFrames || 0,
        hasAudio: this.hasAudio,
        hasMuxedAudio: muxResult.hasMuxedAudio
      };
    } catch (error) {
      console.error('Error during video creation or muxing:', error);
      await this._cleanupFrames();
      await this._cleanupTempVideo();
      return {
        success: false,
        outputPath: this.finalOutputPath,
        totalFrames: data?.totalFrames || 0,
        error: error.message
      };
    }
  }

  cancel() {
    console.log('Cancelling export...');
    this.isExporting = false;
    this.isReady = false;

    if (this.ffmpegProc && !this.ffmpegProc.killed) {
      this.ffmpegProc.kill('SIGTERM');
      // Force kill if it doesn't respond
      setTimeout(() => {
        if (this.ffmpegProc && !this.ffmpegProc.killed) {
          this.ffmpegProc.kill('SIGKILL');
        }
      }, 3000);
    }

    this._cleanupFrames();
    this._cleanupTempVideo();
  }

  async _cleanupFrames() {
    if (this.framesDir) {
      try {
        const files = await fs.readdir(this.framesDir);
        for (const file of files) {
          await fs.unlink(path.join(this.framesDir, file));
        }
        await fs.rmdir(this.framesDir);
        console.log('Cleaned up frames directory');
        this.framesDir = null;
      } catch (error) {
        console.warn('Failed to clean up frames directory:', error);
      }
    }
  }

  async _cleanupTempVideo() {
    if (this.tempVideoPath) {
      try {
        await fs.unlink(this.tempVideoPath);
        console.log('Cleaned up temp video file');
        this.tempVideoPath = null;
      } catch (error) {
        console.warn('Failed to clean up temp video file:', error);
      }
    }
  }
}
