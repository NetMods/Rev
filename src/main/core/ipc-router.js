import log from 'electron-log/main';
import { ipcMain } from 'electron';

export function registerIPCRouter(core) {
  const handlers = { ...core.ipcHandlers };

  Object.values(core.modules).forEach(mod => {
    const modHandlers = mod.getIPCHandlers();
    Object.assign(handlers, modHandlers);
  });

  const registered = [];

  for (const [channel, fn] of Object.entries(handlers)) {
    // detect AsyncFunction (constructor name approach works in Node)
    const isAsync = fn.constructor && fn.constructor.name === 'AsyncFunction';
    const type = isAsync ? 'handle' : 'on';

    if (type === 'handle') {
      ipcMain.handle(channel, async (event, ...args) => {
        try {
          return await fn(event, ...args);
        } catch (err) {
          log.error(`[ipc][${channel}] handler threw:`, err);
          throw err;
        }
      });
    } else {
      ipcMain.on(channel, (event, ...args) => {
        try {
          const r = fn(event, ...args);

          // if they returned a Promise and didn't await it, at least catch unhandled rejects
          if (r && typeof r.then === 'function') {
            r.catch(err => console.error(`[ipc][${channel}] async error:`, err));
          }
        } catch (err) {
          log.error(`[ipc][${channel}] handler threw:`, err);
        }
      });
    }

    registered.push({ channel, type });
    log.verbose(`ipc registered ${type} -> ${channel}`);
  }
}
