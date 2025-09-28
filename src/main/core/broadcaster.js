import { BrowserWindow } from "electron/main";

class BroadCaster {
  broadcast(channel, data) {
    const allWindows = BrowserWindow.getAllWindows()

    allWindows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data)
      }
    })
  }

  error(error, source = 'main') {
    const obj = {
      message: error.message || error,
      source,
    };

    this.broadcast('app:error', obj)
  }

  status(status) {
    this.broadcast('app:status', status)
  }
}


export const broadcaster = new BroadCaster()
