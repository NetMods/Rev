import { LuBrush as Brush, LuArrowUpRight as Arrow } from "react-icons/lu";
import { CiEraser as Eraser } from "react-icons/ci";
import { MdOutlineFormatColorText as Text } from "react-icons/md";
import { cn } from "../../../../shared/utils";
import { MainAnnotationControls } from "../constants";

const MainPanel = ({ config, setConfig }) => {


  const handleToolChange = (tool) => {
    setConfig({
      tool: tool
    })
  }


  return (
    <div className="flex flex-col gap-2 items-center no-drag">
      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.PEN)
        }}
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center",
          config.tool === "pen" ? "" : "hover"
        )}
      >
        <Brush size={23} />
      </button>

      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.ERASER)
        }}
        onDoubleClick={() => {
          window.api.annotation.clear()
        }}
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          config.tool === "eraser" ? "" : "hover")}
      >
        <Eraser size={20} />
      </button>

      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.ARROW)
        }}
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          config.tool === "arrow" ? "" : ""
        )}
      >
        <Arrow size={23} />
      </button>

      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.TEXT)
        }}
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          config.tool === "text" ? "" : ""
        )}
      >
        <Text size={20} />
      </button>
    </div>
  );
};

export default MainPanel;
