import { IoClose as Close } from 'react-icons/io5';
import { TimeIndicator } from "./time-indicator";
import { cn } from '../../../shared/utils';
import { useState } from 'react';

export const CentralDisplay = ({ isRecording, stopRecording, hoveredIndex, buttons, elapsedTime }) => {
  const [isStopping, setIsStopping] = useState(false);

  const handleStopRecording = async () => {
    setIsStopping(true);
    try {
      await stopRecording();
    } finally {
      setIsStopping(false);
    }
  };

  const renderContent = () => {
    if (isRecording) {
      return (
        <div className='w-full h-full rounded-full grid grid-flow-row grid-rows-5 overflow-hidden'>
          <TimeIndicator
            className={"row-span-3 text-lg"}
            elapsedTime={elapsedTime}
          />
          <button
            className='hover:bg-red-600 no-drag hover:text-base-content bg-red-700 text-base-content/70 text-sm w-full row-span-2 cursor-pointer transition-all ease-linear duration-100 disabled:bg-neutral-600 disabled:text-base-content'
            onClick={handleStopRecording}
            disabled={isStopping}
          >
            {isStopping ? 'Ending' : 'Stop'}
          </button>
        </div>
      );
    }

    if (hoveredIndex !== null) {
      return (
        <span className="text-center text-xs font-medium">
          {buttons[hoveredIndex].label.split(" ").map((word, j) => (
            <span key={j} className="block">{word}</span>
          ))}
        </span>
      );
    }

    return <Close size={25} className='cursor-pointer no-drag' onClick={() => window.api.core.closeWindow()} />;
  };

  return (
    <div
      className={cn(
        `bg-base-100 btn btn-circle absolute rounded-full text-base-content/80 border border-base-content/20 drag move`,
        `size-20 flex justify-center items-center overflow-hidden z-10 relative`
      )}
    >
      <div className='bg-transparent absolute inset-0 -z-10 move pointer-events-none' />
      {renderContent()}
    </div>
  );
};
