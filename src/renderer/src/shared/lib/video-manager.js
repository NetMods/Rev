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
    this.onError = null;
  }

  init(path) {
    if (this.video) {
      this.destroy();
    }

    this.video = document.createElement("video");
    this.video.style.display = "none";
    this.video.crossOrigin = "anonymous";
    this.video.preload = "auto";

    // **Improvement**: Attach listeners BEFORE setting the source.
    // This prevents a race condition where an event could fire before the listener is ready.
    this.setupEventListeners();

    document.body.appendChild(this.video);
    this.video.src = path;
  }

  setupEventListeners() {
    this.video.addEventListener("loadedmetadata", () => {
      this.width = this.video.videoWidth;
      this.height = this.video.videoHeight;
    });

    this.video.addEventListener("loadeddata", () => {
      this.duration = this.video.duration;
      this.currentTime = 0;
      if (this.onLoadedData) this.onLoadedData();
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      if (this.onPlayStateChange) this.onPlayStateChange(this.isPlaying);
    });

    this.video.addEventListener("pause", () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(this.isPlaying);
    });

    this.video.addEventListener("seeked", () => {
      this.currentTime = this.video.currentTime;
    });

    // **CRITICAL ADDITION**: Listen for errors on the video element itself.
    this.video.addEventListener('error', () => {
      const error = this.video.error;
      let errorMessage = `Video Error: Unknown error.`;

      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback aborted by the user.';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'A network error caused the video download to fail.';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video playback aborted due to a corruption problem or because the video used features your browser did not support.';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
          break;
        default:
          errorMessage = `An unknown error occurred. Code: ${error.code}`;
          break;
      }

      console.error("VideoManager Error:", errorMessage, "Details:", error.message);

      if (this.onError) this.onError(errorMessage);
    });
  }

  togglePlayPause() {
    if (!this.video) return;
    // Using promises for play is a good modern practice
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => { }).catch(() => {
        // Play was interrupted, usually by a pause. This is fine.
      });
    }
  }

  seekTo(time) {
    if (!this.video || isNaN(time)) return;
    time = Math.max(0, Math.min(time, this.duration));
    if (Math.abs(this.video.currentTime - time) > 0.01) {
      this.video.currentTime = time;
    }
  }

  destroy() {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
      this.video.remove();
      this.video = null;
    }
  }
}
