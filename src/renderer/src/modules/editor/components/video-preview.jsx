import { cn } from "../../../shared/utils"

const VideoPreview = ({ className, data }) => {
  const { canvasRef } = data

  return (
    <div className={cn("bg-card rounded border py-1", className)}>
      <div className="flex justify-center items-center h-full w-2/3">
        <canvas ref={canvasRef} className="border-2 border-foreground/40" />
      </div>
    </div>
  )
}

export default VideoPreview
