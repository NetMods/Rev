import { useState } from "react"
import { useSetAtom, useAtomValue } from "jotai/react"
import PresetDropdown from "./preset-dropdown"
import SliderControl from "./slider-selector"
import BackgroundSelector from "./background-selector"
import RatioSelector from "./ratio-selector"
import { getPresetConfigAtom, setPresetConfigAtom } from "../../../../store"


const SidePanel = () => {
  const [preset, setPreset] = useState("Default")
  const setConfig = useSetAtom(setPresetConfigAtom)
  const config = useAtomValue(getPresetConfigAtom)
  const [ratio, setRatio] = useState("Auto")

  const presets = ["Default", "Custom 1", "Custom 2"]

  const backgrounds = [
    // matt finish colors
    { value: "#FFFFFF" }, // white
    { value: "#1E1E1E" }, // matte dark gray
    { value: "#2C3A47" }, // deep slate blue-gray
    { value: "#6D6875" }, // muted mauve-gray
    { value: "#4E8098" }, // dusty teal
    { value: "#9A8C98" }, // muted lavender
    { value: "#A3B18A" }, // sage green
    // metal finish colrs
    { value: "#2F2F2F" }, // gunmetal
    { value: "#3A3A3A" }, // charcoal steel
    { value: "#4B4B4B" }, // forged iron
    { value: "#5C5470" }, // dark pewter violet
    { value: "#6E7C7C" }, // aged zinc
    { value: "#7A6F5C" }, // bronze alloy
    { value: "#8A817C" }, // tarnished silver
  ]
  // const ratios = ["Auto", "4:3", "3:2", "16:9", "1:1"]

  return (
    <div className="bg-neutral p-4 overflow-y-auto border-l-primary">
      <PresetDropdown presets={presets} selected={preset} setSelected={setPreset} />
      <SliderControl label="Padding" value={config.padding} setValue={setConfig} />
      <SliderControl label="Rounded" value={config.rounded} setValue={setConfig} />
      {/*<SliderControl label="Shadow" value={config.shadow} setValue={setConfig} />*/}
      <BackgroundSelector
        backgrounds={backgrounds}
        selected={config.backgroundcolor}
        setSelected={setConfig}
      />
      {/*<RatioSelector ratios={ratios} selected={ratio} setSelected={setRatio} />*/}
    </div>
  )
}

export default SidePanel
