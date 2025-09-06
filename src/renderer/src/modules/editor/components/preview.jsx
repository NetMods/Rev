import { cn } from "../../../shared/utils"
import { useVideoPreview } from "../hooks/use-video-preview";

const VideoPreview = ({ className, data }) => {
  const { videoPreviewInstance, videoPath, handleTimeUpdate, handlePreviewState, effects } = data

  const { canvasRef } = useVideoPreview({ videoPreviewInstance, videoPath, handleTimeUpdate, handlePreviewState, effects });

  return (
    <div className={cn("rounded border py-1", className)}>
      <div className="flex justify-center items-center h-full w-2/3 ">
        <canvas ref={canvasRef} className="border-2" />
      </div>
    </div>
  )
}

export default VideoPreview
