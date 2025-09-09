const BackgroundSelector = ({ backgrounds, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-base-content block mb-2 no-drag">Background</label>
      <div className="grid grid-cols-5 gap-2 no-drag">
        {backgrounds.map((bg, idx) => (
          <button
            key={idx}
            onClick={() => setSelected({
              backgroundcolor: bg.value
            })}
            className={`h-12 rounded-md border-2 no-drag ${selected === bg.value ? "border-primary" : "border-transparent"}`}
            style={{
              background: bg.value,
            }}
          />
        ))}
        <button
          onClick={() => alert("Custom color picker coming soon")}
          className="h-12 rounded-md bg-base-300 text-base-content border-2 border-dashed border-primary flex items-center justify-center no-drag"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default BackgroundSelector
