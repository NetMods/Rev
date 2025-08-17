import log from 'electron-log/main';
import { setupVideoRecording, saveVideoRecording } from './video-record';
import { startMouseTracking, stopMouseTracking } from './mouse-record';

export default {
  name: 'recording',

  init(core) {
    this.core = core;
    log.info('Recording module initialized');
  },

  async startRecording() {
    const mainWindow = this.core.window.getMainWindow();
    setupVideoRecording(mainWindow);

    // const width = 50, height = 291
    // // macOS: setting the resize again false as useSystemPicker is set false which cause native OS to mess things a bit
    // setTimeout(() => {
    //   if (mainWindow) {
    //     mainWindow.setResizable(false);
    //     mainWindow.setSize(width, height)
    //   }
    // }, 100)

    startMouseTracking();
  },

  async stopRecording(arrayBuffer) {
    const mouseData = stopMouseTracking();
    await saveVideoRecording(arrayBuffer);

    const data = {
      arrayBuffer,
      mouseClickRecords: mouseData.mouseClickRecords,
      timestamp: new Date().toISOString(),
    }
    // Call project module to save data
    const projectId = await this.core.modules.project.createProject(data);

    // Open editor
    this.core.modules.editor.createEditor({ projectId });
    return projectId;
  },

  getIPCHandlers() {
    return {
      'recording:setup': () => this.startRecording(),
      'recording:save': (_, arrayBuffer) => this.stopRecording(arrayBuffer),
      'mouse-track:start': () => startMouseTracking(),
      'mouse-track:stop': async () => stopMouseTracking(),
    };
  }
};
