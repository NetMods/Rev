import log from "electron-log/renderer"
import { useState, useRef } from "react";

const MIN_DISTANCE = 5;

export const useDrawingLogic = (config, applyEffect) => {
  const [pencilLines, setPencilLines] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [cropPreview, setCropPreview] = useState(null);
  const [tempArrowEnd, setTempArrowEnd] = useState(null);

  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const tempArrowStart = useRef(null);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    isDrawing.current = true;

    switch (config.tool) {
      case "crop":
        setCropPreview({ x: pos.x, y: pos.y, width: 0, height: 0 });
        break;
      case "pen":
      case "eraser":
        lastPoint.current = pos;
        setPencilLines((prev) => [
          ...prev,
          {
            points: [pos.x, pos.y],
            color: "red",
            width: 12,
            type: config.tool === "eraser" ? "destination-out" : "source-over",
          },
        ]);
        break;
      case "arrow":
        tempArrowStart.current = { x: pos.x, y: pos.y };
        setTempArrowEnd({ x: pos.x, y: pos.y }); // Initialize with start position
        break;
      case "pixelate":
        applyEffect(config.tool, pos.x, pos.y);
        break;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    switch (config.tool) {
      case "crop":
        setCropPreview((prev) => prev ? { ...prev, width: pos.x - prev.x, height: pos.y - prev.y } : null);
        break;
      case "pen":
      case "eraser": {
        if (!lastPoint.current) return;
        const dist = Math.hypot(pos.x - lastPoint.current.x, pos.y - lastPoint.current.y);
        if (dist >= MIN_DISTANCE) {
          setPencilLines((prev) => {
            const lines = [...prev];
            const lastLine = lines[lines.length - 1];
            if (lastLine) {
              lastLine.points = lastLine.points.concat([pos.x, pos.y]);
            }
            lastPoint.current = pos;
            return lines;
          });
        }
        break;
      }
      case "arrow":
        setTempArrowEnd({ x: pos.x, y: pos.y });
        break;
      case "pixelate":
        applyEffect(config.tool, pos.x, pos.y);
        break;
    }
  };

  const handleMouseUp = (e, onCrop) => {
    isDrawing.current = false;

    switch (config.tool) {
      case "crop":
        if (cropPreview) onCrop(cropPreview);
        setCropPreview(null);
        break;
      case "pen":
      case "eraser":
        lastPoint.current = null;
        break;
      case "arrow":
        if (tempArrowStart.current && tempArrowEnd) {
          log.info("the final value are : ", tempArrowStart.current, tempArrowEnd)
          setArrows((prev) => [
            ...prev,
            {
              points: [
                tempArrowStart.current.x,
                tempArrowStart.current.y,
                tempArrowEnd.x,
                tempArrowEnd.y,
              ],
              color: "yellow",
            },
          ]);
        }
        break;
    }
  };

  return {
    pencilLines,
    arrows,
    cropPreview,
    tempArrowStart,
    tempArrowEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
