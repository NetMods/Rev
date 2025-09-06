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
    <div className="flex flex-col w-[53px] h-full py-1 px-1 gap-1">
      <div className="flex flex-col items-center justify-between size-full gap-1">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeChange(size)}
            className={cn(
              "p-1 no-drag w-full rounded flex justify-center items-center h-11",
              config.size === size && ""
            )}
          >
            <FaCircle size={size} />
          </button>
        ))}
      </div>

      <button
        onClick={close}
        className="p-1 py-2 rounded no-drag w-full flex justify-center items-center h-11"
      >
        <LeftArrow size={20} />
      </button>
    </div>
  );
};

export default SizePanel;
