import { uIOhook } from 'uiohook-napi'


let timestampsRecords = []
let mouseDownHandler = null
let startTime = null // nanoseconds (BigInt)

export const recordGlobalMouse = () => {
  // Clean up any previous listeners
  if (mouseDownHandler) {
    uIOhook.off('mousedown', mouseDownHandler)
  }

  // Record the start time in nanoseconds
  startTime = process.hrtime.bigint()

  // Define mouse down handler
  mouseDownHandler = (e) => {
    const now = process.hrtime.bigint()
    const elapsedNs = now - startTime
    const elapsedSeconds = Number(elapsedNs) / 1_000_000_000

    timestampsRecords.push({
      elapsed: elapsedSeconds.toFixed(3), // round to milliseconds
      x: e.x,
      y: e.y
    })
  }

  uIOhook.on('mousedown', mouseDownHandler)
  uIOhook.start()
}

export const recordGlobalMouseStop = () => {
  if (mouseDownHandler) {
    uIOhook.off('mousedown', mouseDownHandler)
    mouseDownHandler = null
  }
  uIOhook.stop()
}

export const saveMouseRecords = () => {
  uIOhook.stop()
  const temp = timestampsRecords
  timestampsRecords = []
  startTime = null
  return {
    mouseRecords: temp
  }
}
