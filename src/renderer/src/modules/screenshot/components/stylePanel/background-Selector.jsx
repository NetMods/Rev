const BackgroundSelector = ({ backgrounds, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-[#EEEEEE] block mb-2 no-drag">Background</label>
      <div className="grid grid-cols-5 gap-2 no-drag">
        {backgrounds.map((bg, idx) => (
          <button
            key={idx}
            onClick={() => setSelected({
              backgroundcolor: bg.value
            })}
            className={`h-12 rounded-md border-2 no-drag ${selected === bg.value ? "border-[#00ADB5]" : "border-transparent"}`}
            style={{
              background: bg.value,
            }}
          />
        ))}
        <button
          onClick={() => alert("Custom color picker coming soon")}
          className="h-12 rounded-md bg-[#393E46] text-[#EEEEEE] border-2 border-dashed border-[#00ADB5] flex items-center justify-center no-drag"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default BackgroundSelector
