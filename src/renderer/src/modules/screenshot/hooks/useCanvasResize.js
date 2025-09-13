import { useEffect, useRef, useState } from "react"
import { PADDING } from "../constants";

const useCanvasResize = () => {

  const canvasContainerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        setStageSize({
          width: canvasContainerRef.current.clientWidth - PADDING,
          height: canvasContainerRef.current.clientHeight - PADDING,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return [
    stageSize,
    canvasContainerRef
  ]
}

export default useCanvasResize
