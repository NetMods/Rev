import { Stage, Layer, Rect, Line, Arrow } from "react-konva";
import URLImage from "../urlImage";

export const AnnotationCanvas = ({
  stageRef,
  layerRef,
  stageSize,
  imageUrl,
  cropRect,
  pencilLines,
  arrows,
  cropPreview,
  tempArrowStart,
  tempArrowEnd,
  stageProps,
  onDisplayDimsChange,
  applyEffectRef,
}) => {
  const hasTempArrow =
    tempArrowStart.current &&
    tempArrowStart.current.x !== undefined &&
    tempArrowEnd &&
    tempArrowEnd.x !== undefined;


  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      {...stageProps}
    >
      <Layer ref={layerRef}>
        <URLImage
          src={imageUrl}
          stageWidth={stageSize.width}
          stageHeight={stageSize.height}
          cropRect={cropRect}
          onDisplayDimsChange={onDisplayDimsChange}
          applyEffectRef={applyEffectRef}
          batchDraw={() => layerRef.current?.batchDraw()}
        />
        {cropPreview && (
          <Rect
            {...cropPreview}
            stroke="white"
            dash={[6, 4]}
            strokeWidth={2}
          />
        )}
      </Layer>

      <Layer>
        {/* Pencil Lines & Eraser */}
        {pencilLines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.width}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={line.type}
          />
        ))}

        {/* Saved Arrows */}
        {arrows.map((arrow, i) => (
          <Arrow
            key={i}
            points={arrow.points}
            pointerLength={10}
            pointerWidth={10}
            fill={arrow.color}
            stroke={arrow.color}
            strokeWidth={4}
          />
        ))}

        {/* Temporary Arrow Preview */}
        {hasTempArrow && (
          <Arrow
            points={[
              tempArrowStart.current.x,
              tempArrowStart.current.y,
              tempArrowEnd.x,
              tempArrowEnd.y,
            ]}
            pointerLength={10}
            pointerWidth={10}
            fill="gray"
            stroke="gray"
            strokeWidth={4}
            opacity={0.7}
          />
        )}
      </Layer>
    </Stage>
  );
};
