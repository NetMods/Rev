export class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;
    this.effects = [];
    this.videoZoomLevel = 1;
    this.lastCenter = null;
    this.lastFrameTime = null;
  }

  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.setupCanvas();
  }

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

  drawFrame(video, currentTime) {
    if (!video || video.readyState < 2 || !this.ctx) return;

    this.video = video;
    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(0, 0, video.videoWidth, video.videoHeight);

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
    this.applyEffects(currentTime);
    this.ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    this.ctx.restore();
  }

  applyEffects(currentTime) {
    if (!this.video || !this.ctx) return;

    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    const activeEffects = this.getActiveEffectsAtTime(currentTime);
    let hasZoom = false;
    let hasPan = false;

    activeEffects.forEach(effect => {
      if (effect.type === 'zoom') {
        this.applyZoomEffect(effect, currentTime);
        hasZoom = true;
      }

      if (effect.type === 'pan') {
        this.applyPanEffect(effect, currentTime);
        hasPan = true;
      }
    });

    // Handle zoom-out when no zoom or pan effects are active
    if (!hasZoom && !hasPan && this.videoZoomLevel > 1) {
      // Assume 0.008 per frame at 60 FPS = 0.48 zoom level decrease per second
      const zoomOutRate = 1; // Zoom-out rate per second
      const currentFrameTime = performance.now(); // Current time in milliseconds
      if (this.lastFrameTime !== null) {
        const deltaTime = (currentFrameTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.videoZoomLevel = Math.max(1, this.videoZoomLevel - zoomOutRate * deltaTime);
      }
      this.lastFrameTime = currentFrameTime; // Update last frame time
    } else if (hasZoom || hasPan) {
      // Reset lastFrameTime when effects are active to avoid large initial delta
      this.lastFrameTime = performance.now();
    }

    const s = this.videoZoomLevel;
    if (s > 1) {
      let cx = this.lastCenter ? this.lastCenter.x : w / 2;
      let cy = this.lastCenter ? this.lastCenter.y : h / 2;

      if (!hasZoom && !hasPan) {
        const half_w = w / (2 * s);
        const half_h = h / (2 * s);
        cx = Math.max(half_w, Math.min(cx, w - half_w));
        cy = Math.max(half_h, Math.min(cy, h - half_h));
        this.lastCenter = { x: cx, y: cy };
      }

      this.ctx.translate(w / 2, h / 2);
      this.ctx.scale(s, s);
      this.ctx.translate(-cx, -cy);
    }
  }

  getActiveEffectsAtTime(currentTime) {
    return this.effects.filter(effect => {
      const start = parseFloat(effect.startTime);
      const end = parseFloat(effect.endTime);
      return currentTime >= start && currentTime <= end;
    });
  }

  applyZoomEffect(effect, currentTime) {
    if (!effect.center || typeof effect.level !== 'number') return;

    const { x, y } = effect.center;
    const start = parseFloat(effect.startTime);
    const end = parseFloat(effect.endTime);
    const progress = Math.min(1, Math.max(0,
      (currentTime - start) / (end - start)
    ));

    this.videoZoomLevel = 1 + (effect.level - 1) * progress;

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
  }

  applyPanEffect(effect, currentTime) {
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    const s = this.videoZoomLevel;
    if (s <= 1) return; // No effect without zoom

    const path = effect.path.map(point => ({
      x: point.x,
      y: point.y,
      t: parseFloat(point.time)
    }));

    let cx, cy;
    const now = currentTime;
    const first = path[0];
    const last = path[path.length - 1];

    if (now < first.t) {
      cx = first.x;
      cy = first.y;
    } else if (now > last.t) {
      cx = last.x;
      cy = last.y;
    } else {
      let found = false;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (now >= p1.t && now <= p2.t) {
          const segDur = p2.t - p1.t;
          const prog = segDur > 0 ? (now - p1.t) / segDur : 0;
          cx = p1.x + (p2.x - p1.x) * prog;
          cy = p1.y + (p2.y - p1.y) * prog;
          found = true;
          break;
        }
      }
      if (!found) {
        cx = last.x;
        cy = last.y;
      }
    }

    const half_w = w / (2 * s);
    const half_h = h / (2 * s);
    cx = Math.max(half_w, Math.min(cx, w - half_w));
    cy = Math.max(half_h, Math.min(cy, h - half_h));

    this.lastCenter = { x: cx, y: cy };
  }

  updateEffects(newEffects) {
    this.effects = newEffects || [];
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
  }
}
