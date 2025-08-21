export const BrushSize = ({ size }) => {
  return <svg width={size} height={size} viewBox={`20 20 70 45`} fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
    <circle cx="26" cy="52" r="5" stroke="white" strokeWidth="4" />
    <circle cx="43" cy="47" r="10" stroke="white" strokeWidth="4" />
    <path d="M71.5 25C80.6402 25 88 32.1906 88 41C88 49.8094 80.6402 57 71.5 57C62.3598 57 55 49.8094 55 41C55 32.1906 62.3598 25 71.5 25Z" stroke="white" strokeWidth="4" />
  </svg>
};

export const Square = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-rectangle">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M19 4h-14a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" />
  </svg>
}

export const Pause = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-player-pause">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
    <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
  </svg>
}

export const Restart = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-rotate">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
  </svg>
}

export const Delete = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 7l16 0" />
    <path d="M10 11l0 6" />
    <path d="M14 11l0 6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
}


export default {
  BrushSize,
  Square,
  Pause,
  Restart,
  Delete,
};
