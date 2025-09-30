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
        "btn flex items-center gap-2 no-drag transition-all ease-linear duration-75",
        pressed
          ? "btn-active scale-95 shadow-inner"
          : "active:scale-95",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;
