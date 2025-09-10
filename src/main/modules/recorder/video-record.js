import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, moveSync, rmSync } from 'fs-extra';
import log from 'electron-log/main';
import { spawnScreenCapture, spawnWebcamCapture, mergeVideoClips, gracefullyStopProcess } from './ffmpeg';

export class RecordingSession {
  constructor(projectId, opts, core) {
    this.projectId = projectId;
    this.core = core;
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

    const ffmpegPath = await this.core.paths.getFFmpegPath();
    this.currentProcess = spawnScreenCapture(ffmpegPath, outputPath, this.opts);
    log.verbose(`Started new clip: clip${this.clipIndex}.mkv`);

    if (this.opts.videoDevice) {
      const webcamOutputPath = join(this.tempDirectory, `webcam${this.clipIndex}.mkv`);
      this.webcamClipPaths.push(webcamOutputPath);
      this.currentWebcamProcess = spawnWebcamCapture(ffmpegPath, webcamOutputPath, this.opts);
      log.verbose(`Started new webcam clip: webcam_clip${this.clipIndex}.mkv`);
    }
  }

  async start() {
    await this._startNewClip();
  }

  async pause() {
    if (!this.currentProcess || this.isPaused) return;

    await gracefullyStopProcess(this.currentProcess);
    this.currentProcess = null;

    if (this.opts.videoDevice && this.currentWebcamProcess) {
      await gracefullyStopProcess(this.currentWebcamProcess);
      this.currentWebcamProcess = null;
    }

    this.isPaused = true;
    log.info('Recording paused.');
  }

  async resume() {
    if (!this.isPaused) return;

    await this._startNewClip();
    this.isPaused = false;
    log.info('Recording resumed.');
  }

  async stop() {
    log.info('Stopping recording session...');
    if (this.currentProcess) {
      await gracefullyStopProcess(this.currentProcess);
      this.currentProcess = null;
    }
    if (this.opts.videoDevice && this.currentWebcamProcess) {
      await gracefullyStopProcess(this.currentWebcamProcess);
      this.currentWebcamProcess = null;
    }

    const projectsDirectory = this.core.paths.projectsDirectory;
    const ffmpegPath = await this.core.paths.getFFmpegPath();

    // Merge screen clips
    const screenVideoName = 'screen.mkv'
    const finalScreenPath = join(projectsDirectory, this.projectId, screenVideoName);

    const screenOutputPath = await mergeVideoClips(ffmpegPath, this.clipPaths, this.tempDirectory, screenVideoName);

    moveSync(screenOutputPath, finalScreenPath, { overwrite: true });
    log.info(`Final screen video saved to: ${finalScreenPath}`);

    let finalWebcamPath = null;
    const webcamVideoName = 'webcam.mkv';
    if (this.opts.videoDevice && this.webcamClipPaths.length > 0) {
      finalWebcamPath = join(projectsDirectory, this.projectId, webcamVideoName);

      const webcamOutputPath = await mergeVideoClips(ffmpegPath, this.webcamClipPaths, this.tempDirectory, webcamVideoName);

      moveSync(webcamOutputPath, finalWebcamPath, { overwrite: true });
      log.info(`Final webcam video saved to: ${finalWebcamPath}`);
    }

    return this.opts.videoDevice ? { screen: finalScreenPath, webcam: finalWebcamPath } : finalScreenPath;
  }

  cleanup() {
    if (this.currentProcess && this.currentProcess.exitCode === null) {
      log.info(`Killing the current running ffmpeg process`);
      this.currentProcess.kill('SIGKILL');
    }
    if (this.opts.videoDevice && this.currentWebcamProcess && this.currentWebcamProcess.exitCode === null) {
      log.info(`Killing the current running webcam ffmpeg process`);
      this.currentWebcamProcess.kill('SIGKILL');
    }
    log.info(`Cleaning up temp directory: ${this.tempDirectory}`);
    rmSync(this.tempDirectory, { recursive: true, force: true });
  }
}
