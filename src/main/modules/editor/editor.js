import { screen } from "electron/main"

export const createEditorWindow = async ({ projectId }, core) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: width,
    height: height,
    frame: false,
    alwaysOnTop: true,
    path: `/editor?id=${projectId}`,
  }

  const editor = await core.window.createWindow(options, "Editor")
  editor.on("ready-to-show", () => editor.maximize())
}
