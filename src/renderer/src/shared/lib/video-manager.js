export class VideoManager {
  constructor() {
    this.video = null;
    this.currentTime = 0;
    this.duration = 0;
    this.isPlaying = false;
    this.width = 0;
    this.height = 0;
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;
    this.onLoadedData = null;
  }

  init(path) {
    if (this.video) {
      this.video.remove();
    }

    this.video = document.createElement("video");
    this.video.style.display = "none";
    this.video.crossOrigin = "anonymous";
    this.video.preload = "auto";

    document.body.appendChild(this.video);
    this.video.src = path;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.video.addEventListener("loadedmetadata", () => {
      this.width = this.video.videoWidth;
      this.height = this.video.videoHeight;
    });

    this.video.addEventListener("loadeddata", () => {
      this.duration = this.video.duration;
      this.currentTime = 0;
      this.onLoadedData && this.onLoadedData();
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      this.onPlayStateChange && this.onPlayStateChange(this.isPlaying);
    });

    this.video.addEventListener("pause", () => {
      this.isPlaying = false;
      this.onPlayStateChange && this.onPlayStateChange(this.isPlaying);
    });

    this.video.addEventListener("seeking", () => {
      this.currentTime = this.video.currentTime;
    });

    this.video.addEventListener("seeked", () => {
      this.currentTime = this.video.currentTime;
    });
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
    time = Math.max(0, Math.min(time, this.duration));
    this.video.currentTime = time;
    this.currentTime = time;
  }

  destroy() {
    if (this.video) {
      this.video.remove();
    }
  }
}
