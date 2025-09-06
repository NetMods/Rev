// URLImage.jsx
import { useEffect, useState, useMemo } from "react";
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
}) => {
  const [image] = useImage(src, "anonymous");
  const [dims, setDims] = useState(null);

  useEffect(() => {
    if (!image || !stageWidth || !stageHeight) return;

    const imgW = image.width;
    const imgH = image.height;

    // available area after padding
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
      scale: scale,
      originalWidth: imgW,
      originalHeight: imgH,
    });
  }, [image, stageWidth, stageHeight, padding]);

  const displayDims = useMemo(() => {
    if (!image || !dims) return null;

    // If no crop, use full image dimensions
    if (!cropRect) {
      const display = {
        x: dims.x,
        y: dims.y,
        width: dims.width,
        height: dims.height,
        crop: { x: 0, y: 0, width: image.width, height: image.height },
        originalWidth: dims.originalWidth,
        originalHeight: dims.originalHeight,
        scale: dims.scale,
      };
      return display;
    }

    // Calculate crop in original image coordinates
    const cropX = Math.max(0, (cropRect.x - dims.x) / dims.scale);
    const cropY = Math.max(0, (cropRect.y - dims.y) / dims.scale);
    const cropW = Math.abs(cropRect.width) / dims.scale;
    const cropH = Math.abs(cropRect.height) / dims.scale;

    // Clamp crop to image bounds
    const clampedCropX = Math.min(cropX, image.width);
    const clampedCropY = Math.min(cropY, image.height);
    const clampedCropW = Math.min(cropW, image.width - clampedCropX);
    const clampedCropH = Math.min(cropH, image.height - clampedCropY);

    // Fit the cropped area to the stage while maintaining aspect ratio
    const availW = Math.max(0, stageWidth - padding * 2);
    const availH = Math.max(0, stageHeight - padding * 2);

    const cropScale = Math.min(availW / clampedCropW, availH / clampedCropH);
    const displayW = clampedCropW * cropScale;
    const displayH = clampedCropH * cropScale;

    // Center the cropped image
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

  // notify parent when displayDims changes
  useEffect(() => {
    if (displayDims) {
      onDisplayDimsChange(displayDims);
    }
  }, [displayDims, onDisplayDimsChange]);

  if (!image || !dims || !displayDims) return null;

  return (
    <Group>
      <Rect
        x={displayDims.x - padding}
        y={displayDims.y - padding}
        width={displayDims.width + padding * 2}
        height={displayDims.height + padding * 2}
      />
      <Image
        image={image}
        x={displayDims.x}
        y={displayDims.y}
        width={displayDims.width}
        height={displayDims.height}
        cornerRadius={borderRadius}
        listening={false}
        crop={displayDims.crop}
      />
    </Group>
  );
};

export default URLImage;
