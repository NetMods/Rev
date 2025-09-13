import { atom } from "jotai"
import { SCREENSHOTTOOL } from "../shared/constants"
import { PRESERTYPES } from "../modules/screenshot/constants"

const presetConfigAtom = atom({
  tool: SCREENSHOTTOOL.NONE,
  padding: 10,
  rounded: 5,
  shadow: 0,
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


export const backgroundImageAtom = atom(null)
export const getbackgroundImageAtom = atom((get) => get(backgroundImageAtom))
export const setbackgroundImageAtom = atom(null, (_, set, update) => set(backgroundImageAtom, update))


export const canvasRedoAtom = atom(null)
export const getcanvasRedoAtom = atom((get) => get(canvasRedoAtom))
export const setCanvasRedoAtom = atom(null, (_, set, update) => set(canvasRedoAtom, update))


export const userPresetAtom = atom({})
export const currentPresetNameAtom = atom("default preset")
export const presetTypeAtom = atom(PRESERTYPES.DEFAULT)
