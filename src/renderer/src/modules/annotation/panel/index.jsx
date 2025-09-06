import { useState } from "react";
import { IoColorPaletteOutline as Palette } from "react-icons/io5";
import { IoClose as Cross } from "react-icons/io5";
import { IoIosTimer as Timer } from "react-icons/io";
import MainPanel from "./components/main-panel";
import ColorPanel from "./components/color-panel";
import SizePanel from "./components/size-panel";
import { BrushSize } from "../../../shared/constants/icons-table";
import { cn } from "../../../shared/utils";
import useAnnotationConfig from "../shared/useAnnotation";

const AnnotateApp = () => {
  const [annotationTimer, setAnnotationTimer] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [config, setConfig] = useAnnotationConfig()



  const toggleDrawer = (drawer) => {
    setOpenDrawer(prev => (prev === drawer ? null : drawer));
  };

  const handleAnnotationTimer = async () => {
    if (annotationTimer === 3) {
      setAnnotationTimer(0);
      setConfig({
        freeze: true,
        freezeTime: 0
      })
    } else {
      setAnnotationTimer((prev) => prev + 1);
      setConfig({
        freeze: false,
        freezeTime: parseInt((annotationTimer + 1) * 3000)
      })
    }
  };

  const breaker = (<hr className="bg-button-hover/80" />)

  return (
    <div className="py-1 bg-background text-foreground/80 flex gap-1 border border-foreground/25 rounded select-none max-w-[53px]">
      <div
        className={cn(
          "flex flex-col items-center justify-center w-[50px] transition-transform duration-300 ease-in-out px-2 gap-2",
          openDrawer ? "translate-x-[-50px]" : "translate-x-0"
        )}
      >
        <MainPanel config={config} setConfig={setConfig} />

        {breaker}

        <button
          disabled={config.tool === "text" || config.tool === "arrow"}
          onClick={() => toggleDrawer("size")}
          className="hover:bg-button-hover p-1 no-drag rounded w-full flex justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <BrushSize size="25" />
        </button>

        <button
          disabled={config.tool === "eraser"}
          onClick={() => toggleDrawer("color")}
          className="hover:bg-button-hover p-1 no-drag rounded w-full flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Palette size={23} />
        </button>

        {breaker}

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleAnnotationTimer}
            className="hover:bg-button-hover p-1 no-drag rounded w-full flex justify-center"
          >
            <Timer size={23} />
          </button>
          <div className="flex gap-1 max-w-8 opacity-60">
            <span className={cn('w-4 h-0.5', annotationTimer > 0 ? 'bg-cyan-500' : 'bg-foreground')} />
            <span className={cn('w-4 h-0.5', annotationTimer > 1 ? 'bg-cyan-500' : 'bg-foreground')} />
            <span className={cn('w-4 h-0.5', annotationTimer > 2 ? 'bg-cyan-500' : 'bg-foreground')} />
          </div>
        </div>

        {breaker}

        <button
          onClick={() => window.api.annotation.stop()}
          className="hover:bg-button-hover p-1 no-drag rounded w-full flex justify-center"
        >
          <Cross size={23} />
        </button>
      </div>

      <div
        className={cn(
          "absolute top-0 left-[50px] w-[50px] h-full transition-transform duration-300 ease-in-out",
          openDrawer === "color" ? "translate-x-[-50px]" : "translate-x-0"
        )}
      >
        <ColorPanel config={config} setConfig={setConfig} close={() => setOpenDrawer(null)} />
      </div>

      <div
        className={cn(
          "absolute top-0 left-[50px] w-[50px] h-full transition-transform duration-300 ease-in-out",
          openDrawer === "size" ? "translate-x-[-50px]" : "translate-x-0"
        )}
      >
        <SizePanel config={config} setConfig={setConfig} close={() => setOpenDrawer(null)} />
      </div>
    </div>
  );
};

export default AnnotateApp;
