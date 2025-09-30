const SliderControl = ({ label, value, setValue, min = 0, max = 50 }) => {
  let key = label.toLowerCase().replace(" ", "");
  return (
    <div className="flex flex-col pb-4 gap-3 no-drag">
      <label className="text-base-content mb-1 no-drag text-sm">{label}</label>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => setValue({
          [key]: parseInt(e.target.value)
        })}
        className="range range-primary range-xs no-drag"
      />
    </div>
  )
}

export default SliderControl
