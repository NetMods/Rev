import log from 'electron-log/main';
import { app } from 'electron';
import { RecordingSession } from './video-record';
import { MouseTracker } from './mouse-record';
import { existsSync, readdirSync, readJsonSync, rmSync } from 'fs-extra';
import { join } from "path"

export default {
  name: 'recording',

  init(core) {
    this.core = core;
    this.currentEvent = null;

    this.recordingState = {
      isRecording: false,
      isPaused: false,
      status: 'idle', // idle, starting, active, paused, stopping, error
      error: null,

      startTime: null,
      elapsedTime: 0,
      pauseStartTime: null,
      totalPausedTime: 0
    };

    this.mouseTracker = new MouseTracker();
    this.session = null;

    this.timer = null;

    this._cleanupIncompleteProjects();
    app.on('before-quit', this.handleBeforeQuit.bind(this));
    log.info('Recording module initialized');
  },

  _broadcastState() {
    this._updateElapsedTime();
    if (this.currentEvent && !this.currentEvent.sender.isDestroyed()) {
      this.currentEvent.sender.send('recording:state', this.recordingState);
    }
  },

  _updateState(updates) {
    this.recordingState = { ...this.recordingState, ...updates };
    this._broadcastState();
  },

  _updateElapsedTime() {
    if (!this.recordingState.isRecording || !this.recordingState.startTime) return;

    const now = Date.now();
    let currentElapsed = this.recordingState.pauseStartTime
      ? (this.recordingState.pauseStartTime - this.recordingState.startTime - this.recordingState.totalPausedTime)
      : (now - this.recordingState.startTime - this.recordingState.totalPausedTime);

    this.recordingState.elapsedTime = Math.floor(currentElapsed / 1000); // in seconds
  },

  getCurrentState(event) {
    this.currentEvent = event;
    this._updateElapsedTime();
    return this.recordingState;
  },

  async startRecording(event, opts) {
    this.currentEvent = event;

    if (this.session) {
      const error = 'Recording is already in progress.';
      this._updateState({ status: 'error', error });
      throw new Error(error);
    }

    let currentProjectId = null;

    try {
      this._updateState({ status: 'starting' });

      const mainWindow = this.core.window.getMainWindow();
      this.mouseTracker.start(mainWindow);

      currentProjectId = await this.core.modules.project.createProject();

      this.session = new RecordingSession(currentProjectId, opts, this.core, this._updateState.bind(this));

      // This is where the session will fail if ffmpeg can't start
      await this.session.start();

      const startTime = Date.now();
      this._updateState({
        isRecording: true,
        isPaused: false,
        status: 'active',
        error: null,
        startTime,
        elapsedTime: 0,
        pauseStartTime: null,
        totalPausedTime: 0
      });

      this.timer = setInterval(() => {
        this._broadcastState();
      }, 1000);

      log.verbose('Recording started successfully.');
    } catch (error) {
      log.error('Failed to start recording:', error);

      if (this.session) {
        try {
          await this.session.cleanup();
        } catch (cleanupError) {
          log.error('Error during session cleanup:', cleanupError);
        }
        this.session = null;
      }

      if (currentProjectId) {
        try {
          await this.core.modules.project.deleteProject(currentProjectId);
          log.info(`Cleaned up failed project: ${currentProjectId}`);
        } catch (projectCleanupError) {
          log.error('Error cleaning up failed project:', projectCleanupError);
        }
      }

      try {
        this.mouseTracker.stop();
      } catch (mouseError) {
        log.error('Error stopping mouse tracker:', mouseError);
      }

      this._updateState({
        status: 'error',
        error: error.message,
        isRecording: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
        pauseStartTime: null,
        totalPausedTime: 0
      });

      throw error;
    }
  },

  async pauseRecording(event) {
    this.currentEvent = event;

    if (!this.session || this.session.isPaused) {
      log.warn('No active recording to pause or it is already paused.');
      return;
    }

    try {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      const now = Date.now();
      this._updateState({ isPaused: true, status: 'paused', pauseStartTime: now });
      await this.session.pause();
      this.mouseTracker.pause();
    } catch (error) {
      log.error('Failed to pause recording:', error);
      this._updateState({
        status: 'error',
        error: error.message,
        isPaused: false,
        pauseStartTime: null
      });
      this.timer = setInterval(() => this._broadcastState(), 1000);
      throw error;
    }
  },

  async resumeRecording(event) {
    this.currentEvent = event;

    if (!this.session || !this.session.isPaused) {
      log.warn('No paused recording to resume.');
      return;
    }

    try {
      await this.session.resume();
      this.mouseTracker.resume();
      const now = Date.now();
      const pausedDuration = now - this.recordingState.pauseStartTime;
      this._updateState({
        isPaused: false,
        status: 'active',
        totalPausedTime: this.recordingState.totalPausedTime + pausedDuration,
        pauseStartTime: null
      });
      this.timer = setInterval(() => this._broadcastState(), 1000);
    } catch (error) {
      log.error('Failed to resume recording:', error);
      this._updateState({ status: 'error', error: error.message });
      throw error;
    }
  },

  async stopRecording(event) {
    this.currentEvent = event;

    if (!this.session) {
      log.warn('No active recording to stop.');
      return;
    }

    try {
      this._updateState({ status: 'stopping' });

      const { clicks, drags } = this.mouseTracker.stop();
      const returnedPaths = await this.session.stop();

      const paths = Object.keys(returnedPaths).reduce((obj, key) => {
        obj[key] = `app://${returnedPaths[key]}`;
        return obj;
      }, {});

      this._updateElapsedTime(); // Final update before saving

      let data = {
        status: 'completed',
        mouseClickRecords: clicks,
        mouseDragRecords: drags,
        finishedAt: new Date(),
        elapsedTime: this.recordingState.elapsedTime,
        ...paths
      }

      const { projectId } = this.session;
      await this.core.modules.project.updateProject(projectId, data, this.core);
      this.core.modules.editor.createEditor({ projectId });

      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this._updateState({
        isRecording: false,
        isPaused: false,
        status: 'idle',
        error: null,
        startTime: null,
        elapsedTime: 0,
        pauseStartTime: null,
        totalPausedTime: 0
      });

      log.info('Recording stopped and project data saved.');
    } catch (error) {
      log.error('An error occurred while stopping the recording:', error);
      this._updateState({ status: 'error', error: error.message });
      throw error;
    } finally {
      this.session?.cleanup();
      this.session = null;
    }
  },

  async handleBeforeQuit() {
    if (!this.session) return;
    log.info('Recording in progress. Stopping gracefully before quit...');

    try {
      await this.session.cleanup();

      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      log.info('Recording cleanup completed before quit');
    } catch (error) {
      log.error('Error stopping recording on app quit:', error);
    }
  },

  _cleanupIncompleteProjects() {
    log.info('Scanning for incomplete projects to clean up...');
    try {
      const projectsDirectory = this.core.paths.projectsDirectory;

      if (!existsSync(projectsDirectory)) {
        log.info('Projects directory does not exist. Skipping cleanup.');
        return;
      }

      const projectFolders = readdirSync(projectsDirectory);

      for (const projectId of projectFolders) {
        const projectPath = join(projectsDirectory, projectId);
        const dataPath = join(projectPath, 'data.json');

        try {
          if (!existsSync(dataPath)) {
            log.warn(`Project ${projectId} is missing data.json. Deleting.`);
            rmSync(projectPath, { recursive: true, force: true });
            continue;
          }

          const projectData = readJsonSync(dataPath);

          if (projectData.status !== 'completed') {
            log.info(`Found incomplete project: ${projectId} (status: ${projectData.status || 'unknown'}). Deleting.`);
            rmSync(projectPath, { recursive: true, force: true });
          }
        } catch (readError) {
          log.error(`Error processing project ${projectId}, it may be corrupt. Deleting.`, readError);
          rmSync(projectPath, { recursive: true, force: true });
        }
      }

      log.info('Project cleanup scan complete.');
    } catch (scanError) {
      log.error('A critical error occurred during project cleanup:', scanError);
    }
  },

  getIPCHandlers() {
    return {
      'recording:start': async (event, ...args) => this.startRecording(event, ...args),
      'recording:pause': async (event, ...args) => this.pauseRecording(event, ...args),
      'recording:resume': async (event, ...args) => this.resumeRecording(event, ...args),
      'recording:stop': async (event, ...args) => this.stopRecording(event, ...args),
      'recording:getState': async (event) => this.getCurrentState(event)
    };
  },
};
