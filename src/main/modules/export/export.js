import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

export class ExportingSession {
  constructor() {
    this.ffmpegProc = null;
    this.ffmpegStdin = null;
    this.tempVideoPath = null;
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
    const fileName = `shikibidi_demo_${Date.now()}.${opts.format}`;
    const finalOutputPath = await this._getOutputPath(fileName);

    // Create temporary file for video-only output
    const tempFileName = `temp_video_${Date.now()}.${opts.format}`;
    this.tempVideoPath = await this._getOutputPath(tempFileName);

    console.log(`Starting export - temp video: ${this.tempVideoPath}`);
    console.log(`Final output will be: ${finalOutputPath}`);

    const ffmpegpath = await core.paths.getFFmpegPath();
    const { width, height, fps, projectId } = opts;

    this.width = width;
    this.height = height;
    this.fps = fps;
    this.outputPath = finalOutputPath;
    this.format = path.extname(this.outputPath).substring(1);
    this.projectId = projectId;
    this.core = core;

    // Store paths for audio muxing
    const projectsDirectory = core.paths.projectsDirectory;
    this.projectDir = path.join(projectsDirectory, projectId);
    this.screenRecordingPath = path.join(this.projectDir, 'screen.mkv');

    // Start FFmpeg process for video-only output (temporary file)
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
      this.tempVideoPath, // Output to temporary file
    ]);

    this.ffmpegStdin = this.ffmpegProc.stdin;

    this.ffmpegProc.stderr.on('data', (data) => {
      console.error('FFmpeg: ', data.toString());
    });

    this.ffmpegProc.on('close', (code) => {
      console.log(`FFmpeg video encoding closed with code: ${code}`);
      if (code === 0) {
        console.log(`✅ Video encoding successful: ${this.tempVideoPath}`);
        // Don't start audio muxing here - wait for explicit stop() call
      } else {
        console.error(`❌ Video encoding failed.`);
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

  async stop() {
    if (this.ffmpegStdin) {
      this.ffmpegStdin.end();
    }

    if (this.ffmpegProc) {
      await new Promise((resolve) => {
        this.ffmpegProc.on('close', resolve);
      });
    }

    await this._muxWithAudio();
  }

  async _muxWithAudio() {
    try {
      await fs.access(this.screenRecordingPath);
      console.log(`Found screen recording: ${this.screenRecordingPath}`);

      const ffmpegPath = await this.core.paths.getFFmpegPath();

      console.log('Starting audio extraction and muxing...');

      const muxProc = spawn(ffmpegPath, [
        '-y',
        '-i', this.tempVideoPath,           // Input: our generated video
        '-i', this.screenRecordingPath,     // Input: screen recording with audio
        '-c:v', 'copy',                     // Copy video stream as-is
        '-c:a', 'aac',                      // Encode audio to AAC
        '-map', '0:v:0',                    // Map video from first input
        '-map', '1:a:0',                    // Map audio from second input
        '-shortest',                        // End when shortest stream ends
        this.outputPath                     // Final output
      ]);

      muxProc.stderr.on('data', (data) => {
        console.error('FFmpeg mux error:', data.toString());
      });

      muxProc.on('close', async (code) => {
        console.log(`FFmpeg mux process closed with code: ${code}`);

        if (code === 0) {
          console.log(`✅ Final export with audio successful: ${this.outputPath}`);

          // Clean up temporary video file
          try {
            await fs.unlink(this.tempVideoPath);
            console.log('🧹 Cleaned up temporary video file');
          } catch (cleanupError) {
            console.warn('Warning: Could not clean up temporary file:', cleanupError.message);
          }
        } else {
          console.error(`❌ Audio muxing failed. Temporary video saved at: ${this.tempVideoPath}`);
        }
      });

    } catch (error) {
      console.warn('Screen recording not found or not accessible:', error.message);
      console.log('Proceeding without audio...');

      // Move temp file to final location if no audio available
      try {
        await fs.rename(this.tempVideoPath, this.outputPath);
        console.log(`✅ Video-only export successful: ${this.outputPath}`);
      } catch (renameError) {
        console.error('Failed to move temporary file:', renameError.message);
      }
    }
  }

  cancel() {
    if (this.ffmpegProc) {
      this.ffmpegProc.kill('SIGINT');
    }

    // Clean up temp file if it exists
    if (this.tempVideoPath) {
      fs.unlink(this.tempVideoPath).catch(() => {
        // Ignore cleanup errors on cancel
      });
    }
  }
}
