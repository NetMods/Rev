import log from 'electron-log/main';
import { annotateScreen, stopAnnotating, updateAnnotationConfig } from './annotate-screen';

export default {
  name: 'annotation',

  init(core) {
    this.core = core;
    this.annotationWindows = null;
    log.info('Annotation module initialized');
  },

  async startAnnotate() {
    this.annotationWindows = await annotateScreen(this.core);
  },

  stopAnnotate() {
    stopAnnotating(this.core.window.getMainWindow(), this.annotationWindows);
    this.annotationWindows = null;
  },

  getIPCHandlers() {
    return {
      'annotation:start': async () => this.startAnnotate(),
      'annotation:stop': () => this.stopAnnotate(),
      'annotation-config:update': async (_, ...args) => updateAnnotationConfig(...args, this.annotationWindows.annotationBackground)
    };
  }
};
