import { Image, Rect, Group } from "react-konva";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { getPresetConfigAtom } from "../../../../store";

const URLImage = ({
  src,
  stageWidth,
  stageHeight,
  cropRect,
  onDisplayDimsChange,
  applyEffectRef,
  batchDraw,
}) => {
  const config = useAtomValue(getPresetConfigAtom);
  const imageRef = useRef();

  const { konvaImage, displayDims, applyEffect } = useImageProcessor(
    src,
    stageWidth,
    stageHeight,
    cropRect,
    batchDraw,
    config.padding
  );

  useEffect(() => {
    onDisplayDimsChange(displayDims);
    applyEffectRef.current = applyEffect;
  }, [displayDims, onDisplayDimsChange, applyEffect, applyEffectRef, batchDraw]);

  if (!konvaImage || !displayDims) return null;

  return (
    <Group>
      <Rect
        x={displayDims.x - config.padding}
        y={displayDims.y - config.padding}
        width={displayDims.width + config.padding * 2}
        height={displayDims.height + config.padding * 2}
        fill={config.backgroundcolor}
        listening={false}
      />
      <Image
        ref={imageRef}
        image={konvaImage}
        x={displayDims.x}
        y={displayDims.y}
        width={displayDims.width}
        height={displayDims.height}
        crop={displayDims.crop}
        listening={false}
        cornerRadius={config.rounded}
      />
    </Group>
  );
};

export default URLImage;
