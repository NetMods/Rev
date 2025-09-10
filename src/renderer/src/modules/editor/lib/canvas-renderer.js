export class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.webcam = null;
  }

  init(canvasElement, effectsManager, webcamManager) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'high';

    this.effectsManager = effectsManager;
    this.webcamManager = webcamManager;

    this.setupCanvas();
  }

  setupCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parent = this.canvas.parentElement;

    this.canvas.style.width = parent.offsetWidth + "px";
    this.canvas.style.height = parent.offsetHeight + "px";

    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#666666";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Loading...", this.canvas.width / 2, this.canvas.height / 2);
  }

  resizeCanvas(videoWidth, videoHeight) {
    if (!this.canvas || !this.canvas.parentElement) return;

    const dpr = window.devicePixelRatio || 1;

    // Canvas internal resolution
    this.canvas.width = videoWidth * dpr;
    this.canvas.height = videoHeight * dpr;

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

    this.ctx.scale(dpr, dpr);
  }

  drawFrame(video, currentTime) {
    if (!video || video.readyState < 2 || !this.ctx) return;

    this.video = video;

    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasDisplayAspect = parseFloat(this.canvas.style.width) / parseFloat(this.canvas.style.height);

    let drawWidth, drawHeight, offsetX, offsetY;

    if (videoAspect > canvasDisplayAspect) {
      // Fit width
      drawWidth = video.videoWidth;
      drawHeight = video.videoWidth / canvasDisplayAspect;
      offsetX = 0;
      offsetY = (video.videoHeight - drawHeight) / 2;
    } else {
      // Fit height
      drawHeight = video.videoHeight;
      drawWidth = video.videoHeight * canvasDisplayAspect;
      offsetX = (video.videoWidth - drawWidth) / 2;
      offsetY = 0;
    }

    this.ctx.save();
    this.effectsManager.applyEffects(this.ctx, this.video, currentTime);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    this.ctx.restore();

    // Draw webcam video if available
    if (this.webcamManager && this.webcamManager.video && this.webcamManager.video.readyState >= 2) {
      this.webcam = this.webcamManager.video;
      const webcamSize = Math.min(this.canvas.width, this.canvas.height) * 0.25; // Webcam is 25% of canvas size
      const marginX = 100, marginY = 60;
      const x = this.canvas.width - webcamSize - marginX;
      const y = this.canvas.height - webcamSize - marginY;

      this.ctx.save();
      this.ctx.beginPath();

      this.ctx.roundRect(x, y, webcamSize, webcamSize, 15);
      this.ctx.clip();

      // Crop webcam to square, showing the center
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

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.webcam = null;
    this.effectsManager = null;
    this.webcamManager = null;
  }
}
