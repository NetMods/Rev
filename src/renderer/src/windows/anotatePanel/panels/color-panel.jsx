import { FaCircle } from "react-icons/fa";
import { PENCOLORS } from "../constants";
import { useState } from "react";

const ColorPanel = () => {
  const [currentColor, setCurrentColor] = useState(PENCOLORS.RED);

  const handleColorChange = async (Hexcolor) => {
    setCurrentColor(Hexcolor);
    await window.api.updateAnnotaionStyle({
      color: Hexcolor,
      size: null
    });
  };

  const colorButtons = [
    { hex: PENCOLORS.RED, class: "text-[#FF3B30]" },
    { hex: PENCOLORS.YELLOW, class: "text-[#FFCC00]" },
    { hex: PENCOLORS.GREEN, class: "text-[#34C759]" },
    { hex: PENCOLORS.BLUE, class: "text-[#007AFF]" },
    { hex: PENCOLORS.PURPLE, class: "text-[#AF52DE]" },
    { hex: PENCOLORS.ORANGE, class: "text-[#FF9500]" },
    { hex: PENCOLORS.BLACK, class: "text-[#333333]" },
  ];

  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      {colorButtons.map(({ hex, class: colorClass }) => (
        <button
          key={hex}
          onClick={() => handleColorChange(hex)}
          className={`p-1 no-drag rounded ${colorClass} ${currentColor === hex
              ? "bg-neutral-700/60"
              : "hover:bg-neutral-800"
            }`}
        >
          <FaCircle size={24} />
        </button>
      ))}
    </div>
  );
};

export default ColorPanel;
