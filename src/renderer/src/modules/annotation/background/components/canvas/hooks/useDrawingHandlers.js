import { useEffect, useState } from 'react';
import { getRelativePointerPosition } from '../utils';

export default function useDrawingHandlers(
  stageRef,
  isDrawing,
  originRef,
  penColor,
  penWidth,
  tool,
  foregroundAnnotation,
  onForegroundAnnotationChange
) {
  const [drawnArrows, setDrawnArrows] = useState([]);
  const [tempEnd, setTempEnd] = useState({ x: null, y: null });
  const [textAreas, setTextAreas] = useState([]);

  const handlePointerDown = (e) => {
    e.cancelBubble = true;
    isDrawing.current = true;
    const pos = getRelativePointerPosition(stageRef.current);
    if (!pos) return;

    originRef.current = { x: pos.x, y: pos.y };

    if (tool === 'pen' || tool === 'eraser') {
      const newLine = {
        points: [pos.x, pos.y],
        color: penColor,
        width: penWidth,
        type: tool === 'eraser' ? 'destination-out' : 'source-over'
      };
      onForegroundAnnotationChange([...foregroundAnnotation, newLine]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return;
    e.cancelBubble = true;
    const pos = getRelativePointerPosition(stageRef.current);
    if (!pos) return;

    if (tool === 'pen' || tool === 'eraser') {
      const lines = [...foregroundAnnotation];
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        lastLine.points = lastLine.points.concat([pos.x, pos.y]);
        onForegroundAnnotationChange(lines);
      }
    } else if (tool === 'arrow' || tool === 'text') {
      setTempEnd({ x: pos.x, y: pos.y });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawing.current) return;
    e.cancelBubble = true;
    const pos = getRelativePointerPosition(stageRef.current);
    if (!pos) {
      isDrawing.current = false;
      originRef.current = { x: null, y: null };
      setTempEnd({ x: null, y: null });
      return;
    }

    if (tool === 'arrow') {
      if (originRef.current.x !== null && pos.x !== null) {
        const newArrow = {
          points: [originRef.current.x, originRef.current.y, pos.x, pos.y],
          color: penColor
        };
        setDrawnArrows((prev) => [...prev, newArrow]);
      }
      setTempEnd({ x: null, y: null });
    } else if (tool === 'text') {
      if (originRef.current.x !== null && tempEnd.x !== null) {
        const x = Math.min(originRef.current.x, tempEnd.x);
        const y = Math.min(originRef.current.y, tempEnd.y);
        const width = Math.abs(tempEnd.x - originRef.current.x);
        const height = Math.abs(tempEnd.y - originRef.current.y);

        if (width >= 10 && height >= 10) {
          setTextAreas((prev) => [
            ...prev,
            { x, y, width, height, id: Date.now(), penColor }
          ]);
        }
      }
      setTempEnd({ x: null, y: null });
    }

    isDrawing.current = false;
    originRef.current = { x: null, y: null };
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const options = { passive: false };

    const setupEventListeners = () => {
      stage.container().addEventListener('pointerdown', handlePointerDown, options);
      stage.container().addEventListener('pointermove', handlePointerMove, options);
      stage.container().addEventListener('pointerup', handlePointerUp, options);
    };

    const cleanupEventListeners = () => {
      stage.container().removeEventListener('pointerdown', handlePointerDown, options);
      stage.container().removeEventListener('pointermove', handlePointerMove, options);
      stage.container().removeEventListener('pointerup', handlePointerUp, options);
    };

    setupEventListeners();

    return cleanupEventListeners;
  }, [penColor, penWidth, tool, foregroundAnnotation, onForegroundAnnotationChange, tempEnd]);

  return {
    drawnArrows,
    setDrawnArrows,
    tempEnd,
    setTempEnd,
    textAreas,
    setTextAreas,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
