import { atom } from "jotai"
import { SCREENSHOT_TOOL } from "../shared/constants"
import { PRESET_TYPES } from "../modules/screenshot/constants"

const presetConfigAtom = atom({
  tool: SCREENSHOT_TOOL.NONE,
  padding: 60,
  rounded: 5,
  shadow: 25,
  backgroundcolor: "#9D4EDD"
})

export const getPresetConfigAtom = atom((get) => get(presetConfigAtom))
export const setPresetConfigAtom = atom(null, (_, set, update) => set(presetConfigAtom, (prev) => ({ ...prev, ...update })))


export const backgroundImageAtom = atom(null)
export const getbackgroundImageAtom = atom((get) => get(backgroundImageAtom))
export const setbackgroundImageAtom = atom(null, (_, set, update) => set(backgroundImageAtom, update))


export const canvasRedoAtom = atom(null)
export const getcanvasRedoAtom = atom((get) => get(canvasRedoAtom))
export const setCanvasRedoAtom = atom(null, (_, set, update) => set(canvasRedoAtom, update))


export const userPresetAtom = atom({})
export const currentPresetNameAtom = atom("Default Preset")
export const presetTypeAtom = atom(PRESET_TYPES.DEFAULT)
