// hooks/use-timeline.js
import { useEffect, useState, useRef } from "react";
import { formatTime } from "../utils";

export function useTimeline({
  zoomLevel,
  timelineContainer,
  videoDuration,
  preview,
  currentTime,
  setCurrentTime,
  playheadRef,
}) {
  const [ticks, setTicks] = useState([]);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(10);
  const [videoWidth, setVideoWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Internal refs for dragging/RAF/throttle
  const rafRef = useRef(null);
  const pendingTimeRef = useRef(null);
  const lastStateUpdateRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);

  // ResizeObserver for container width
  useEffect(() => {
    const el = timelineContainer?.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const observer = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [timelineContainer]);

  // Main tick / sizing computation (same logic as before)
  useEffect(() => {
    if (containerWidth <= 0 || !videoDuration) return;

    const localPxPerSec = Math.pow(2, zoomLevel);
    const localVideoWidth = videoDuration * localPxPerSec;
    const localFinalWidth = Math.max(localVideoWidth, containerWidth);
    const targetSpacing = 100; // aim for ~100px between major ticks
    let interval = Math.ceil(targetSpacing / localPxPerSec);

    const niceSteps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    interval = niceSteps.find((step) => step >= interval) || niceSteps[niceSteps.length - 1];

    let localMaxSeconds = localFinalWidth / localPxPerSec;

    const newTicks = [];
    for (let t = 0; t <= localMaxSeconds; t += interval) {
      const x = t * localPxPerSec;
      newTicks.push({
        x,
        label: formatTime(t, { showMs: false }),
        major: true,
      });

      let divisions = 0;
      if (interval >= 60) divisions = 5;
      else if (interval >= 10) divisions = 4;
      else if (interval >= 5) divisions = 5;
      else if (interval > 1) divisions = interval;
      else divisions = 0;

      if (divisions > 0) {
        const step = interval / (divisions + 1);
        for (let i = 1; i <= divisions; i++) {
          const minorTime = t + i * step;
          if (minorTime > localMaxSeconds) break;
          newTicks.push({
            x: minorTime * localPxPerSec,
            label: "",
            major: false,
          });
        }
      }
    }

    setTicks(newTicks);
    setPixelsPerSecond(localPxPerSec);
    setVideoWidth(localVideoWidth);
  }, [zoomLevel, videoDuration, containerWidth]);

  // Helper: apply transform to playhead element
  const applyPlayheadTransform = (px) => {
    if (!playheadRef?.current) return;
    playheadRef.current.style.transform = `translate3d(${px}px, 0, 0)`;
  };

  // Update playhead position when currentTime changes (if not dragging)
  useEffect(() => {
    if (!playheadRef?.current || !videoDuration || !pixelsPerSecond) return;
    if (isDragging) return;

    const playheadPosition = (currentTime / videoDuration) * videoWidth;
    applyPlayheadTransform(playheadPosition);
  }, [currentTime, videoDuration, videoWidth, pixelsPerSecond, isDragging, playheadRef]);

  // Auto-scroll to keep playhead visible (when not dragging)
  useEffect(() => {
    if (!playheadRef?.current || !videoDuration || !pixelsPerSecond) return;
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
  }, [currentTime, videoDuration, videoWidth, pixelsPerSecond, isDragging, timelineContainer, playheadRef]);

  // Click-to-seek handler
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

  // Playhead mousedown to begin dragging
  const handlePlayheadMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = currentTime;

    if (preview?.current?.video && !preview.current.video.paused) {
      preview.current.video.pause();
    }
  };

  // Document-level mousemove / mouseup handling for dragging (RAF-driven)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !videoDuration || !pixelsPerSecond) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const deltaTime = deltaX / pixelsPerSecond;
      const newTime = Math.max(0, Math.min(dragStartTimeRef.current + deltaTime, videoDuration));
      pendingTimeRef.current = newTime;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          const t = pendingTimeRef.current ?? newTime;
          const px = (t / videoDuration) * videoWidth;
          applyPlayheadTransform(px);

          if (preview?.current) {
            // If your preview seeking is expensive, you can throttle here.
            preview.current.seekTo(t);
          }

          const now = Date.now();
          if (now - (lastStateUpdateRef.current || 0) > 100) {
            setCurrentTime(t);
            lastStateUpdateRef.current = now;
          }

          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      const finalTime = pendingTimeRef.current ?? dragStartTimeRef.current;
      setIsDragging(false);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const finalPx = (finalTime / (videoDuration || 1)) * videoWidth;
      applyPlayheadTransform(finalPx);

      setCurrentTime(finalTime);
      if (preview?.current) preview.current.seekTo(finalTime);

      pendingTimeRef.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    isDragging,
    pixelsPerSecond,
    videoDuration,
    videoWidth,
    preview,
    setCurrentTime,
  ]);

  // wheel handler (unchanged)
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
