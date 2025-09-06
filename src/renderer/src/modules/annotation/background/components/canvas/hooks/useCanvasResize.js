import { useEffect } from 'react';

export default function useCanvasResize(stageRef, width, height) {
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.width(width);
      stageRef.current.height(height);
      stageRef.current.batchDraw();
    }
  }, [width, height]);
}
