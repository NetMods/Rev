import { useRef, useState } from "react";
import Canvas from "./components/canvas";
import { useAtom } from "jotai";
import { getCurrentColor, getCurrentSize } from "../../store";
import log from 'electron-log/renderer'

export default function App() {
  const canvasRef = useRef();
  const [foregroundAnnotation, setForegroundAnnotation] = useState([]);
  const [penColor] = useAtom(getCurrentColor)
  const [penWidth] = useAtom(getCurrentSize)


  log.info(penColor)

  return (
    <div className="w-screen h-screen overflow-hidden no-drag">
      <Canvas
        ref={canvasRef}
        penColor={penColor}
        penWidth={penWidth}
        width={window.innerWidth}
        height={window.innerHeight}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={setForegroundAnnotation}
      />
    </div>
  );
}
