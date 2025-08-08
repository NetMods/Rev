import { FaCircle } from "react-icons/fa";
import { PENSIZE } from "../constants";


const SizePanel = () => {

  const handleSizeChange = async (size) => {
    await window.api.updateAnnotaionStyle({
      color: null,
      size: size
    })
  }



  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      <button onClick={() => handleSizeChange(PENSIZE.W1)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W1} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W2)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W2} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W3)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W3} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W4)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W4} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W5)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W5} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W6)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W6} /></button>
      <button onClick={() => handleSizeChange(PENSIZE.W7)} className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={PENSIZE.W7} /></button>
    </div>
  )
}

export default SizePanel
