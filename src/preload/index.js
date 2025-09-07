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

  core: {
    closeWindow: () => ipcRenderer.send('window:close'),
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    toggleMaximizeWindow: () => ipcRenderer.send('window:maximize')
  },
});
