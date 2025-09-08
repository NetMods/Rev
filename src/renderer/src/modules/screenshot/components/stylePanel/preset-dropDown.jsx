const PresetDropdown = ({ presets, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-[#EEEEEE] block mb-1 no-drag">Preset</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-[#393E46] text-[#EEEEEE] rounded p-2 border border-[#00ADB5] focus:outline-none no-drag"
      >
        {presets.map((preset, idx) => (
          <option key={idx} value={preset}>
            {preset}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PresetDropdown
