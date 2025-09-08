import { Arrow } from 'react-konva';
import PropTypes from 'prop-types';

export default function Arrows({ arrows }) {
  return (
    <>
      {arrows.map((arrow, index) => (
        <Arrow
          key={index}
          points={arrow.points}
          pointerLength={10}
          pointerWidth={10}
          fill={arrow.color}
          stroke={arrow.color}
          strokeWidth={10}
        />
      ))}
    </>
  );
}

Arrows.propTypes = {
  arrows: PropTypes.arrayOf(
    PropTypes.shape({
      points: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired
};
