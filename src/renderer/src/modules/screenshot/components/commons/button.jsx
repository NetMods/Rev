import { cn } from "../../../../shared/utils"

const Button = ({
  text,
  icon: Icon,
  onClick,
  pressed = false,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border text-gray-800 font-medium transition-all duration-200 no-drag",
        pressed
          ? "bg-[#00969E] border-gray-400 shadow-inner translate-y-[1px]" // pressed look
          : "bg-[#00ADB5] border-gray-300 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]",
        className
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center p-1 rounded-md no-drag",
          pressed
            ? "bg-[#DDDDDD] text-gray-600"
            : "bg-[#EEEEEE] text-gray-400"
        )}
      >
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      {text && (
        <span
          className={cn(
            "font-semibold no-drag",
            pressed ? "text-[#DDDDDD]" : "text-[#EEEEEE]"
          )}
        >
          {text}
        </span>
      )}
    </button>
  );
};

export default Button;
