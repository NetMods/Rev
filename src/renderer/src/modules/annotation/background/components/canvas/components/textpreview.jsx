import { Rect } from 'react-konva';
import PropTypes from 'prop-types';

export default function TextPreview({ start, end, penColor }) {
  return (
    <Rect
      x={Math.min(start.x, end.x)}
      y={Math.min(start.y, end.y)}
      width={Math.abs(end.x - start.x)}
      height={Math.abs(end.y - start.y)}
      fill={penColor}
      opacity={0.3}
    />
  );
}

TextPreview.propTypes = {
  start: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  end: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
};
