import { cn } from "../../../../shared/utils";

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
        "btn flex items-center gap-2 no-drag transition-all duration-150",
        pressed
          ? "btn-active scale-95 shadow-inner" // pressed look
          : "hover:scale-105 active:scale-95", // hover & active feedback
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;
