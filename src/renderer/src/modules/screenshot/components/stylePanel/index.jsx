import { useState } from "react"
import PresetDropdown from "./preset-dropdown"
import SliderControl from "./slider-selector"
import BackgroundSelector from "./background-selector"
import RatioSelector from "./ratio-selector"


const SidePanel = () => {
  const [preset, setPreset] = useState("Default")
  const [padding, setPadding] = useState(20)
  const [rounded, setRounded] = useState(10)
  const [shadow, setShadow] = useState(15)
  const [background, setBackground] = useState("linear-gradient(45deg,#00ADB5,#393E46)")
  const [ratio, setRatio] = useState("Auto")

  const presets = ["Default", "Custom 1", "Custom 2"]
  const backgrounds = [
    { value: "#222831" },
    { value: "#393E46" },
    { value: "#00ADB5" },
    { value: "#EEEEEE" },
    { value: "linear-gradient(45deg,#00ADB5,#393E46)" },
    { value: "linear-gradient(90deg,#FF6F61,#FFD700)" },
    { value: "linear-gradient(135deg,#6A11CB,#2575FC)" },
  ]
  const ratios = ["Auto", "4:3", "3:2", "16:9", "1:1"]

  return (
    <div className="bg-[#222831] p-4 overflow-y-auto">
      <PresetDropdown presets={presets} selected={preset} setSelected={setPreset} />
      <SliderControl label="Padding" value={padding} setValue={setPadding} />
      <SliderControl label="Rounded" value={rounded} setValue={setRounded} />
      <SliderControl label="Shadow" value={shadow} setValue={setShadow} />
      <BackgroundSelector
        backgrounds={backgrounds}
        selected={background}
        setSelected={setBackground}
      />
      <RatioSelector ratios={ratios} selected={ratio} setSelected={setRatio} />
    </div>
  )
}

export default SidePanel
