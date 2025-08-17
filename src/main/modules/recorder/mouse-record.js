import { uIOhook } from 'uiohook-napi'
import log from "electron-log/main"

let mouseClickRecords = []
let mouseDownListener = null
let trackingStartTime = null // nanoseconds (bigint)

export const startMouseTracking = () => {
  // Clean up any previous listeners
  if (mouseDownListener) {
    uIOhook.off('mousedown', mouseDownListener)
  }

  // Record the start time in nanoseconds
  trackingStartTime = process.hrtime.bigint()

  // Define mouse down listener
  mouseDownListener = (event) => {
    const currentTime = process.hrtime.bigint()
    const elapsedNanoseconds = currentTime - trackingStartTime
    const elapsedSeconds = Number(elapsedNanoseconds) / 1_000_000_000

    mouseClickRecords.push({
      elapsedTime: elapsedSeconds.toFixed(3), // round to milliseconds
      x: event.x,
      y: event.y
    })
  }

  log.verbose("Adding mousedown event listener on uIOhook")
  uIOhook.on('mousedown', mouseDownListener)
  uIOhook.start()
}

export const stopMouseTracking = () => {
  if (mouseDownListener) {
    log.verbose("Removing mouse down event listener on uIOhook")
    uIOhook.off('mousedown', mouseDownListener)
    mouseDownListener = null
  }

  const records = [...mouseClickRecords]

  // TODO: remove the clicks that are inside the our recorder

  mouseClickRecords = []
  trackingStartTime = null
  uIOhook.stop()

  return { mouseClickRecords: records }
}
