import { useSetAtom, useAtom } from 'jotai';
import { addMouseTimeStampsAtom, mouseTimeStampsAtom, resetMouseTimeStampsAtom } from '@renderer/store';
import { useState } from "react";

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const recordedChunks = [];

  const setMouseTimeStamps = useSetAtom(addMouseTimeStampsAtom);
  const setResetMouseTimeStamps = useSetAtom(resetMouseTimeStampsAtom);
  const [mouseRecord] = useAtom(mouseTimeStampsAtom);

  const options = { mimeType: 'video/webm; codecs=vp9' };

  const startRecording = async () => {
    setResetMouseTimeStamps();
    setIsRecording(true);

    try {
      window.api.recordMouse();
      await window.api.startRecording();

      const data = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: { framerate: 30 },
      });

      const mediaRecorder = new MediaRecorder(data, options);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;

      setRecorder(mediaRecorder);

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      window.api.stopRecordingMouse();
    }
  };

  const stopRecording = async (callback) => {
    if (!recorder || !isRecording) return;

    setIsRecording(false);
    setIsPaused(false);
    callback()

    try {
      const { mouseRecords } = await window.api.saveMouseRecords();
      mouseRecords.forEach(record => setMouseTimeStamps(record));
      recorder.stop();
    } catch (error) {
      console.error('Error saving mouse records:', error);
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
    recordedChunks.push(e.data);
  };

  const handleStop = async () => {
    const blob = new Blob(recordedChunks, options);
    const arrayBuffer = await blob.arrayBuffer();
    try {
      await window.api.stopRecording(arrayBuffer);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    recordedChunks.length = 0;
  };

  return { startRecording, stopRecording, togglePause, mouseRecord, isRecording, isPaused }
}

