import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, moveSync, rmSync } from 'fs-extra';
import log from 'electron-log/main';
import { spawnScreenCapture, spawnWebcamCapture, mergeVideoClips, gracefullyStopProcess, extractAudio } from './ffmpeg';
import { existsSync } from 'fs';

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
      const ffmpegPath = await this.core.paths.getFFmpegPath();
      this.currentProcess = await spawnScreenCapture(ffmpegPath, outputPath, this.opts, this.core);
      log.verbose(`Started new clip: clip${this.clipIndex}.mkv`);

      if (this.opts.videoDevice !== null) {
        const webcamOutputPath = join(this.tempDirectory, `webcam${this.clipIndex}.mkv`);
        this.webcamClipPaths.push(webcamOutputPath);
        this.currentWebcamProcess = spawnWebcamCapture(ffmpegPath, webcamOutputPath, this.opts);
        log.verbose(`Started new webcam clip: webcam${this.clipIndex}.mkv`);
      }

      this.updateState({ status: 'clip-started', clipIndex: this.clipIndex });
    } catch (error) {
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
      await gracefullyStopProcess(this.currentProcess);
      this.currentProcess = null;

      if (this.opts.videoDevice !== null && this.currentWebcamProcess) {
        await gracefullyStopProcess(this.currentWebcamProcess);
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
      await gracefullyStopProcess(this.currentProcess);
      this.currentProcess = null;
    }
    if (this.opts.videoDevice !== null && this.currentWebcamProcess) {
      await gracefullyStopProcess(this.currentWebcamProcess);
      this.currentWebcamProcess = null;
    }

    this.updateState({ status: 'progress', message: 'Processing video files...' });

    const projectsDirectory = this.core.paths.projectsDirectory;
    const ffmpegPath = await this.core.paths.getFFmpegPath();

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
      const screenOutputPath = await mergeVideoClips(ffmpegPath, this.clipPaths, this.tempDirectory, screenVideoName);

      if (existsSync(screenOutputPath)) {
        moveSync(screenOutputPath, finalScreenPath, { overwrite: true });
        returnedPaths.videoPath = finalScreenPath;
        log.info(`Final screen video saved to: ${finalScreenPath}`);

        this.updateState({ status: 'progress', message: 'Extracting audio...' });
        const audioName = 'audio.aac';
        const finalAudioPath = join(projectsDirectory, this.projectId, audioName);
        try {
          await extractAudio(ffmpegPath, finalScreenPath, finalAudioPath);
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
        const webcamOutputPath = await mergeVideoClips(ffmpegPath, this.webcamClipPaths, this.tempDirectory, webcamVideoName);

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

  cleanup() {
    if (this.currentProcess && this.currentProcess.exitCode === null) {
      log.info(`Killing the current running ffmpeg process`);
      this.currentProcess.kill('SIGKILL');
    }
    if (this.opts.videoDevice !== null && this.currentWebcamProcess && this.currentWebcamProcess.exitCode === null) {
      log.info(`Killing the current running webcam ffmpeg process`);
      this.currentWebcamProcess.kill('SIGKILL');
    }
    log.info(`Cleaning up temp directory: ${this.tempDirectory}`);
    rmSync(this.tempDirectory, { recursive: true, force: true });
  }
}
