export class VideoPreview {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.video = null;

    this.currentTime = 0;
    this.isPlaying = false;

    this.onTimeUpdate = null;
    this.resizeObserver = null;
  }

  init(canvasElement, videoPath, onTimeUpdate) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.onTimeUpdate = onTimeUpdate;

    this.setupCanvas();
    this.loadVideo(videoPath);
  }

  setupCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;

    const parent = this.canvas.parentElement;
    this.canvas.width = parent.offsetWidth;
    this.canvas.height = parent.offsetHeight;

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

    // Reset transform and apply DPI scaling
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
      this.resizeObserver.observe(this.canvas.parentElement);

      this.isPlaying = false;
      this.duration = this.video.duration;
      this.currentTime = 0;
      this.drawFrame();
      this.onTimeUpdate(this.currentTime, this.duration);
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      this.startRenderLoop();
    });

    this.video.addEventListener("pause", () => {
      this.isPlaying = false;
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

      this.ctx.drawImage(this.video, offsetX, offsetY, drawWidth, drawHeight);
    }
  }

  startRenderLoop() {
    const render = () => {
      this.drawFrame();
      if (this.isPlaying) {
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

  toggleFullscreen() {
    if (!this.canvas) return;

    if (!document.fullscreenElement) {
      if (this.canvas.requestFullscreen) {
        this.canvas.requestFullscreen();
      } else if (this.canvas.webkitRequestFullscreen) {
        this.canvas.webkitRequestFullscreen();
      } else if (this.canvas.msRequestFullscreen) {
        this.canvas.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
}
