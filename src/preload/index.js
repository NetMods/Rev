import { contextBridge, ipcRenderer } from 'electron'

const api = {
  ping: (...args) => ipcRenderer.invoke('ping', ...args),
  closeApp: (...args) => ipcRenderer.send('close-app', ...args)
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
