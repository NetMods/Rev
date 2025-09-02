import log from 'electron-log/main';
import { createScreenshotWindow } from './screenshot';

export default {
  name: 'screenshot',

  init(core) {
    this.core = core;
    log.info('Screenshot module initialized');
  },

  async createScreenshot(data) {
    return createScreenshotWindow(data, this.core)
  },

  getIPCHandlers() {
    return {
      "screenshot:create": (_, data) => this.createScreenshot(data),
    };
  }
};

