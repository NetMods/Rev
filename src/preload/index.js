import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // health check
  ping: (...args) => ipcRenderer.send('ping', ...args),

  // api for video recording
  startVideoRecording: () => ipcRenderer.send('video-record:start'),
  stopVideoRecording: (arrayBuffer) => ipcRenderer.send('video-record:stop', arrayBuffer),

  // api for mouse tracking
  startMouseTracking: (...args) => ipcRenderer.send('mouse-track:start', ...args),
  stopMouseTracking: (...args) => ipcRenderer.invoke('mouse-track:stop', ...args),

  // api for anotate Screen
  startAnotatingScreen: (...args) => ipcRenderer.send('anotate:start', ...args),
  stopAnotatingScreen: (...args) => ipcRenderer.send('anotate:stop', ...args),

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
