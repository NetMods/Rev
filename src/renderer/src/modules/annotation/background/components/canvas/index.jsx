import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Layer, Line, Stage, Arrow, Rect } from 'react-konva'
import { Html } from 'react-konva-utils'
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
  const originRef = useRef({ x: null, y: null })
  const [drawnArrows, setDrawnArrows] = useState([])
  const [tempEnd, setTempEnd] = useState({ x: null, y: null })
  const [textArea, settextArea] = useState([])

  useImperativeHandle(canvasRefProp, () => ({
    clear: () => {
      onForegroundAnnotationChange([])
      setDrawnArrows([])
      settextArea([])
    }
  }))

  // Clean up temporary states when tool changes
  useEffect(() => {
    // Reset drawing state when tool changes
    isDrawing.current = false
    originRef.current = { x: null, y: null }
    setTempEnd({ x: null, y: null })
  }, [tool])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const handlePointerDown = (e) => {
      // Prevent event bubbling issues
      e.cancelBubble = true

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

    const handlePointerMove = (e) => {
      if (!isDrawing.current) return

      // Prevent event bubbling
      e.cancelBubble = true

      const pos = getRelativePointerPosition(stage)

      if (tool === 'pen' || tool === "eraser") {
        const lines = foregroundAnnotation.slice()
        const lastLine = lines[lines.length - 1]
        if (lastLine) {
          lastLine.points = lastLine.points.concat([pos.x, pos.y])
          onForegroundAnnotationChange(lines)
        }
      } else if (tool === "arrow" || tool === "text") {
        setTempEnd({ x: pos.x, y: pos.y })
      }
    }

    const handlePointerUp = (e) => {
      if (!isDrawing.current) return

      // Prevent event bubbling
      e.cancelBubble = true

      const pos = getRelativePointerPosition(stage)

      if (tool === "arrow") {
        // Only create arrow if we have valid start and end points
        if (originRef.current.x !== null && pos) {
          const newArrowPoints = {
            points: [originRef.current.x, originRef.current.y, pos.x, pos.y],
            color: penColor
          }
          setDrawnArrows(prevArrows => [...prevArrows, newArrowPoints])
        }
        setTempEnd({ x: null, y: null })
      } else if (tool === "text") {
        // Only create text area if we have valid dimensions
        if (originRef.current.x !== null && tempEnd.x !== null) {
          const x = Math.min(originRef.current.x, tempEnd.x)
          const y = Math.min(originRef.current.y, tempEnd.y)
          const width = Math.abs(tempEnd.x - originRef.current.x)
          const height = Math.abs(tempEnd.y - originRef.current.y)

          if (width >= 10 && height >= 10) {
            settextArea((prev) => [
              ...prev,
              { x, y, width, height, id: Date.now(), penColor }
            ])
          }
        }
        setTempEnd({ x: null, y: null })
      }

      isDrawing.current = false
      originRef.current = { x: null, y: null }
    }

    // Use passive: false to prevent default browser behaviors
    const options = { passive: false }

    stage.container().addEventListener('pointerdown', handlePointerDown, options)
    stage.container().addEventListener('pointermove', handlePointerMove, options)
    stage.container().addEventListener('pointerup', handlePointerUp, options)

    return () => {
      stage.container().removeEventListener('pointerdown', handlePointerDown, options)
      stage.container().removeEventListener('pointermove', handlePointerMove, options)
      stage.container().removeEventListener('pointerup', handlePointerUp, options)
    }
  }, [penColor, penWidth, foregroundAnnotation, onForegroundAnnotationChange, tool, tempEnd])


  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (freeze) return // <-- only block clearing, not timer reset logic

    if (foregroundAnnotation.length > 0 || drawnArrows.length > 0 || textArea.length > 0) {
      timerRef.current = setTimeout(() => {
        onForegroundAnnotationChange([])
        setDrawnArrows([])
        settextArea([])
        timerRef.current = null
      }, freezeTime)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [foregroundAnnotation, drawnArrows, textArea, freeze, freezeTime, onForegroundAnnotationChange])

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
        {foregroundAnnotation.map((line, idx) => (
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


        {textArea.map((vec) => (
          <Html key={vec.id} groupProps={{ x: vec.x, y: vec.y }}>
            <textarea
              value={vec.text || ""}   // controlled value
              onChange={(e) => {
                settextArea((prev) =>
                  prev.map((t) =>
                    t.id === vec.id ? { ...t, text: e.target.value } : t
                  )
                )
              }}
              style={{
                width: vec.width,
                height: vec.height,
                resize: 'none',
                background: 'rgba(255,255,255,0.7)',
                fontSize: '24px',
                outline: 'none',
                color: vec.penColor,
              }}
              placeholder="Type here..."
            />
          </Html>
        ))}

        {/* Preview arrow while drawing */}
        {isDrawing.current && tool === "arrow" && tempEnd.x !== null && originRef.current.x !== null && (
          <Arrow
            points={[originRef.current.x, originRef.current.y, tempEnd.x, tempEnd.y]}
            pointerLength={10}
            pointerWidth={10}
            fill="gray"
            stroke="gray"
            strokeWidth={10}
            opacity={0.7}
          />
        )}

        {/* Preview rectangle while drawing text area */}
        {isDrawing.current && tool === "text" && tempEnd.x !== null && originRef.current.x !== null && (
          <Rect
            x={Math.min(originRef.current.x, tempEnd.x)}
            y={Math.min(originRef.current.y, tempEnd.y)}
            width={Math.abs(tempEnd.x - originRef.current.x)}
            height={Math.abs(tempEnd.y - originRef.current.y)}
            fill={penColor}
            opacity={0.3}
          />
        )}
      </Layer>
    </Stage>
  )
}
