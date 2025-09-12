import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  recording: {
    start: (...args) => ipcRenderer.invoke('recording:start', ...args),
    pause: (...args) => ipcRenderer.invoke('recording:pause', ...args),
    resume: (...args) => ipcRenderer.invoke('recording:resume', ...args),
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
    get: (...args) => ipcRenderer.invoke('project:get', ...args),
  },

  editor: {
    create: (...args) => ipcRenderer.send('editor:create', ...args),
  },

  screenshot: {
    create: (...args) => ipcRenderer.send('screenshot:create-window', ...args),
    show: (callback) => ipcRenderer.on("screenshot:image-data", (_, data) => callback(data)),
    copyImage: (...args) => ipcRenderer.invoke("screenshot:copy", ...args),
    downloadImage: (...args) => ipcRenderer.invoke("screenshot:download", ...args),
  },

  core: {
    getConfig: () => ipcRenderer.invoke('config:get'),
    updateConfig: (...args) => ipcRenderer.invoke('config:update', ...args),
    getIOdevices: (...args) => ipcRenderer.invoke('devices:get', ...args),
    closeWindow: () => ipcRenderer.send('window:close'),
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    toggleMaximizeWindow: () => ipcRenderer.send('window:maximize')
  },

  export: {
    start: (...args) => ipcRenderer.invoke('export:start', ...args),
    pushFrame: (...args) => ipcRenderer.invoke('export:pushFrame', ...args),
    stop: (...args) => ipcRenderer.invoke('export:stop', ...args),
    cancel: () => ipcRenderer.send('export:cancel')
  }
});
