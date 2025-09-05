import log from "electron-log/renderer"
import Button from "./button"
import { useSetAtom } from "jotai";
import { SCREENSHOTTOOL } from "../../../shared/constants"
import { setPresetConfigAtom } from "../../../store";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { IoCopySharp as CopyIcon } from "react-icons/io5";
import { FaCropSimple as CropIcon } from "react-icons/fa6";
import { LuPencil as PencilIcon } from "react-icons/lu";
import { RiArrowRightUpFill as ArrowIcon } from "react-icons/ri";
import { MdBlurOn as BlurIcon } from "react-icons/md";
import { FaSave as SaveAsIcon } from "react-icons/fa";
import { BsFillEraserFill as EraserIcon } from "react-icons/bs";
import { FaRedo as RedoIcon } from "react-icons/fa";


const ToolPanel = () => {

  const setConfig = useSetAtom(setPresetConfigAtom)

  const handleDiscard = () => {
    log.info("close the window")
  }

  const handleRedo = () => { }

  const handleTools = (currentTool) => {
    setConfig({
      tool: currentTool
    })
  }

  return (
    <div className="bg-[#EEEEEE] col-start-1 col-end-3 p-1">
      <div className="border-black h-full w-full flex gap-4 justify-around items-center">
        <div className="flex gap-1 justify-center items-center no-drag">
          <Button icon={CropIcon} onClick={() => handleTools(SCREENSHOTTOOL.CROP)} />
          <Button icon={PencilIcon} onClick={() => handleTools(SCREENSHOTTOOL.PEN)} />
          <Button icon={ArrowIcon} onClick={() => handleTools(SCREENSHOTTOOL.ARROW)} />
          <Button icon={BlurIcon} onClick={() => handleTools(SCREENSHOTTOOL.BLUR)} />
          <Button icon={EraserIcon} onClick={() => handleTools(SCREENSHOTTOOL.ERASER)} />
        </div>
        <div className="flex justify-center items-center no-drag">
          <Button text={"Copy"} icon={CopyIcon} onClick={() => { }} />
          <Button text={"Save As"} icon={SaveAsIcon} onClick={() => { }} />
        </div>
        <div className="flex justify-center items-center no-drag">
          <Button text={"Discard"} icon={DeleteIcon} onClick={handleDiscard} />
          <Button text={"Redo"} icon={RedoIcon} onClick={handleRedo} />
        </div>
      </div>
    </div>
  )
}

export default ToolPanel
