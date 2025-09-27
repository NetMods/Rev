import { useEffect, useState } from "react";

export function useContainerWidth(containerRef) {
  const [containerWidth, setContainerWidth] = useState(0);
  const padding = 20


  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    setContainerWidth(el.clientWidth - 2 * padding);

    const observer = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth - 2 * padding);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  return containerWidth;
}
