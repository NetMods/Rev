import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Layer, Line, Stage, Arrow } from 'react-konva'
import { getRelativePointerPosition } from './utils'

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
  const stageRef = useRef(null)
  const layerRef = useRef(null)
  const isDrawing = useRef(false)
  const timerRef = useRef(null)
  const originRef = useRef({ x: undefined, y: undefined })
  const [drawnArrows, setDrawnArrows] = useState([])
  const [tempEnd, setTempEnd] = useState(null)
  const [isEditingtext, setidEditingText] = useState(false)
  const [text, setText] = useState("All Yours")
  const [drawnText, setDrawnText] = useState([])

  useImperativeHandle(canvasRefProp, () => ({
    clear: () => {
      onForegroundAnnotationChange([])
      setDrawnArrows([])
    }
  }))

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const handlePointerDown = () => {
      isDrawing.current = true
      const pos = getRelativePointerPosition(stage)

      originRef.current = {
        x: pos.x,
        y: pos.y
      }

      if (tool === "pen" || tool === "eraser") {
        const newLine = {
          points: [pos.x, pos.y],
          color: penColor,
          width: penWidth,
          type: tool === 'eraser' ? 'destination-out' : 'source-over'
        }
        onForegroundAnnotationChange([...foregroundAnnotation, newLine])
      }

    }

    const handlePointerMove = () => {
      if (!isDrawing.current) return
      const pos = getRelativePointerPosition(stage)
      if (tool === 'pen' || tool === "eraser") {
        const lines = foregroundAnnotation.slice()
        const lastLine = lines[lines.length - 1]
        lastLine.points = lastLine.points.concat([pos.x, pos.y])
        onForegroundAnnotationChange(lines)
      } else if (tool === "arrow") {
        setTempEnd({ x: pos.x, y: pos.y })
      }
    }

    const handlePointerUp = () => {
      if (tool === "arrow") {
        const pos = stage.getPointerPosition()
        const newArrowPoints = {
          points: [originRef.current.x, originRef.current.y, pos.x, pos.y],
          color: penColor
        }
        setDrawnArrows(prevArrows => [...prevArrows, newArrowPoints])
        setTempEnd(null)
      }
      isDrawing.current = false
    }

    stage.container().addEventListener('pointerdown', handlePointerDown)
    stage.container().addEventListener('pointermove', handlePointerMove)
    stage.container().addEventListener('pointerup', handlePointerUp)

    return () => {
      stage.container().removeEventListener('pointerdown', handlePointerDown)
      stage.container().removeEventListener('pointermove', handlePointerMove)
      stage.container().removeEventListener('pointerup', handlePointerUp)
    }
  }, [penColor, penWidth, foregroundAnnotation, onForegroundAnnotationChange, tool])

  useEffect(() => {
    // Clear any existing timer
    if (freeze) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set a new timer to clear annotations after 5 seconds
    if (foregroundAnnotation.length > 0) {
      timerRef.current = setTimeout(() => {
        onForegroundAnnotationChange([])
        setDrawnArrows([])
      }, freezeTime)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [foregroundAnnotation, onForegroundAnnotationChange, freeze, freezeTime])

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.width(width)
      stageRef.current.height(height)
      stageRef.current.batchDraw()
    }
  }, [width, height])

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


        {
          foregroundAnnotation.map((line, idx) => (
            <Line
              key={idx}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.width}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={line.type}
              draggable={false}
            />
          ))}



        {drawnArrows.length > 0 && drawnArrows.map((arrowPoints, index) => (
          <Arrow
            key={index}
            points={arrowPoints.points}
            pointerLength={10}
            pointerWidth={10}
            fill={arrowPoints.color}
            stroke={arrowPoints.color}
            strokeWidth={10}
          />
        ))}


        {isDrawing && tempEnd && (
          <Arrow
            points={[originRef.current.x, originRef.current.y, tempEnd.x, tempEnd.y]}
            pointerLength={10}
            pointerWidth={10}
            fill="gray"
            stroke="gray"
            strokeWidth={10}
          />
        )}


      </Layer>
    </Stage>
  )
}
