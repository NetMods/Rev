import { useState } from "react";
import startSound from '../../../assets/start.wav';
import stopSound from '../../../assets/stop.wav';

const startRecSound = new Audio(startSound);
const stopRecSound = new Audio(stopSound);
startRecSound.volume = 0.05;
stopRecSound.volume = 0.05;

const playSound = (sound) => {
  sound.currentTime = 0;
  sound.play().catch((e) => {
    console.log(e)
  });
};
export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      playSound(startRecSound)
      await window.api.recording.start();
    } catch (error) {
      console.error('[renderer] Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsPaused(false);
      playSound(stopRecSound)
      await window.api.recording.stop()
    } catch (error) {
      console.error('[renderer] Error stopping recording:', error);
    }
  };

  const togglePause = async () => {
    try {
      if (isPaused) {
        await window.api.recording.resume();
      } else {
        await window.api.recording.pause();
      }
      setIsPaused(prev => !prev);
    } catch (error) {
      console.error('[renderer] Error stopping recording:', error);
    }
  };

  return { startRecording, stopRecording, togglePause, isRecording, isPaused };
};
