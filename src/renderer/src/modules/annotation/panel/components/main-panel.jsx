import { useState } from "react";
import { LuBrush as Brush, LuArrowUpRight as Arrow } from "react-icons/lu";
import { TbOvalVertical as Oval } from "react-icons/tb";
import { IoText as Text } from "react-icons/io5";
import { cn } from "../../../../shared/utils";
import { MainAnnotationControls } from "../constants";

const MainPanel = () => {
  const [currentMode, setCurrentMode] = useState(MainAnnotationControls.LINE);

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        onClick={() => setCurrentMode(MainAnnotationControls.LINE)}
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center",
          currentMode === "line" ? "" : "hover:"
        )}
      >
        <Brush size={23} />
      </button>

      <button
        onClick={() => setCurrentMode(MainAnnotationControls.ARROW)}
        disabled
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          currentMode === "arrow" ? "" : "hover")}
      >
        <Arrow size={23} />
      </button>

      <button
        onClick={() => setCurrentMode(MainAnnotationControls.OVAL)}
        disabled
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          currentMode === "oval" ? "" : ""
        )}
      >
        <Oval size={23} />
      </button>

      <button
        onClick={() => setCurrentMode(MainAnnotationControls.TEXT)}
        disabled
        className={cn(
          "hover:bg-button-hover p-1 no-drag rounded w-full inline-flex justify-center disabled:opacity-50 disabled:cursor-not-allowed",
          currentMode === "text" ? "" : ""
        )}
      >
        <Text size={20} />
      </button>
    </div>
  );
};

export default MainPanel;
