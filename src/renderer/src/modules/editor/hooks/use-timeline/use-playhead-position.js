import { useEffect } from "react";
import { useVideoEditor } from "../use-video-editor";

export function usePlayheadPosition(playheadRef, videoWidth, isDragging) {
  const { videoDuration, currentTime } = useVideoEditor()

  const applyPlayheadTransform = (px) => {
    if (!playheadRef?.current) return;
    playheadRef.current.style.transform = `translate3d(${px}px, 0, 0)`;
  };

  useEffect(() => {
    if (!playheadRef?.current || !videoDuration) return;
    if (isDragging) return;

    const playheadPosition = (currentTime / videoDuration) * videoWidth;
    applyPlayheadTransform(playheadPosition);
  }, [currentTime, videoDuration, videoWidth, isDragging, playheadRef]);
}
