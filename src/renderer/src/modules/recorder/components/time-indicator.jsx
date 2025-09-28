import { memo } from 'react';
import { cn } from '../../../shared/utils';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const TimeIndicator = memo(function TimeIndicator({ elapsedTime, className }) {
  return <span className={cn("inline-flex flex-col items-center justify-end", className)}>{formatTime(elapsedTime)}</span>
});
