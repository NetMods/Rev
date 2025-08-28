import { useState } from "react";
import Preview from "./preview"
import { Controls } from "./controls";
import Timeline from "./timeline";
import { useRef } from "react";

export const Editor = ({ data }) => {
  const { id, videoPath, effects: savedEffects } = data

  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(6);

  const [effects, setEffects] = useState(savedEffects || [])

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoPreviewInstance = useRef(null)

  const handleTimeUpdate = (time, duration) => {
    setCurrentTime(time);
    setVideoDuration(duration);
  };

  const handleEffectsChange = async (newEffects) => {
    setEffects(newEffects);
    videoPreviewInstance.current.updateEffects(newEffects);
    await window.api.project.updateEffects(id, newEffects);
  };

  const handlePreviewState = ({ isPlaying: p, isFullscreen: f }) => {
    setIsPlaying(p);
    setIsFullscreen(f);
  };

  const increaseZoom = () => setZoomLevel(prev => Math.min(8, prev + 1))
  const decreaseZoom = () => setZoomLevel(prev => Math.max(0, prev - 1))

  return (
    <div className='flex flex-col h-full gap-2'>
      <Preview
        className="h-2/3 flex justify-center"
        data={{ videoPreviewInstance, videoPath, handleTimeUpdate, handlePreviewState, effects }}
      />

      <Controls
        className="h-8 flex justify-between items-center"
        data={{ preview: videoPreviewInstance.current, videoDuration, currentTime, isPlaying, isFullscreen, increaseZoom, decreaseZoom }}
      />

      <Timeline
        className="h-1/3 flex justify-center"
        data={{ preview: videoPreviewInstance.current, videoDuration, currentTime, setCurrentTime, effects, handleEffectsChange, zoomLevel }}
      />
    </div>
  )
}
