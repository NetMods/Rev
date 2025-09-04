import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, moveSync, rmSync } from 'fs-extra';
import log from 'electron-log/main';
import { spawnScreenCapture, mergeVideoClips, gracefullyStopProcess } from './ffmpeg';

export class RecordingSession {
  constructor(projectId, core) {
    this.projectId = projectId;
    this.core = core;
    this.tempDirectory = join(tmpdir(), core.paths.applicationName, projectId);
    this.clipIndex = 0;
    this.clipPaths = [];
    this.currentProcess = null;
    this.isPaused = false;

    mkdirSync(this.tempDirectory, { recursive: true });
    log.info(`Recording session started for project ${projectId}. Temp dir: ${this.tempDirectory}`);
  }

  async _startNewClip() {
    this.clipIndex += 1;
    const outputPath = join(this.tempDirectory, `clip${this.clipIndex}.mkv`);
    this.clipPaths.push(outputPath);

    const ffmpegPath = await this.core.paths.getFFmpegPath();
    this.currentProcess = spawnScreenCapture(ffmpegPath, outputPath);
    log.verbose(`Started new clip: clip${this.clipIndex}.mkv`);
  }

  async start() {
    await this._startNewClip();
    this.isPaused = false;
  }

  async pause() {
    if (!this.currentProcess || this.isPaused) return;

    await gracefullyStopProcess(this.currentProcess);
    this.currentProcess = null;
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

    const ffmpegPath = await this.core.paths.getFFmpegPath();
    const { outputPath, videoName } = await mergeVideoClips(ffmpegPath, this.clipPaths, this.tempDirectory);

    const projectsDirectory = this.core.paths.projectsDirectory;
    const finalPath = join(projectsDirectory, this.projectId, videoName);
    moveSync(outputPath, finalPath, { overwrite: true });

    log.info(`Final video saved to: ${finalPath}`);
    return finalPath;
  }

  cleanup() {
    if (this.currentProcess && this.currentProcess.exitCode === null) {
      log.info(`Killing the current running ffmpeg process`);
      this.currentProcess.kill('SIGKILL');
    }
    log.info(`Cleaning up temp directory: ${this.tempDirectory}`);
    rmSync(this.tempDirectory, { recursive: true, force: true });
  }
}
