import log from 'electron-log/main';
import { createScreenshotWindow } from './screenshot';
import { copyImageUrl, downloadImageUrl } from './utils';

export default {
  name: 'screenshot',

  init(core) {
    this.core = core;
    log.info('Screenshot module initialized');
  },

  async createScreenshot(data) {
    return createScreenshotWindow(data, this.core)
  },

  copyImage(dataUrl) {
    return copyImageUrl(dataUrl)
  },

  downloadImage(...args) {
    return downloadImageUrl(...args)
  },

  getIPCHandlers() {
    return {
      "screenshot:create-window": (_, data) => this.createScreenshot(data),
      "screenshot:copy": async (_, dataUrl) => this.copyImage(dataUrl),
      "screenshot:download": async (_, ...args) => this.downloadImage(...args)
    };
  }
};

