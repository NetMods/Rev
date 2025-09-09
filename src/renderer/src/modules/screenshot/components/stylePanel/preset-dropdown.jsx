const PresetDropdown = ({ presets, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-base-content block mb-1 no-drag">Preset</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-base-300 text-base-content rounded p-2 border border-primary focus:outline-none no-drag"
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
