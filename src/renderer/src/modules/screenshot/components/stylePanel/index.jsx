import { useState } from "react"
import { useSetAtom, useAtomValue } from "jotai/react"
import PresetDropdown from "./preset-dropdown"
import SliderControl from "./slider-selector"
import BackgroundSelector from "./background-selector"
import { getPresetConfigAtom, setPresetConfigAtom } from "../../../../store/screenshot"


const SidePanel = () => {
  const [preset, setPreset] = useState("Default")
  const setConfig = useSetAtom(setPresetConfigAtom)
  const config = useAtomValue(getPresetConfigAtom)

  const presets = ["Default", "Custom 1", "Custom 2"]

  const backgrounds = [
    { value: "#FF6B6B" },
    { value: "#FFD93D" },
    { value: "#6BCB77" },
    { value: "#4D96FF" },
    { value: "#9D4EDD" },
    { value: "#FF922B" },
    { value: "#00C2A8" },
    { value: "#3D348B" },
    { value: "#FFB5A7" },
    { value: "#FF70A6" },
    { value: "transparent" }
  ];

  return (
    <div className="bg-neutral p-4 px-8 overflow-y-auto border-l border-base-content/20 rounded-none">
      <PresetDropdown presets={presets} selected={preset} setSelected={setPreset} />

      <SliderControl label="Padding" value={config.padding} setValue={setConfig} max={90} />
      <SliderControl label="Rounded" value={config.rounded} setValue={setConfig} max={150} />
      <SliderControl label="Shadow" value={config.shadow} setValue={setConfig} />

      <BackgroundSelector
        backgrounds={backgrounds}
        selected={config.backgroundcolor}
        setSelected={setConfig}
      />
    </div>
  )
}

export default SidePanel
