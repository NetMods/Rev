import {
  IoStop as CircleStopIcon,
  IoPlay as Play,
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
  IoPauseSharp as Pause,
} from 'react-icons/io5';
import { FiEdit2 as Pencil } from 'react-icons/fi';
import { useRecording } from './hooks/use-recording';
import { OperatingMode } from "../../shared/constants"
import { TimeIndicator } from "./components/time-indicator"
import { useState } from "react"

export default function Page() {
  const { startRecording, stopRecording, togglePause, isRecording, isPaused } = useRecording()

  const [selectedMode, setSelectedMode] = useState(OperatingMode.VIDEO);

  return (
    <div className="p-2 bg-black/90 text-white/70 max-w-[5rem]">
      <div className="flex flex-col gap-3">
        <div className="inline-flex flex-col gap-2">
          <div className="inline-flex flex-col gap-1">
            <button
              disabled={!isRecording}
              className={`disabled:opacity-50 py-1 no-drag ${isRecording && 'bg-red-500/50'} inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded transition-all ease-in-out ${isRecording ? 'hover:shadow-md shadow-red-600/40' : 'hover:bg-neutral-800'}`}
              onClick={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}
            >
              <CircleStopIcon size={20} />
            </button>
            <TimeIndicator
              isRecording={isRecording}
              isPaused={isPaused}
              onTimeLimitExceeds={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}
            />
          </div>
          <button
            disabled={selectedMode !== OperatingMode.VIDEO}
            className={`disabled:opacity-50 py-1 no-drag inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded hover:bg-neutral-801`}
            onClick={() => (isRecording ? togglePause() : startRecording())}
          >
            {isRecording && !isPaused ? <Pause size={23} /> : <Play size={20} />}
          </button>
        </div>

        <hr className="text-white/30" />

        <div className="flex flex-col gap-3">
          <button
            className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === OperatingMode.VIDEO ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
            onClick={() => setSelectedMode(OperatingMode.VIDEO)}
          >
            <Video size={23} />
          </button>
          <button
            className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === OperatingMode.SCREENSHOT ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
            onClick={() => setSelectedMode(OperatingMode.SCREENSHOT)}
          >
            <Camera size={23} />
          </button>
          <button
            className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === OperatingMode.ANNOTATE ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
            onClick={() => setSelectedMode(OperatingMode.ANNOTATE)}
          >
            <Pencil size={20} />
          </button>
        </div>
        <hr className="text-white/30" />

        <button className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800">
          <Close onClick={() => window.api.closeWindow()} size={23} />
        </button>
      </div>
    </div>
  )
}
