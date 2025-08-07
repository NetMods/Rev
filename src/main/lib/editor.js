import { is } from "@electron-toolkit/utils"
import { createNewWindow } from "./window-manager"
import { join } from "path"
import { screen } from "electron/main"
import log from "electron-log/main"

export const createEditorWindow = async ({ projectId }) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: 3 * width / 4,
    height: 3 * height / 4,
    frame: false,
    alwaysOnTop: true,
    path: `/editor?id=${projectId}`,
    backgroundColor: '#2e2c29'
  }

  const editorWindow = await createNewWindow(options)
  log.info("editor window created")

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    editorWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + `#${options.path}`)
  } else {
    editorWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: options.path })
  }
}
