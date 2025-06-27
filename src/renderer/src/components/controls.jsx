import { useState } from 'react'
import { IconsTable } from '../constants/iconsTable'
import { TimeIndicator } from './timeIndicator'
import { Square, Play, Pause, PencilLine, X, Video } from 'lucide-react';

export const Controls = () => {
  let recordingChunks = []
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState([])

  const options = { mimeType: 'video/webm; codecs=vp9' };

  const [resume, setResume] = useState(true)

  const startRecording = async () => {
    setIsRecording(true)
    await window.api.startRecording()

    const data = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        framerate: 30
      }
    })

    const recorder = new MediaRecorder(data, options)
    recorder.ondataavailable = handleDataAvailable
    recorder.onstop = handleStop
    setMediaRecorder(recorder)

    recorder.start()
  }

  const stopRecording = async () => {
    setIsRecording(false)
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
    setResume((prev) => !prev)
  }

  const closeApp = () => {
    window.api.closeApp()
  }

  return (
    <div className="no-drag flex flex-col w-full gap-2">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <button
            disabled={!isRecording}
            className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={stopRecording}
          >
            <Square />
          </button>
          <TimeIndicator isRecording={isRecording} resumeRecording={resume} />
        </div>
        <button
          disabled={!isRecording}
          className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          onClick={toggleResuming}
        >
          {resume ? <Pause /> : <Play />}
        </button>
      </div>
      {IconsTable.line}
      <div className="flex flex-col gap-2">
        <PencilLine className='cursor-pointer' onClick={() => { }} />
        <Video className='cursor-pointer' onClick={startRecording} />
      </div>
      {IconsTable.line}
      <div>
        <X className='cursor-pointer' onClick={closeApp} />
      </div>
    </div>
  )
}
