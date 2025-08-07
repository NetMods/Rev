import { useRef, useState } from "react";
import Canvas from "./components/canvas";

export default function App() {
  const canvasRef = useRef();
  const [foregroundAnnotation, setForegroundAnnotation] = useState([]);

  return (
    <div className="w-screen h-screen overflow-hidden no-drag">
      <Canvas
        ref={canvasRef}
        penColor="#ff0000"
        penWidth={5}
        width={window.innerWidth}
        height={window.innerHeight}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={setForegroundAnnotation}
      />
    </div>
  );
}
