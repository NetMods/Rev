import { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { PENSIZE } from "../constants";

const SizePanel = () => {
  const [selectedSize, setSelectedSize] = useState(PENSIZE.W1); // default selected

  const handleSizeChange = async (size) => {
    setSelectedSize(size); // update UI highlight

    await window.api.updateAnnotaionStyle({
      color: null,
      size: size,
    });
  };

  const sizes = [
    PENSIZE.W1,
    PENSIZE.W2,
    PENSIZE.W3,
    PENSIZE.W4,
    PENSIZE.W5,
    PENSIZE.W6,
    PENSIZE.W7,
  ];

  return (
    <div className="h-screen w-[50px] flex flex-col items-center justify-evenly">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => handleSizeChange(size)}
          className={`p-1 no-drag rounded
            hover:bg-neutral-800
            ${selectedSize === size ? "bg-neutral-700" : ""}`}
        >
          <FaCircle size={size} />
        </button>
      ))}
    </div>
  );
};

export default SizePanel;
