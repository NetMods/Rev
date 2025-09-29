import { useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getPresetConfigAtom, setPresetConfigAtom } from "../../store";
import { useDrawingLogic } from "./hooks/useDrawingLogic";
import { AnnotationCanvas } from "./components/AnnotationCanvas";
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif";
import ToolPanel from "./components/toolPanel"
import StylePanel from "./components/stylePanel";
import HistoryStack from "./utils/historyStack";
import DeleteModal from "./components/modals/delete-modal";
import SaveModal from "./components/modals/save-modal";
import useCanvasResize from "./hooks/useCanvasResize";
// import useHistoryStack from "./hooks/useHistoryStack";


export default function EditorPage() {

  const [imageUrl, setImageUrl] = useState(null);
  const [displayDims, setDisplayDims] = useState(null);
  const [cropRect, setCropRect] = useState(null);

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const editorRef = useRef(null);
  const applyEffectRef = useRef(() => { });
  const historyRef = useRef(new HistoryStack([]))

  const config = useAtomValue(getPresetConfigAtom);
  const setConfig = useSetAtom(setPresetConfigAtom);

  const [stageSize, canvasContainerRef] = useCanvasResize()

  useEffect(() => {
    window.api.screenshot.onShow((data) => setImageUrl(data));
  }, []);

  const {
    pencilLines, arrows, cropPreview, tempArrowStart, tempArrowEnd,
    handleMouseDown, handleMouseMove, handleMouseUp
  } = useDrawingLogic(config, applyEffectRef.current, historyRef.current);

  // this has to revised again for maintaning history
  // useHistoryStack(historyRef, setPencilLines, setTempArrowEnd, tempArrowStart, setArrows, setConfig)

  const stageProps = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: (e) => handleMouseUp(e, (newCropRect) => {
      setCropRect(newCropRect);
      setConfig({ tool: 'none' });
    }),
  };

  return (
    <>
      <div ref={editorRef} className="relative h-screen w-screen overflow-hidden p-1 no-drag font-sans">
        <div className="h-full w-full grid grid-cols-[4fr_1fr] grid-rows-[11fr_1fr] no-drag">
          <div
            ref={canvasContainerRef}
            className="flex justify-center items-center w-full h-full bg-neutral"
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
          <ToolPanel stageRef={stageRef} displayDims={displayDims} setCropRect={setCropRect} />
        </div>
      </div>
      {/* Delete Modal */}
      <DeleteModal />
      {/* Save Modal */}
      <SaveModal />
    </>
  );
}
