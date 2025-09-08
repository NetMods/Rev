import { Image, Rect, Group } from "react-konva";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import { useEffect } from "react";

const URLImage = ({
  src,
  stageWidth,
  stageHeight,
  cropRect,
  onDisplayDimsChange,
  applyEffectRef,
  batchDraw,
  padding = 10,
  rectFill = "white",
  rectStroke = "black",
  rectStrokeWidth = 0,
  imgCornerRadius = 10,
}) => {
  const { konvaImage, displayDims, applyEffect } = useImageProcessor(
    src,
    stageWidth,
    stageHeight,
    cropRect,
    batchDraw
  );

  useEffect(() => {
    onDisplayDimsChange(displayDims);
    applyEffectRef.current = applyEffect;
  }, [displayDims, onDisplayDimsChange, applyEffect, applyEffectRef]);

  if (!konvaImage || !displayDims) return null;

  return (
    <Group>
      {/* Background rect */}
      <Rect
        x={displayDims.x}
        y={displayDims.y}
        width={displayDims.width}
        height={displayDims.height}
        fill={rectFill}
        stroke={rectStroke}
        strokeWidth={rectStrokeWidth}
        listening={false}
      />

      {/* Foreground image with inset padding */}
      <Image
        image={konvaImage}
        x={displayDims.x + padding}
        y={displayDims.y + padding}
        width={displayDims.width - padding * 2}
        height={displayDims.height - padding * 2}
        crop={displayDims.crop}
        listening={false}
        cornerRadius={imgCornerRadius}
      />
    </Group>
  );
};

export default URLImage;
