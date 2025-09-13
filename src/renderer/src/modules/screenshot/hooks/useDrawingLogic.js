// import log from "electron-log/renderer"
import { useState, useRef } from "react";

const MIN_DISTANCE = 5;

export const useDrawingLogic = (config, applyEffect, historyStack) => {
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
        setPencilLines((prev) => {
          historyStack.push({
            type: "pen",
            state: JSON.parse(JSON.stringify(prev)),
          });
          return [
            ...prev,
            {
              points: [pos.x, pos.y],
              color: "red",
              width: 12,
              type:
                config.tool === "eraser" ? "destination-out" : "source-over",
            },
          ];
        });
        break;

      case "arrow":
        tempArrowStart.current = { x: pos.x, y: pos.y };
        setTempArrowEnd({ x: pos.x, y: pos.y });
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
        setCropPreview((prev) =>
          prev
            ? { ...prev, width: pos.x - prev.x, height: pos.y - prev.y }
            : null
        );
        break;

      case "pen":
      case "eraser": {
        if (!lastPoint.current) return;
        const dist = Math.hypot(
          pos.x - lastPoint.current.x,
          pos.y - lastPoint.current.y
        );
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
          const dx = tempArrowEnd.x - tempArrowStart.current.x;
          const dy = tempArrowEnd.y - tempArrowStart.current.y;
          const length = Math.hypot(dx, dy);
          const MIN_ARROW_LENGTH = 10;

          if (length >= MIN_ARROW_LENGTH) {
            setArrows((prev) => {
              historyStack.push({
                type: "arrows",
                state: JSON.parse(JSON.stringify(prev)),
              });

              const newArrows = [
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
              ];
              return newArrows;
            });
          }
        }
        break;
    }
  };

  return {
    pencilLines,
    setPencilLines,
    arrows,
    setArrows,
    cropPreview,
    tempArrowStart,
    setTempArrowEnd,
    tempArrowEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
