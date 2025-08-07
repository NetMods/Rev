import { app } from "electron"

export const closeApp = () => app.quit()

export const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

export const fileEncoding = "utf-8"

// Keep track of all open windows
export const openWindows = new Set();


export const openDrawer = (window) => {
  const [, height] = window.getSize()
  window.setSize(100, height)
}

export const closeDrawer = (window) => {
  const [, height] = window.getSize()
  window.setSize(50, height)
}
