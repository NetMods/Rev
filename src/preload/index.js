import { contextBridge, ipcRenderer } from 'electron'

const api = {
  ping: (...args) => ipcRenderer.invoke('ping', ...args),

  startRecording: () => ipcRenderer.invoke('record:start'),
  stopRecording: (arrayBuffer) => ipcRenderer.invoke('record:stop', arrayBuffer),
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
