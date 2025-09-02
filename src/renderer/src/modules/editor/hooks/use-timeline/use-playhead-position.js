import { useEffect } from "react";

export function usePlayheadPosition(playheadRef, currentTime, videoDuration, videoWidth, isDragging) {
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
