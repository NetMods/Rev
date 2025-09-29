import { app } from "electron";
import log from "electron-log/main"

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

export function initializeLogger() {
  log.initialize();
  log.transports.console.format = '\x1b[33m{h}:{i}:{s} \x1b[36m[{level}] \x1b[30m› \x1b[0m{text}';
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] › {text}';
  return log
}

export const restartApp = async () => {
  log.info('Restarting app...');
  app.relaunch();
  app.exit();
}
