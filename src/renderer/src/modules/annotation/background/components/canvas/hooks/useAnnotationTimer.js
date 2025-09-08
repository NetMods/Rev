import { useEffect, useRef } from 'react';

export default function useAnnotationTimer(
  foregroundAnnotation,
  drawnArrows,
  textAreas,
  onForegroundAnnotationChange,
  setDrawnArrows,
  setTextAreas,
  freeze,
  freezeTime
) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (freeze) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (foregroundAnnotation.length > 0 || drawnArrows.length > 0 || textAreas.length > 0) {
      timerRef.current = setTimeout(() => {
        onForegroundAnnotationChange([]);
        setDrawnArrows([]);
        setTextAreas([]);
      }, freezeTime);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [foregroundAnnotation, drawnArrows, textAreas, onForegroundAnnotationChange, setDrawnArrows, setTextAreas, freeze, freezeTime]);
}
