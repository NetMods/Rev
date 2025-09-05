import log from "electron-log/renderer"
import { useAtomValue } from "jotai"
import { getPresetConfigAtom } from "../../store"
import { useEffect, useRef, useState } from "react"
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif"
import { Stage, Layer, Rect } from "react-konva"
import URLImage from "./components/urlimage"
import { PADDING } from "./constants"
import ToolPanel from "./components/tools-panel"
import StylePanel from "./components/stylepanel"

export default function Page() {
  const [imageUrl, setImageUrl] = useState(null)
  const stageRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const [stageSize, setstageSize] = useState({ width: 0, height: 0 })
  const config = useAtomValue(getPresetConfigAtom)

  const [isDrawing, setIsDrawing] = useState(false)
  const [rectProps, setRectProps] = useState(null)


  useEffect(() => {
    window.api.screenshot.show((data) => {
      setImageUrl(data)
    })
  }, [])

  useEffect(() => {
    const handelResize = () => {
      setstageSize({
        width: canvasContainerRef.current.clientWidth - PADDING,
        height: canvasContainerRef.current.clientHeight - PADDING
      })
    }
    handelResize()

    window.addEventListener("resize", handelResize)
    return () => {
      window.removeEventListener("resize", handelResize)
    }
  }, [])

  const handleMouseDown = () => {
    if (config.tool !== "crop") return
    const stage = stageRef.current
    const pointer = stage.getPointerPosition()
    setIsDrawing(true)
    setRectProps({
      x: pointer.x,
      y: pointer.y,
      width: 0,
      height: 0
    })
  }

  const handleMouseMove = () => {
    if (!isDrawing || config.tool !== "crop") return
    const stage = stageRef.current
    const pointer = stage.getPointerPosition()
    setRectProps((prev) => ({
      ...prev,
      width: pointer.x - prev.x,
      height: pointer.y - prev.y
    }))
  }

  const handleMouseUp = () => {
    if (config.tool !== "crop") return
    setIsDrawing(false)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden p-1">
      <div className="h-full w-full grid grid-cols-[4fr_1fr] grid-rows-[11fr_1fr] no-drag">
        <div
          ref={canvasContainerRef}
          className="flex justify-center items-center w-full h-full min-w-0 min-h-0 bg-[#222831] no-drag"
        >
          {!imageUrl ? (
            <div className="h-full w-full flex justify-center items-center no-drag">
              <img src={ScreeshotPlaceholder} alt="screenshot-placeholder" />
            </div>
          ) : (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                <URLImage
                  src={imageUrl}
                  stageWidth={stageSize.width}
                  stageHeight={stageSize.height}
                />

                {/* Dotted rectangle selection */}
                {rectProps && (
                  <Rect
                    {...rectProps}
                    stroke="white"
                    dash={[6, 4]}
                    strokeWidth={2}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </div>
        <StylePanel />
        <ToolPanel />
      </div>
    </div>
  )
}
