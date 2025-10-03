import { useState, useRef, useEffect } from "react";
import { useVideoEditor } from "../use-video-editor";

export function usePlayheadDrag(
  playheadRef,
  videoWidth,
  pixelsPerSecond,
) {
  const { videoPreviewInstance, videoDuration, setCurrentTime, currentTime } = useVideoEditor();

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !videoDuration || !pixelsPerSecond) return;

      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - dragStartXRef.current;
      const deltaTime = deltaX / pixelsPerSecond;
      const newTime = Math.max(0, Math.min(dragStartTimeRef.current + deltaTime, videoDuration));
      pendingTimeRef.current = newTime;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          const t = pendingTimeRef.current ?? newTime;
          const px = (t / videoDuration) * videoWidth;
          applyPlayheadTransform(px);

          if (videoPreviewInstance) {
            videoPreviewInstance.seekTo(t);
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

    const finishDrag = () => {
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
      if (videoPreviewInstance) videoPreviewInstance.seekTo(finalTime);

      pendingTimeRef.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", finishDrag);
      document.addEventListener("mouseleave", finishDrag);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", finishDrag);
      document.removeEventListener("mouseleave", finishDrag);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, pixelsPerSecond, videoDuration, videoWidth, videoPreviewInstance, setCurrentTime, playheadRef]);

  useEffect(() => {
    const playhead = playheadRef?.current;
    if (!playhead) return;

    const onDown = (e) => {
      if (e.type === "mousedown" && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      dragStartXRef.current = clientX;
      dragStartTimeRef.current = (typeof currentTime === 'number' ? currentTime : 0);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setIsDragging(true);
    };

    playhead.addEventListener("mousedown", onDown);

    return () => {
      playhead.removeEventListener("mousedown", onDown);
    };
  }, [playheadRef, currentTime]);

  return { isDragging };
}
