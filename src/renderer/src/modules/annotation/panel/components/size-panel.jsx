import { FaCircle } from "react-icons/fa";
import { PENSIZE } from "../constants";
import { HiArrowNarrowLeft as LeftArrow } from "react-icons/hi";
import { cn } from "../../../../shared/utils";

const SizePanel = ({ config, setConfig, close }) => {

  const handleSizeChange = async (size) => {
    setConfig({
      size: size,
    })
  };

  const sizes = [
    PENSIZE.W1,
    PENSIZE.W2,
    PENSIZE.W3,
    PENSIZE.W4,
    PENSIZE.W5,
    PENSIZE.W6,
  ];

  return (
    <div className="flex flex-col w-[53px] h-full py-1 gap-1">
      <div className="flex flex-col items-center justify-between size-full gap-1">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeChange(size)}
            className={cn(
              "p-1 no-drag w-full flex justify-center items-center h-11 cursor-pointer transition-all ease-linear hover:bg-base-content/15",
              config.size === size && "bg-base-content/15"
            )}
          >
            <FaCircle size={size} className="bg-base-content rounded-full" />
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

export default SizePanel;
