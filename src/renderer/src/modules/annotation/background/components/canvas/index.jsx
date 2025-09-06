import { useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import PropTypes from 'prop-types';
import useDrawingHandlers from './hooks/useDrawingHandlers';
import useAnnotationTimer from './hooks/useAnnotationTimer';
import useCanvasImperative from './hooks/useCanvasImperative';
import useToolReset from './hooks/useToolReset';
import useCanvasResize from './hooks/useCanvasResize';
import Lines from './components/lines';
import Arrows from './components/arrow';
import TextAreas from './components/textarea';
import ArrowPreview from './components/arrowpreview';
import TextPreview from './components/textpreview';

export default function Canvas({
  penColor,
  penWidth,
  width,
  height,
  foregroundAnnotation,
  onForegroundAnnotationChange,
  ref: canvasRefProp,
  freeze,
  freezeTime,
  tool
}) {
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const isDrawing = useRef(false);
  const originRef = useRef({ x: null, y: null });

  // Call useDrawingHandlers first to ensure setDrawnArrows and setTextAreas are defined
  const {
    drawnArrows,
    setDrawnArrows,
    tempEnd,
    setTempEnd,
    textAreas,
    setTextAreas,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useDrawingHandlers(
    stageRef,
    isDrawing,
    originRef,
    penColor,
    penWidth,
    tool,
    foregroundAnnotation,
    onForegroundAnnotationChange
  );

  // Now safe to call useCanvasImperative
  useCanvasImperative(canvasRefProp, onForegroundAnnotationChange, setDrawnArrows, setTextAreas);
  useToolReset(tool, isDrawing, originRef, setTempEnd);
  useAnnotationTimer(
    foregroundAnnotation,
    drawnArrows,
    textAreas,
    onForegroundAnnotationChange,
    setDrawnArrows,
    setTextAreas,
    freeze,
    freezeTime
  );
  useCanvasResize(stageRef, width, height);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{
        background: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10
      }}
    >
      <Layer ref={layerRef}>
        <Lines annotations={foregroundAnnotation} />
        <Arrows arrows={drawnArrows} />
        <TextAreas textAreas={textAreas} setTextAreas={setTextAreas} />
        {isDrawing.current && tool === 'arrow' && tempEnd.x !== null && originRef.current.x !== null && (
          <ArrowPreview start={originRef.current} end={tempEnd} />
        )}
        {isDrawing.current && tool === 'text' && tempEnd.x !== null && originRef.current.x !== null && (
          <TextPreview start={originRef.current} end={tempEnd} penColor={penColor} />
        )}
      </Layer>
    </Stage>
  );
}

Canvas.propTypes = {
  penColor: PropTypes.string.isRequired,
  penWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  foregroundAnnotation: PropTypes.arrayOf(
    PropTypes.shape({
      points: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['source-over', 'destination-out']).isRequired
    })
  ).isRequired,
  onForegroundAnnotationChange: PropTypes.func.isRequired,
  freeze: PropTypes.bool.isRequired,
  freezeTime: PropTypes.number.isRequired,
  tool: PropTypes.oneOf(['pen', 'eraser', 'arrow', 'text']).isRequired
};
