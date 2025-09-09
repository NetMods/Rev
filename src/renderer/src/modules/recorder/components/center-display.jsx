import { IoClose as Close } from 'react-icons/io5';
import { TimeIndicator } from "./time-indicator";
import { cn } from '../../../shared/utils';

export const CentralDisplay = ({ isRecording, isPaused, stopRecording, hoveredIndex, buttons }) => {
  const renderContent = () => {
    if (isRecording) {
      return (
        <div className='w-full h-full rounded-full grid grid-flow-row grid-rows-5 overflow-hidden'>
          <TimeIndicator
            isRecording={isRecording}
            isPaused={isPaused}
            onTimeLimitExceeds={stopRecording}
            className={"row-span-3 text-lg"}
          />
          <button
            className='hover:bg-red-700 hover:text-base-content/80 bg-red-500 text-red-900 text-sm w-full row-span-2 cursor-pointer'
            onClick={stopRecording}
          >
            Stop
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

    return <Close size={25} className='cursor-pointer' onClick={() => window.api.core.closeWindow()} />;
  };

  return (
    <div
      className={cn(
        `bg-base-200 absolute rounded-full text-base-content/80 border border-base-content/20`,
        `size-20 flex justify-center items-center overflow-hidden z-10`
      )}
    >
      {renderContent()}
    </div>
  );
};
