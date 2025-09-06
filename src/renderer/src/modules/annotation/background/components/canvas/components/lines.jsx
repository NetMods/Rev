import { Line } from 'react-konva';
import PropTypes from 'prop-types';

export default function Lines({ annotations }) {
  return (
    <>
      {annotations.map((line, idx) => (
        <Line
          key={idx}
          points={line.points}
          stroke={line.color}
          strokeWidth={line.width}
          tension={0.5}
          lineCap="round"
          globalCompositeOperation={line.type}
          draggable={false}
        />
      ))}
    </>
  );
}

Lines.propTypes = {
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      points: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['source-over', 'destination-out']).isRequired
    })
  ).isRequired
};
