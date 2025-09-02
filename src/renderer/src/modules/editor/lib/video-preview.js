import { CanvasRenderer } from "./canvas-renderer";
import { EffectsManager } from "./effect-manager";
import { VideoManager } from "./video-manager";

export class VideoPreview {
  constructor() {
    this.videoManager = new VideoManager();
    this.effectsManager = new EffectsManager();
    this.canvasRenderer = new CanvasRenderer();

    this.isFullscreen = false;
    this.isPlaying = false;

    this.onTimeUpdate = null;
    this.onPreviewStateUpdate = null;
    this.resizeObserver = null;
  }

  init(canvasElement, videoPath, onTimeUpdate, onPreviewStateUpdate, effects) {
    this.videoManager.init(videoPath);
    this.effectsManager.init(effects);
    this.canvasRenderer.init(canvasElement, this.effectsManager);

    this.onTimeUpdate = onTimeUpdate;
    this.onPreviewStateUpdate = onPreviewStateUpdate;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.videoManager.onLoadedData = () => {
      const video = this.videoManager.video;

      this.canvasRenderer.resizeCanvas(video.videoWidth, video.videoHeight);

      this.resizeObserver = new ResizeObserver(() => {
        this.canvasRenderer.resizeCanvas(video.videoWidth, video.videoHeight);
        this.canvasRenderer.drawFrame(video, this.videoManager.currentTime);
      });

      this.canvasRenderer.canvas?.parentElement &&
        this.resizeObserver.observe(this.canvasRenderer.canvas.parentElement);

      this.isPlaying = false;
      this.onTimeUpdate && this.onTimeUpdate(this.videoManager.currentTime, this.videoManager.duration);
    };

    this.videoManager.onPlayStateChange = (isPlaying) => {
      this.isPlaying = isPlaying;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen });
      if (isPlaying) {
        this.startRenderLoop();
      }
    };

    document.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.onPreviewStateUpdate({ isPlaying: this.isPlaying, isFullscreen: this.isFullscreen });
    });
  }

  startRenderLoop() {
    const render = () => {
      this.canvasRenderer.drawFrame(this.videoManager.video, this.videoManager.currentTime);

      if (this.isPlaying) {
        if (this.onTimeUpdate) {
          this.videoManager.currentTime = this.videoManager.video.currentTime;
          this.onTimeUpdate(this.videoManager.currentTime, this.videoManager.duration);
        }

        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);
  }

  togglePlayPause() {
    this.videoManager.togglePlayPause();
  }

  seekTo(time) {
    this.videoManager.seekTo(time);
    this.onTimeUpdate(this.videoManager.currentTime, this.videoManager.duration);
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
    this.effectsManager.updateEffects(newEffects);

    if (this.videoManager.video && this.videoManager.video.readyState >= 2) {
      this.canvasRenderer.drawFrame(this.videoManager.video, this.videoManager.currentTime);
    }
  }

  destroy() {
    this.videoManager.destroy();
    this.canvasRenderer.destroy();
    this.effectsManager.destroy();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.onTimeUpdate = null;
    this.onPreviewStateUpdate = null;
  }
}
