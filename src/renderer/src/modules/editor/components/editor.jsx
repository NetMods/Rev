import { useState } from "react";
import Preview from "./preview"
import { useVideoPreview } from "../hooks/use-video-preview";
import { Controls } from "./controls";
import Timeline from "./timeline";

export const Editor = ({ data }) => {
  const { id, videoPath, effects: savedEffects } = data
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(4);

  const [effects, setEffects] = useState(savedEffects || [])

  const handleTimeUpdate = (time, duration) => {
    setCurrentTime(time);
    setVideoDuration(duration);
  };

  const handleEffectsChange = async (newEffects) => {
    setEffects(newEffects);
    preview.current.updateEffects(newEffects);
    const success = await window.api.project.updateEffects(id, newEffects);
    if (success) {
      console.log("Saved updated effects");
    } else {
      console.error("Failed to save effects");
    }
  };

  const { preview, canvasRef, isPlaying, isFullscreen } = useVideoPreview({ videoPath, handleTimeUpdate, effects });

  return (
    <div className='flex flex-col h-full gap-2'>
      <Preview
        className="h-2/3 flex justify-center"
        data={{ canvasRef }}
      />

      <Controls
        className="flex justify-between items-center h-8"
        data={{ preview, isPlaying, isFullscreen, currentTime, videoDuration, setZoomLevel }}
      />

      <Timeline
        className="h-1/3 flex justify-center"
        data={{ videoDuration, preview, currentTime, setCurrentTime, zoomLevel, effects, handleEffectsChange }}
      />
    </div>
  )
}
