import { cn } from "../../../shared/utils"

const Button = ({
  text,
  icon: Icon,
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-[#00ADB5] rounded-xl shadow-sm border border-gray-300 text-gray-800 font-medium transition-all duration-200 no-drag hover:cursor-grab",
        className)}
    >
      <div className="bg-[#EEEEEE] text-gray-400 flex justify-center items-center p-1 rounded-md no-drag">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      {text && <span className="text-[#EEEEEE] font-semibold no-drag">{text}</span>}
    </button>
  );
};

export default Button;
