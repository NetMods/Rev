import { atom } from "jotai"
import { SCREENSHOTTOOL } from "../shared/constants"

const presetConfigAtom = atom({
  tool: SCREENSHOTTOOL.NONE,
  padding: 10,
  rounded: 5,
  noise: 0,
  backgroundcolor: "#FFFFFF"
})

export const getPresetConfigAtom = atom((get) => get(presetConfigAtom))

export const setPresetConfigAtom = atom(
  null,
  (_, set, update) => {
    set(presetConfigAtom, (prev) => {
      return {
        ...prev,
        ...update
      }
    })
  }
)
