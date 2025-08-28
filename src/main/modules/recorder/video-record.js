import { session } from "electron"
import { desktopCapturer } from "electron/main"
import log from "electron-log/main"

export const setupVideoRecording = () => {
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })
    })
  }, { useSystemPicker: false })
  log.verbose("Setted screen 0 as default for getDisplayMedia")
}
