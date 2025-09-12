import log from 'electron-log/main';

export default {
  name: 'export',

  init(core) {
    this.core = core;
    log.info('Export module initialized');
  },


  getIPCHandlers() {
    return {
      "export:start": (_, data) => { console.log(data) },
    };
  }
};

