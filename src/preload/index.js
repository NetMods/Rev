import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  recording: {
    start: () => ipcRenderer.send('recording:setup'),
    stop: (...args) => ipcRenderer.invoke('recording:stop', ...args),
  },

  annotation: {
    start: () => ipcRenderer.invoke('annotation:start'),
    stop: () => ipcRenderer.send('annotation:stop'),
    clear: () => ipcRenderer.send("annotation:clear"),
    onClear: (cb) => ipcRenderer.on("annotation:onClear", (_, data) => cb(data)),
    setConfig: (...args) => ipcRenderer.on('annotation-config:set', ...args),
    updateConfig: (...args) => ipcRenderer.invoke('annotation-config:update', ...args),
    getConfig: (...args) => ipcRenderer.invoke('annotation-config:get', ...args),
  },


  project: {
    create: (...args) => ipcRenderer.invoke('project:create', ...args),
    get: (...args) => ipcRenderer.invoke('project:get', ...args),
  },

  editor: {
    create: (...args) => ipcRenderer.send('editor:create', ...args),
  },

  screenshot: {
    create: (...args) => ipcRenderer.send('screenshot:create-window', ...args),
    show: (callback) => ipcRenderer.on("screenshot:image-data", (_, data) => callback(data))
  },

  core: {
    closeWindow: () => ipcRenderer.send('window:close'),
  },
});
