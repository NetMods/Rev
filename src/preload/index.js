import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // health check
  ping: (...args) => ipcRenderer.send('ping', ...args),

  // api for video recording
  setupVideoRecording: () => ipcRenderer.send('video-record:setup'),
  saveVideoRecording: (...args) => ipcRenderer.send('video-record:save', ...args),

  // api for mouse tracking
  startMouseTracking: (...args) => ipcRenderer.send('mouse-track:start', ...args),
  stopMouseTracking: (...args) => ipcRenderer.invoke('mouse-track:stop', ...args),

  // api for editor window
  createEditorWindow: (...args) => ipcRenderer.send('editor-window:create', ...args),
  getProjectVideoBlob: (...args) => ipcRenderer.invoke('editor:get-video-blob', ...args),

  // api for project
  createProjectWithData: (...args) => ipcRenderer.invoke('project:create', ...args),

  // api for anotate Screen
  startAnotatingScreen: (...args) => ipcRenderer.send('anotate:start', ...args),
  stopAnotatingScreen: (...args) => ipcRenderer.send('anotate:stop', ...args),
  setAnnotationStyle: (cb) => ipcRenderer.on('set:anotationstyle', cb),
  updateAnnotaionStyle: (...args) => ipcRenderer.invoke('update:anotationstyle', ...args),

  openDrawer: (...args) => ipcRenderer.send('openDrawer', ...args),
  closeDrawer: (...args) => ipcRenderer.send('closeDrawer', ...args),

  // close
  closeWindow: (...args) => ipcRenderer.send('window:close', ...args),
  closeApp: (...args) => ipcRenderer.send('app:close', ...args)
}

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled in the browser window')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
}
