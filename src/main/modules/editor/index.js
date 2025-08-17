import log from 'electron-log/main';
import { createEditorWindow } from './editor';

export default {
  name: 'editor',

  init(core) {
    this.core = core;
    log.info('Editor module initialized');
  },

  async createEditor(data) {
    return createEditorWindow(data, this.core);
  },

  getIPCHandlers() {
    return {
      'editor:create': (_, data) => this.createEditor(data),
    };
  }
};
