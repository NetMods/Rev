import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  recording: {
    start: (...args) => ipcRenderer.invoke('recording:start', ...args),
    pause: (...args) => ipcRenderer.invoke('recording:pause', ...args),
    resume: (...args) => ipcRenderer.invoke('recording:resume', ...args),
    stop: (...args) => ipcRenderer.invoke('recording:stop', ...args),
    getState: (...args) => ipcRenderer.invoke('recording:getState', ...args),

    onStateChange: (callback) => ipcRenderer.on('recording:state', callback),
    onProgress: (callback) => ipcRenderer.on('recording:progress', callback),
    onError: (callback) => ipcRenderer.on('recording:error', callback),
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
    updateEffects: (...args) => ipcRenderer.invoke('project:updateEffects', ...args),
  },

  editor: {
    create: (...args) => ipcRenderer.send('editor:create', ...args),
  },

  screenshot: {
    create: (...args) => ipcRenderer.send('screenshot:create-window', ...args),
    createFromArea: (...args) => ipcRenderer.send('screenshot:selected-area', ...args),
    show: (callback) => ipcRenderer.on("screenshot:image-data", (_, data) => callback(data)),

    openAreaSelection: () => ipcRenderer.send('screenshot:area'),

    copyImage: (...args) => ipcRenderer.invoke("screenshot:copy", ...args),
    downloadImage: (...args) => ipcRenderer.invoke("screenshot:download", ...args),
    getbackgroundImage: (...args) => ipcRenderer.invoke("screenshot:backgroundimage-data", ...args), // currently this API is not working need to make sone changes

    getUserPreset: (...args) => ipcRenderer.invoke("screenshot:get-preset", ...args),
    updateUserPreset: (...args) => ipcRenderer.invoke("screenshot:set-preset", ...args),

    onShow: (callback) => ipcRenderer.on("screenshot:image-data", (_, data) => callback(data)),
  },

  core: {
    getIOdevices: (...args) => ipcRenderer.invoke('devices:get', ...args),

    getConfig: () => ipcRenderer.invoke('config:get'),
    updateConfig: (...args) => ipcRenderer.invoke('config:update', ...args),

    showError: (...args) => ipcRenderer.send('window:error', ...args),
    closeWindow: () => ipcRenderer.send('window:close'),
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    toggleMaximizeWindow: () => ipcRenderer.send('window:maximize'),

    restart: () => ipcRenderer.send('app:restart'),

    onError: (callback) => ipcRenderer.on('app:error', (_, data) => callback(data)),
    onStatus: (callback) => ipcRenderer.on('app:status', (_, data) => callback(data)),
  },

  export: {
    start: (...args) => ipcRenderer.invoke('export:start', ...args),
    pushFrame: (...args) => ipcRenderer.invoke('export:pushFrame', ...args),
    stop: (...args) => ipcRenderer.invoke('export:stop', ...args),
    cancel: () => ipcRenderer.send('export:cancel')
  }
});
