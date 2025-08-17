import log from 'electron-log/main';

export default {
  name: 'screenshot',

  init(core) {
    this.core = core;
    log.info('Screenshot module initialized');
  },

  getIPCHandlers() {
    return {
    };
  }
};

