import { Html } from 'react-konva-utils';
import PropTypes from 'prop-types';

export default function TextAreas({ textAreas, setTextAreas }) {
  return (
    <>
      {textAreas.map((area) => (
        <Html key={area.id} groupProps={{ x: area.x, y: area.y }}>
          <textarea
            value={area.text || ''}
            onChange={(e) => {
              setTextAreas((prev) =>
                prev.map((t) =>
                  t.id === area.id ? { ...t, text: e.target.value } : t
                )
              );
            }}
            style={{
              width: area.width,
              height: area.height,
              resize: 'none',
              background: 'rgba(255,255,255,0.7)',
              fontSize: '20px',
              outline: 'none',
              color: area.penColor
            }}
            placeholder="Type here..."
          />
        </Html>
      ))}
    </>
  );
}

TextAreas.propTypes = {
  textAreas: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
      text: PropTypes.string
    })
  ).isRequired,
  setTextAreas: PropTypes.func.isRequired
};
