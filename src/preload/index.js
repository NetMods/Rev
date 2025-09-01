import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  recording: {
    start: () => ipcRenderer.send('recording:setup'),
    stop: (...args) => ipcRenderer.invoke('recording:save', ...args),
    startMouse: () => ipcRenderer.send('mouse-track:start'),
    stopMouse: () => ipcRenderer.invoke('mouse-track:stop'),
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
  },

  editor: {
    create: (...args) => ipcRenderer.send('editor:create', ...args),
  },

  core: {
    closeWindow: () => ipcRenderer.send('window:close'),
  },
});
