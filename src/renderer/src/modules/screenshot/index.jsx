import { useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getPresetConfigAtom, setPresetConfigAtom } from "../../store";
import { useDrawingLogic } from "./hooks/useDrawingLogic";
import { AnnotationCanvas } from "./components/AnnotationCanvas";
import { downloadDataUrl } from "./utils/download";
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif";
import ToolPanel from "./components/toolPanel"
import StylePanel from "./components/stylePanel";

const PADDING = 8;

export default function EditorPage() {
  const [imageUrl, setImageUrl] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [displayDims, setDisplayDims] = useState(null);
  const [cropRect, setCropRect] = useState(null);

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const applyEffectRef = useRef(() => { });

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
    pencilLines, arrows, cropPreview, tempArrowStart, tempArrowEnd,
    handleMouseDown, handleMouseMove, handleMouseUp,
  } = useDrawingLogic(config, applyEffectRef.current);

  const handleSave = () => {
    const stage = stageRef.current;
    if (!stage || !displayDims) return;

    const dataUrl = stage.toDataURL({
      x: displayDims.x,
      y: displayDims.y,
      width: displayDims.width,
      height: displayDims.height,
      pixelRatio: displayDims.crop.width / displayDims.width,
    });
    downloadDataUrl(dataUrl, `screenshot-${Date.now()}.png`);
  };

  const stageProps = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: (e) => handleMouseUp(e, (newCropRect) => {
      setCropRect(newCropRect);
      setConfig({ tool: 'none' });
    }),
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden p-1">
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
            />
          )}
        </div>
        <StylePanel />
        <ToolPanel onSave={handleSave} />
      </div>
    </div>
  );
}
