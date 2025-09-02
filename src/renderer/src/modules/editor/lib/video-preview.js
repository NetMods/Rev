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

  async export() {
    // 1. Validate that the necessary components are initialized
    if (!this.canvasRenderer.canvas || !this.videoManager.video) {
      console.error("Export failed: Canvas or video not initialized.");
      return;
    }

    console.log("Starting video export...");

    // Store the original state (current time and play status) to restore later
    const originalTime = this.videoManager.currentTime;
    const wasPlaying = this.isPlaying;

    // Pause the video if it's playing and reset to the beginning for a clean start
    if (wasPlaying) {
      this.videoManager.togglePlayPause();
    }
    this.seekTo(0);

    // Ensure the first frame is drawn before recording starts
    // A small delay helps guarantee the canvas is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    this.canvasRenderer.drawFrame(this.videoManager.video, 0);

    // 2. Setup MediaRecorder
    const stream = this.canvasRenderer.canvas.captureStream(30); // Capture at 30 FPS
    const options = {
      // Using webm/vp9 for better browser support and quality-to-size ratio
      mimeType: 'video/webm; codecs=vp9',
      bitsPerSecond: 8_000_000 // 8 Mbps for good quality
    };

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported. Trying default.`);
      // Fallback to default if the preferred codec isn't supported
      delete options.mimeType;
    }

    const recorder = new MediaRecorder(stream, options);
    const chunks = [];

    // 3. Define event handlers and wrap the process in a Promise
    const exportPromise = new Promise((resolve, reject) => {
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        console.log("Recording stopped, processing file...");
        try {
          // Use the first chunk's type or a fallback
          const blobType = chunks.length > 0 ? chunks[0].type : 'video/webm';
          const blob = new Blob(chunks, { type: blobType });

          // This part is specific to your app's API (e.g., Electron backend)
          const arrayBuffer = await blob.arrayBuffer();
          await window.api.editor.saveVideo(arrayBuffer);

          console.log("Export successful!");
          resolve(); // Resolve the promise on success
        } catch (error) {
          console.error("Error during video saving:", error);
          reject(error); // Reject the promise on failure
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder encountered an error:", event.error);
        reject(event.error);
      };
    });

    // This function will be called when the video finishes playing
    const handleVideoEnd = () => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
      // Clean up the event listener
      this.videoManager.video.removeEventListener('ended', handleVideoEnd);
    };

    // 4. Start the recording process
    this.videoManager.video.addEventListener('ended', handleVideoEnd);
    recorder.start();
    this.videoManager.video.play(); // Play the video to generate frames for the stream

    // Wait for the process to complete, then restore the original state
    try {
      await exportPromise;
    } finally {
      console.log("Restoring original video state.");
      this.seekTo(originalTime);
      if (wasPlaying) {
        // You might want to resume playback or leave it paused
        // this.videoManager.togglePlayPause();
      }
      // Redraw the frame at the original time
      this.canvasRenderer.drawFrame(this.videoManager.video, originalTime);
    }

    return exportPromise;
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
