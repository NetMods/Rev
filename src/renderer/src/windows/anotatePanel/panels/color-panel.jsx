import { FaCircle } from "react-icons/fa";
import { useAtom } from "jotai";
import { currentColor } from "../../../store";
import { PENCOLORS } from "../constants";




const ColorPanel = () => {

  const [, setPenColor] = useAtom(currentColor)

  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      <button onClick={() => setPenColor(PENCOLORS.RED)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FF3B30]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.YELLOW)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FFCC00]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.GREEN)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#34C759]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.BLUE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#007AFF]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.PURPLE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#AF52DE]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.ORANGE)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#FF9500]"><FaCircle size={24} /></button>
      <button onClick={() => setPenColor(PENCOLORS.BLACK)} className="p-1 hover:bg-neutral-800 no-drag rounded text-[#333333]"><FaCircle size={24} /></button>
    </div>

  )
}

export default ColorPanel
