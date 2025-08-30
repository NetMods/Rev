import log from 'electron-log/main'
import { annotateScreen, stopAnnotating, updateAnnotationConfig } from './annotate-screen'

const DEFAULT_CONFIG = {
  color: '#FF3B30',
  size: 6,
  freeze: true,
  freezeTime: 0,
  tool: 'pen'
}

export default {
  name: 'annotation',

  init(core) {
    this.core = core
    this.annotationWindows = null
    this.config = { ...DEFAULT_CONFIG }
    log.info('Annotation module initialized')
  },

  async startAnnotate() {
    this.annotationWindows = await annotateScreen(this.core)
  },

  stopAnnotate() {
    stopAnnotating(this.core.window.getMainWindow(), this.annotationWindows)
    this.annotationWindows = null
  },

  getAnnoationConfig() {
    return this.config
  },

  clearAnnotation() {
    const backgroundWindow = this.annotationWindows.annotationBackground
    backgroundWindow.webContents.send("annotation:onClear", { status: 200 })
  },

  getIPCHandlers() {
    return {
      'annotation:start': async () => this.startAnnotate(),
      'annotation:stop': () => this.stopAnnotate(),
      'annotation:clear': () => this.clearAnnotation(),
      'annotation-config:update': async (_, ...args) => {
        const [partialConfig] = args
        this.config = {
          ...partialConfig,
          ...Object.fromEntries(Object.entries(partialConfig).filter(([, v]) => v != null))
        }
        updateAnnotationConfig(...args, this.annotationWindows.annotationBackground)
      },
      'annotation-config:get': async () => this.getAnnoationConfig()
    }
  }
}
