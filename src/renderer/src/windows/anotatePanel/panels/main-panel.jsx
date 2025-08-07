import { FaPaintBrush } from "react-icons/fa";
import { MdOutlineArrowOutward } from "react-icons/md";
import { TbOvalVertical } from "react-icons/tb";
import { RxText } from "react-icons/rx";


const MainPanel = () => {

  return (
    <div className="flex flex-col gap-2 items-center">
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><FaPaintBrush size={23} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded "><MdOutlineArrowOutward size={23} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><TbOvalVertical size={23} /></button>
      <button className="p-1 hover:bg-neutral-800 no-drag rounded"><RxText size={23} /></button>
    </div>
  );
};

export default MainPanel

