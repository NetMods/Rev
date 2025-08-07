import { FaCircle } from "react-icons/fa";


const SizePanel = () => {
  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={6} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={12} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={18} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={24} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={30} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={36} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaCircle size={42} /></button>
    </div>
  )
}

export default SizePanel
