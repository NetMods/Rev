const createSlicePath = (index, slices, radius, centerX, centerY) => {
  const anglePerSlice = 360 / slices;
  const startAngle = index * anglePerSlice;
  const endAngle = (index + 1) * anglePerSlice;

  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(endRad);
  const endY = centerY + radius * Math.sin(endRad);

  const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
  return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

const getButtonPosition = (index, totalButtons, radius) => {
  const angle = ((index - 1) * 2 * Math.PI) / totalButtons;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { transform: `translate(${x}px, ${y}px)` };
};

export const CircularMenu = ({ buttons, dimensions, hoveredIndex, onHover, onLeave, playSound }) => {
  const size = Math.min(dimensions.width, dimensions.height);
  const center = size / 2;

  const slices = buttons.map((_, index) => createSlicePath(index, buttons.length, size / 2, center, center));

  const positions = buttons.map((_, index) => getButtonPosition(index, buttons.length, size / 3));

  return (
    <>
      <svg width={size} height={size} className="absolute z-0">
        {buttons.map((button, index) => (
          <path
            key={index}
            d={slices[index]}
            fill="var(--color-base-100)"
            stroke="var(--color-base-content)"
            strokeOpacity={0.2}
            strokeWidth="1"
            className="transition-all duration-200 cursor-pointer hover:opacity-50"
            onClick={button.action}
            style={{
              filter: hoveredIndex === index ? 'brightness(6.8) saturate(1.2)' : 'brightness(1)',
              transform: hoveredIndex === index ? 'scale(0.98)' : 'scale(1)',
              transformOrigin: 'center'
            }}
            onMouseEnter={() => {
              onHover(index);
              playSound();
            }}
            onMouseLeave={onLeave}
          />
        ))}
      </svg>

      {buttons.map((button, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-base-content/70 flex justify-center items-center"
          style={positions[i]}
        >
          <button className="hover:opacity-80 transition-opacity">
            {button.icon}
          </button>
        </span>
      ))}
    </>
  );
};
