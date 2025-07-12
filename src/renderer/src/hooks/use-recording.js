import { useSetAtom, useAtom } from 'jotai';
import { addMouseTimeStampsAtom, mouseTimeStampsAtom, resetMouseTimeStampsAtom } from '@renderer/store';
import { useRef, useState } from "react";

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recorder, setRecorder] = useState(null);

  const setMouseTimeStamps = useSetAtom(addMouseTimeStampsAtom);
  const setResetMouseTimeStamps = useSetAtom(resetMouseTimeStampsAtom);
  const [mouseRecord] = useAtom(mouseTimeStampsAtom);

  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  const options = { mimeType: 'video/webm; codecs=vp9' };

  const startRecording = async () => {
    setResetMouseTimeStamps();
    setIsRecording(true);

    try {
      await window.api.startVideoRecording();
      window.api.startMouseTracking();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: { framerate: 30 },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = handleDataAvailable
      mediaRecorder.onstop = handleStop

      setRecorder(mediaRecorder);
      mediaRecorder.start(100); // Timeslice of 100ms to ensure frequent dataavailable events
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      await window.api.stopMouseTracking();
    }
  };

  const stopRecording = async (callback) => {
    if (!recorder || !isRecording) return;

    setIsRecording(false);
    setIsPaused(false);
    callback();

    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recorder.stop();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const togglePause = () => {
    if (recorder && !isPaused) {
      recorder.pause();
    } else if (recorder) {
      recorder.resume();
    }
    setIsPaused((prev) => !prev);
  };

  const handleDataAvailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.current.push(e.data);
    }
  };

  const handleStop = async () => {
    const blob = new Blob(recordedChunks.current, options);
    const arrayBuffer = await blob.arrayBuffer();

    try {
      await window.api.stopVideoRecording(arrayBuffer);
      const { mouseClickRecords } = await window.api.stopMouseTracking();
      mouseClickRecords?.forEach(record => setMouseTimeStamps(record));
    } catch (error) {
      console.error('Error saving recording:', error);
    }

    recordedChunks.current = [];
  }


  const applyEffectsOnVideo = () => {
    // Add any post-processing logic here if needed
  };

  return { startRecording, stopRecording, togglePause, mouseRecord, isRecording, isPaused };
};
