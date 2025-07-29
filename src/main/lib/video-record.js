import { dialog, session } from "electron"
import { desktopCapturer } from "electron/main"
import log from "electron-log/main"
import { writeFile } from "fs-extra"

export const setupVideoRecording = (mainWindow) => {
  const width = 50, height = 291

  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })

      // macOS: setting the resize again false as useSystemPicker is set false which cause native OS to mess things a bit
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.setResizable(false);
          mainWindow.setSize(width, height)
        }
      }, 100)
    })
  }, { useSystemPicker: false })
  log.verbose("Setted screen 0 as default for getDisplayMedia")
}

export const saveVideoRecording = async (arrayBuffer) => {
  log.verbose(`Getting raw buffer data to Nodejs Buffer object`)
  const buffer = Buffer.from(arrayBuffer)

  log.verbose(`Showing dialog to user to select video location`)
  const { canceled, filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `rec-${Date.now()}.webm`,
  });

  if (canceled || !filePath) {
    log.warn('Save dialog was canceled or no video path selected');
    return;
  }

  log.verbose(`Writing video to ${filePath}`)
  await writeFile(filePath, buffer)
}
