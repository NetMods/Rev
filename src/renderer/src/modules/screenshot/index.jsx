import log from "electron-log/renderer"
import { useEffect, useRef, useState } from "react"
import ScreeshotPlaceholder from "../../assets/screenshot-placeholder.gif"
import { Stage, Layer } from "react-konva"
import URLImage from "./components/urlimage"
import { PADDING } from "./constants"
import ToolPanel from "./components/tools-panel"
import StylePanel from "./components/stylePanel"

export default function Page() {

  const [imageUrl, setImageUrl] = useState(null)
  const stageRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const [stageSize, setstageSize] = useState({
    width: 0,
    height: 0
  })

  // this one is for fetching the image data
  useEffect(() => {
    window.api.screenshot.show((data) => {
      log.info(data)
      setImageUrl(data)
    })
  }, [])


  // this one is for handling resizing
  useEffect(() => {
    const handelResize = () => {
      setstageSize({
        width: canvasContainerRef.current.clientWidth - PADDING,
        height: canvasContainerRef.current.clientHeight - PADDING
      })
    }
    handelResize()

    window.addEventListener('resize', handelResize)

    return () => {
      window.addEventListener('resize', handelResize)
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden p-1">
      <div className="h-full w-full grid grid-cols-[4fr_1fr] grid-rows-[11fr_1fr]">
        <div ref={canvasContainerRef} className="flex justify-center items-center w-full h-full min-w-0 min-h-0 bg-[#222831]" >
          {!imageUrl ? (
            <div className="h-full w-full flex justify-center items-center">
              <img src={ScreeshotPlaceholder} alt="screenshot-placeholder" />
            </div>
          ) : (
            <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}>
              <Layer>
                <URLImage
                  src={imageUrl}
                  stageWidth={stageSize.width}
                  stageHeight={stageSize.height}
                />
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
