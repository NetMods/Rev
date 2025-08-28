import log from 'electron-log/main';
import { setupVideoRecording } from './video-record';
import { MouseTracker } from './mouse-record';

export default {
  name: 'recording',

  init(core) {
    this.core = core;
    this.mouseTracker = new MouseTracker()
    log.info('Recording module initialized');
  },

  async startRecording() {
    const mainWindow = this.core.window.getMainWindow();
    setupVideoRecording(mainWindow);
    this.mouseTracker.start();
  },

  async stopRecording(arrayBuffer, extension) {
    const { clicks, drags } = this.mouseTracker.stop()

    const data = {
      arrayBuffer,
      mouseClickRecords: clicks,
      mouseDragRecords: drags,
      timestamp: new Date().toISOString(),
      extension
    }

    // Call project module to save data
    const projectId = await this.core.modules.project.createProject(data);

    // Open editor
    this.core.modules.editor.createEditor({ projectId });
  },

  getIPCHandlers() {
    return {
      'recording:setup': () => this.startRecording(),
      'recording:stop': async (_, ...args) => this.stopRecording(...args),
    };
  }
};
