import log from 'electron-log/main';
import { createEditorWindow } from './editor';
import { createZoomAndPanEffects } from "./effects"

export default {
  name: 'editor',

  init(core) {
    this.core = core;
    log.info('Editor module initialized');
  },

  async createEditor(data) {
    return createEditorWindow(data, this.core);
  },

  createEffects(mouseClicks, mouseDrags) {
    return createZoomAndPanEffects(mouseClicks, mouseDrags)
  },

  getIPCHandlers() {
    return {
      'editor:create': (_, data) => this.createEditor(data),
    };
  }
};
