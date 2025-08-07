import { atom } from "jotai"

// atom that contains the mouse - recording
export const mouseTimeStampsAtom = atom([])

// WRITE ONLY ATOM (avoids unnecessary re-rendering) for mouseRecording
export const setMouseTimeStampsAtom = atom(null, (_, set, mouseRecordings) => {
  set(mouseTimeStampsAtom, mouseRecordings)
})


export const currentColor = atom("#FF3B30")
export const currentSize = atom(5)


export const getCurrentColor = atom((get) => get(currentColor))
export const getCurrentSize = atom((get) => get(currentSize))
