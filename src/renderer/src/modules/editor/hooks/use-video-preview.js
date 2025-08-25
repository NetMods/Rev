import { useLayoutEffect, useRef } from "react";
import { VideoPreview } from "../lib/video-preview";
import { useState } from "react";

export function useVideoPreview({ videoPath, handleTimeUpdate, effects }) {
  const preview = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      preview.current = new VideoPreview();
      preview.current.init(canvasRef.current, videoPath, handleTimeUpdate, effects);
    }

    const videoElement = preview.current.video;
    if (videoElement) {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);;

      videoElement.addEventListener("play", onPlay);
      videoElement.addEventListener("pause", onPause);
      document.addEventListener("fullscreenchange", onFullscreenChange);

      return () => {
        videoElement.removeEventListener("play", onPlay);
        videoElement.removeEventListener("pause", onPause);
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        preview.current.video?.remove();
      };
    }

    return () => preview.destroy();
  }, [videoPath]);

  return { preview, canvasRef, isPlaying, isFullscreen };
}
