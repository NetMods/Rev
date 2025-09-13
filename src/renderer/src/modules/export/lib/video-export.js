// import { CanvasRenderer } from "../../../shared/lib/canvas-renderer";
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

    this.fps = 30;
    this.width = 1920
    this.height = 1080
    this.quality = 0.95

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

    this.offScreenCanvas = document.createElement('canvas')
    this.offScreenCanvas.width = this.width
    this.offScreenCanvas.height = this.height

    this.canvasRenderer.init(this.offScreenCanvas, this.effectsManager, this.webcamManager)(this.width, this.height)
    this.canvasRenderer.loadBackground(bgUrl).catch(err => {
      console.warn('Background loading failed during export init:', err);
    });

    this.videoManager.onLoadedData = () => {
      this.totalFrames = Math.floor(this.videoManager.duration * this.fps);
    }
  }

  async startExport(options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    const startTime = options.startTime || 0;
    const endTime = options.endTime || this.videoManager.duration;
    const format = options.format || 'png';

    this.fps = options.fps || 30;
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.quality = options.quality || 0.95;

    const duration = endTime - startTime;
    const frameInterval = 1 / this.fps;

    this.isExporting = true;
    this.progress = 0;
    this.currentFrame = 0;

    window.api?.export?.start({
      totalFrames: this.totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      format: format
    })

    try {
      for (let i = 0; i < this.totalFrames; i++) {
        if (!this.isExporting) {
          break;
        }

        const currentTime = startTime + (i * frameInterval);

        await this.seekToFrame(currentTime);

        this.canvasRenderer.drawFrame(this.videoManager.video, currentTime);

        const blob = await this.canvasToBlob(format)

        const frameData = await this.blobToBase64(blob);

        window.api?.export?.pushFrame({
          frameNumber: i,
          timestamp: currentTime,
          data: frameData,
          format: format
        })

        this.currentFrame = i + 1;
        this.progress = (this.fps / this.totalFrames) * 100;

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


  seekToFrame(time) {
    return new Promise((resolve) => {
      const video = this.videoManager.video;

      video.pause();  // Ensure paused before seek

      if (Math.abs(video.currentTime - time) < 0.001) {
        resolve();
        return;
      }

      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        // Increase delay for full decode
        setTimeout(resolve, 100);
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

    if (this.videoManager) {
      this.videoManager.destroy();
    }

    if (this.webcamManager) {
      this.webcamManager.destroy();
    }

    if (this.canvasRenderer) {
      this.canvasRenderer.destroy();
    }

    if (this.effectsManager) {
      this.effectsManager.destroy();
    }

    if (this.offScreenCanvas) {
      this.offScreenCanvas = null;
    }

    this.onExportProgress = null;
    this.onExportComplete = null;
    this.onExportError = null;
  }
}


export class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.backgroundImage = null;
    this.backgroundImageLoaded = false;
    this.padding = 40;
    this.paddingColor = '#222222';
  }

  init(canvasElement, effectsManager, webcamManager) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
    this.effectsManager = effectsManager;
    this.webcamManager = webcamManager;

    // Optimize for quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    return this.setupCanvas.bind(this);
  }

  setupCanvas(width, height) {
    if (!this.canvas) return;

    // Set canvas dimensions directly to target resolution
    this.canvas.width = width;
    this.canvas.height = height;

    // Ensure CSS size matches pixel size for crisp rendering
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Clear canvas with padding color
    this.ctx.fillStyle = this.paddingColor;
    this.ctx.fillRect(0, 0, width, height);
  }

  loadBackground(src, { crossOrigin = null } = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = crossOrigin;
      img.onload = () => {
        this.backgroundImage = img;
        this.backgroundImageLoaded = true;
        resolve(img);
      };
      img.onerror = (err) => {
        this.backgroundImage = null;
        this.backgroundImageLoaded = false;
        reject(err);
      };
      img.src = src;
    });
  }

  drawFrame(video, currentTime) {
    if (!video || video.readyState < 2 || !this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);

    // Draw background
    if (this.backgroundImageLoaded && this.backgroundImage) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, width, height);
    } else {
      this.ctx.fillStyle = this.paddingColor;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Calculate video dimensions with padding
    const availableWidth = width - (this.padding * 2);
    const availableHeight = height - (this.padding * 2);
    const videoAspect = video.videoWidth / video.videoHeight;
    const availableAspect = availableWidth / availableHeight;

    let drawWidth, drawHeight;
    if (videoAspect > availableAspect) {
      drawWidth = availableWidth;
      drawHeight = availableWidth / videoAspect;
    } else {
      drawHeight = availableHeight;
      drawWidth = availableHeight * videoAspect;
    }

    // Center video
    const videoX = this.padding + (availableWidth - drawWidth) / 2;
    const videoY = this.padding + (availableHeight - drawHeight) / 2;

    // Apply effects if available
    if (this.effectsManager && typeof this.effectsManager.applyEffects === 'function') {
      this.effectsManager.applyEffects(this.ctx, video, currentTime);
    }

    // Draw main video with high-quality settings
    this.ctx.drawImage(video, videoX, videoY, drawWidth, drawHeight);

    // Draw webcam if available
    if (this.webcamManager && this.webcamManager.video && this.webcamManager.video.readyState >= 2) {
      const webcam = this.webcamManager.video;
      const webcamSize = Math.min(width, height) * 0.25;
      const margin = 20;
      const x = width - webcamSize - margin;
      const y = height - webcamSize - margin;

      this.ctx.save();

      // Create circular clip for webcam
      this.ctx.beginPath();
      this.ctx.arc(x + webcamSize / 2, y + webcamSize / 2, webcamSize / 2, 0, Math.PI * 2);
      this.ctx.clip();

      // Crop webcam to square
      const webcamAspect = webcam.videoWidth / webcam.videoHeight;
      let srcWidth, srcHeight, srcX, srcY;
      if (webcamAspect > 1) {
        srcHeight = webcam.videoHeight;
        srcWidth = srcHeight;
        srcX = (webcam.videoWidth - srcWidth) / 2;
        srcY = 0;
      } else {
        srcWidth = webcam.videoWidth;
        srcHeight = srcWidth;
        srcX = 0;
        srcY = (webcam.videoHeight - srcHeight) / 2;
      }

      this.ctx.drawImage(webcam, srcX, srcY, srcWidth, srcHeight, x, y, webcamSize, webcamSize);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  setPadding(padding, color = '#222222') {
    this.padding = padding;
    this.paddingColor = color;
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.effectsManager = null;
    this.webcamManager = null;
    this.backgroundImage = null;
    this.backgroundImageLoaded = false;
  }
}
