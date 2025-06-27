import { useEffect, useState } from 'react'

export const Controls = () => {
  let recordingChunks = []
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState([])

  const options = { mimeType: 'video/webm; codecs=vp9' };

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
  }

  const handleDataAvailable = (e) => {
    recordingChunks.push(e.data)
  }

  const handleStop = async () => {
    const blob = new Blob(recordingChunks, options)
    const arrayBuffer = await blob.arrayBuffer()
    await window.api.stopRecording(arrayBuffer)
  }

  return (
    <div className="flex w-full gap-2">
      {!isRecording ? (
        <button
          className="grow border rounded cursor-pointer"
          onClick={startRecording}
        >
          Start
        </button>
      ) : (
        <div className='grow flex'>
          <TimeIndicator />
          <button className="border rounded cursor-pointer px-3" onClick={stopRecording}>
            Stop
          </button>
        </div>
      )}
    </div>
  )
}

const TimeIndicator = () => {
  const [time, setTime] = useState({
    hour: 0,
    minute: 0,
    second: 0
  })

  const padZero = (num) => num < 10 ? `0${num}` : `${num}`

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prev) => {
        const updatedSecond = parseInt(prev.second + 1)
        const updatedMinute = parseInt(prev.minute + 1)
        const updatedHour = parseInt(prev.hour + 1)

        if (updatedSecond < 60) {
          return { ...prev, second: updatedSecond }
        } else if (updatedMinute < 60) {
          return { ...prev, minute: updatedMinute, second: 0 }
        } else if (updatedHour < 24) {
          return { hour: updatedHour, minute: 0, second: 0 }
        } else {
          return { hour: 0, minute: 0, second: 0 }
        }
      })

    }, 1000)

    return () => clearInterval(intervalId);
  }, [])

  return (
    <span className='grow px-3 inline-flex justify-center'>
      {`${padZero(time.hour)}:${padZero(time.minute)}:${padZero(time.second)}`}
    </span>
  )
}
