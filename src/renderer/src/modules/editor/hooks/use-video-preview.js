import { useRef, useEffect } from "react";
import { VideoPreview } from "../lib/video-preview";

export function useVideoPreview({ videoPreviewInstance, videoPath, webcamPath, handleTimeUpdate, handlePreviewState, effects }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      videoPreviewInstance.current = new VideoPreview();
      videoPreviewInstance.current.init(canvasRef.current, videoPath, webcamPath, handleTimeUpdate, handlePreviewState, effects);
    }

    return () => videoPreviewInstance.current.destroy()
  }, [videoPath]);

  return { canvasRef };
}
