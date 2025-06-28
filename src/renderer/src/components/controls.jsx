import { useState } from 'react'
import { TimeIndicator } from './time-indicator'
import {
  IoStop as CircleStopIcon,
  IoPlay as Play,
  IoCameraOutline as Camera,
  IoVideocamOutline as Video,
  IoClose as Close,
} from "react-icons/io5"
import { useSetAtom, useAtom } from 'jotai'
import { addMouseTimeStampsAtom, mouseTimeStampsAtom, resetMouseTimeStampsAtom } from '../store'
import { IoIosPause as Pause } from "react-icons/io";
import { FiEdit2 as Pencil } from "react-icons/fi";

export const Controls = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedMode, setSelectedMode] = useState('video')
  const recordedChunks = []


  // jotai atoms
  const setMouseTimeStamps = useSetAtom(addMouseTimeStampsAtom)
  const setResetMouseTimeStamps = useSetAtom(resetMouseTimeStampsAtom)
  const [mouseRecord,] = useAtom(mouseTimeStampsAtom)


  console.log("recorded values for mouse are", mouseRecord)

  const options = { mimeType: 'video/webm; codecs=vp9' }

  const startRecording = async () => {
    if (selectedMode !== 'video') return
    setResetMouseTimeStamps()
    setIsRecording(true)
    window.api.recordMouse()

    try {
      await window.api.startRecording()
      const data = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: { framerate: 30 }
      })
      const mediaRecorder = new MediaRecorder(data, options)
      mediaRecorder.ondataavailable = handleDataAvailable
      mediaRecorder.onstop = handleStop
      setRecorder(mediaRecorder)
      mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
      window.api.stopRecordingMouse()
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorder || !isRecording) {
      return
    }

    setIsRecording(false)
    setSelectedMode(null)
    setIsPaused(false)

    try {
      const { mouseRecords } = await window.api.saveMouseRecords()
      // Add each mouse record to the Jotai atom
      mouseRecords.forEach(record => {
        setMouseTimeStamps(record)
      })
      recorder.stop()
    } catch (error) {
      console.error('Error saving mouse records:', error)
    }
  }

  const handleDataAvailable = (e) => {
    recordedChunks.push(e.data)
  }

  const handleStop = async () => {
    const blob = new Blob(recordedChunks, options)
    const arrayBuffer = await blob.arrayBuffer()
    try {
      await window.api.stopRecording(arrayBuffer)
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
    recordingChunks.length = 0
  }

  const toggleResuming = () => {
    if (recorder && isRecording) {
      if (!isPaused) {
        recorder.pause()
      } else {
        recorder.resume()
      }
      setIsPaused((prev) => !prev)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex flex-col gap-2">
        <div className="inline-flex flex-col gap-1">
          <button
            disabled={!isRecording}
            className={`disabled:opacity-50 py-1 no-drag ${isRecording && "bg-red-500/50"} inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded transition-all ease-in-out ${isRecording ? 'hover:shadow-md shadow-red-600/40' : 'hover:bg-neutral-800'}`}
            onClick={stopRecording}
          >
            <CircleStopIcon size={20} />
          </button>
          <TimeIndicator
            isRecording={isRecording}
            isPaused={isPaused}
            onTimeLimitExceeds={stopRecording}
          />
        </div>
        <button
          disabled={selectedMode !== 'video'}
          className={`disabled:opacity-50 py-1 no-drag inline-flex justify-center disabled:cursor-not-allowed cursor-pointer rounded hover:bg-neutral-800`}
          onClick={isRecording ? toggleResuming : startRecording}
        >
          {isRecording && !isPaused ? <Pause size={23} /> : <Play size={20} />}
        </button>
      </div>

      <hr className="text-white/30" />

      <div className="flex flex-col gap-3">
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'video' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('video')}
        >
          <Video size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'screenshot' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('screenshot')}
        >
          <Camera size={23} />
        </button>
        <button
          className={`rounded cursor-pointer py-1 no-drag inline-flex justify-center ${selectedMode === 'annotation' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'}`}
          onClick={() => setSelectedMode('annotation')}
        >
          <Pencil size={20} />
        </button>
      </div>

      <hr className="text-white/30" />

      <button className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800">
        <Close onClick={() => window.api.closeApp()} size={23} />
      </button>
    </div>
  )
}
