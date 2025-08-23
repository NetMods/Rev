import { MdFullscreen as Fullscreen, MdFullscreenExit as FullscreenExit } from "react-icons/md";
import { IoPlay as Play, IoPauseSharp as Pause } from 'react-icons/io5';
import { LuPlus as Plus, LuMinus as Minus } from "react-icons/lu";
import { formatTime } from "../utils";
import { cn } from "../../../shared/utils";

export const Controls = ({ className, data }) => {
  const { preview, isPlaying, isFullscreen, currentTime, videoDuration } = data

  return (
    <div className={cn(" px-4 bg-card border", className)}>
      <div className="flex items-center justify-center text-sm font-mono text-foreground/80 space-x-1">
        <span>{formatTime(currentTime)}</span>
        <span className="text-foreground/50 px-1">/</span>
        <span>{formatTime(videoDuration)}</span>
      </div>

      <button
        onClick={() => preview.current.togglePlayPause()}
        className="z-50 cursor-pointer bg-muted hover:bg-foreground/20 p-1 inline-flex items-center justify-center transition-colors"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => preview.current.zoomOut()}
          className="z-50 cursor-pointer bg-muted hover:bg-foreground/20 p-1 inline-flex items-center justify-center transition-colors"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() => preview.current.zoomIn()}
          className="z-50 cursor-pointer bg-muted hover:bg-foreground/20 p-1 inline-flex items-center justify-center transition-colors"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => preview.current.toggleFullscreen()}
          className="z-50 cursor-pointer bg-muted hover:bg-foreground/20 p-1 inline-flex items-center justify-center transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <FullscreenExit size={20} /> : <Fullscreen size={20} />}
        </button>
      </div>
    </div>
  )
}
