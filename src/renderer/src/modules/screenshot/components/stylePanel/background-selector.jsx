import { cn } from '../../../../shared/utils'
import log from "electron-log/renderer"

const BackgroundSelector = ({ backgrounds, selected, setSelected }) => {
  return (
    <div className="mb-6 no-drag">
      <label className="text-base-content block mb-2 no-drag">Background</label>
      <div className="grid grid-cols-5 gap-2 no-drag">
        {backgrounds.map((bg, idx) => (
          <div key={idx}
            onClick={() => {
              setSelected({
                backgroundcolor: bg.value
              })
            }}
            className={cn("avatar", selected === bg.value ? "avatar-online" : "avatar-offline")}>
            <div
              style={{ background: bg.value }}
              className={cn("h-12 rounded-md")}> </div>
          </div>
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


// className={`h-12 rounded-md border-2 no-drag ${selected === bg.value ? "border-primary" : "border-transparent"}`}

export default BackgroundSelector
