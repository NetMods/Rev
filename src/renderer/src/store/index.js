import { atom } from "jotai"
import { SCREENSHOTTOOL } from "../shared/constants"

const presetConfigAtom = atom({
  tool: SCREENSHOTTOOL.NONE,
  padding: 0,
  rounded: 0,
  shadow: 0,
  backgroundcolor: "#222831"
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


