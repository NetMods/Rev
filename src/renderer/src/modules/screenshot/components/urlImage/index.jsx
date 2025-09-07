import { Image } from "react-konva";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import { useEffect } from "react";

const URLImage = ({ src, stageWidth, stageHeight, cropRect, onDisplayDimsChange, applyEffectRef, batchDraw }) => {
  const { konvaImage, displayDims, applyEffect } = useImageProcessor(src, stageWidth, stageHeight, cropRect, batchDraw);

  useEffect(() => {
    onDisplayDimsChange(displayDims);
    applyEffectRef.current = applyEffect; // Assign the effect function to the parent's ref
  }, [displayDims, onDisplayDimsChange, applyEffect, applyEffectRef]);

  if (!konvaImage || !displayDims) return null;

  return (
    <Image
      image={konvaImage}
      x={displayDims.x}
      y={displayDims.y}
      width={displayDims.width}
      height={displayDims.height}
      crop={displayDims.crop}
      listening={false} // Image should not capture mouse events directly
    />
  );
};

export default URLImage;
