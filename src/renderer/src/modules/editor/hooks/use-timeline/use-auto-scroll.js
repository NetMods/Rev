import { useEffect } from "react";
import { useVideoEditor } from "../use-video-editor";

export function useAutoScroll(timelineContainer, playheadRef, videoWidth, isDragging) {
  const { videoDuration, currentTime } = useVideoEditor()

  useEffect(() => {
    if (!playheadRef?.current || !videoDuration) return;
    if (!timelineContainer?.current) return;
    if (isDragging) return;

    const playheadPosition = (currentTime / videoDuration) * videoWidth;

    const container = timelineContainer.current;
    const containerW = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const padding = 20;

    const edgeThreshold = 5;

    const playheadScreenX = playheadPosition - scrollLeft + padding;

    if (playheadScreenX > containerW - edgeThreshold) {
      container.scrollLeft = playheadPosition;
    } else if (playheadScreenX < edgeThreshold) {
      container.scrollLeft = Math.max(0, playheadPosition - edgeThreshold);
    }
  }, [currentTime, videoDuration, videoWidth, isDragging, timelineContainer, playheadRef]);
}
