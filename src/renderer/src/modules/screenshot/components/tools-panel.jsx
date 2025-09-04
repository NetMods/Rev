import log from "electron-log/renderer"
import Button from "./button"
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

  const handleDiscard = () => {
    log.info("close the window")
  }

  const handleRedo = () => { }

  return (
    <div className="bg-[#EEEEEE] col-start-1 col-end-3 p-1">
      <div className="border-black h-full w-full flex gap-4 justify-around items-center">
        <div className="flex gap-1 justify-center items-center">
          <Button icon={CropIcon} onClick={() => { }} />
          <Button icon={PencilIcon} onClick={() => { }} />
          <Button icon={ArrowIcon} onClick={() => { }} />
          <Button icon={BlurIcon} onClick={() => { }} />
          <Button icon={EraserIcon} onClick={() => { }} />
        </div>
        <div className="flex justify-center items-center">
          <Button text={"Copy"} icon={CopyIcon} onClick={() => { }} />
          <Button text={"Save As"} icon={SaveAsIcon} onClick={() => { }} />
        </div>
        <div className="flex justify-center items-center">
          <Button text={"Discard"} icon={DeleteIcon} onClick={handleDiscard} />
          <Button text={"Redo"} icon={RedoIcon} onClick={handleRedo} />
        </div>
      </div>
    </div>
  )
}

export default ToolPanel
