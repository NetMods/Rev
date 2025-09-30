import { Image, Rect, Group } from "react-konva";
import { useImageProcessor } from "../../hooks/useImageProcessor";
import { useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { getPresetConfigAtom, getbackgroundImageAtom, setCanvasRedoAtom } from "../../../../store/screenshot";
import log from "electron-log/renderer"

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
  const backgroundImageSrc = useAtomValue(getbackgroundImageAtom)
  const setredoCanvasAtom = useSetAtom(setCanvasRedoAtom)
  const [backgroundImage, setbackgroundImage] = useState(null)
  const imageRef = useRef();


  useEffect(() => {
    if (backgroundImageSrc === null) {
      setbackgroundImage(null)
      return;
    };
    const img = new window.Image();
    img.src = backgroundImageSrc

    img.onload = () => {
      setbackgroundImage(img)
    }
    img.onerror = (err) => {
      log.info("[background image error]", err)
    }
  }, [backgroundImageSrc])

  const { konvaImage, displayDims, applyEffect, redoCanvas } = useImageProcessor(
    src,
    stageWidth,
    stageHeight,
    cropRect,
    batchDraw,
    config.padding
  );

  setredoCanvasAtom(() => redoCanvas)

  useEffect(() => {
    onDisplayDimsChange(displayDims);
    applyEffectRef.current = applyEffect;
  }, [displayDims, onDisplayDimsChange, applyEffect, applyEffectRef, batchDraw]);


  if (!konvaImage || !displayDims) return null;

  const backgroundX = displayDims.x - config.padding
  const backgroundY = displayDims.y - config.padding
  const backgroundWidth = displayDims.width + config.padding * 2
  const backgroundHeight = displayDims.height + config.padding * 2

  return (
    <Group>
      {/* Background rect (without shadow) */}
      {backgroundImage === null ?
        (<Rect
          x={backgroundX}
          y={backgroundY}
          width={backgroundWidth}
          height={backgroundHeight}
          fill={config.backgroundcolor}
          listening={false}
        />) : (
          <Image
            image={backgroundImage}
            x={backgroundX}
            y={backgroundY}
            width={backgroundWidth}
            height={backgroundHeight}
          />
        )
      }
      <Group>
        {/* Shadow rect (acts as shadow layer) */}
        <Rect
          x={displayDims.x}
          y={displayDims.y}
          width={displayDims.width}
          height={displayDims.height}
          fill="white"
          cornerRadius={config.rounded}
          shadowColor="black"
          shadowBlur={config.shadow}
          shadowOpacity={config.shadow < 10 ? 0 : 1}
          shadowOffset={{ x: 4, y: 4 }}
          listening={false}
        />
        {/* Actual image */}
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

    </Group>
  );
};

export default URLImage;
