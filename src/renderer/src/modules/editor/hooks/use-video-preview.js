import { useLayoutEffect, useRef } from "react";
import { VideoPreview } from "../lib/video-preview";
import { useState } from "react";

export function useVideoPreview({ canvasRef, videoPath, handleTimeUpdate }) {
  const preview = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      preview.current = new VideoPreview();
      preview.current.init(canvasRef.current, videoPath, handleTimeUpdate);
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

  return { preview, isPlaying, isFullscreen };
}
