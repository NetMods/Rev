export class CanvasRenderer {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.isOffScreen = null
    this.background = { image: null, isLoaded: false }
    this.padding = { value: 30, color: '#000000' }
  }

  init(canvasElement, effectsManager, { isOffScreen }) {
    this.canvas = canvasElement

    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true, colorSpace: "display-p3" })
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.effectsManager = effectsManager

    this.isOffScreen = isOffScreen

    return this.setupCanvas.bind(this);
  }

  setupCanvas(width, height) {
    if (!this.canvas) return

    if (this.isOffScreen) {
      if (!width || !height) return
    } else {
      const parent = this.canvas.parentElement;
      width = parent.offsetWidth
      height = parent.offsetHeight
    }

    // Set canvas dimensions directly to target resolution
    this.canvas.width = width;
    this.canvas.height = height;

    // Ensure CSS size matches pixel size for crisp rendering
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.isOffScreen) {
      this.ctx.fillStyle = this.padding.color;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.fillStyle = this.padding.color;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = "24px 'funnel'";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Loading...", width / 2, height / 2);
    }
  }

  loadBackground(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.background.image = img;
        this.background.isLoaded = true;
        resolve(img);
      };
      img.onerror = (err) => {
        this.background.image = null;
        this.background.isLoaded = false;
        reject(err);
      };
      img.src = src;
    });
  }

  drawFrame(video, webcam, currentTime) {
    if (!this.ctx) return
    if (!video || video.readyState < 2) return;

    const logicalWidth = this.canvas.width, logicalHeight = this.canvas.height

    this.ctx.save();

    this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Draw background
    if (this.background.isLoaded && this.background.image) {
      this.ctx.drawImage(this.background.image, 0, 0, logicalWidth, logicalHeight);
    } else {
      // Fallback to solid color
      this.ctx.fillStyle = this.padding.color;
      this.ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    }

    const availableWidth = logicalWidth - (this.padding.value * 2);
    const availableHeight = logicalHeight - (this.padding.value * 2);

    const videoAspect = video.videoWidth / video.videoHeight;
    const availableAspect = availableWidth / availableHeight;

    let drawWidth, drawHeight;
    if (videoAspect > availableAspect) {
      // Video is wider, fit to width
      drawWidth = availableWidth;
      drawHeight = availableWidth / videoAspect;
    } else {
      // Video is taller, fit to height
      drawHeight = availableHeight;
      drawWidth = availableHeight * videoAspect;
    }

    // Center the video in the available space
    const videoX = this.padding.value + (availableWidth - drawWidth) / 2;
    const videoY = this.padding.value + (availableHeight - drawHeight) / 2;

    this.effectsManager.applyEffects(this.ctx, video, currentTime);

    this.ctx.filter = `contrast(104%)`;

    this.ctx.drawImage(video, videoX, videoY, drawWidth, drawHeight);

    this.ctx.restore();

    // Draw webcam overlay
    if (webcam && webcam.readyState >= 2) {
      const webcamSize = Math.min(logicalWidth, logicalHeight) * 0.25;

      const marginX = 20;
      const marginY = 20;

      const x = logicalWidth - webcamSize - marginX;
      const y = logicalHeight - webcamSize - marginY;

      this.ctx.save();

      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === "function") {
        this.ctx.roundRect(x, y, webcamSize, webcamSize, 15);
      } else {
        this.ctx.arc(x + webcamSize / 2, y + webcamSize / 2, webcamSize / 2, 0, Math.PI * 2);
      }
      this.ctx.clip();

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
  }

  resizeCanvas(videoWidth, videoHeight) {
    if (this.isOffScreen) return
    if (!this.canvas || !this.canvas.parentElement) return;

    // Canvas internal resolution (physical pixels)
    this.canvas.width = videoWidth
    this.canvas.height = videoHeight

    const parent = this.canvas.parentElement;
    const parentAspect = parent.offsetWidth / parent.offsetHeight;
    const videoAspect = videoWidth / videoHeight;
    let displayWidth, displayHeight;

    if (videoAspect > parentAspect) {
      // Fit width
      displayWidth = parent.offsetWidth;
      displayHeight = parent.offsetWidth / videoAspect;
    } else {
      // Fit height
      displayHeight = parent.offsetHeight;
      displayWidth = parent.offsetHeight * videoAspect;
    }

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.effectsManager = null;
    this.background = { image: null, isLoaded: false };
  }
}
