import { useState, useRef, useEffect } from "react";

export function usePlayheadDrag(
  playheadRef,
  preview,
  currentTime,
  setCurrentTime,
  videoDuration,
  videoWidth,
  pixelsPerSecond,
) {
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef(null);
  const pendingTimeRef = useRef(null);
  const lastStateUpdateRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);

  const applyPlayheadTransform = (px) => {
    if (!playheadRef?.current) return;
    playheadRef.current.style.transform = `translate3d(${px}px, 0, 0)`;
  };

  const handlePlayheadMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = currentTime;

    if (preview?.video && !preview.video.paused) {
      preview.video.pause();
    }
  };

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

          if (preview) {
            preview.seekTo(t);
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
      if (preview) preview.seekTo(finalTime);

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
  }, [isDragging, pixelsPerSecond, videoDuration, videoWidth, preview, setCurrentTime, playheadRef]);

  return { isDragging, handlePlayheadMouseDown };
}
