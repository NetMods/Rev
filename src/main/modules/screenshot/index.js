import log from 'electron-log/main';
import { createScreenshotWindow } from './screenshot';
import { copyImageUrl, downloadImageUrl, backgroundImagePath, getUsersPreset, updateUserPreset } from './utils';

export default {
  name: 'screenshot',

  init(core) {
    this.core = core;
    log.info('Screenshot module initialized');
  },

  async createScreenshot(data) {
    log.info("preparing screenshot")
    return createScreenshotWindow(data, this.core)
  },

  getIPCHandlers() {
    return {
      "screenshot:create-window": (_, data) => this.createScreenshot(data),
      "screenshot:copy": async (_, dataUrl) => copyImageUrl(dataUrl),
      "screenshot:download": async (_, ...args) => downloadImageUrl(...args),
      "screenshot:backgroundimage-data": async (_, ...args) => backgroundImagePath(...args),
      "screenshot:get-preset": async (_, ...args) => getUsersPreset(...args),
      "screenshot:set-preset": async (_, ...args) => updateUserPreset(...args),
    };
  }
};

