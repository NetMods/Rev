import log from "electron-log/renderer";
import { useAtomValue, useSetAtom } from "jotai";
import { getPresetConfigAtom, setPresetConfigAtom } from "../../store";
import { useEffect, useRef, useState } from "react";
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif";
import { Stage, Layer, Rect, Line, Arrow } from "react-konva";
import URLImage from "./components/urlimage";
import { PADDING } from "./constants";
import ToolPanel from "./components/tools-panel";
import StylePanel from "./components/stylepanel";

export default function Page() {
  const [imageUrl, setImageUrl] = useState(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const applyEffectRef = useRef(() => { });

  const config = useAtomValue(getPresetConfigAtom);
  const setConfig = useSetAtom(setPresetConfigAtom);

  const [displayDims, setDisplayDims] = useState(null);

  // Crop states
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectProps, setRectProps] = useState(null);
  const [cropRect, setCropRect] = useState(null);

  // Pen states
  const [pencilLines, setPencilLines] = useState([]);
  const isDrawingPencil = useRef(false);
  const lastPoint = useRef(null);
  const MIN_DISTANCE = 5;

  // Arrow states
  const [arrows, setArrows] = useState([]);
  const [tempArrowStart, setTempArrowStart] = useState(null);
  const [tempArrowEnd, setTempArrowEnd] = useState(null);

  // Blur and pixelate states
  const isDrawingEffect = useRef(false);

  useEffect(() => {
    window.api.screenshot.show((data) => {
      setImageUrl(data);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: canvasContainerRef.current.clientWidth - PADDING,
        height: canvasContainerRef.current.clientHeight - PADDING,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (config.tool === "crop") {
      setIsDrawing(true);
      setRectProps({
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
      });
    } else if (config.tool === "pen" || config.tool === "eraser") {
      isDrawingPencil.current = true;
      lastPoint.current = { x: pointer.x, y: pointer.y };
      setPencilLines((prev) => [
        ...prev,
        {
          points: [pointer.x, pointer.y],
          color: "red",
          width: 12,
          type: config.tool === "eraser" ? "destination-out" : "source-over",
        },
      ]);
    } else if (config.tool === "arrow") {
      setTempArrowStart({ x: pointer.x, y: pointer.y });
      setTempArrowEnd(null);
    } else if (config.tool === "pixelate") {
      isDrawingEffect.current = true;
      applyEffectRef.current(config.tool, pointer.x, pointer.y);
    }
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (isDrawing && config.tool === "crop") {
      setRectProps((prev) => ({
        ...prev,
        width: pointer.x - prev.x,
        height: pointer.y - prev.y,
      }));
    } else if ((isDrawingPencil.current && config.tool === "pen") || config.tool === "eraser") {
      const last = lastPoint.current;
      if (!last) return;
      const distance = Math.sqrt(
        Math.pow(pointer.x - last.x, 2) + Math.pow(pointer.y - last.y, 2)
      );

      if (distance >= MIN_DISTANCE) {
        setPencilLines((prev) => {
          const lines = prev.slice();
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
            lastLine.points = lastLine.points.concat([pointer.x, pointer.y]);
          }
          lastPoint.current = { x: pointer.x, y: pointer.y };
          return lines;
        });
      }
    } else if (config.tool === "arrow" && tempArrowStart) {
      setTempArrowEnd({ x: pointer.x, y: pointer.y });
    } else if ((config.tool === "pixelate") && isDrawingEffect.current) {
      applyEffectRef.current(config.tool, pointer.x, pointer.y);
    }
  };

  const handleMouseUp = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (config.tool === "crop") {
      setIsDrawing(false);
      setCropRect(rectProps);
      setRectProps(null);
      setConfig({ tool: "none" });
    } else if (config.tool === "pen" || config.tool === "eraser") {
      isDrawingPencil.current = false;
      lastPoint.current = null;
    } else if (config.tool === "arrow") {
      if (tempArrowStart) {
        setArrows((prev) => [
          ...prev,
          {
            points: [
              tempArrowStart.x,
              tempArrowStart.y,
              pointer.x,
              pointer.y,
            ],
            color: "yellow",
          },
        ]);
      }
      setTempArrowStart(null);
      setTempArrowEnd(null);
    } else if (config.tool === "pixelate") {
      isDrawingEffect.current = false;
    }
  };

  const downloadDataUrl = (dataUrl, filename = "screenshot.png") => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSave = () => {
    const stage = stageRef.current;
    if (!stage) return;

    if (displayDims) {
      const x = Math.round(displayDims.x);
      const y = Math.round(displayDims.y);
      const width = Math.round(displayDims.width);
      const height = Math.round(displayDims.height);

      const desiredWidth = Math.round(displayDims.crop.width);
      const desiredHeight = Math.round(displayDims.crop.height);

      const pixelRatioW = desiredWidth / Math.max(1, width);
      const pixelRatioH = desiredHeight / Math.max(1, height);
      const pixelRatio = (pixelRatioW + pixelRatioH) / 2;

      const dataUrl = stage.toDataURL({
        x,
        y,
        width,
        height,
        pixelRatio,
      });

      downloadDataUrl(dataUrl, `screenshot-${Date.now()}.png`);
      return;
    }

    const dataUrl = stage.toDataURL();
    downloadDataUrl(dataUrl, `screenshot-${Date.now()}.png`);
  };

  useEffect(() => {
    if (config.tool !== "pen" && config.tool !== "eraser") {
      isDrawingPencil.current = false;
      lastPoint.current = null;
    }
    if (config.tool !== "pixelate") {
      isDrawingEffect.current = false;
    }
  }, [config.tool]);

  return (
    <div className="relative h-screen w-screen overflow-hidden p-1">
      <div className="h-full w-full grid grid-cols-[4fr_1fr] grid-rows-[11fr_1fr] no-drag">
        <div
          ref={canvasContainerRef}
          className="flex justify-center items-center w-full h-full min-w-0 min-h-0 bg-[#222831] no-drag"
        >
          {!imageUrl ? (
            <div className="h-full w-full flex justify-center items-center no-drag">
              <img src={ScreeshotPlaceholder} alt="screenshot-placeholder" />
            </div>
          ) : (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer ref={layerRef}>
                <URLImage
                  src={imageUrl}
                  stageWidth={stageSize.width}
                  stageHeight={stageSize.height}
                  cropRect={cropRect}
                  onDisplayDimsChange={setDisplayDims}
                  applyEffect={applyEffectRef}
                  batchDraw={() => layerRef.current?.batchDraw()}
                />
                {rectProps && (
                  <Rect
                    {...rectProps}
                    stroke="white"
                    dash={[6, 4]}
                    strokeWidth={2}
                  />
                )}
              </Layer>
              <Layer>
                {/* Draw pen lines */}
                {pencilLines.map((line, idx) => (
                  <Line
                    key={idx}
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.width}
                    tension={0.3}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={line.type}
                    draggable={false}
                  />
                ))}

                {/* Draw arrows */}
                {arrows.map((arrow, idx) => (
                  <Arrow
                    key={idx}
                    points={arrow.points}
                    pointerLength={10}
                    pointerWidth={10}
                    fill={arrow.color}
                    stroke={arrow.color}
                    strokeWidth={4}
                  />
                ))}

                {/* Temporary arrow preview */}
                {tempArrowStart && tempArrowEnd && (
                  <Arrow
                    points={[
                      tempArrowStart.x,
                      tempArrowStart.y,
                      tempArrowEnd.x,
                      tempArrowEnd.y,
                    ]}
                    pointerLength={10}
                    pointerWidth={10}
                    fill="gray"
                    stroke="gray"
                    strokeWidth={4}
                    opacity={0.5}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </div>
        <StylePanel />
        <ToolPanel onSave={handleSave} />
      </div>
    </div>
  );
}
