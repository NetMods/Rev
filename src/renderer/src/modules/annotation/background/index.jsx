import log from 'electron-log/renderer'
import { useEffect, useRef, useState } from 'react'

import Canvas from './components/canvas'

export default function App() {
  const canvasRef = useRef(null)
  const [foregroundAnnotation, setForegroundAnnotation] = useState([])
  const [penColor, setPenColor] = useState('#ff0000')
  const [penSize, setPenSize] = useState(6)
  const [freeze, setFreeze] = useState(true)
  const [freezeTime, setFreezeTime] = useState(0)

  const handleAnnotationConfigChange = (_, config) => {
    log.info('Annotation configuration changed:', config)

    if (config.color) setPenColor(config.color)
    if (config.size) setPenSize(config.size)

    const shouldFreeze = config.freeze !== false
    setFreeze(shouldFreeze)

    if (config.freezeTime !== undefined) {
      setFreezeTime(config.freezeTime)
    }
  }

  useEffect(() => {
    window.api.annotation.setConfig(handleAnnotationConfigChange)
  }, [])

  return (
    <div className="annotation-background w-screen h-screen overflow-hidden no-drag cursor-crosshair fixed inset-0 z-10">
      <Canvas
        ref={canvasRef}
        penColor={penColor}
        penWidth={penSize}
        width={window.innerWidth}
        height={window.innerHeight}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={setForegroundAnnotation}
        freeze={freeze}
        freezeTime={freezeTime}
      />
    </div>
  )
}
