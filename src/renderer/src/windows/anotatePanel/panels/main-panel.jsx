import { FaPaintBrush } from "react-icons/fa";
import { MdOutlineArrowOutward } from "react-icons/md";
import { TbOvalVertical } from "react-icons/tb";
import { RxText } from "react-icons/rx";
import { useState } from "react";
import { MainAnotationControls } from "../constants";


const MainPanel = () => {

  const [currentMode, setCurrentMode] = useState(MainAnotationControls.LINE)

  return (
    <div className="flex flex-col gap-2 items-center">
      <button onClick={() => setCurrentMode(MainAnotationControls.LINE)} className={`p-1  no-drag rounded ${currentMode === 'line' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'} `}><FaPaintBrush size={23} /></button>
      <button onClick={() => setCurrentMode(MainAnotationControls.ARROW)} disabled className={`p-1  no-drag rounded ${currentMode === 'arrow' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'} disabled:opacity-50 disabled:cursor-not-allowed`}><MdOutlineArrowOutward size={23} /></button>
      <button onClick={() => setCurrentMode(MainAnotationControls.OVAL)} disabled className={`p-1 hover:bg-neutral-800 no-drag rounded ${currentMode === 'oval' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'} disabled:opacity-50 disabled:cursor-not-allowed`}><TbOvalVertical size={23} /></button>
      <button onClick={() => setCurrentMode(MainAnotationControls.TEXT)} disabled className={`p-1 hover:bg-neutral-800 no-drag rounded ${currentMode === 'text' ? 'bg-neutral-700/60' : 'hover:bg-neutral-800'} disabled:opacity-50 disabled:cursor-not-allowed`}><RxText size={23} /></button>
    </div>
  );
};

export default MainPanel

