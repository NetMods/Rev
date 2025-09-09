import log from "electron-log/renderer";
import Button from "../commons/button";
import { useSetAtom, useAtomValue } from "jotai";
import { SCREENSHOTTOOL } from "../../../../shared/constants";
import { getPresetConfigAtom, setPresetConfigAtom } from "../../../../store";
import { getDataUrl } from "../../utils/download";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { IoCopySharp as CopyIcon } from "react-icons/io5";
import { FaCropSimple as CropIcon } from "react-icons/fa6";
import { LuPencil as PencilIcon } from "react-icons/lu";
import { RiArrowRightUpFill as ArrowIcon } from "react-icons/ri";
import { MdBlurOn as BlurIcon } from "react-icons/md";
import { FaSave as SaveAsIcon } from "react-icons/fa";
import { BsFillEraserFill as EraserIcon } from "react-icons/bs";
import { FaRedo as RedoIcon } from "react-icons/fa";
import { useState } from "react";

const ToolPanel = ({ stageRef, displayDims }) => {
  const [copyStatus, setCopyStatus] = useState(false);

  const setConfig = useSetAtom(setPresetConfigAtom);
  const config = useAtomValue(getPresetConfigAtom);
  const handleRedo = () => { };

  const handleTools = (currentTool) => {
    setConfig({
      tool: currentTool,
    });
  };

  const handleSave = async () => {
    const stage = stageRef.current;
    if (!stage || !displayDims) return;
    const dataUrl = getDataUrl(stage, displayDims, config.padding)
    const res = await window.api.screenshot.downloadImage(dataUrl, `RevShot-${Date.now()}.png`);
    if (res.status === "failed") {
      alert("Sincere apologies mate !! try again");
    }
  };

  const handleCopy = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = getDataUrl(stage, displayDims, config.padding)
    const res = await window.api.screenshot.copyImage(dataUrl);
    if (res.status === "done") {
      setCopyStatus(true);
      setTimeout(() => {
        setCopyStatus(false);
      }, 2000);
    } else {
      alert("Sorry failed to Saved ! apologies try again");
    }
  };

  return (
    <div className="bg-base-100 col-start-1 col-end-3 p-1">
      <div className="border-black h-full w-full flex gap-4 justify-around items-center">
        <div className="flex gap-1 justify-center items-center no-drag">
          <Button pressed={config.tool === SCREENSHOTTOOL.CROP} icon={CropIcon} onClick={() => handleTools(SCREENSHOTTOOL.CROP)} />
          <Button pressed={config.tool === SCREENSHOTTOOL.PIXELATE} icon={BlurIcon} onClick={() => handleTools(SCREENSHOTTOOL.PIXELATE)} />
          {/*<Button pressed={config.tool === SCREENSHOTTOOL.PEN} icon={PencilIcon} onClick={() => handleTools(SCREENSHOTTOOL.PEN)} /> */}
          {/* <Button pressed={config.tool === SCREENSHOTTOOL.ARROW} icon={ArrowIcon} onClick={() => handleTools(SCREENSHOTTOOL.ARROW)} /> */}
          {/*<Button pressed={config.tool === SCREENSHOTTOOL.ERASER} icon={EraserIcon} onClick={() => handleTools(SCREENSHOTTOOL.ERASER)} />*/}
        </div>
        <div className="flex justify-center items-center no-drag">
          <Button text={copyStatus === true ? "Saved" : "Copy"} icon={CopyIcon} onClick={handleCopy} />
          <Button text={"Save As"} icon={SaveAsIcon} onClick={handleSave} />
        </div>
        <div className="flex justify-center items-center no-drag">
          <Button text={"Discard"} icon={DeleteIcon} onClick={() => window.api.core.closeWindow()} />
          <Button text={"Redo"} icon={RedoIcon} onClick={handleRedo} />
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;
