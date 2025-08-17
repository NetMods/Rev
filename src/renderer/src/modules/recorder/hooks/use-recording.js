import { useSetAtom } from 'jotai';
import { setMouseTimeStampsAtom } from '@renderer/store';
import { useRef, useState } from "react";
import log from 'electron-log/renderer'

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recorder, setRecorder] = useState(null);

  const setMouseTimeStamps = useSetAtom(setMouseTimeStampsAtom);

  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  const options = { mimeType: 'video/webm; codecs=vp9' };

  const startRecording = async () => {
    setMouseTimeStamps([]);
    setIsRecording(true);

    try {
      await window.api.recording.start();
      window.api.recording.startMouse();

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
      await window.api.recording.stopMouse();
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

    try {
      const { mouseClickRecords } = await window.api.recording.stopMouse();
      setMouseTimeStamps(mouseClickRecords)

      const arrayBuffer = await blob.arrayBuffer();

      const data = {
        arrayBuffer,
        mouseClickRecords,
        timestamp: new Date().toISOString()
      }

      const projectId = await window.api.project.create(data)
      log.verbose("Got project with id:", projectId)

      await window.api.editor.create({ projectId })
    } catch (error) {
      log.error('Error saving recording:', error);
    }

    recordedChunks.current = [];
  }

  return { startRecording, stopRecording, togglePause, isRecording, isPaused };
};
