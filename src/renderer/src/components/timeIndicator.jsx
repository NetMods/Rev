import { useEffect, useState } from 'react';

export const TimeIndicator = ({ isRecording, resumeRecording }) => {
  const [time, setTime] = useState({
    minute: 0,
    second: 0,
  });

  const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);

  useEffect(() => {
    if (!isRecording) {
      setTime({
        minute: 0,
        second: 0
      })
      return;
    }

    if (!resumeRecording) return;

    const intervalId = setInterval(() => {
      setTime((prev) => {
        let { minute, second } = prev;

        second += 1;
        if (second >= 60) {
          second = 0;
          minute += 1;
        }

        return { minute, second };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRecording, resumeRecording]);

  return (
    <span className='grow px-3 inline-flex justify-center'>
      {`${padZero(time.minute)}:${padZero(time.second)}`}
    </span>
  );
};
