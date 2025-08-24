import { useRef, useState } from "react";
import VideoPreview from "./video-preview"
import { useVideoPreview } from "../hooks/use-video-preview";
import { Controls } from "./controls";
import Timeline from "./timeline";

export const Editor = ({ data }) => {
  const { videoPath } = data
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(4);

  const handleTimeUpdate = (time, duration) => {
    setCurrentTime(time);
    if (duration && duration !== videoDuration) {
      setVideoDuration(duration);
    }
  };

  const canvasRef = useRef(null);
  const { preview, isPlaying, isFullscreen } = useVideoPreview({ canvasRef, videoPath, handleTimeUpdate });

  return (
    <div className='flex flex-col h-full gap-2'>
      <VideoPreview
        className="h-2/3 flex justify-center"
        data={{ canvasRef }}
      />

      <Controls
        className="flex justify-between items-center h-8"
        data={{ preview, isPlaying, isFullscreen, currentTime, videoDuration, setZoomLevel }}
      />

      <Timeline
        className="h-1/3 flex justify-center"
        data={{ videoDuration, preview, currentTime, setCurrentTime, zoomLevel }}
      />
    </div>
  )
}
