import { dialog, screen } from "electron/main"
import log from "electron-log/main"
import { writeFile } from "fs-extra"

export const createEditorWindow = async ({ projectId }, core) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: width,
    height: height,
    frame: false,
    path: `/editor?id=${projectId}`,
  }

  const editor = await core.window.createWindow(options, "Editor")
  editor.on("ready-to-show", () => editor.maximize())
}

export const saveVideo = async (arrayBuffer) => {
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
