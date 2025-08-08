import { useEffect, useRef, useState } from "react";
import Canvas from "./components/canvas";

export default function App() {
  const canvasRef = useRef();
  const [foregroundAnnotation, setForegroundAnnotation] = useState([]);

  const [penColor, setPenColor] = useState("#ff0000")
  const [penSize, setPenSize] = useState(6)


  useEffect(() => {
    window.api.setAnnotationStyle((event, style) => {
      if (style.color) {
        setPenColor(style.color)
      }
      if (style.size) {
        setPenSize(style.size)
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
      />
    </div>
  );
}
