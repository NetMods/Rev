import { contextBridge, ipcRenderer } from 'electron'

const api = {
  ping: (...args) => ipcRenderer.invoke('ping', ...args),

  // api for recording
  startRecording: () => ipcRenderer.invoke('record:start'),
  stopRecording: (arrayBuffer) => ipcRenderer.invoke('record:stop', arrayBuffer),


  // api for recording mouse
  recordMouse: (...args) => ipcRenderer.send('record:mouse', ...args),
  stopRecordingMouse: (...args) => ipcRenderer.send('record:mouse.stop', ...args),
  saveMouseRecords: (...args) => ipcRenderer.invoke('save:mouseRecord', ...args),


  closeApp: (...args) => ipcRenderer.send('close:app', ...args)
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
