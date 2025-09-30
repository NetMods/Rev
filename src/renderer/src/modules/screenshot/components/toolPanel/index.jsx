import Button from "../commons/button";
import { useSetAtom, useAtomValue } from "jotai";
import { SCREENSHOT_TOOL } from "../../../../shared/constants";
import { getcanvasRedoAtom, getPresetConfigAtom, setPresetConfigAtom } from "../../../../store/screenshot";
import { getDataUrl } from "../../utils/download";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { IoCopySharp as CopyIcon } from "react-icons/io5";
import { FaCropSimple as CropIcon } from "react-icons/fa6";
import { MdBlurOn as BlurIcon } from "react-icons/md";
import { FaSave as SaveAsIcon } from "react-icons/fa";
import { FaRedo as ResetIcon } from "react-icons/fa";
import { useState } from "react";
import { cn } from "../../../../shared/utils";

const ToolPanel = ({ stageRef, displayDims, setCropRect }) => {
  const [copyStatus, setCopyStatus] = useState(false);

  const setConfig = useSetAtom(setPresetConfigAtom);
  const config = useAtomValue(getPresetConfigAtom);
  const canvasRedoAtom = useAtomValue(getcanvasRedoAtom)


  const handleReset = () => {
    setCropRect(null)
    setConfig({
      tool: SCREENSHOT_TOOL.NONE,
      padding: 10,
      rounded: 5,
      shadow: 0,
      backgroundcolor: "#FFFFFF"
    })
    canvasRedoAtom()
  };

  const handleTools = (currentTool) => {
    setConfig({ tool: currentTool });
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
      alert("Sorry failed to saved!, Apologies try again");
    }
  };

  return (
    <div className="bg-base-300 col-start-1 col-end-3 p-1 border-t border-t-base-content/20">
      <div className="border-black h-full w-full flex gap-4 justify-around items-center">
        <div className="flex justify-center items-center gap-1 no-drag">
          <Button className="btn-warning" text={"Discard"} icon={DeleteIcon} onClick={() => window.api.core.closeWindow()} />
          <Button className="btn-neutral" text={"Reset"} icon={ResetIcon} onClick={handleReset} />
        </div>

        <div className="flex gap-1 justify-center items-center no-drag">
          <ToolOption
            icon={CropIcon}
            label="Crop"
            active={config.tool === SCREENSHOT_TOOL.CROP}
            onClick={() => handleTools(SCREENSHOT_TOOL.CROP)}
          />
          <ToolOption
            icon={BlurIcon}
            label="Mosaic"
            active={config.tool === SCREENSHOT_TOOL.PIXELATE}
            onClick={() => handleTools(SCREENSHOT_TOOL.PIXELATE)}
          />
        </div>

        <div className="flex justify-center items-center gap-1 no-drag">
          <Button className="btn-neutral" text={copyStatus === true ? "Copied" : "Copy"} icon={CopyIcon} onClick={handleCopy} />
          <Button className="btn-neutral" text={"Save As"} icon={SaveAsIcon} onClick={handleSave} />
        </div>

      </div>
    </div>
  );
};

export default ToolPanel;


const ToolOption = ({ icon: Icon, active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded cursor-pointer text-sm transition-all ease-linear flex justify-center items-center gap-1",
        active && "bg-base-200 ring-1 ring-base-content/20"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
};
