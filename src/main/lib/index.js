export function setupIPC(ipcMain) {
  ipcMain.handle('ping', () => console.log('pong'))
}
