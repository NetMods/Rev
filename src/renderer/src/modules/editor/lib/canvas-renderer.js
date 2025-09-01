
export class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
  }

  init(canvasElement, effectsManager) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'high';

    this.effectsManager = effectsManager

    this.setupCanvas();
  }

  setupCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parent = this.canvas.parentElement;

    this.canvas.style.width = parent.offsetWidth + "px"
    this.canvas.style.height = parent.offsetHeight + "px"

    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#666666";
    this.ctx.font = "24px Arial";
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

    this.ctx.fillRect(0, 0, video.videoWidth, video.videoHeight);

    this.ctx.save();

    this.effectsManager.applyEffects(this.ctx, this.video, currentTime);
    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.effectsManager = null;
  }
}
