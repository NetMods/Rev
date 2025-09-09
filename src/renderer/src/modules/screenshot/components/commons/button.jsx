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
        "flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all duration-200 no-drag",
        pressed
          ? "bg-primary/70 border-primary-content/70 shadow-inner translate-y-[1px]" // pressed look
          : "bg-primary border-primary-content shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]",
        className
      )}
    >
      <div
        className={cn(
          "flex justify-center items-center p-1 rounded-md no-drag",
          pressed
            ? "bg-base-300 text-base-content/70"
            : "bg-base-200 text-base-content/50"
        )}
      >
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      {text && (
        <span
          className={cn(
            "font-semibold no-drag",
            pressed ? "text-primary-content/70" : "text-primary-content"
          )}
        >
          {text}
        </span>
      )}
    </button>
  );
};

export default Button;
