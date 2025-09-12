export class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.webcam = null;
    this.dpr = 1;

    // Padding configuration
    this.padding = 40; // Padding in logical pixels
    this.paddingColor = "#222222"; // Dark gray padding color

    // background image state
    this.backgroundImage = null;
    this.backgroundImageLoaded = false;
  }

  init(canvasElement, effectsManager, webcamManager) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");

    // image smoothing
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'high';

    this.effectsManager = effectsManager;
    this.webcamManager = webcamManager;

    return this.setupCanvas.bind(this);
  }

  // load background image from a path (returns a Promise)
  loadBackground(src, { crossOrigin = null } = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = crossOrigin; // optionally set CORS
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

  // convenience: set background from already-imported URL (eg: import bg from '../assets/bg.png')
  setBackgroundImage(imgUrl) {
    // returns the same promise-based loader
    return this.loadBackground(imgUrl);
  }

  setupCanvas(width, height) {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parent = this.canvas.parentElement;

    // Set CSS size to parent so it fits
    this.canvas.style.width = parent ? parent.offsetWidth + "px" : width;
    this.canvas.style.height = parent ? parent.offsetHeight + "px" : height;

    // Make sure internal resolution is reasonable until first resize
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = (parent ? parent.offsetWidth : width) * this.dpr;
    this.canvas.height = (parent ? parent.offsetHeight : height) * this.dpr;

    // Reset transform and scale once to account for DPR
    this.ctx.setTransform(parent ? this.dpr : 1, 0, 0, parent ? this.dpr : 1, 0, 0);

    // draw initial fallback
    const logicalWidth = this.canvas.width / this.dpr;
    const logicalHeight = this.canvas.height / this.dpr;
    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    this.ctx.fillStyle = "#666666";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Loading...", logicalWidth / 2, logicalHeight / 2);
  }

  resizeCanvas(videoWidth, videoHeight) {
    if (!this.canvas || !this.canvas.parentElement) return;

    this.dpr = window.devicePixelRatio || 1;

    // IMPORTANT: reset transforms before changing width/height and scaling
    // This avoids cumulative scale when resizeCanvas called multiple times.
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Canvas internal resolution (physical pixels)
    this.canvas.width = videoWidth * this.dpr;
    this.canvas.height = videoHeight * this.dpr;

    // scale to device pixels (logical coordinate space after this)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

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

  // Method to set padding and color
  setPadding(padding, color = "#222222") {
    this.padding = padding;
    this.paddingColor = color;
  }

  drawFrame(video, currentTime) {
    if (!video || video.readyState < 2 || !this.ctx) return;

    this.video = video;

    const logicalWidth = this.canvas.width / this.dpr;
    const logicalHeight = this.canvas.height / this.dpr;

    this.ctx.save();

    // Clear the entire canvas first (in logical coords)
    this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Draw background image or fallback to color
    if (this.backgroundImageLoaded && this.backgroundImage) {
      // Stretch background to cover full canvas (you can change to cover/contain logic)
      this.ctx.drawImage(this.backgroundImage, 0, 0, logicalWidth, logicalHeight);
    } else {
      // Fallback to solid color
      this.ctx.fillStyle = this.paddingColor;
      this.ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    }

    // Calculate video dimensions with padding
    const availableWidth = logicalWidth - (this.padding * 2);
    const availableHeight = logicalHeight - (this.padding * 2);

    // Calculate video size to fit within the padded area while maintaining aspect ratio
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
    const videoX = this.padding + (availableWidth - drawWidth) / 2;
    const videoY = this.padding + (availableHeight - drawHeight) / 2;

    // Apply effects before drawing the video
    if (this.effectsManager && typeof this.effectsManager.applyEffects === "function") {
      this.effectsManager.applyEffects(this.ctx, this.video, currentTime);
    }

    // Draw the video with padding offset
    this.ctx.drawImage(video, videoX, videoY, drawWidth, drawHeight);

    this.ctx.restore();

    // Draw webcam video if available (adjusted for padding)
    if (this.webcamManager && this.webcamManager.video && this.webcamManager.video.readyState >= 2) {
      this.webcam = this.webcamManager.video;

      const webcamSize = Math.min(logicalWidth, logicalHeight) * 0.25;
      const marginX = 20;
      const marginY = 20;

      // Position webcam considering the padding (keep inside logical area)
      const x = logicalWidth - webcamSize - marginX;
      const y = logicalHeight - webcamSize - marginY;

      this.ctx.save();
      this.ctx.beginPath();

      // rounded rect (make sure browser supports roundRect; otherwise draw manual)
      if (typeof this.ctx.roundRect === "function") {
        this.ctx.roundRect(x, y, webcamSize, webcamSize, 15);
        this.ctx.clip();
      } else {
        // fallback circle-like rounded rectangle
        const r = 15;
        this._roundedRectPath(this.ctx, x, y, webcamSize, webcamSize, r);
        this.ctx.clip();
      }

      // ... cropping code remains the same ...
      const webcamAspect = this.webcam.videoWidth / this.webcam.videoHeight;
      let srcWidth, srcHeight, srcX, srcY;
      if (webcamAspect > 1) {
        // Wider than tall, crop width
        srcHeight = this.webcam.videoHeight;
        srcWidth = srcHeight; // Square
        srcX = (this.webcam.videoWidth - srcWidth) / 2; // Center
        srcY = 0;
      } else {
        // Taller than wide, crop height
        srcWidth = this.webcam.videoWidth;
        srcHeight = srcWidth; // Square
        srcX = 0;
        srcY = (this.webcam.videoHeight - srcHeight) / 2; // Center
      }

      this.ctx.drawImage(this.webcam, srcX, srcY, srcWidth, srcHeight, x, y, webcamSize, webcamSize);
      this.ctx.restore();
    }
  }

  // helper fallback for rounded rect path if ctx.roundRect is unavailable
  _roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.webcam = null;
    this.effectsManager = null;
    this.webcamManager = null;
    this.backgroundImage = null;
    this.backgroundImageLoaded = false;
  }
}
