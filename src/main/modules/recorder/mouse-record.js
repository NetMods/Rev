import { uIOhook } from 'uiohook-napi'
import log from "electron-log/main"
import { screen } from 'electron'

export class MouseTracker {
  constructor() {
    this.clicks = []
    this.drags = []

    this.onMouseDown = null
    this.onMouseMove = null
    this.onMouseUp = null

    this.startTime = null
    this.dragging = false
    this.activeDrag = null
    this.isTracking = false
    this.isPaused = false
    this.pausedTime = null
    this.totalPausedDuration = 0n
  }

  isInsideMainWindow(mouseX, mouseY, win) {
    const bounds = win.getBounds()
    const display = screen.getDisplayMatching(bounds)
    const scaleFactor = display.scaleFactor

    const scaledBounds = {
      x: bounds.x * scaleFactor,
      y: bounds.y * scaleFactor,
      width: bounds.width * scaleFactor,
      height: bounds.height * scaleFactor
    }

    return (
      mouseX >= scaledBounds.x &&
      mouseX <= scaledBounds.x + scaledBounds.width &&
      mouseY >= scaledBounds.y &&
      mouseY <= scaledBounds.y + scaledBounds.height
    )
  }

  getElapsedTime() {
    const currentTime = process.hrtime.bigint()
    let adjustedElapsed = currentTime - this.startTime - this.totalPausedDuration

    // If currently paused, subtract the current pause duration
    if (this.isPaused && this.pausedTime) {
      adjustedElapsed -= (currentTime - this.pausedTime)
    }

    return Number(adjustedElapsed) / 1_000_000_000
  }

  start(mainWindow) {
    if (this.isTracking) {
      log.warn("Mouse tracking is already active")
      return
    }

    this.cleanup()
    this.startTime = process.hrtime.bigint()
    this.totalPausedDuration = 0n
    this.isPaused = false
    this.pausedTime = null

    this.onMouseDown = (event) => {
      if (this.isPaused) return

      try {
        if (this.isInsideMainWindow(event.x, event.y, mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseDown:", err)
      }

      const elapsedSeconds = this.getElapsedTime()

      this.clicks.push({
        type: 'click',
        elapsedTime: elapsedSeconds.toFixed(3),
        x: event.x,
        y: event.y
      })

      this.dragging = false
      this.activeDrag = {
        startTime: elapsedSeconds.toFixed(3),
        startX: event.x,
        startY: event.y,
        path: [{ x: event.x, y: event.y, time: elapsedSeconds.toFixed(3) }]
      }
    }

    this.onMouseMove = (event) => {
      if (this.isPaused) return

      try {
        if (this.isInsideMainWindow(event.x, event.y, mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseMove:", err)
      }

      if (this.activeDrag) {
        const elapsedSeconds = this.getElapsedTime()

        this.dragging = true
        this.activeDrag.path.push({
          x: event.x,
          y: event.y,
          time: elapsedSeconds.toFixed(3)
        })
      }
    }

    this.onMouseUp = (event) => {
      if (this.isPaused) return

      try {
        if (this.isInsideMainWindow(event.x, event.y, mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseUp:", err)
      }

      if (this.activeDrag) {
        const elapsedSeconds = this.getElapsedTime()

        if (this.dragging) {
          this.activeDrag.endTime = elapsedSeconds.toFixed(3)
          this.activeDrag.endX = event.x
          this.activeDrag.endY = event.y
          this.activeDrag.duration = (parseFloat(this.activeDrag.endTime) - parseFloat(this.activeDrag.startTime)).toFixed(3)

          const duration = parseFloat(elapsedSeconds.toFixed(3)) - parseFloat(this.activeDrag.startTime)
          if (duration <= 1) return;

          this.drags.push({
            type: 'drag',
            startTime: this.activeDrag.startTime,
            endTime: this.activeDrag.endTime,
            duration: this.activeDrag.duration,
            startX: this.activeDrag.startX,
            startY: this.activeDrag.startY,
            endX: this.activeDrag.endX,
            endY: this.activeDrag.endY,
            path: this.activeDrag.path
          })
        }

        this.activeDrag = null
        this.dragging = false
      }
    }

    log.verbose("Adding mouse event listeners on uIOhook")
    uIOhook.on('mousedown', this.onMouseDown)
    uIOhook.on('mousemove', this.onMouseMove)
    uIOhook.on('mouseup', this.onMouseUp)
    uIOhook.start()
    this.isTracking = true
  }

  pause() {
    if (!this.isTracking) {
      log.warn("Mouse tracking is not active, cannot pause")
      return false
    }

    if (this.isPaused) {
      log.warn("Mouse tracking is already paused")
      return false
    }

    this.isPaused = true
    this.pausedTime = process.hrtime.bigint()

    log.verbose("Mouse tracking paused")
    return true
  }

  resume() {
    if (!this.isTracking) {
      log.warn("Mouse tracking is not active, cannot resume")
      return false
    }

    if (!this.isPaused) {
      log.warn("Mouse tracking is not paused, cannot resume")
      return false
    }

    if (this.pausedTime) {
      const pauseDuration = process.hrtime.bigint() - this.pausedTime
      this.totalPausedDuration += pauseDuration
    }

    this.isPaused = false
    this.pausedTime = null

    log.verbose("Mouse tracking resumed")
    return true
  }

  stop() {
    if (!this.isTracking) {
      log.warn("Mouse tracking is not active")
      return { mouseClickRecords: [], mouseDragRecords: [] }
    }

    this.cleanup()

    const clickRecords = [...this.clicks]
    const dragRecords = [...this.drags]

    this.reset()
    uIOhook.stop()

    return {
      clicks: clickRecords,
      drags: dragRecords
    }
  }

  cleanup() {
    log.verbose("Removing mouse event listeners on uIOhook")
    if (this.onMouseDown) {
      uIOhook.off('mousedown', this.onMouseDown)
      this.onMouseDown = null
    }
    if (this.onMouseMove) {
      uIOhook.off('mousemove', this.onMouseMove)
      this.onMouseMove = null
    }
    if (this.onMouseUp) {
      uIOhook.off('mouseup', this.onMouseUp)
      this.onMouseUp = null
    }
  }

  reset() {
    this.clicks = []
    this.drags = []
    this.startTime = null
    this.dragging = false
    this.activeDrag = null
    this.isTracking = false
    this.isPaused = false
    this.pausedTime = null
    this.totalPausedDuration = 0n
  }

  // Utility methods to check status
  getStatus() {
    return {
      isTracking: this.isTracking,
      isPaused: this.isPaused,
      totalRecords: this.clicks.length + this.drags.length
    }
  }
}
