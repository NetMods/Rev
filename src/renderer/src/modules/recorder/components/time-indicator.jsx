import { useEffect, useState, memo } from 'react';
import { cn } from '../../../shared/utils';

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const TimeIndicator = memo(function TimeIndicator({ isRecording, isPaused, onTimeLimitExceeds, className }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    let startTime = Date.now();
    let lastElapsed = elapsed;

    if (isPaused) return;

    const tick = () => {
      const updatedTime = lastElapsed + Date.now() - startTime
      if (updatedTime > 360000) onTimeLimitExceeds()
      setElapsed(updatedTime);
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  return <span className={cn("inline-flex flex-col items-center justify-end", className)}>{formatTime(elapsed)}</span>
});
