import { PiExport as ExportIcon } from "react-icons/pi";
import { IoPlay as Play, IoPauseSharp as Pause } from 'react-icons/io5';
import { LuPlus as Plus, LuMinus as Minus } from "react-icons/lu";
import { formatTime } from "../utils";
import { cn } from "../../../shared/utils";

export const Controls = ({ className, data }) => {
  const { preview, isPlaying, currentTime, videoDuration, increaseZoom, decreaseZoom, onExportModalOpen } = data

  return (
    <div className={cn("px-4 border-2 rounded border-base-content/10 bg-base-200", className)}>
      <div className="flex items-center justify-center text-sm font-mono space-x-1 text-base-content/70">
        <span>{formatTime(currentTime)}</span>
        <span className="px-1">/</span>
        <span>{formatTime(videoDuration)}</span>
      </div>

      <button
        onClick={() => preview.togglePlayPause()}
        className="z-50 btn btn-circle"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex gap-2">
        <button
          onClick={decreaseZoom}
          className="z-50 p-1 cursor-pointer rounded-full hover:bg-base-300"
        >
          <Minus size={20} />
        </button>

        <button
          onClick={increaseZoom}
          className="z-50 p-1 cursor-pointer rounded-full hover:bg-base-300"
        >
          <Plus size={20} />
        </button>

        {/*
          <button
            onClick={() => preview.toggleFullscreen()}
            className="z-50 p-1 cursor-pointer rounded-full hover:bg-base-300"
          >
            <Fullscreen size={20} />
          </button>
      */
        }

        <button
          onClick={onExportModalOpen}
          className="z-50 p-1 text-xs cursor-pointer rounded-sm px-2 hover:bg-base-300 inline-flex justify-center items-center gap-2"
        >
          <ExportIcon size={17} className="shrink-0" />
          Export
        </button>
      </div>
    </div >
  )
}
