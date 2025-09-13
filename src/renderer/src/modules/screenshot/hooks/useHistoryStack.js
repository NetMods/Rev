import { useEffect } from "react";

const useHistoryStack = (historyRef, setPencilLines, setTempArrowEnd, tempArrowStart, setArrows, setConfig) => {


  useEffect(() => {
    let historyStack = historyRef.current
    if (!historyStack) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        const prevTask = historyStack.undo();
        if (!prevTask) return;

        switch (prevTask.type) {
          case "pen":
            setPencilLines(prevTask.state);
            break;
          case "arrows":
            setTempArrowEnd(null);
            tempArrowStart.current = null;
            setArrows(prevTask.state);
            break;
        }
      } else if (e.key === "Escape") {
        setConfig({
          tool: "none"
        })
      }
    };


    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [setArrows, setConfig, setPencilLines, setTempArrowEnd, tempArrowStart]);
}

export default useHistoryStack
