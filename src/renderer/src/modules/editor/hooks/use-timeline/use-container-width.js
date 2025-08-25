import { useEffect, useState } from "react";

export function useContainerWidth(containerRef) {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const observer = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  return containerWidth;
}
