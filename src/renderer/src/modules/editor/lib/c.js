export class VideoPreview {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;

    this.currentTime = 0;
    this.isPlaying = false;
    this.isDragging = false;
    this.isFullscreen = false;

    this.effects = []
    this.videoZoomLevel = 1
    this.lastCenter = null;

    this.onTimeUpdate = null;
    this.onPreviewStateUpdate = null
    this.resizeObserver = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init(canvasElement, videoPath, onTimeUpdate, onPreviewStateUpdate, effects) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.onTimeUpdate = onTimeUpdate;
    this.onPreviewStateUpdate = onPreviewStateUpdate

    this.effects = effects

    this.setupCanvas();
    this.loadVideo(videoPath);

    document.addEventListener('keydown', this.handleKeyDown);

    document.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen })
    });
  }

  handleKeyDown() { }

  setupCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parent = this.canvas.parentElement;
    this.canvas.style.width = parent.offsetWidth;
    this.canvas.style.height = parent.offsetHeight;

    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#666666";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Load a video file to start", this.canvas.width / 2, this.canvas.height / 2);
  }

  resizeCanvas(videoWidth, videoHeight) {
    if (!this.canvas || !this.canvas.parentElement) return;

    const dpi = window.devicePixelRatio || 1;

    // Canvas internal resolution
    this.canvas.width = videoWidth * dpi;
    this.canvas.height = videoHeight * dpi;

    // CSS size to fit parent
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

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpi, dpi);
  }

  loadVideo(path) {
    if (this.video) {
      this.video.remove();
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    }

    this.video = document.createElement("video");
    this.video.style.display = "none";
    this.video.crossOrigin = "anonymous";
    this.video.preload = "auto";

    document.body.appendChild(this.video);
    this.video.src = path;

    this.video.addEventListener("loadeddata", () => {
      this.resizeCanvas(this.video.videoWidth, this.video.videoHeight);

      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas(this.video.videoWidth, this.video.videoHeight);
        this.drawFrame();
      });

      this.resizeObserver.observe(this.canvas?.parentElement);

      this.isPlaying = false;
      this.duration = this.video.duration;
      this.currentTime = 0;
      this.onTimeUpdate(this.currentTime, this.duration);
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen })
      this.startRenderLoop();
    });

    this.video.addEventListener("pause", () => {
      this.isPlaying = false;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen })
    });

    this.video.addEventListener("seeking", () => {
      this.currentTime = this.video.currentTime;
      this.drawFrame();
    });

    this.video.addEventListener("seeked", () => {
      this.currentTime = this.video.currentTime;
      this.drawFrame();
    });
  }

  drawFrame() {
    if (this.video && this.video.readyState >= 2 && this.ctx) {
      this.ctx.fillStyle = "#111111";
      this.ctx.fillRect(0, 0, this.video.videoWidth, this.video.videoHeight);

      const videoAspect = this.video.videoWidth / this.video.videoHeight;
      const canvasDisplayAspect = parseFloat(this.canvas.style.width) / parseFloat(this.canvas.style.height);
      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoAspect > canvasDisplayAspect) {
        // Fit width
        drawWidth = this.video.videoWidth;
        drawHeight = this.video.videoWidth / canvasDisplayAspect;
        offsetX = 0;
        offsetY = (this.video.videoHeight - drawHeight) / 2;
      } else {
        // Fit height
        drawHeight = this.video.videoHeight;
        drawWidth = this.video.videoHeight * canvasDisplayAspect;
        offsetX = (this.video.videoWidth - drawWidth) / 2;
        offsetY = 0;
      }

      this.ctx.save();

      this.applyEffects()

      this.ctx.drawImage(this.video, offsetX, offsetY, drawWidth, drawHeight);

      this.ctx.restore()
    }
  }

  applyEffects() {
    if (!this.video || !this.ctx) return;

    const activeEffects = this.getActiveEffectsAtTime(this.currentTime);

    let applied = 0

    activeEffects.forEach(effect => {
      if (effect.type === 'zoom') {
        this.applyZoomEffect(effect);
        applied += 1
      }

      if (effect.type === 'pan') {
        this.applyPanEffect(effect)
      }
    });

    if (!applied && this.videoZoomLevel > 1) {
      this.videoZoomLevel = Math.max(1, this.videoZoomLevel - 0.008);
      if (this.videoZoomLevel < 1) this.videoZoomLevel = 1;
      else {
        const s = this.videoZoomLevel;
        const w = this.video.videoWidth;
        const h = this.video.videoHeight;
        let cx = this.lastCenter ? this.lastCenter.x : w / 2;
        let cy = this.lastCenter ? this.lastCenter.y : h / 2;
        const half_w = w / (2 * s);
        const half_h = h / (2 * s);
        cx = Math.max(half_w, Math.min(cx, w - half_w));
        cy = Math.max(half_h, Math.min(cy, h - half_h));
        this.ctx.translate(w / 2, h / 2);
        this.ctx.scale(s, s);
        this.ctx.translate(-cx, -cy);
      }
    }
  }

  getActiveEffectsAtTime(currentTime) {
    return this.effects.filter(effect => {
      return currentTime >= effect.startTime && currentTime <= effect.endTime;
    });
  }

  applyZoomEffect(effect) {
    if (!effect.center || typeof effect.level !== 'number') return;

    const { x, y } = effect.center;
    const zoomLevel = effect.level;

    const progress = Math.min(1, Math.max(0,
      (this.currentTime - effect.startTime) / (effect.endTime - effect.startTime)
    ));

    this.videoZoomLevel = 1 + (zoomLevel - 1) * progress;

    const s = this.videoZoomLevel;
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    let cx = x;
    let cy = y;
    const half_w = w / (2 * s);
    const half_h = h / (2 * s);
    cx = Math.max(half_w, Math.min(cx, w - half_w));
    cy = Math.max(half_h, Math.min(cy, h - half_h));

    this.lastCenter = { x: cx, y: cy };

    // Apply zoom transformation centered on the (bounded) point
    this.ctx.translate(w / 2, h / 2);
    this.ctx.scale(s, s);
    this.ctx.translate(-cx, -cy);
  }

  applyPanEffect() {
  }

  updateEffects(newEffects) {
    this.effects = newEffects || [];
    if (this.video && this.video.readyState >= 2) {
      this.drawFrame();
    }
  }

  startRenderLoop() {
    const render = () => {
      this.drawFrame();
      if (this.isPlaying) {
        // Only update time if not dragging
        if (!this.isDragging && this.onTimeUpdate) {
          this.currentTime = this.video.currentTime;
          this.onTimeUpdate(this.currentTime, this.duration);
        }
        requestAnimationFrame(render);
      }
    };
    requestAnimationFrame(render);
  }

  togglePlayPause() {
    if (!this.video) return;
    if (this.video.paused || this.video.ended) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  seekTo(time) {
    if (!this.video) return;
    time = Math.max(0, Math.min(time, this.video.duration));
    this.video.currentTime = time;
    this.currentTime = time;
    this.onTimeUpdate(this.currentTime, this.duration);
  }

  setDragging(isDragging) {
    this.isDragging = isDragging;
  }


  toggleFullscreen() {
    if (!this.canvas) return;

    if (!document.fullscreenElement) {
      const req =
        this.canvas.requestFullscreen ||
        this.canvas.webkitRequestFullscreen ||
        this.canvas.msRequestFullscreen;

      req?.call(this.canvas);
    } else {
      const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

      exit?.call(document);
    }
  }


  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.video) {
      this.video.remove();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.canvas = null;
    this.ctx = null;
    this.onTimeUpdate = null;
  }
}
