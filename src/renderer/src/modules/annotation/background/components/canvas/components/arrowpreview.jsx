import { Arrow } from 'react-konva';
import PropTypes from 'prop-types';

export default function ArrowPreview({ start, end }) {
  return (
    <Arrow
      points={[start.x, start.y, end.x, end.y]}
      pointerLength={10}
      pointerWidth={10}
      fill="gray"
      stroke="gray"
      strokeWidth={10}
      opacity={0.7}
    />
  );
}

ArrowPreview.propTypes = {
  start: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  end: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired
};
