import { useState, useEffect, useMemo, useRef } from "react";

export const useImageProcessor = (
  src,
  stageWidth,
  stageHeight,
  cropRect,
  batchDraw,
  padding = 0
) => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [dims, setDims] = useState(null);
  const canvasRef = useRef(null);
  const [konvaImage, setKonvaImage] = useState(null);

  // Effect 0: Load the image from the source URL without external libraries
  useEffect(() => {
    if (!src) return;

    setStatus("loading");
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "Anonymous"; // Handle potential CORS issues

    const handleLoad = () => {
      setStatus("loaded");
      setImage(img);
    };

    const handleError = () => {
      setStatus("failed");
      setImage(null);
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);

  // Effect 1: Calculate initial image dimensions to fit the stage with clamping logic
  useEffect(() => {
    if (!image || status !== "loaded" || !stageWidth || !stageHeight) return;

    const maxWidth = (stageWidth / 12) * 10;
    const maxHeight = (stageHeight / 12) * 10;

    let targetWidth = image.width;
    let targetHeight = image.height;

    if (image.width > maxWidth || image.height > maxHeight) {
      const clampScale = Math.min(maxWidth / image.width, maxHeight / image.height);
      targetWidth = image.width * clampScale;
      targetHeight = image.height * clampScale;
    }

    // Apply scaling to fit within stage if necessary
    const fitScale = Math.min(
      (stageWidth - padding * 2) / targetWidth,
      (stageHeight - padding * 2) / targetHeight
    );
    if (fitScale < 1) {
      targetWidth *= fitScale;
      targetHeight *= fitScale;
    }

    const x = (stageWidth - targetWidth) / 2;
    const y = (stageHeight - targetHeight) / 2;

    setDims({
      x,
      y,
      width: targetWidth,
      height: targetHeight,
      scale: targetWidth / image.width,
      originalWidth: image.width,
      originalHeight: image.height,
    });

    const offCanvas = document.createElement("canvas");
    offCanvas.width = image.width;
    offCanvas.height = image.height;
    const ctx = offCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    canvasRef.current = offCanvas;
    setKonvaImage(offCanvas);
  }, [image, status, stageWidth, stageHeight, padding]);

  // Calculate display dimensions with crop, without expanding
  const displayDims = useMemo(() => {
    if (!image || !dims) return null;
    if (!cropRect || cropRect.width < 40 || cropRect.height < 40) {
      return {
        ...dims,
        crop: { x: 0, y: 0, width: image.width, height: image.height },
      };
    }

    // Normalize crop rectangle to handle any direction
    const cropX = (Math.min(cropRect.x, cropRect.x + cropRect.width) - dims.x) / dims.scale;
    const cropY = (Math.min(cropRect.y, cropRect.y + cropRect.height) - dims.y) / dims.scale;
    const cropW = Math.abs(cropRect.width) / dims.scale;
    const cropH = Math.abs(cropRect.height) / dims.scale;

    // Clamp values to image boundaries
    const clampedCropX = Math.max(0, Math.min(cropX, image.width));
    const clampedCropY = Math.max(0, Math.min(cropY, image.height));
    const clampedCropW = Math.max(
      0,
      Math.min(cropW, image.width - clampedCropX)
    );
    const clampedCropH = Math.max(
      0,
      Math.min(cropH, image.height - clampedCropY)
    );


    // Use the original scale for the cropped area, no expansion
    const displayW = clampedCropW * dims.scale;
    const displayH = clampedCropH * dims.scale;

    // Ensure it fits within stage if necessary, accounting for padding
    const fitScale = Math.min(
      (stageWidth - padding * 2) / displayW,
      (stageHeight - padding * 2) / displayH
    );
    const finalW = fitScale < 1 ? displayW * fitScale : displayW;
    const finalH = fitScale < 1 ? displayH * fitScale : displayH;

    return {
      x: (stageWidth - finalW) / 2,
      y: (stageHeight - finalH) / 2,
      width: finalW,
      height: finalH,
      crop: {
        x: clampedCropX,
        y: clampedCropY,
        width: clampedCropW,
        height: clampedCropH,
      },
    };
  }, [cropRect, dims, image, stageWidth, stageHeight, padding]);

  // Fixed pixelate effect to account for padding
  const applyEffect = (effectType, stageX, stageY) => {
    if (!canvasRef.current || !dims || !displayDims) return;
    const ctx = canvasRef.current.getContext("2d");

    const effectiveWidth = displayDims.width;
    const effectiveHeight = displayDims.height;

    // Cursor → image coordinates (adjust for padding)
    const imgX =
      (stageX - displayDims.x) /
      (effectiveWidth / displayDims.crop.width) +
      displayDims.crop.x;

    const imgY =
      (stageY - displayDims.y) /
      (effectiveHeight / displayDims.crop.height) +
      displayDims.crop.y;

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
      tmpCtx.drawImage(
        canvasRef.current,
        sx,
        sy,
        size,
        size,
        0,
        0,
        size / pixelSize,
        size / pixelSize
      );
      tmpCtx.drawImage(
        tmpCanvas,
        0,
        0,
        size / pixelSize,
        size / pixelSize,
        0,
        0,
        size,
        size
      );
      ctx.drawImage(tmpCanvas, sx, sy);
      batchDraw();
    }
  };

  return { konvaImage, displayDims, applyEffect };
};
