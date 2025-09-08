const SliderControl = ({ label, value, setValue, min = 0, max = 100 }) => {
  let key = label.toLowerCase().replace(" ", "");
  return (
    <div className="flex flex-col mb-4 no-drag">
      <label className="text-[#EEEEEE] mb-1 no-drag">{label}</label>
      <div className="flex items-center gap-2 no-drag">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue({
            [key]: parseInt(e.target.value)
          })}
          className="w-full accent-[#00ADB5] no-drag"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-16 text-center rounded bg-[#393E46] text-[#EEEEEE] border border-[#00ADB5] no-drag"
        />
      </div>
    </div>
  )
}

export default SliderControl
