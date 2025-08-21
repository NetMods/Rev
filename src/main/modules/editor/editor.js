import { screen } from "electron/main"

export const createEditorWindow = async ({ projectId }, core) => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const options = {
    width: 3 * width / 4,
    height: 3 * height / 4,
    frame: false,
    alwaysOnTop: true,
    path: `/editor?id=${projectId}`,
  }

  await core.window.createWindow(options, "Editor")
}
