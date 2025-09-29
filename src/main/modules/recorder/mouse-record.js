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
    this.totalPausedTime = 0n
    this.pauseStartTime = null
    this.isPaused = false
    this.mainWindow = null

    this.dragging = false
    this.activeDrag = null
    this.isTracking = false
    this.lastClickTime = 0
    this.debounceTime = 0.5 // seconds; for clicks
    this.lastDragTime = 0
    this.dragDebounceTime = 0.5 // seconds; for drags
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

  start(mainWindow) {
    if (this.isTracking) {
      log.warn("Mouse tracking is already active")
      return
    }

    this.mainWindow = mainWindow
    this.cleanup()
    this.startTime = process.hrtime.bigint()
    this.totalPausedTime = 0n
    this.pauseStartTime = null
    this.isPaused = false

    this._addListeners()

    this.isTracking = true
  }

  pause() {
    if (!this.isTracking || this.isPaused) {
      log.warn("Mouse tracking is not active or already paused")
      return
    }

    this.cleanup() // Remove listeners
    this.pauseStartTime = process.hrtime.bigint()
    this.isPaused = true
    log.info("Mouse tracking paused")
  }

  resume() {
    if (!this.isTracking || !this.isPaused) {
      log.warn("Mouse tracking is not paused")
      return
    }

    const pausedNs = process.hrtime.bigint() - this.pauseStartTime
    this.totalPausedTime += pausedNs
    this.pauseStartTime = null
    this.isPaused = false

    this._addListeners()
    log.info("Mouse tracking resumed")
  }

  stop() {
    if (!this.isTracking) {
      log.warn("Mouse tracking is not active")
      return { clicks: [], drags: [] }
    }

    if (this.isPaused) {
      // Optionally add the current pause time if needed
      const pausedNs = process.hrtime.bigint() - this.pauseStartTime
      this.totalPausedTime += pausedNs
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

  _addListeners() {
    this.onMouseDown = (event) => {
      if (this.isPaused) return

      try {
        if (this.isInsideMainWindow(event.x, event.y, this.mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseDown:", err)
      }

      const currentTime = process.hrtime.bigint()
      const elapsedNanoseconds = currentTime - this.startTime - this.totalPausedTime
      const elapsedSeconds = Number(elapsedNanoseconds) / 1_000_000_000

      if (elapsedSeconds - this.lastClickTime > this.debounceTime) {
        this.clicks.push({
          type: 'click',
          elapsedTime: elapsedSeconds.toFixed(3),
          x: event.x,
          y: event.y
        })
        this.lastClickTime = elapsedSeconds
      }

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
        if (this.isInsideMainWindow(event.x, event.y, this.mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseMove:", err)
      }

      if (this.activeDrag) {
        const currentTime = process.hrtime.bigint()
        const elapsedNanoseconds = currentTime - this.startTime - this.totalPausedTime
        const elapsedSeconds = Number(elapsedNanoseconds) / 1_000_000_000

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
        if (this.isInsideMainWindow(event.x, event.y, this.mainWindow)) return;
      } catch (err) {
        log.error("Error in onMouseUp:", err)
      }

      if (this.activeDrag) {
        const currentTime = process.hrtime.bigint()
        const elapsedNanoseconds = currentTime - this.startTime - this.totalPausedTime
        const elapsedSeconds = Number(elapsedNanoseconds) / 1_000_000_000

        if (this.dragging) {
          this.activeDrag.endTime = elapsedSeconds.toFixed(3)
          this.activeDrag.endX = event.x
          this.activeDrag.endY = event.y
          this.activeDrag.duration = (parseFloat(this.activeDrag.endTime) - parseFloat(this.activeDrag.startTime)).toFixed(3)

          const duration = parseFloat(elapsedSeconds.toFixed(3)) - parseFloat(this.activeDrag.startTime)
          if (duration <= 1) return;

          if (elapsedSeconds - this.lastDragTime > this.dragDebounceTime) {
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
            this.lastDragTime = elapsedSeconds
          } else {
            log.verbose("Drag event debounced due to overlapping time")
          }
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
    this.totalPausedTime = 0n
    this.pauseStartTime = null
    this.isPaused = false
    this.mainWindow = null
    this.dragging = false
    this.activeDrag = null
    this.isTracking = false
    this.lastClickTime = 0
    this.lastDragTime = 0
  }
}
