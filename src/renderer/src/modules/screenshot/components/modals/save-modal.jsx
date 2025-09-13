import log from 'electron-log/renderer'
import { useAtom, useAtomValue } from 'jotai'
import { getPresetConfigAtom, userPresetAtom } from '../../../../store'


const SaveModal = () => {

  const [userPreset, setuserPreset] = useAtom(userPresetAtom)
  const config = useAtomValue(getPresetConfigAtom)


  const handleSave = async () => {
    const fileInputDiv = document.getElementById("filename-input")
    const saveModelDiv = document.getElementById("save_modal")
    const filename = fileInputDiv.value;
    if (filename.length <= 0) {
      alert("plz Input a file Name")
    }
    if (Object.keys(userPreset).includes(filename)) {
      alert("plz add a different preset name of delete the previous one")
    }
    const newPreset = {
      [filename]: config
    }
    log.info(userPreset)
    const payload = { ...userPreset, ...newPreset }
    const res = await window.api.screenshot.updateUserPreset({
      "presets": payload
    })
    setuserPreset(res)
    saveModelDiv.close()
  }



  return (
    <dialog id="save_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
          <legend className="fieldset-legend">File-Name</legend>
          <div className="join">
            <input type="text" id="filename-input" className="input join-item" placeholder="rev-preset" />
            <button onClick={handleSave} className="btn join-item">save</button>
          </div>
        </fieldset>
      </div>
    </dialog>
  )
}

export default SaveModal
