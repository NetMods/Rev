import { CanvasRenderer } from "./canvas-renderer";
import { VideoController } from "./video-controller";

export class VideoPreview {
  constructor() {
    this.videoController = new VideoController();
    this.canvasRenderer = new CanvasRenderer();

    this.isDragging = false;
    this.isFullscreen = false;
    this.isPlaying = false;

    this.onTimeUpdate = null;
    this.onPreviewStateUpdate = null;
    this.resizeObserver = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init(canvasElement, videoPath, onTimeUpdate, onPreviewStateUpdate, effects) {
    this.canvasRenderer.init(canvasElement);
    this.canvasRenderer.updateEffects(effects);

    this.onTimeUpdate = onTimeUpdate;
    this.onPreviewStateUpdate = onPreviewStateUpdate;

    this.setupEventListeners();
    this.loadVideo(videoPath);
  }

  setupEventListeners() {
    this.videoController.onLoadedData = () => {
      const video = this.videoController.video;
      this.canvasRenderer.resizeCanvas(video.videoWidth, video.videoHeight);

      this.resizeObserver = new ResizeObserver(() => {
        this.canvasRenderer.resizeCanvas(video.videoWidth, video.videoHeight);
        this.drawFrame();
      });

      this.resizeObserver.observe(this.canvasRenderer.canvas?.parentElement);

      this.isPlaying = false;
      this.onTimeUpdate(this.videoController.currentTime, this.videoController.duration);
    };

    this.videoController.onPlayStateChange = (isPlaying) => {
      this.isPlaying = isPlaying;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen });
      if (isPlaying) {
        this.startRenderLoop();
      }
    };

    document.addEventListener('keydown', this.handleKeyDown);

    document.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen });
    });
  }

  handleKeyDown() { }

  loadVideo(path) {
    this.videoController.loadVideo(path);
  }

  drawFrame() {
    this.canvasRenderer.drawFrame(
      this.videoController.video,
      this.videoController.currentTime
    );
  }

  startRenderLoop() {
    const render = () => {
      this.drawFrame();
      if (this.isPlaying) {
        if (!this.isDragging && this.onTimeUpdate) {
          this.videoController.currentTime = this.videoController.video.currentTime;
          this.onTimeUpdate(this.videoController.currentTime, this.videoController.duration);
        }
        requestAnimationFrame(render);
      }
    };
    requestAnimationFrame(render);
  }

  togglePlayPause() {
    this.videoController.togglePlayPause();
  }

  seekTo(time) {
    this.videoController.seekTo(time);
    this.onTimeUpdate(this.videoController.currentTime, this.videoController.duration);
  }

  setDragging(isDragging) {
    this.isDragging = isDragging;
  }

  toggleFullscreen() {
    if (!this.canvasRenderer.canvas) return;

    if (!document.fullscreenElement) {
      const req =
        this.canvasRenderer.canvas.requestFullscreen ||
        this.canvasRenderer.canvas.webkitRequestFullscreen ||
        this.canvasRenderer.canvas.msRequestFullscreen;

      req?.call(this.canvasRenderer.canvas);
    } else {
      const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

      exit?.call(document);
    }
  }

  updateEffects(newEffects) {
    this.canvasRenderer.updateEffects(newEffects);
    if (this.videoController.video && this.videoController.video.readyState >= 2) {
      this.drawFrame();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);

    this.videoController.destroy();
    this.canvasRenderer.destroy();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.onTimeUpdate = null;
    this.onPreviewStateUpdate = null;
  }
}
