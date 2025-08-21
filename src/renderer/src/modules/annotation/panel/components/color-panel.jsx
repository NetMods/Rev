import { FaCircle } from "react-icons/fa";
import { PENCOLORS } from "../constants";
import { HiArrowNarrowLeft as LeftArrow } from "react-icons/hi";
import { cn } from "../../../../shared/utils";

const ColorPanel = ({ config, setConfig, close }) => {

  const handleColorChange = async (Hexcolor) => {
    setConfig({
      color: Hexcolor,
      size: null,
      freeze: null,
      freezeTime: 0
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
    <div className="flex flex-col w-[53px] h-full py-1 px-1 gap-1">
      <div className="flex flex-col items-center justify-between size-full gap-1">
        {colorButtons.map(({ hex, class: colorClass }) => (
          <button
            key={hex}
            onClick={() => handleColorChange(hex)}
            className={cn(
              "hover:bg-button-hover p-1 no-drag w-full rounded flex justify-center items-center h-11 ",
              colorClass,
              config.color === hex ? "bg-button-hover" : "hover:bg-button-hover"
            )}
          >
            <FaCircle size={24} />
          </button>
        ))}
      </div>

      <button
        onClick={close}
        className="hover:bg-button-hover p-1 py-2 rounded no-drag w-full flex justify-center items-center h-11"
      >
        <LeftArrow size={20} />
      </button>
    </div>
  );
};

export default ColorPanel;
