import log from 'electron-log/main';
import { createProjectWithData, getProjectFromId, updateProjectData, updateProjectEffects } from './project';

export default {
  name: 'project',

  init(core) {
    this.core = core;
    log.info('Project module initialized');
  },

  async createProject(data) {
    return createProjectWithData(data, this.core)
  },

  async getProject(id) {
    return getProjectFromId(id, this.core);
  },

  async updateProject(id, data) {
    return updateProjectData(id, data, this.core);
  },

  async updateEffects(id, effects) {
    return updateProjectEffects(id, effects, this.core);
  },

  getIPCHandlers() {
    return {
      'project:create': async (_, data) => this.createProject(data),
      'project:get': async (_, id) => this.getProject(id),
      'project:updateEffects': async (_, id, data) => this.updateEffects(id, data),
    };
  }
};
