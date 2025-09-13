import { CanvasRenderer } from "../../../shared/lib/canvas-renderer";
import { EffectsManager } from "../../../shared/lib/effect-manager";
import { VideoManager } from "../../../shared/lib/video-manager";
import bgUrl from "../../../assets/background.jpg"

export class VideoExporter {
  constructor() {
    this.videoManager = new VideoManager();
    this.webcamManager = null;
    this.effectsManager = new EffectsManager();
    this.canvasRenderer = new CanvasRenderer();

    this.isExporting = false;
    this.progress = 0;
    this.currentFrame = 0;
    this.totalFrames = 0;

    this.onExportProgress = null;
    this.onExportComplete = null;
    this.onExportError = null;
  }

  init(videoPath, webcamPath, effects) {
    this.videoManager.init(videoPath)
    if (webcamPath) {
      this.webcamManager = new VideoManager();
      this.webcamManager.init(webcamPath);
    }

    this.effectsManager.init(effects)

    this.videoManager.onLoadedData = () => {
      const defaultFps = 30;
      this.totalFrames = Math.floor(this.videoManager.duration * defaultFps);
    }
  }

  async startExport(options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    this.fps = options.fps
    this.width = this.videoManager.width || options.width
    this.height = this.videoManager.height || options.height
    this.quality = options.quality
    this.format = options.format

    this.offScreenCanvas = document.createElement('canvas');
    this.offScreenCanvas.width = this.width;
    this.offScreenCanvas.height = this.height;

    this.canvasRenderer.init(this.offScreenCanvas, this.effectsManager, { isOffScreen: true })(this.width, this.height);
    await this.canvasRenderer.loadBackground(bgUrl)

    const startTime = 0;
    const endTime = this.videoManager.duration;
    const imageFormat = 'png';

    const duration = endTime - startTime;
    const frameInterval = 1 / this.fps;

    this.isExporting = true;
    this.progress = 0;
    this.currentFrame = 0;

    // Recalculate total frames based on actual export settings
    this.totalFrames = Math.floor(duration * this.fps);

    window.api?.export?.start({
      totalFrames: this.totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      format: this.format
    })

    try {
      // Loop is correct, but the progress calculation was slightly off
      for (let i = 0; i < this.totalFrames; i++) {
        if (!this.isExporting) {
          break;
        }

        const currentTime = startTime + (i * frameInterval);
        await this.seekToFrame(currentTime);

        this.canvasRenderer.drawFrame(this.videoManager.video, this.webcamManager?.video, currentTime);

        const blob = await this.canvasToBlob(imageFormat)
        const frameData = await this.blobToBase64(blob);

        window.api?.export?.pushFrame({
          frameNumber: i,
          timestamp: currentTime,
          data: frameData,
          format: imageFormat
        })

        this.currentFrame = i + 1;
        // Corrected progress calculation
        this.progress = (this.currentFrame / this.totalFrames) * 100;

        if (this.onExportProgress) {
          this.onExportProgress({
            current: this.currentFrame,
            total: this.totalFrames,
            progress: this.progress,
            currentTime: currentTime
          });
        }

        if (i % 10 === 0) {
          await this.delay(10);
        }
      }

      this.isExporting = false;

      window.api?.export?.stop({
        totalFrames: this.currentFrame,
        duration: duration
      })

      if (this.onExportComplete) {
        this.onExportComplete({
          totalFrames: this.currentFrame,
          duration: duration
        });
      }
    } catch (error) {
      this.isExporting = false;

      if (this.onExportError) {
        this.cancelExport()
        this.onExportError(error);
      }
      throw error;
    }
  }

  // ... rest of the class remains the same
  seekToFrame(time) {
    return new Promise((resolve) => {
      const video = this.videoManager.video;
      video.pause();
      if (Math.abs(video.currentTime - time) < 0.001) {
        resolve();
        return;
      }
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        setTimeout(resolve, 50);
      };
      video.addEventListener('seeked', onSeeked);
      this.videoManager.seekTo(time);
      if (this.webcamManager) {
        this.webcamManager.seekTo(time);
      }
    });
  }

  canvasToBlob(format) {
    return new Promise((resolve) => {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      this.offScreenCanvas.toBlob((blob) => resolve(blob), mimeType, this.quality);
    });
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cancelExport() {
    this.isExporting = false;
    window.api?.export?.cancel()
  }

  destroy() {
    this.cancelExport();
    this.videoManager.destroy();
    if (this.webcamManager) {
      this.webcamManager.destroy();
    }
    if (this.canvasRenderer) {
      this.canvasRenderer.destroy();
    }
    if (this.effectsManager) {
      this.effectsManager.destroy();
    }
    this.offScreenCanvas = null;
    this.onExportProgress = null;
    this.onExportComplete = null;
    this.onExportError = null;
  }
}
