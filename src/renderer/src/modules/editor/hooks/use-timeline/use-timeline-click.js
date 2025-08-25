export function useTimelineClick(timelineContainer, videoDuration, videoWidth, preview, setCurrentTime, isDragging) {
  const handleTimelineClick = (e) => {
    if (isDragging) return;
    const container = timelineContainer.current;
    if (!container || !videoDuration) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 20;
    const scrollLeft = container.scrollLeft;
    const totalClickX = clickX + scrollLeft;

    const clickedTime = (totalClickX / videoWidth) * videoDuration;
    const clampedTime = Math.max(0, Math.min(clickedTime, videoDuration));

    setCurrentTime(clampedTime);
    if (preview?.current) preview.current.seekTo(clampedTime);
  };

  return handleTimelineClick;
}
