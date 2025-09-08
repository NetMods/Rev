import {
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
  IoPauseSharp as Pause,
  IoMicOutline as Mic
} from 'react-icons/io5';
import { BsPlay as Play } from "react-icons/bs";
import { useRecording } from './hooks/use-recording';
import { TimeIndicator } from "./components/time-indicator"
import { cn, playSound } from "../../shared/utils";
import { useState } from 'react';
import tickSound from '../../assets/click.wav';
import dslrSound from '../../assets/dslr.wav';

const hoverSound = new Audio(tickSound);
hoverSound.volume = 0.05;

const screenshotSound = new Audio(dslrSound);
screenshotSound.volume = 0.05;

export default function Page() {
  const { startRecording, stopRecording, togglePause, isRecording, isPaused } = useRecording();

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const buttons = [
    {
      icon: <Video size={35} />,
      action: () => { },
      label: "Web Camera",
    },
    {
      icon: <Mic size={35} />,
      label: "Microphone",
      action: () => { },
    },
    {
      icon: (
        <svg width="35" height="35" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className='text-base-content/70' stroke='#ffffffbb' d="M35.875 17.9375C61.5 7.6875 71.75 30.75 51.25 38.4375C7.68752 51.25 10.25 76.875 25.625 82C51.25 92.25 71.75 30.75 97.375 46.125C123 61.5 99.9375 115.312 76.875 107.625C51.25 94.8125 79.4375 51.25 107.625 97.375" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Annotate",
      action: () => window.api.annotation.start(),
    },
    {
      icon: <Camera size={35} />,
      action: () => playSound(screenshotSound),
      label: "Screenshot",
    },
    {
      icon: isRecording && !isPaused ? <Pause size={35} /> : <Play size={35} />,
      label: isRecording && !isPaused ? "Pause Recording" : "Start Recording",
      action: () => isRecording ? togglePause() : startRecording(),
    },
    {
      icon: (
        <svg width="35" height="35" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke='#ffffffbb' d="M60 157.5H120M90 127.5V157.5M30 22.5H150C158.284 22.5 165 29.2157 165 37.5V112.5C165 120.784 158.284 127.5 150 127.5H30C21.7157 127.5 15 120.784 15 112.5V37.5C15 29.2157 21.7157 22.5 30 22.5Z" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path stroke='#ffffffbb' d="M47.5 65.5V78.25M64.5 48.5V95.25M81.5 35.75V112.25M98.5 57V86.75M115.5 44.25V99.5M132.5 65.5V78.25" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "System Audio",
      action: () => { },
    }
    ,
  ]

  const createSlicePath = (index) => {
    const slices = buttons.length;
    const radius = (window.innerWidth) / 2;
    const centerX = window.innerWidth / 2
    const centerY = window.innerWidth / 2
    const anglePerSlice = 360 / slices;

    const startAngle = index * anglePerSlice;
    const endAngle = (index + 1) * anglePerSlice;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);

    const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const getButtonPosition = (index, totalButtons) => {
    const radius = window.innerWidth / 3
    const angle = ((index - 1) * 2 * Math.PI) / totalButtons;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return { transform: `translate(${x}px, ${y}px)` };
  };

  return (
    <div className="font-sans w-full h-screen select-none">
      <div className="w-full h-full bg-base-300 rounded-full flex justify-center items-center origin-center overflow-hidden">
        <svg
          width={window.innerWidth}
          height={window.innerHeight}
          className="absolute"
          style={{ zIndex: 0 }}
        >
          {buttons.map((button, index) => (
            <path
              key={index}
              d={createSlicePath(index)}
              fill="var(--color-base-100)"
              stroke="var(--color-base-content)"
              strokeOpacity={0.2}
              strokeWidth="1"
              className="transition-all duration-200 cursor-pointer hover:opacity-50"
              onClick={button.action}
              style={{
                filter: hoveredIndex === index
                  ? 'brightness(0.8) saturate(1.2)'
                  : 'brightness(1)',
                transform: hoveredIndex === index
                  ? 'scale(0.98)'
                  : 'scale(1)',
                transformOrigin: 'center'
              }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                playSound(hoverSound);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        <div
          className={cn(
            `bg-base-200 absolute rounded-full text-base-content/80 border border-base-content/20`,
            `size-24 flex justify-center items-center overflow-hidden`
          )}
        >
          {!isRecording && hoveredIndex !== null ? (
            <span className="text-center text-sm font-medium">
              {buttons[hoveredIndex].label.split(" ").map((word, j) => (
                <span key={j} className="block">
                  {word}
                </span>
              ))}
            </span>
          ) : (
            isRecording ? (
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
            ) : (
              <Close size={30} className='cursor-pointer' onClick={() => window.api.core.closeWindow()} />
            )
          )}
        </div>

        {buttons.map((button, i) => (
          <span
            key={i}
            className={cn("absolute text-base-content/70 flex flex-col justify-center items-center pointer-events-none", button?.className)}
            style={{ ...getButtonPosition(i, buttons.length) }}
          >
            <button className="hover:opacity-80 transition-opacity">
              {button.icon}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
