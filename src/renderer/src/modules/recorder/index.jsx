import {
  IoPlay as Play,
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
  IoPauseSharp as Pause,
} from 'react-icons/io5';
import { SlPencil as Pencil } from "react-icons/sl";
import { useRecording } from './hooks/use-recording';
import { OperatingMode } from "../../shared/constants"
import { TimeIndicator } from "./components/time-indicator"
import { useState } from "react"
import { cn } from "../../shared/utils";

export default function Page() {
  const { startRecording, stopRecording, togglePause, isRecording, isPaused } = useRecording();

  const [selectedMode, setSelectedMode] = useState(OperatingMode.VIDEO);

  return (
    <div className="py-1 border rounded select-none w-[53px]">
      <div className="flex flex-col gap-2 px-2">

        <div className="flex flex-col gap-1">
          <button
            disabled={!isRecording}
            className={cn(
              "py-2 no-drag flex justify-center items-center rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              isRecording ? "bg-red-700/90 hover:shadow-md" : ""
            )}
            onClick={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}
          >
            <span className='size-3.5 rounded-xs' />
          </button>

          <TimeIndicator
            isRecording={isRecording}
            isPaused={isPaused}
            onTimeLimitExceeds={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}
          />

          <button
            disabled={selectedMode !== OperatingMode.VIDEO}
            className="py-1 no-drag flex justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => (isRecording ? togglePause() : startRecording())}
          >
            {isRecording && !isPaused ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>

        <hr className="" />

        <div className="flex flex-col gap-2">
          <button
            className={cn(
              "py-1 no-drag flex justify-center rounded cursor-pointer",
              selectedMode === OperatingMode.VIDEO ? "" : ""
            )}
            onClick={() => setSelectedMode(OperatingMode.VIDEO)}
          >
            <Video size={23} />
          </button>

          <button
            className={cn(
              "py-1 no-drag flex justify-center rounded cursor-pointer",
              selectedMode === OperatingMode.SCREENSHOT ? "" : ""
            )}
            onClick={() => window.api.screenshot.create()}
          >
            <Camera size={23} />
          </button>

          <button
            className={cn("py-1 no-drag flex justify-center rounded cursor-pointer",
              selectedMode === OperatingMode.ANNOTATE ? "" : "",
            )}
            onClick={() => {
              setSelectedMode(OperatingMode.ANNOTATE)
              window.api.annotation.start()
            }}
          >
            <Pencil size={20} />
          </button>
        </div>

        <hr className="" />

        <button
          className="py-1 no-drag flex justify-center rounded cursor-pointer "
          onClick={() => window.api.core.closeWindow()}
        >
          <Close size={23} />
        </button>
      </div>
    </div>
  );
}
