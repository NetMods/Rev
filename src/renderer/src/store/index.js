import { atom } from "jotai"

// atom that contains the mouse - recording
export const mouseTimeStampsAtom = atom([])

// WRITE ONLY ATOM (avoids unnecessary re-rendering) for mouseRecording
export const setMouseTimeStampsAtom = atom(null, (_, set, mouseRecordings) => {
  set(mouseTimeStampsAtom, mouseRecordings)
})
