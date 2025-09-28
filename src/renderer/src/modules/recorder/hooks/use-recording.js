import { useState, useEffect } from "react";
import startSound from '../../../assets/start.wav';
import stopSound from '../../../assets/stop.wav';
import { playSound } from "../../../shared/utils";

const startRecSound = new Audio(startSound);
const stopRecSound = new Audio(stopSound);

startRecSound.volume = 0.05;
stopRecSound.volume = 0.05;

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const state = await window.api.recording.getState();
        setIsRecording(state.isRecording);
        setIsPaused(state.isPaused);
        setElapsedTime(state.elapsedTime);
      } catch (error) {
        console.error('[renderer] Error fetching initial recording state:', error);
      }
    };

    fetchInitialState();

    const handleStateChange = (_, state) => {
      setIsRecording(state.isRecording);
      setIsPaused(state.isPaused);
      setElapsedTime(state.elapsedTime);
    };

    window.api.recording.onStateChange(handleStateChange)
  }, []);

  const startRecording = async (opts) => {
    try {
      setIsRecording(true);
      playSound(startRecSound)
      await window.api.recording.start(opts);
    } catch (error) {
      console.error('[renderer] Error starting recording:', error);
      setIsRecording(false); // Reset on error
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
      const currentPausedState = isPaused
      setIsPaused(prev => !prev);

      if (currentPausedState) {
        await window.api.recording.resume();
      } else {
        await window.api.recording.pause();
      }
    } catch (error) {
      console.error('[renderer] Error toggling pause:', error);
      setIsPaused(!isPaused); // Revert on error
    }
  };

  return { startRecording, stopRecording, togglePause, isRecording, isPaused, elapsedTime };
};
