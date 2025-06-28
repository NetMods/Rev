import { atom } from "jotai"

// atom that contains the mouse - recording
export const mouseTimeStampsAtom = atom([])

// WRITE ONLY ATOM (avoids unnecessary re-rendering) for mouseRecording
export const addMouseTimeStampsAtom = atom(null, (_, set, newMouseRecording) => {
  set(mouseTimeStampsAtom, (prev) => [...prev, newMouseRecording])
})

// WRITE ONLY ATOM reseting the mousetimestamps
export const resetMouseTimeStampsAtom = atom(null, (_, set) => {
  set(mouseTimeStampsAtom, [])
})
