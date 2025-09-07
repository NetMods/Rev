// import {
//   IoPlay as Play,
//   IoCameraOutline as Camera,
//   IoVideocamOutline as Video,
//   IoClose as Close,
//   IoPauseSharp as Pause,
// } from 'react-icons/io5';
// import { SlPencil as Pencil } from "react-icons/sl";
// import { useRecording } from './hooks/use-recording';
// import { OperatingMode } from "../../shared/constants"
// import { TimeIndicator } from "./components/time-indicator"
// import { useState } from "react"
// import { cn } from "../../shared/utils";

export default function Page() {
  // const { startRecording, stopRecording, togglePause, isRecording, isPaused } = useRecording();

  // const [selectedMode, setSelectedMode] = useState(OperatingMode.VIDEO);

  return (
    <div className="font-sans w-full h-screen">
      <div className="w-full h-full bg-base-100 rounded-full flex justify-center items-center">hello</div>
    </div>
  );
}


{/*
            disabled={!isRecording}
            onClick={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}

          <TimeIndicator
            isRecording={isRecording}
            isPaused={isPaused}
            onTimeLimitExceeds={() => stopRecording(() => setSelectedMode(OperatingMode.VIDEO))}
          />

            onClick={() => (isRecording ? togglePause() : startRecording())}
          >
            {isRecording && !isPaused ? <Pause size={20} /> : <Play size={20} />}

    onClick={() => {
      setSelectedMode(OperatingMode.ANNOTATE)
      window.api.annotation.start()

    onClick={() => window.api.core.closeWindow()}
    */}
