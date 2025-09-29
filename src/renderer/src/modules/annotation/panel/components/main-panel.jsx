import { LuBrush as Brush, LuArrowUpRight as Arrow, LuEraser as Eraser } from "react-icons/lu";
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
    <div className="flex flex-col gap-2 items-center no-drag w-full">
      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.PEN)
        }}
        className={cn(
          "p-1 no-drag w-full inline-flex justify-center cursor-pointer transition-all ease-linear hover:bg-base-content/15",
          config.tool === "pen" ? "bg-base-content/15" : ""
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
          "p-1 no-drag w-full inline-flex justify-center cursor-pointer transition-all ease-linear disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-content/15",
          config.tool === "eraser" ? "bg-base-content/15" : ""
        )}
      >
        <Eraser size={20} />
      </button>

      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.ARROW)
        }}
        className={cn(
          " p-1 no-drag w-full inline-flex justify-center cursor-pointer transition-all ease-linear disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-content/15",
          config.tool === "arrow" ? "bg-base-content/15" : ""
        )}
      >
        <Arrow size={23} />
      </button>

      <button
        onClick={() => {
          handleToolChange(MainAnnotationControls.TEXT)
        }}
        className={cn(
          "p-1 no-drag w-full inline-flex justify-center cursor-pointer transition-all ease-linear disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-content/15",
          config.tool === "text" ? "bg-base-content/15" : ""
        )}
      >
        <Text size={20} />
      </button>
    </div>
  );
};

export default MainPanel;
