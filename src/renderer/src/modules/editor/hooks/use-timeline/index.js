import { useAutoScroll } from "./use-auto-scroll";
import { useContainerWidth, } from "./use-container-width";
import { usePlayheadDrag } from "./use-playhead-drag";
import { usePlayheadPosition } from "./use-playhead-position";
import { useTimelineClick } from "./use-timeline-click";
import { useTimelineEffects } from "./use-timeline-effect";
import { useTimelineScale } from "./use-timeline-ticks";
import { useTimelineWheel } from "./use-timeline-wheel";

export function useTimeline({
  zoomLevel,
  timelineContainer,
  videoDuration,
  preview,
  currentTime,
  setCurrentTime,
  playheadRef,
  effects,
  effectsRowRef
}) {
  const containerWidth = useContainerWidth(timelineContainer);
  const { ticks, pixelsPerSecond, videoWidth } = useTimelineScale(zoomLevel, videoDuration, containerWidth);
  const { isDragging, handlePlayheadMouseDown } = usePlayheadDrag(playheadRef, preview, currentTime, setCurrentTime, videoDuration, videoWidth, pixelsPerSecond);
  const handleTimelineClick = useTimelineClick(timelineContainer, videoDuration, videoWidth, preview, setCurrentTime, isDragging);

  useTimelineEffects(effects, effectsRowRef, pixelsPerSecond)
  usePlayheadPosition(playheadRef, currentTime, videoDuration, videoWidth, isDragging);
  useAutoScroll(timelineContainer, playheadRef, currentTime, videoDuration, videoWidth, isDragging);
  useTimelineWheel(timelineContainer, zoomLevel, videoDuration);

  return {
    ticks,
    pixelsPerSecond,
    videoWidth,
    containerWidth,
    isDragging,
    handlePlayheadMouseDown,
    handleTimelineClick,
  };
}
