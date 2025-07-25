import { useEffect, useState } from 'react';

const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);

export const TimeIndicator = ({ isRecording, isPaused, onTimeLimitExceeds }) => {
  const [time, setTime] = useState({ minute: 0, second: 0 });

  useEffect(() => {
    if (!isRecording) {
      setTime({ minute: 0, second: 0 });
    }
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording || isPaused) return;

    const intervalId = setInterval(() => {
      setTime((prev) => {
        let { minute, second } = prev;

        second += 1;
        if (second >= 60) {
          second = 0;
          minute += 1;
        }
        if (minute >= 9 && second >= 59) {
          onTimeLimitExceeds()
          return { minute: 0, second: 0 };
        }
        return { minute, second };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRecording, isPaused, onTimeLimitExceeds]);

  return (
    <span className='inline-flex justify-center text-sm'>{`${time.minute}:${padZero(time.second)}`} </span>
  );
};
