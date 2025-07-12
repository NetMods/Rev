import { useState } from 'react';
import { TimeIndicator } from './time-indicator';
import {
  IoStop as CircleStopIcon,
  IoPlay as Play,
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
} from 'react-icons/io5';
import { IoIosPause as Pause } from 'react-icons/io';
import { FiEdit2 as Pencil } from 'react-icons/fi';
import { useRecording } from '@renderer/hooks/use-recording';

export const Controls = () => {
  const { startRecording, stopRecording, togglePause, mouseRecord, isRecording, isPaused } = useRecording()

  const [selectedMode, setSelectedMode] = useState('video');

  console.log("mouse coords:", mouseRecord)

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex flex-col gap-2">
        <div className="inline-flex flex-col gap-1">
          <button
            disabled={!isRecording}
            className={`disabled:opacity-50 py-1 no-drag ${isRecording && 'bg-red-500/50'} inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded transition-all ease-in-out ${isRecording ? 'hover:shadow-md shadow-red-600/40' : 'hover:bg-neutral-800'}`}
            onClick={() => stopRecording(() => setSelectedMode('video'))}
          >
            <CircleStopIcon size={20} />
          </button>
          <TimeIndicator
            isRecording={isRecording}
            isPaused={isPaused}
            onTimeLimitExceeds={() => stopRecording(() => setSelectedMode('video'))}
          />
        </div>
        <button
          disabled={selectedMode !== 'video'}
          className={`disabled:opacity-50 py-1 no-drag inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded hover:bg-neutral-801`}
          onClick={() => (isRecording ? togglePause() : startRecording())}
        >
          {isRecording && !isPaused ? <Pause size={23} /> : <Play size={20} />}
        </button>
      </div>

      <hr className="text-white/30" />

      <div className="flex flex-col gap-3">
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'video' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('video')}
        >
          <Video size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'screenshot' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('screenshot')}
        >
          <Camera size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'annotation' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('annotation')}
        >
          <Pencil size={20} />
        </button>
      </div>

      <hr className="text-white/30" />

      <button className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800">
        <Close onClick={() => window.api.closeApp()} size={23} />
      </button>
    </div>
  );
};
