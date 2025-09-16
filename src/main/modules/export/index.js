import log from 'electron-log/main'
import { ExportingSession } from './export'

export default {
  name: 'export',
  session: null,
  core: null,

  init(core) {
    this.core = core
    log.info('Export module initialized')
  },

  async startExport(data) {
    this.session = new ExportingSession()
    return await this.session.start(data, this.core)
  },

  async pushExportFrame(data) {
    if (!this.session) {
      console.error('No active export session')
      return false
    }
    return await this.session.pushFrame(data)
  },

  async stopExport(data) {
    if (!this.session) {
      console.error('No active export session')
      return { success: false }
    }
    const result = await this.session.stop(data)
    this.session = null
    return result
  },

  cancelExport() {
    if (this.session) {
      this.session.cancel()
      this.session = null
    }
  },

  getIPCHandlers() {
    return {
      'export:start': async (_, data) => this.startExport(data),
      'export:pushFrame': async (_, data) => this.pushExportFrame(data),
      'export:stop': async (_, data) => this.stopExport(data),
      'export:cancel': () => this.cancelExport()
    }
  }
}
