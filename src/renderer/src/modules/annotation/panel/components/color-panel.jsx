import { FaCircle } from "react-icons/fa";
import { PENCOLORS } from "../constants";
import { HiArrowNarrowLeft as LeftArrow } from "react-icons/hi";
import { cn } from "../../../../shared/utils";

const ColorPanel = ({ config, setConfig, close }) => {

  const handleColorChange = async (Hexcolor) => {
    setConfig({
      color: Hexcolor,
    })
  };

  const colorButtons = [
    { hex: PENCOLORS.RED, class: "text-[#FF3B30]" },
    { hex: PENCOLORS.YELLOW, class: "text-[#FFCC00]" },
    { hex: PENCOLORS.GREEN, class: "text-[#34C759]" },
    { hex: PENCOLORS.BLUE, class: "text-[#007AFF]" },
    { hex: PENCOLORS.PURPLE, class: "text-[#AF52DE]" },
    { hex: PENCOLORS.ORANGE, class: "text-[#FF9500]" },
  ];

  return (
    <div className="flex flex-col w-[53px] h-full py-1  gap-1">
      <div className="flex flex-col items-center justify-between size-full gap-1">
        {colorButtons.map(({ hex, class: colorClass }) => (
          <button
            key={hex}
            onClick={() => handleColorChange(hex)}
            className={cn(
              "p-1 no-drag w-full flex justify-center items-center h-11 cursor-pointer transition-all ease-linear hover:bg-base-content/15",
              colorClass,
              config.color === hex ? "bg-base-content/15" : ""
            )}
          >
            <FaCircle size={24} />
          </button>
        ))}
      </div>

      <button
        onClick={close}
        className="p-1 py-2 rounded no-drag w-full flex justify-center items-center h-11 cursor-pointer hover:bg-base-content/15"
      >
        <LeftArrow size={20} />
      </button>
    </div>
  );
};

export default ColorPanel;
