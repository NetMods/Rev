import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import log from "electron-log/renderer";

const Page = () => {
  const originRef = useRef(null);
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [endPos, setEndPos] = useState(null);

  // send the end poinst back to the elctron to get a specific area
  useEffect(() => {
    if (isDrawing === false && endPos !== null) {
      log.info("the points are", endPos)
      window.api.screenshot.createUsingBuffer({
        origin: originRef.current,
        rectPos: endPos
      })
      window.api.core.closeWindow()
    }
  }, [endPos, isDrawing])

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleMouseDown = () => {
      log.info("detected mouse down");
      const pos = stage.getStage().getPointerPosition();
      if (!pos) return;
      setIsDrawing(true);
      setEndPos(null)
      originRef.current = { x: pos.x, y: pos.y };
    };

    const handleMouseMove = () => {
      if (!isDrawing) return;
      const pos = stage.getStage().getPointerPosition();
      if (!pos) return;
      setEndPos({ x: pos.x, y: pos.y });
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    const handlekeyDown = (evt) => {
      if (evt.key === "Escape") {
        //call the closing function for bufferWindow
      }
    }

    stage.on("mousedown", handleMouseDown);
    stage.on("mousemove", handleMouseMove);
    stage.on("mouseup", handleMouseUp);
    stage.on("keydown", handlekeyDown)

    // Cleanup
    return () => {
      stage.off("mousedown", handleMouseDown);
      stage.off("mousemove", handleMouseMove);
      stage.off("mouseup", handleMouseUp);
      stage.off("keydown", handlekeyDown)
    };
  }, [isDrawing]);


  return (
    <div className="h-full w-full no-drag">
      <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {isDrawing && originRef.current && endPos && (
            <Rect
              x={Math.min(originRef.current.x, endPos.x)}
              y={Math.min(originRef.current.y, endPos.y)}
              width={Math.abs(endPos.x - originRef.current.x)}
              height={Math.abs(endPos.y - originRef.current.y)}
              stroke="red"
              dash={[2, 2]}
            />
          )}
          {endPos && (
            <Rect
              x={Math.min(originRef.current.x, endPos.x)}
              y={Math.min(originRef.current.y, endPos.y)}
              width={Math.abs(endPos.x - originRef.current.x)}
              height={Math.abs(endPos.y - originRef.current.y)}
              stroke="red"
              dash={[2, 2]}
            />
          )
          }
        </Layer>
      </Stage>
    </div>
  );
};

export default Page;
