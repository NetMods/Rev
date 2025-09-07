import log from "electron-log/renderer";
import { useEffect, useRef, useState, useMemo } from "react";
import useImage from "use-image";
import { Group, Rect, Image } from "react-konva";

const URLImage = ({
  src,
  stageWidth,
  stageHeight,
  padding = 0,
  borderRadius = 0,
  cropRect = null,
  onDisplayDimsChange = () => { },
  applyEffect = () => { },
  batchDraw = () => { },
}) => {
  const [image] = useImage(src, "anonymous");
  const [dims, setDims] = useState(null);
  const canvasRef = useRef(null);
  const [konvaImage, setKonvaImage] = useState(null);

  useEffect(() => {
    if (!image || !stageWidth || !stageHeight) return;

    const imgW = image.width;
    const imgH = image.height;

    const availW = Math.max(0, stageWidth - padding * 2);
    const availH = Math.max(0, stageHeight - padding * 2);

    const scale = Math.min(availW / imgW, availH / imgH);
    const newW = imgW * scale;
    const newH = imgH * scale;

    const x = (stageWidth - newW) / 2;
    const y = (stageHeight - newH) / 2;

    setDims({
      x,
      y,
      width: newW,
      height: newH,
      scale,
      originalWidth: imgW,
      originalHeight: imgH,
    });

    const offCanvas = document.createElement("canvas");
    offCanvas.width = imgW;
    offCanvas.height = imgH;
    const ctx = offCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    canvasRef.current = offCanvas;
    setKonvaImage(offCanvas);
  }, [image, stageWidth, stageHeight, padding]);

  const displayDims = useMemo(() => {
    if (!image || !dims) return null;

    if (!cropRect) {
      return {
        x: dims.x,
        y: dims.y,
        width: dims.width,
        height: dims.height,
        crop: { x: 0, y: 0, width: image.width, height: image.height },
        originalWidth: dims.originalWidth,
        originalHeight: dims.originalHeight,
        scale: dims.scale,
      };
    }

    const cropX = Math.max(0, (cropRect.x - dims.x) / dims.scale);
    const cropY = Math.max(0, (cropRect.y - dims.y) / dims.scale);
    const cropW = Math.abs(cropRect.width) / dims.scale;
    const cropH = Math.abs(cropRect.height) / dims.scale;

    const clampedCropX = Math.min(cropX, image.width);
    const clampedCropY = Math.min(cropY, image.height);
    const clampedCropW = Math.min(cropW, image.width - clampedCropX);
    const clampedCropH = Math.min(cropH, image.height - clampedCropY);

    const availW = Math.max(0, stageWidth - padding * 2);
    const availH = Math.max(0, stageHeight - padding * 2);

    const cropScale = Math.min(availW / clampedCropW, availH / clampedCropH);
    const displayW = clampedCropW * cropScale;
    const displayH = clampedCropH * cropScale;

    const displayX = (stageWidth - displayW) / 2;
    const displayY = (stageHeight - displayH) / 2;

    return {
      x: displayX,
      y: displayY,
      width: displayW,
      height: displayH,
      crop: {
        x: clampedCropX,
        y: clampedCropY,
        width: clampedCropW,
        height: clampedCropH,
      },
      originalWidth: dims.originalWidth,
      originalHeight: dims.originalHeight,
      scale: dims.scale,
      cropScale,
    };
  }, [cropRect, dims, image, stageWidth, stageHeight, padding]);

  useEffect(() => {
    if (displayDims) onDisplayDimsChange(displayDims);
  }, [displayDims, onDisplayDimsChange]);

  // Pixelation effect
  const pixelateAt = (x, y, size = 30, pixelSize = 12) => {
    if (!canvasRef.current || !dims) return;

    const ctx = canvasRef.current.getContext("2d");
    const sx = x - size / 2;
    const sy = y - size / 2;


    // Create temporary canvas for pixelation
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = size;
    tmpCanvas.height = size;
    const tmpCtx = tmpCanvas.getContext("2d");

    // Draw downscaled
    tmpCtx.imageSmoothingEnabled = false;
    tmpCtx.drawImage(canvasRef.current, sx, sy, size, size, 0, 0, size / pixelSize, size / pixelSize);

    // Upscale back to blocky pixels
    tmpCtx.drawImage(tmpCanvas, 0, 0, size / pixelSize, size / pixelSize, 0, 0, size, size);

    // Put result back into main canvas
    ctx.drawImage(tmpCanvas, sx, sy);

    batchDraw();
  };

  // Blur effect
  const blurAt = (x, y, size = 40) => {
    if (!canvasRef.current || !dims) return;

    const ctx = canvasRef.current.getContext("2d");
    // Create a temporary canvas for the blur effect
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = size;
    tmpCanvas.height = size;
    const tmpCtx = tmpCanvas.getContext("2d");

    // Extract the region to blur
    const sx = x - size / 2;
    const sy = y - size / 2;
    tmpCtx.drawImage(canvasRef.current, sx, sy, size, size, 0, 0, size, size);

    // Apply blur filter on temporary canvas
    tmpCtx.filter = "blur(10px)";
    tmpCtx.drawImage(tmpCanvas, 0, 0);

    // Draw blurred region back to main canvas
    ctx.drawImage(tmpCanvas, sx, sy);

    batchDraw();
  };

  // Expose effect application function
  useEffect(() => {
    applyEffect.current = (effectType, x, y) => {
      if (!canvasRef.current || !dims || !displayDims) return;

      // Convert stage coordinates to image coordinates
      const imgX = (x - dims.x) / dims.scale;
      const imgY = (y - dims.y) / dims.scale;

      // Check if within crop bounds if cropRect exists
      if (cropRect && displayDims) {
        const crop = displayDims.crop;
        if (
          imgX < crop.x ||
          imgX > crop.x + crop.width ||
          imgY < crop.y ||
          imgY > crop.y + crop.height
        ) {
          return;
        }
      }

      if (effectType === "pixelate") {
        pixelateAt(imgX, imgY, 40, 8);
      }
    };
  }, [dims, cropRect, displayDims, applyEffect, batchDraw]);

  if (!konvaImage || !displayDims) return null;

  return (
    <Group>
      <Rect
        x={displayDims.x - padding}
        y={displayDims.y - padding}
        width={displayDims.width + padding * 2}
        height={displayDims.height + padding * 2}
      />
      <Image
        image={konvaImage}
        x={displayDims.x}
        y={displayDims.y}
        width={displayDims.width}
        height={displayDims.height}
        cornerRadius={borderRadius}
        listening={true}
        crop={displayDims.crop}
      />
    </Group>
  );
};

export default URLImage;
