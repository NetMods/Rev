import { useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getPresetConfigAtom, setPresetConfigAtom } from "../../store";
import { useDrawingLogic } from "./hooks/useDrawingLogic";
import { AnnotationCanvas } from "./components/AnnotationCanvas";
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif";
import ToolPanel from "./components/toolPanel"
import StylePanel from "./components/stylePanel";
import HistoryStack from "./utils/historyStack";

const PADDING = 8;

export default function EditorPage() {

  const [imageUrl, setImageUrl] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [displayDims, setDisplayDims] = useState(null);
  const [cropRect, setCropRect] = useState(null);

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const editorRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const applyEffectRef = useRef(() => { });
  const historyRef = useRef(new HistoryStack([]))

  const config = useAtomValue(getPresetConfigAtom);
  const setConfig = useSetAtom(setPresetConfigAtom);

  useEffect(() => {
    window.api.screenshot.show((data) => setImageUrl(data));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        setStageSize({
          width: canvasContainerRef.current.clientWidth - PADDING,
          height: canvasContainerRef.current.clientHeight - PADDING,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    pencilLines, setPencilLines, arrows, setArrows, cropPreview, tempArrowStart, tempArrowEnd, setTempArrowEnd,
    handleMouseDown, handleMouseMove, handleMouseUp
  } = useDrawingLogic(config, applyEffectRef.current, historyRef.current);

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
  }, []);





  const stageProps = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: (e) => handleMouseUp(e, (newCropRect) => {
      setCropRect(newCropRect);
      setConfig({ tool: 'none' });
    }),
  };

  return (
    <div ref={editorRef} className="relative h-screen w-screen overflow-hidden p-1 no-drag">
      <div className="h-full w-full grid grid-cols-[4fr_1fr] grid-rows-[11fr_1fr] no-drag">
        <div
          ref={canvasContainerRef}
          className="flex justify-center items-center w-full h-full bg-[#222831]"
        >
          {!imageUrl ? (
            <img src={ScreeshotPlaceholder} alt="loading..." />
          ) : (
            <AnnotationCanvas
              stageRef={stageRef}
              layerRef={layerRef}
              stageSize={stageSize}
              imageUrl={imageUrl}
              cropRect={cropRect}
              pencilLines={pencilLines}
              arrows={arrows}
              cropPreview={cropPreview}
              tempArrowStart={tempArrowStart}
              tempArrowEnd={tempArrowEnd}
              stageProps={stageProps}
              onDisplayDimsChange={setDisplayDims}
              applyEffectRef={applyEffectRef}
              historyStack={historyRef.current}
            />
          )}
        </div>
        <StylePanel />
        <ToolPanel stageRef={stageRef} displayDims={displayDims} />
      </div>
    </div>
  );
}
