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
    this.mouseTracker = new MouseTracker();
    this.session = null;

    this._cleanupIncompleteProjects();

    app.on('before-quit', this.handleBeforeQuit.bind(this));

    log.info('Recording module initialized');
  },

  async startRecording(opts) {
    if (this.session) {
      throw new Error('Recording is already in progress.');
    }

    try {
      const mainWindow = this.core.window.getMainWindow();
      this.mouseTracker.start(mainWindow);

      const currentProjectId = await this.core.modules.project.createProject();

      this.session = new RecordingSession(currentProjectId, opts, this.core);
      await this.session.start();

      log.verbose('Recording started successfully.');
    } catch (error) {
      log.error('Failed to start recording:', error);
      this.session?.cleanup();
      this.session = null;
      throw error;
    }
  },

  async pauseRecording() {
    if (!this.session || this.session.isPaused) {
      log.warn('No active recording to pause or it is already paused.');
      return;
    }
    await this.session.pause();
    this.mouseTracker.pause();
  },

  async resumeRecording() {
    if (!this.session || !this.session.isPaused) {
      log.warn('No paused recording to resume.');
      return;
    }
    await this.session.resume();
    this.mouseTracker.resume();
  },

  async stopRecording() {
    if (!this.session) {
      log.warn('No active recording to stop.');
      return;
    }

    try {
      const { clicks, drags } = this.mouseTracker.stop();
      let data = {
        status: 'completed',
        mouseClickRecords: clicks,
        mouseDragRecords: drags,
        finishedAt: new Date().toISOString(),
      }

      const videoPath = await this.session.stop();

      if (typeof videoPath === 'string') {
        data['videoPath'] = `app://${videoPath}`
      } else {
        data['videoPath'] = `app://${videoPath.screen}`
        data['webcamPath'] = `app://${videoPath.webcam}`
      }

      const { projectId } = this.session;

      await this.core.modules.project.updateProject(projectId, data, this.core);

      this.core.modules.editor.createEditor({ projectId });

      log.info('Recording stopped and project data saved.');
    } catch (error) {
      log.error('An error occurred while stopping the recording:', error);
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
    } catch (error) {
      log.error('Error stopping recording on app quit:', error);
    }
  },

  _cleanupIncompleteProjects() {
    log.info('Scanning for incomplete projects to clean up...');
    try {
      const projectsDirectory = this.core.paths.projectsDirectory;

      // Exit if the projects directory doesn't exist yet
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
      'recording:start': async (_, ...args) => this.startRecording(...args),
      'recording:pause': async (_, ...args) => this.pauseRecording(...args),
      'recording:resume': async (_, ...args) => this.resumeRecording(...args),
      'recording:stop': async (_, ...args) => this.stopRecording(...args)
    };
  },
};
