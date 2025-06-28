import { useState } from 'react'
import { TimeIndicator } from './time-indicator'
import {
  IoStop as CircleStopIcon,
  IoPlay as Play,
  IoPause as Pause,
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
} from "react-icons/io5";
import { FiEdit2 as Pencil } from "react-icons/fi";

export const Controls = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [resume, setResume] = useState(true)
  const [selectedMode, setSelectedMode] = useState('video')
  const recordingChunks = []

  const options = { mimeType: 'video/webm; codecs=vp9' };

  const selectVideoMode = () => {
    setSelectedMode('video')
  }

  const startRecording = async () => {
    if (selectedMode !== 'video') return;

    setIsRecording(true)
    await window.api.startRecording()

    const data = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: { framerate: 30 }
    })

    const recorder = new MediaRecorder(data, options)
    recorder.ondataavailable = handleDataAvailable
    recorder.onstop = handleStop
    setMediaRecorder(recorder)

    recorder.start()
  }

  const stopRecording = async () => {
    setIsRecording(false)
    setSelectedMode(null)
    mediaRecorder.stop()
    setResume(true)
  }

  const handleDataAvailable = (e) => {
    recordingChunks.push(e.data)
  }

  const handleStop = async () => {
    const blob = new Blob(recordingChunks, options)
    const arrayBuffer = await blob.arrayBuffer()
    await window.api.stopRecording(arrayBuffer)
  }

  const toggleResuming = () => {
    if (mediaRecorder && isRecording) {
      if (resume) {
        mediaRecorder.pause()
      } else {
        mediaRecorder.resume()
      }
      setResume((prev) => !prev)
    }
  }

  const takeScreenshot = async () => {
    if (selectedMode !== 'screenshot') {
      setSelectedMode('screenshot')
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      const track = stream.getVideoTracks()[0]
      const imageCapture = new ImageCapture(track)
      const bitmap = await imageCapture.grabFrame()
      track.stop()

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')
      context.drawImage(bitmap, 0, 0)
      const arrayBuffer = await new Promise(resolve => {
        canvas.toBlob(blob => blob.arrayBuffer().then(resolve))
      })
      await window.api.saveScreenshot(arrayBuffer)
      setSelectedMode(null)
    } catch (error) {
      console.error('Error capturing screenshot:', error)
    }
  }

  const selectAnnotationMode = () => {
    setSelectedMode('annotation')
  }

  const closeApp = () => {
    window.api.closeApp()
  }

  return (
    <div className="no-drag flex flex-col gap-3">
      <div className="inline-flex flex-col gap-3">
        <div className="inline-flex flex-col">
          <button
            disabled={!isRecording}
            className="disabled:opacity-50 py-1 inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded hover:bg-neutral-800"
            onClick={stopRecording}
          >
            <CircleStopIcon size={20} />
          </button>
          <TimeIndicator isRecording={isRecording} resumeRecording={resume} />
        </div>
        <button
          disabled={selectedMode !== 'video'}
          className={`disabled:opacity-50 py-1 inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded hover:bg-neutral-800 ${isRecording && resume ? 'bg-red-100' : ''}`}
          onClick={isRecording ? toggleResuming : startRecording}
        >
          {isRecording && resume ? <Pause size={23} /> : <Play size={20} />}
        </button>
      </div>

      <hr className="text-white/30" />

      <div className="flex flex-col gap-3">
        <button
          className={`rounded cursor-pointer py-1 inline-flex justify-center ${selectedMode === 'video' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={selectVideoMode}
        >
          <Video size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 inline-flex justify-center ${selectedMode === 'screenshot' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={takeScreenshot}
        >
          <Camera size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 inline-flex justify-center ${selectedMode === 'annotation' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={selectAnnotationMode}
        >
          <Pencil size={20} />
        </button>
      </div>

      <hr className="text-white/30" />

      <button className="rounded cursor-pointer py-1 inline-flex justify-center hover:bg-neutral-800">
        <Close onClick={closeApp} size={23} />
      </button>
    </div>
  )
}
