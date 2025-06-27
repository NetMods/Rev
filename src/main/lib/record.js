import { dialog, session } from "electron"
import { desktopCapturer } from "electron/main"
import { writeFile } from "fs-extra"

export const startRecording = () => {
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })
    })
  }, { useSystemPicker: true })
  console.log("Started Recording")
}

export const stopRecording = async (arrayBuffer) => {
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
