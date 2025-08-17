import { useEffect, useRef, useImperativeHandle } from "react";
import { Stage, Layer, Line } from "react-konva";
import { getRelativePointerPosition } from "./utils";

export default function Canvas({
  penColor,
  penWidth,
  width,
  height,
  foregroundAnnotation,
  onForegroundAnnotationChange,
  ref: canvasRefProp,
  freeze,
  freezeTime
}) {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const isDrawing = useRef(false);
  const timerRef = useRef(null);

  useImperativeHandle(canvasRefProp, () => ({
    clear: () => {
      onForegroundAnnotationChange([]);
    }
  }));

  useEffect(() => {
    const stage = stageRef.current;
    const handlePointerDown = () => {
      isDrawing.current = true;
      const pos = getRelativePointerPosition(stage);
      const newLine = {
        points: [pos.x, pos.y],
        color: penColor,
        width: penWidth,
        type: "source-over"
      };
      onForegroundAnnotationChange([...foregroundAnnotation, newLine]);
    };

    const handlePointerMove = () => {
      if (!isDrawing.current) return;
      const pos = getRelativePointerPosition(stage);
      const lines = foregroundAnnotation.slice();
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      onForegroundAnnotationChange(lines);
    };

    const handlePointerUp = () => {
      isDrawing.current = false;
    };

    stage.container().addEventListener("pointerdown", handlePointerDown);
    stage.container().addEventListener("pointermove", handlePointerMove);
    stage.container().addEventListener("pointerup", handlePointerUp);

    return () => {
      stage.container().removeEventListener("pointerdown", handlePointerDown);
      stage.container().removeEventListener("pointermove", handlePointerMove);
      stage.container().removeEventListener("pointerup", handlePointerUp);
    };
  }, [penColor, penWidth, foregroundAnnotation, onForegroundAnnotationChange]);

  useEffect(() => {
    // Clear any existing timer
    if (freeze) return

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer to clear annotations after 5 seconds
    if (foregroundAnnotation.length > 0) {
      timerRef.current = setTimeout(() => {
        onForegroundAnnotationChange([]);
      }, freezeTime);
    }

    // Cleanup timer on component unmount or when foregroundAnnotation changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [foregroundAnnotation, onForegroundAnnotationChange, freeze, freezeTime]);

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer ref={layerRef}>
        {foregroundAnnotation.map((line, idx) => (
          <Line
            key={idx}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.width}
            tension={0.5}
            lineCap="round"
            globalCompositeOperation={line.type}
            draggable={false}
          />
        ))}
      </Layer>
    </Stage>
  );
}
