import { cn } from "../../../shared/utils"
import { useVideoPreview } from "../hooks/use-video-preview";

const VideoPreview = ({ className, data }) => {
  const { videoPreviewInstance, videoPath, handleTimeUpdate, handlePreviewState, effects } = data

  const { canvasRef } = useVideoPreview({ videoPreviewInstance, videoPath, handleTimeUpdate, handlePreviewState, effects });

  return (
    <div className={cn("rounded border-2 py-1 border-base-content/10 bg-base-200", className)}>
      <div className="flex justify-center items-center h-full w-2/3 ">
        <canvas ref={canvasRef} className="border rounded-sm border-base-content/40" />
      </div>
    </div>
  )
}

export default VideoPreview
