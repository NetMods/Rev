import { uIOhook } from 'uiohook-napi'


export const recordGlobalMouse = () => {
  uIOhook.on('mousedown', (e) => {
    console.log(`Global mouse click at x=${e.x}, y=${e.y}, button=${e.button}`);
  });

  uIOhook.start();
}
