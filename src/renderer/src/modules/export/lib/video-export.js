import { CanvasRenderer } from '../../../shared/lib/canvas-renderer'
import { EffectsManager } from '../../../shared/lib/effect-manager'
import { VideoManager } from '../../../shared/lib/video-manager'
import bgUrl from '../../../assets/background.jpg'

export class VideoExporter {
  constructor() {
    this.videoManager = new VideoManager()
    this.webcamManager = null
    this.effectsManager = new EffectsManager()
    this.canvasRenderer = new CanvasRenderer()

    this.isExporting = false
    this.progress = 0
    this.currentFrame = 0
    this.totalFrames = 0

    this.onExportProgress = null
    this.onExportComplete = null
    this.onExportError = null
    this.onStatusMessage = null
  }

  init(videoPath, webcamPath, audioPath, effects, projectId) {
    this.videoManager.init(videoPath)
    if (webcamPath) {
      this.webcamManager = new VideoManager()
      this.webcamManager.init(webcamPath)
    }

    this.effectsManager.init(effects)
    this.projectId = projectId
    this.audioPath = audioPath

    this.videoManager.onLoadedData = () => {
      const defaultFps = 30
      this.totalFrames = Math.floor(this.videoManager.duration * defaultFps)
    }
  }

  _updateStatus(message) {
    console.log(`[Export Status] ${message}`);
    if (this.onStatusMessage) {
      this.onStatusMessage(message)
    }
  }

  async startExport(options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress')
    }

    this.fps = options.fps
    this.width = this.videoManager.width || options.width
    this.height = this.videoManager.height || options.height
    this.quality = options.quality
    this.format = options.format

    this.offScreenCanvas = document.createElement('canvas')
    this.offScreenCanvas.width = this.width
    this.offScreenCanvas.height = this.height

    this.canvasRenderer.init(this.offScreenCanvas, this.effectsManager, { isOffScreen: true })(
      this.width,
      this.height
    )
    await this.canvasRenderer.loadBackground(bgUrl)

    const startTime = 0
    const endTime = this.videoManager.duration
    const imageFormat = 'png'

    const duration = endTime - startTime
    const frameInterval = 1 / this.fps

    this.isExporting = true
    this.progress = 0
    this.currentFrame = 0
    this.totalFrames = Math.floor(duration * this.fps)

    this._updateStatus('Initializing export...')

    const exportReady = await window.api?.export?.start({
      totalFrames: this.totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      format: this.format,
      projectId: this.projectId,
      audioPath: this.audioPath
    })

    if (!exportReady) {
      throw new Error('Failed to initialize export process in main process.')
    }

    this._updateStatus('Main process ready. Starting frame processing...')

    try {
      for (let i = 0; i < this.totalFrames; i++) {
        if (!this.isExporting) {
          this._updateStatus('Export cancelled by user.')
          break
        }

        const currentTime = startTime + i * frameInterval
        console.time(`Frame ${i}`); // Start timer for the whole frame process

        this._updateStatus(`Processing frame ${i + 1} of ${this.totalFrames}...`)

        await this.seekToFrame(currentTime);

        this.canvasRenderer.drawFrame(
          this.videoManager.video,
          this.webcamManager?.video,
          currentTime
        )

        const blob = await this.canvasToBlob(imageFormat);
        const frameData = await this.blobToBase64(blob);

        const frameProcessed = await window.api?.export?.pushFrame({
          frameNumber: i,
          data: frameData,
        });

        if (!frameProcessed) {
          throw new Error(`Main process failed to save frame ${i}. Check main process logs.`);
        }

        this.currentFrame = i + 1
        this.progress = (this.currentFrame / this.totalFrames) * 100

        if (this.onExportProgress) {
          this.onExportProgress({
            current: this.currentFrame,
            total: this.totalFrames,
            progress: this.progress,
            currentTime: currentTime
          })
        }
      }

      this.isExporting = false

      if (this.currentFrame > 0) {
        this._updateStatus('Finalizing video export...')
        const exportResult = await window.api?.export?.stop()
        if (exportResult?.success) {
          this._updateStatus(`Export completed successfully! Saved to: ${exportResult.outputPath}`)
          if (this.onExportComplete) this.onExportComplete(exportResult);
        } else {
          throw new Error(`Failed to finalize export. Error: ${exportResult?.error || 'Unknown'}`);
        }
      }
    } catch (error) {
      this.isExporting = false
      this._updateStatus(`Export failed: ${error.message}`)
      this.cancelExport();
      if (this.onExportError) this.onExportError(error);
      throw error
    }
  }

  seekToFrame(time) {
    const seekPromise = (video, resolve, reject) => {
      if (Math.abs(video.currentTime - time) < 0.01) {
        return resolve();
      }

      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
        reject(new Error("Error during video seek."));
      };

      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);
      video.currentTime = time;
    };

    const promises = [];
    promises.push(new Promise((resolve, reject) => seekPromise(this.videoManager.video, resolve, reject)));

    if (this.webcamManager) {
      promises.push(new Promise((resolve, reject) => seekPromise(this.webcamManager.video, resolve, reject)));
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Seek timed out at ${time}s`)), 5000);
    });

    return Promise.race([
      Promise.all(promises),
      timeoutPromise
    ]);
  }

  canvasToBlob(format) {
    return new Promise((resolve) => {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      this.offScreenCanvas.toBlob(resolve, mimeType, this.quality)
    })
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  cancelExport() {
    if (this.isExporting) {
      this.isExporting = false
      this._updateStatus('Cancelling export...')
    }
    window.api?.export?.cancel()
  }

  destroy() {
    this.cancelExport()
    this.videoManager.destroy()
    if (this.webcamManager) {
      this.webcamManager.destroy()
    }
    if (this.canvasRenderer) {
      this.canvasRenderer.destroy()
    }
    if (this.effectsManager) {
      this.effectsManager.destroy()
    }
    this.offScreenCanvas = null
    this.onExportProgress = null
    this.onExportComplete = null
    this.onExportError = null
    this.onStatusMessage = null
  }
}
