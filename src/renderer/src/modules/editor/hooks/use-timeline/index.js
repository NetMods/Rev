import { useRef } from "react";
import { useAutoScroll } from "./use-auto-scroll";
import { useContainerWidth, } from "./use-container-width";
import { usePlayheadDrag } from "./use-playhead-drag";
import { usePlayheadPosition } from "./use-playhead-position";
import { useTimelineClick } from "./use-timeline-click";
import { useTimelineEffects } from "./use-timeline-effect";
import { useTimelineScale } from "./use-timeline-ticks";
import { useTimelineWheel } from "./use-timeline-wheel";

export function useTimeline() {
  const timelineContainer = useRef(null);
  const playheadRef = useRef(null);
  const effectsRowRef = useRef(null);

  {/*Get the timeline container width*/ }
  const containerWidth = useContainerWidth(timelineContainer);

  {/*Generate timestamps for the timeline*/ }
  const { ticks, pixelsPerSecond, videoWidth } = useTimelineScale(containerWidth);

  {/*Enabling playhead dragging*/ }
  const { isDragging } = usePlayheadDrag(playheadRef, videoWidth, pixelsPerSecond);

  {/*Move playhead as video plays*/ }
  usePlayheadPosition(playheadRef, videoWidth, isDragging);

  {/*Auto scroll timeline as the video play*/ }
  useAutoScroll(timelineContainer, playheadRef, videoWidth, isDragging);

  {/*Enable Horizantal scroll on timeline*/ }
  useTimelineWheel(timelineContainer);

  {/*Move playhead as per the mouse click on the timeline*/ }
  const handleTimelineClick = useTimelineClick(timelineContainer, videoWidth, isDragging);

  {/*Lay down Effects on the row*/ }
  useTimelineEffects(effectsRowRef, pixelsPerSecond)

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
