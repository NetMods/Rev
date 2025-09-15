import { useState } from "react"
import { useSetAtom, useAtomValue } from "jotai/react"
import PresetDropdown from "./preset-dropdown"
import SliderControl from "./slider-selector"
import BackgroundSelector from "./background-selector"
// import RatioSelector from "./ratio-selector"
import { getPresetConfigAtom, setPresetConfigAtom } from "../../../../store"


const SidePanel = () => {
  const [preset, setPreset] = useState("Default")
  const setConfig = useSetAtom(setPresetConfigAtom)
  const config = useAtomValue(getPresetConfigAtom)
  // const [ratio, setRatio] = useState("Auto")

  const presets = ["Default", "Custom 1", "Custom 2"]

  const backgrounds = [
    // matt finish colors
    { value: "#FF6B6B" }, // bright coral red
    { value: "#FFD93D" }, // sunny yellow
    { value: "#6BCB77" }, // fresh green
    { value: "#4D96FF" }, // vivid sky blue
    { value: "#9D4EDD" }, // rich violet purple
    { value: "#FF922B" }, // vibrant orange
    { value: "#00C2A8" }, // aqua teal
    // metal-inspired but brighter
    { value: "#E85D04" }, // copper orange
    { value: "#3D348B" }, // royal indigo
    { value: "#FF5D8F" }, // hot pink
    { value: "#2EC4B6" }, // turquoise green
    { value: "#FFB5A7" }, // soft coral blush
    { value: "#06D6A0" }, // bright mint green
    { value: "#FF70A6" }, // lively rose pink

    { value: "transparent" }
  ]
  // const ratios = ["Auto", "4:3", "3:2", "16:9", "1:1"]

  return (
    <div className="bg-neutral p-4 overflow-y-auto border-l-2 border-base-content/50 rounded-none">
      <PresetDropdown presets={presets} selected={preset} setSelected={setPreset} />
      <SliderControl label="Padding" value={config.padding} setValue={setConfig} />
      <SliderControl label="Rounded" value={config.rounded} setValue={setConfig} />
      <SliderControl label="Shadow" value={config.shadow} setValue={setConfig} />
      <BackgroundSelector
        backgrounds={backgrounds}
        selected={config.backgroundcolor}
        setSelected={setConfig}
      />
      {/* this ratio selector is to be worked on */}
      {/*<RatioSelector ratios={ratios} selected={ratio} setSelected={setRatio} />*/}
    </div>
  )
}

export default SidePanel
