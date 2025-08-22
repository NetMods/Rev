import log from 'electron-log/main';
import { createProjectWithData, getProjectFromId } from './project';

export default {
  name: 'project',

  init(core) {
    this.core = core;
    log.info('Project module initialized');
  },

  async createProject(data) {
    return createProjectWithData(data, this.core);
  },

  async getProject(id) {
    return getProjectFromId(id, this.core);
  },

  getIPCHandlers() {
    return {
      'project:create': async (_, data) => this.createProject(data),
      'project:get': async (_, id) => this.getProject(id),
    };
  }
};
