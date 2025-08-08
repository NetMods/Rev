import { useEffect, useRef, useState } from "react";
import Canvas from "./components/canvas";
import log from 'electron-log/renderer'

export default function App() {
  const canvasRef = useRef();
  const [foregroundAnnotation, setForegroundAnnotation] = useState([]);

  const [penColor, setPenColor] = useState("#ff0000")
  const [penSize, setPenSize] = useState(6)
  const [freeze, setFreeze] = useState(true)
  const [freezeTime, setFreezeTime] = useState(0)


  useEffect(() => {
    window.api.setAnnotationStyle((event, style) => {
      log.info(style)
      if (style.color) {
        setPenColor(style.color)
      }
      if (style.size) {
        setPenSize(style.size)
      }
      if (style.freeze || style.freeze === null || style.freeze === undefined) {
        setFreeze(true)
        setFreezeTime(style.freezeTime)
      } else {
        setFreeze(false)
        setFreezeTime(style.freezeTime)
      }
    })

    return () => {
      window.api.setAnnotationStyle = null
    }
  }, [])


  return (
    <div className="w-screen h-screen overflow-hidden no-drag">
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
  );
}
