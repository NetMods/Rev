import { useEffect } from "react";

export function useTimelineWheel(timelineContainer, zoomLevel, videoDuration) {
  useEffect(() => {
    const timelineElement = timelineContainer.current;
    if (!timelineElement || videoDuration <= 0) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const scrollAmount = e.deltaY;
      const scrollMultiplier = Math.max(2, 15 - zoomLevel * 2);
      timelineElement.scrollLeft += scrollAmount * scrollMultiplier;
    };

    timelineElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      timelineElement.removeEventListener("wheel", handleWheel);
    };
  }, [zoomLevel, videoDuration, timelineContainer]);
}
