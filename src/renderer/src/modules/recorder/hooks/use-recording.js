import { useState } from "react";

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await window.api.recording.start();
    } catch (error) {
      console.error('[renderer] Error starting recording:', error);
    }
  };

  const stopRecording = async (callback) => {
    try {
      setIsRecording(false);
      setIsPaused(false);
      callback();
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
