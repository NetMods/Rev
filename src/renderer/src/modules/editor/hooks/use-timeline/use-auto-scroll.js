import { useEffect } from "react";

export function useAutoScroll(timelineContainer, playheadRef, currentTime, videoDuration, videoWidth, isDragging) {
  useEffect(() => {
    if (!playheadRef?.current || !videoDuration) return;
    if (!timelineContainer?.current) return;
    if (isDragging) return;

    const playheadPosition = (currentTime / videoDuration) * videoWidth;

    const container = timelineContainer.current;
    const containerW = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const padding = 20;

    const playheadScreenX = playheadPosition - scrollLeft + padding;

    if (playheadScreenX > containerW - 50) {
      container.scrollLeft = playheadPosition - containerW + 100;
    } else if (playheadScreenX < 50) {
      container.scrollLeft = Math.max(0, playheadPosition - 50);
    }
  }, [currentTime, videoDuration, videoWidth, isDragging, timelineContainer, playheadRef]);
}
