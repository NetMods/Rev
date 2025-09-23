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

  copyImage(dataUrl) {
    return copyImageUrl(dataUrl)
  },

  downloadImage(...args) {
    return downloadImageUrl(...args)
  },

  getBackgroundImagePath(...args) {
    return backgroundImagePath(...args)
  },

  getUserPresets(...args) {
    return getUsersPreset(...args)
  },

  updateUserPresets(...args) {
    return updateUserPreset(...args)
  },

  getIPCHandlers() {
    return {
      "screenshot:create-window": (_, data) => this.createScreenshot(data),
      "screenshot:copy": async (_, dataUrl) => this.copyImage(dataUrl),
      "screenshot:download": async (_, ...args) => this.downloadImage(...args),
      "screenshot:backgroundimage-data": async (_, ...args) => this.getBackgroundImagePath(...args),
      "screenshot:get-preset": async (_, ...args) => this.getUserPresets(...args),
      "screenshot:set-preset": async (_, ...args) => this.updateUserPresets(...args),
    };
  }
};

