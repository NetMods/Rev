import log from 'electron-log/main';
import { createScreenshotWindow, createAreaSelectionWindow } from './screenshot';
import { copyImageUrl, downloadImageUrl, backgroundImagePath, getUsersPreset, updateUserPreset } from './utils';

export default {
  name: 'screenshot',

  init(core) {
    this.core = core;
    log.info('Screenshot module initialized');
    this.imageData = null
  },

  async createScreenshot(data) {
    return createScreenshotWindow(data, this.core, this.imageData)
  },

  async getimageData() {
    return this.imageData
  },

  async createSelectableWindow(data) {
    const { imageData } = await createAreaSelectionWindow(this.core, data)
    this.imageData = imageData
  },


  getIPCHandlers() {
    return {
      "screenshot:create-window": (_, data) => this.createScreenshot(data),
      'screenshot:area': (_, data) => this.createSelectableWindow(data),
      "screenshot:copy": async (_, dataUrl) => copyImageUrl(dataUrl),
      "screenshot:download": async (_, ...args) => downloadImageUrl(...args),
      "screenshot:backgroundimage-data": async (_, ...args) => backgroundImagePath(...args),
      "screenshot:get-preset": async (_, ...args) => getUsersPreset(...args),
      "screenshot:set-preset": async (_, ...args) => updateUserPreset(...args),
      "screenshot:get-image": async (_, ...args) => this.getimageData(...args),
    };
  }
};

