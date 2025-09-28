import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, moveSync, rmSync } from 'fs-extra';
import log from 'electron-log/main';
import { spawnScreenCapture, spawnWebcamCapture, mergeVideoClips, extractAudio } from './ffmpeg';
import { existsSync } from 'fs';
import { showError } from '../../core/error';

export class RecordingSession {
  constructor(projectId, opts, core, updateState) {
    this.projectId = projectId;
    this.core = core;
    this.updateState = updateState
    this.tempDirectory = join(tmpdir(), core.paths.applicationName, projectId);
    this.clipIndex = 0;
    this.clipPaths = [];
    this.webcamClipPaths = [];
    this.currentProcess = null;
    this.currentWebcamProcess = null;
    this.isPaused = false;
    this.opts = opts;

    mkdirSync(this.tempDirectory, { recursive: true });
    log.info(`Recording session started for project ${projectId}. Temp dir: ${this.tempDirectory}`);
  }

  async _startNewClip() {
    this.clipIndex += 1;
    const outputPath = join(this.tempDirectory, `clip${this.clipIndex}.mkv`);
    this.clipPaths.push(outputPath);

    try {
      this.currentProcess = await spawnScreenCapture(outputPath, this.opts, this.core);

      if (this.currentProcess === null) {
        const error = new Error('Screen recording is not supported on this platform or failed to initialize. Please check your system configuration.');
        showError({ error: 'Recording Error', message: error.message });
        throw error;
      }

      log.verbose(`Started new clip: clip${this.clipIndex}.mkv`);

      if (this.opts.videoDevice !== null) {
        const webcamOutputPath = join(this.tempDirectory, `webcam${this.clipIndex}.mkv`);
        this.webcamClipPaths.push(webcamOutputPath);
        this.currentWebcamProcess = await spawnWebcamCapture(webcamOutputPath, this.opts, this.core);

        if (this.currentWebcamProcess === null) {
          log.warn('Webcam capture failed to start, continuing with screen recording only');
          this.webcamClipPaths.pop();
          showError({
            error: 'warning',
            message: 'Webcam recording failed, continuing with screen recording only'
          });
        } else {
          log.verbose(`Started new webcam clip: webcam${this.clipIndex}.mkv (Process ID: ${this.currentWebcamProcess})`);
        }
      }

      this.updateState({ status: 'clip-started', clipIndex: this.clipIndex });
    } catch (error) {
      this.clipPaths.pop();
      this.updateState({ status: 'error', message: 'Failed to start new clip', error: error.message });
      throw error;
    }
  }

  async start() {
    await this._startNewClip();
  }

  async pause() {
    if (!this.currentProcess || this.isPaused) return;

    try {
      await this.core.ffmpegManager.killProcess(this.currentProcess);
      this.currentProcess = null;

      if (this.opts.videoDevice !== null && this.currentWebcamProcess) {
        await this.core.ffmpegManager.killProcess(this.currentWebcamProcess);
        this.currentWebcamProcess = null;
      }

      this.isPaused = true;
      log.info('Recording paused.');
    } catch (error) {
      this.updateState({ status: 'error', message: 'Failed to pause recording', error: error.message });
      throw error;
    }
  }

  async resume() {
    if (!this.isPaused) return;

    try {
      await this._startNewClip();
      this.isPaused = false;
      log.info('Recording resumed.');
    } catch (error) {
      this.updateState({ status: 'error', message: 'Failed to resume recording', error: error.message });
      throw error;
    }
  }

  async stop() {
    log.info('Stopping recording session...');
    this.updateState({ status: 'progress', message: 'Stopping processes...' });

    if (this.currentProcess) {
      await this.core.ffmpegManager.killProcess(this.currentProcess);
      this.currentProcess = null;
    }
    if (this.opts.videoDevice !== null && this.currentWebcamProcess) {
      await this.core.ffmpegManager.killProcess(this.currentWebcamProcess);
      this.currentWebcamProcess = null;
    }

    this.updateState({ status: 'progress', message: 'Processing video files...' });

    const projectsDirectory = this.core.paths.projectsDirectory;

    const returnedPaths = {
      videoPath: null,
      webcamPath: null,
      audioPath: null,
    };

    // Merge screen clips
    const screenVideoName = 'screen.mkv'
    const finalScreenPath = join(projectsDirectory, this.projectId, screenVideoName);

    try {
      this.updateState({ status: 'progress', message: 'Merging screen clips...' });
      const screenOutputPath = await mergeVideoClips(this.clipPaths, this.tempDirectory, screenVideoName, this.core);

      if (existsSync(screenOutputPath)) {
        moveSync(screenOutputPath, finalScreenPath, { overwrite: true });
        returnedPaths.videoPath = finalScreenPath;
        log.info(`Final screen video saved to: ${finalScreenPath}`);

        this.updateState({ status: 'progress', message: 'Extracting audio...' });
        const audioName = 'audio.aac';
        const finalAudioPath = join(projectsDirectory, this.projectId, audioName);
        try {
          await extractAudio(finalScreenPath, finalAudioPath, this.core);
          returnedPaths.audioPath = finalAudioPath;
        } catch (error) {
          log.error('Failed to extract audio from screen recording:', error);
          this.updateState({ status: 'warning', message: 'Audio extraction failed' });
        }
      }
    } catch (error) {
      log.error("Failed to merge screen clips:", error);
      this.updateState({ status: 'error', message: 'Failed to merge screen clips', error: error.message });
    }

    // Process webcam if exists
    if (this.opts.videoDevice !== null && this.webcamClipPaths.length > 0) {
      this.updateState({ status: 'progress', message: 'Processing webcam clips...' });
      const webcamVideoName = 'webcam.mkv';
      const finalWebcamPath = join(projectsDirectory, this.projectId, webcamVideoName);

      try {
        const webcamOutputPath = await mergeVideoClips(this.webcamClipPaths, this.tempDirectory, webcamVideoName, this.core);

        if (existsSync(webcamOutputPath)) {
          moveSync(webcamOutputPath, finalWebcamPath, { overwrite: true });
          returnedPaths.webcamPath = finalWebcamPath;
          log.info(`Final webcam video saved to: ${finalWebcamPath}`);
        }
      } catch (error) {
        log.error("Failed to merge webcam clips:", error);
        this.updateState({ status: 'warning', message: 'Webcam processing failed' });
      }
    }

    this.updateState({ status: 'progress', message: 'Recording completed!' });
    return returnedPaths;
  }

  async cleanup() {
    if (this.currentProcess && this.currentProcess.exitCode === null) {
      log.info(`Killing the current running ffmpeg process`);
      await this.core.ffmpegManager.killProcess(this.currentProcess);
    }
    if (this.opts.videoDevice !== null && this.currentWebcamProcess && this.currentWebcamProcess.exitCode === null) {
      log.info(`Killing the current running webcam ffmpeg process`);
      await this.core.ffmpegManager.killProcess(this.currentWebcamProcess);
    }
    log.info(`Cleaning up temp directory: ${this.tempDirectory}`);
    rmSync(this.tempDirectory, { recursive: true, force: true });
  }
}
