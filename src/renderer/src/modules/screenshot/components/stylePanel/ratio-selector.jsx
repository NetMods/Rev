const RatioSelector = ({ ratios, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-base-content block mb-2 no-drag">Ratio / Size</label>
      <div className="flex flex-wrap gap-2 no-drag">
        {ratios.map((r, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(r)}
            className={`px-3 py-1 rounded-full text-sm no-drag ${selected === r
              ? "bg-primary text-neutral"
              : "bg-base-300 text-base-content"
              }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RatioSelector
