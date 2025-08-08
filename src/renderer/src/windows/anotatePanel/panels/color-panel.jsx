import { FaCircle } from "react-icons/fa";
import { PENCOLORS } from "../constants";

const ColorPanel = () => {

  const handleColorChange = async (Hexcolor) => {
    await window.api.updateAnnotaionStyle({
      color: Hexcolor,
      size: null
    })
  }


  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      <button onClick={() => handleColorChange(PENCOLORS.RED)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FF3B30]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.YELLOW)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FFCC00]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.GREEN)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#34C759]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.BLUE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#007AFF]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.PURPLE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#AF52DE]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.PURPLE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FF9500]"><FaCircle size={24} /></button>
      <button onClick={() => handleColorChange(PENCOLORS.BLACK)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#333333]"><FaCircle size={24} /></button>
    </div>
  )
}

export default ColorPanel
