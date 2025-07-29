import { dialog, session } from "electron"
import { desktopCapturer } from "electron/main"
import { writeFile } from "fs-extra"

export const startVideoRecording = (mainWindow) => {
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })

      // macOS: setting the resize again false as useSystemPicker is set false which cause native OS to mess things a bit
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.setResizable(false);
          mainWindow.setSize(50, 291)
        }
      }, 100)
    })
  }, { useSystemPicker: false })
  console.log("Started Recording")
}

export const stopVideoRecording = async (arrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer)

  const { canceled, filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `rec-${Date.now()}.webm`,
  });

  if (canceled || !filePath) {
    console.log('Save dialog was canceled or no file path selected');
    return;
  }

  await writeFile(filePath, buffer)
}
