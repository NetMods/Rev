import { useEffect, useState } from "react";
import { formatTime } from "../../utils";
import { useVideoEditor } from "../use-video-editor";

export function useTimelineScale(containerWidth) {
  const [ticks, setTicks] = useState([]);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(10);
  const [videoWidth, setVideoWidth] = useState(0);

  const { zoomLevel, videoDuration } = useVideoEditor()

  useEffect(() => {
    if (containerWidth <= 0 || !videoDuration) return;

    const localPxPerSec = Math.pow(2, zoomLevel);
    const localVideoWidth = videoDuration * localPxPerSec;
    const localFinalWidth = Math.max(localVideoWidth, containerWidth);
    const targetSpacing = 100; // aim for ~100px between major ticks
    let interval = Math.ceil(targetSpacing / localPxPerSec);

    const niceSteps = [1, 2, 5, 10, 15, 30, 60, 120];
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
      if (interval >= 120) divisions = 3;
      else if (interval >= 60) divisions = 1;
      else if (interval >= 15) divisions = 2;
      else if (interval >= 10) divisions = 4;
      else if (interval >= 5) divisions = 4;
      else if (interval >= 2) divisions = 1;
      else if (interval > 1) divisions = interval;
      else if (interval === 1 && localPxPerSec === 256) divisions = 1;
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

  return { ticks, pixelsPerSecond, videoWidth };
}
