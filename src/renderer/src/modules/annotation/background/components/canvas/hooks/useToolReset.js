import { useEffect } from 'react';

export default function useToolReset(tool, isDrawing, originRef, setTempEnd) {
  useEffect(() => {
    isDrawing.current = false;
    originRef.current = { x: null, y: null };
    setTempEnd({ x: null, y: null });
  }, [tool, setTempEnd]);
}
