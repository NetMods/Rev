import log from 'electron-log/main';
import { ExportingSession } from './export';

export default {
  name: 'export',

  init(core) {
    this.core = core;
    this.session = new ExportingSession()
    log.info('Export module initialized');
  },

  getIPCHandlers() {
    return {
      "export:start": async (_, data) => {
        return await this.session.start(data, this.core);
      },
      "export:pushFrame": async (_, data) => {
        return await this.session.pushFrame(data);
      },
      "export:stop": async (_, data) => {
        return await this.session.stop(data);
      },
      "export:cancel": () => {
        this.session.cancel();
      }
    };
  }
};
