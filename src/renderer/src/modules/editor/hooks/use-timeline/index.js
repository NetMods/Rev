import { useRef } from "react";
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
  videoDuration,
  preview,
  currentTime,
  setCurrentTime,
  effects,
}) {
  const timelineContainer = useRef(null);
  const playheadRef = useRef(null);
  const effectsRowRef = useRef(null);

  {/*Get the timeline container width*/ }
  const containerWidth = useContainerWidth(timelineContainer);

  {/*Generate timestamps for the timeline*/ }
  const { ticks, pixelsPerSecond, videoWidth } = useTimelineScale(zoomLevel, videoDuration, containerWidth);

  {/*Enabling playhead dragging*/ }
  const { isDragging } = usePlayheadDrag(playheadRef, preview, currentTime, setCurrentTime, videoDuration, videoWidth, pixelsPerSecond);

  {/*Move playhead as video plays*/ }
  usePlayheadPosition(playheadRef, currentTime, videoDuration, videoWidth, isDragging);

  {/*Auto scroll timeline as the video play*/ }
  useAutoScroll(timelineContainer, playheadRef, currentTime, videoDuration, videoWidth, isDragging);

  {/*Enable Horizantal scroll on timeline*/ }
  useTimelineWheel(timelineContainer, zoomLevel, videoDuration);


  {/*Move playhead as per the mouse click on the timeline*/ }
  const handleTimelineClick = useTimelineClick(timelineContainer, videoDuration, videoWidth, preview, setCurrentTime, isDragging);

  {/*Lay down Effects on the row*/ }
  useTimelineEffects(effects, effectsRowRef, pixelsPerSecond)

  return {
    ticks,
    pixelsPerSecond,
    videoWidth,
    containerWidth,
    isDragging,
    handleTimelineClick,
    timelineContainer,
    playheadRef,
    effectsRowRef
  };
}
