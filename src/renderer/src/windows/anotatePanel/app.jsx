import { useState } from "react"
import log from 'electron-log/renderer'

const AnotateApp = () => {

  const handelStopAnotating = () => {
    log.info('clicked on stop')
    window.api.stopAnotatingScreen()
  }

  const [color, setColor] = useState(false)

  const openColorDrawer = () => {
    if (!color) {
      window.api.openDrawer()
    } else {
      window.api.closeDrawer()
    }
    setColor((prev) => !prev)
  }


  return (
    <div className="flex bg-red-400 text-white/70">
      <div className="h-screen bg-amber-200 flex flex-col" >
        <button onClick={handelStopAnotating} className="border border-black no-drag" >Done</button>
        <button onClick={openColorDrawer} className="border border-black no-drag" >Color</button>
      </div>
      {color &&
        <div className="h-screen bg-red-400" >
          X
        </div>
      }
    </div>
  )
}


export default AnotateApp
