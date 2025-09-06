import { useImperativeHandle } from 'react';

export default function useCanvasImperative(
  canvasRefProp,
  onForegroundAnnotationChange,
  setDrawnArrows,
  setTextAreas
) {
  useImperativeHandle(canvasRefProp, () => ({
    clear: () => {
      onForegroundAnnotationChange([]);
      setDrawnArrows([]);
      setTextAreas([]);
    }
  }));
}
