import MainPanel from "./panels/main-panel";
import { BsDashLg } from "react-icons/bs";
import { IoColorPaletteOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { IoIosTimer } from "react-icons/io";
import { GoDash } from "react-icons/go";
import log from 'electron-log/renderer'
import { useState } from "react";
import ColorPanel from "./panels/color-panel";
import SizePanel from "./panels/size-panel";

const AnotateApp = () => {

  const [openColorDrawer, setOpenColorDrawer] = useState(false)
  const [openSizeDrawer, setOpenSizeDrawer] = useState(false)

  const handelStopAnotating = () => {
    log.info('clicked on stop');
    window.api.stopAnotatingScreen();
  };

  const handleColorPanel = () => {
    if (openSizeDrawer) {
      setOpenSizeDrawer(false)
    }
    if (openColorDrawer) {
      window.api.closeDrawer()
    } else {
      window.api.openDrawer()
    }
    setOpenColorDrawer((prev) => !prev)
  }

  const handleSizePanel = () => {
    if (openColorDrawer) {
      setOpenColorDrawer(false)
    }
    if (openSizeDrawer) {
      window.api.closeDrawer()
    } else {
      window.api.openDrawer()
    }
    setOpenSizeDrawer((prev) => !prev)
  }


  return (
    <div className="m-1 h-screen text-white flex gap-1">
      <div className="h-screen w-[50px] flex flex-col items-center justify-center">
        <MainPanel />
        <BsDashLg size={23} />
        <button onClick={handleSizePanel} className="p-1 hover:bg-neutral-800 no-drag rounded">.o<span className="text-blue-800">O</span></button>
        <button onClick={handleColorPanel} className="p-1 hover:bg-neutral-800 no-drag rounded"><IoColorPaletteOutline size={23} /></button>
        <BsDashLg size={23} />
        <div className="flex flex-col items-center justify-center">
          <button className="p-1 hover:bg-neutral-800 no-drag rounded"><IoIosTimer size={23} /></button>
          <div className="flex">
            <GoDash size={7} />
            <GoDash size={7} />
            <GoDash size={7} />
          </div>
        </div>
        <BsDashLg size={23} />
        <button onClick={handelStopAnotating} className="p-1 hover:bg-neutral-800 no-drag rounded"><RxCross2 size={23} /></button>
      </div>
      {
        openColorDrawer &&
        <ColorPanel />
      }
      {
        openSizeDrawer &&
        <div className="h-screen w-[50px] flex flex-col items-center justify-center">
          <SizePanel />
        </div>
      }

    </div>
  );
};

export default AnotateApp;
