export const BrushSize = ({ size }) => {
  return <svg width={size} height={size} viewBox={`20 20 70 45`} fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
    <circle cx="26" cy="52" r="5" stroke="white" strokeWidth="4" />
    <circle cx="43" cy="47" r="10" stroke="white" strokeWidth="4" />
    <path d="M71.5 25C80.6402 25 88 32.1906 88 41C88 49.8094 80.6402 57 71.5 57C62.3598 57 55 49.8094 55 41C55 32.1906 62.3598 25 71.5 25Z" stroke="white" strokeWidth="4" />
  </svg>
};


export default {
  BrushSize,
};
