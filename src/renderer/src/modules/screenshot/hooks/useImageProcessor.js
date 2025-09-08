import { useState, useEffect, useMemo, useRef } from "react";
import useImage from "use-image";

export const useImageProcessor = (src, stageWidth, stageHeight, cropRect, batchDraw) => {
  const [image, status] = useImage(src, "anonymous");
  const [dims, setDims] = useState(null);
  const canvasRef = useRef(null);
  const [konvaImage, setKonvaImage] = useState(null);

  // Effect 1: Calculate initial image dimensions to fit the stage
  useEffect(() => {
    // Check if the image has been loaded successfully
    if (!image || status !== "loaded" || !stageWidth || !stageHeight) return;

    const scale = Math.min(stageWidth / image.width, stageHeight / image.height);
    const newW = image.width * scale;
    const newH = image.height * scale;
    setDims({
      x: (stageWidth - newW) / 2,
      y: (stageHeight - newH) / 2,
      width: newW,
      height: newH,
      scale,
      originalWidth: image.width,
      originalHeight: image.height,
    });

    // Create an offscreen canvas for effects
    const offCanvas = document.createElement("canvas");
    offCanvas.width = image.width;
    offCanvas.height = image.height;
    const ctx = offCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    canvasRef.current = offCanvas;
    setKonvaImage(offCanvas);
  }, [image, status, stageWidth, stageHeight]);

  // The rest of your code remains the same
  const displayDims = useMemo(() => {
    if (!image || !dims) return null;
    if (!cropRect) {
      return { ...dims, crop: { x: 0, y: 0, width: image.width, height: image.height } };
    }

    const cropX = (cropRect.x - dims.x) / dims.scale;
    const cropY = (cropRect.y - dims.y) / dims.scale;
    const cropW = Math.abs(cropRect.width) / dims.scale;
    const cropH = Math.abs(cropRect.height) / dims.scale;

    // Clamp values to be within image bounds
    const clampedCropX = Math.max(0, Math.min(cropX, image.width));
    const clampedCropY = Math.max(0, Math.min(cropY, image.height));
    const clampedCropW = Math.max(0, Math.min(cropW, image.width - clampedCropX));
    const clampedCropH = Math.max(0, Math.min(cropH, image.height - clampedCropY));

    const cropScale = Math.min(stageWidth / clampedCropW, stageHeight / clampedCropH);
    const displayW = clampedCropW * cropScale;
    const displayH = clampedCropH * cropScale;

    return {
      x: (stageWidth - displayW) / 2,
      y: (stageHeight - displayH) / 2,
      width: displayW,
      height: displayH,
      crop: { x: clampedCropX, y: clampedCropY, width: clampedCropW, height: clampedCropH },
    };
  }, [cropRect, dims, image, stageWidth, stageHeight]);

  // Function to apply effects to the offscreen canvas
  const applyEffect = (effectType, stageX, stageY) => {
    if (!canvasRef.current || !dims || !displayDims) return;
    const ctx = canvasRef.current.getContext("2d");

    // Convert stage coordinates to original image coordinates
    const imgX = (stageX - displayDims.x) / (displayDims.width / displayDims.crop.width) + displayDims.crop.x;
    const imgY = (stageY - displayDims.y) / (displayDims.height / displayDims.crop.height) + displayDims.crop.y;

    if (effectType === "pixelate") {
      const size = 40;
      const sx = imgX - size / 2;
      const sy = imgY - size / 2;
      const pixelSize = 8;

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = size;
      tmpCanvas.height = size;
      const tmpCtx = tmpCanvas.getContext("2d");

      tmpCtx.imageSmoothingEnabled = false;
      tmpCtx.drawImage(canvasRef.current, sx, sy, size, size, 0, 0, size / pixelSize, size / pixelSize);
      tmpCtx.drawImage(tmpCanvas, 0, 0, size / pixelSize, size / pixelSize, 0, 0, size, size);
      ctx.drawImage(tmpCanvas, sx, sy);
      batchDraw();
    }
    // ... other effects like blur could go here
  };

  return { konvaImage, displayDims, applyEffect };
};
