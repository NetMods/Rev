import log from "electron-log/renderer"
import { useAtom, useSetAtom } from "jotai"
import { currentPresetNameAtom, userPresetAtom, presetTypeAtom, setPresetConfigAtom } from "../../../../store"
import { PRESERTYPES, DEFAULT_CONFIG } from "../../constants"

const DeleteModal = () => {

  const [currentPresetName, setcurrentPrestName] = useAtom(currentPresetNameAtom)
  const [, setuserPreset] = useAtom(userPresetAtom)
  const [, setpresetType] = useAtom(presetTypeAtom)
  const setConfig = useSetAtom(setPresetConfigAtom)



  const handleDelete = async () => {
    const deleteModalDiv = document.getElementById("delete_modal");

    try {
      const res = await window.api.screenshot.getUserPreset();
      const userPresetNames = Object.keys(res);

      if (userPresetNames.includes(currentPresetName)) {
        const entries = Object.entries(res);
        const filteredEntries = entries.filter(([key]) => key !== currentPresetName);
        const newPresets = Object.fromEntries(filteredEntries);

        log.info("new presets", newPresets);

        const newRes = await window.api.screenshot.updateUserPreset({
          presets: newPresets
        });
        setuserPreset(newRes);
        setpresetType(PRESERTYPES.DEFAULT)
        setcurrentPrestName(PRESERTYPES.DEFAULT)
        setConfig(DEFAULT_CONFIG)
        deleteModalDiv.close();
      } else {
        alert("No preset found of that name");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete preset. Please try again.");
    }
  };

  return (
    <dialog id="delete_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        Hey!!! Are You Sure You want To <span><button onClick={handleDelete} className="btn btn-dash btn-error">Delete</button></span> the requested Preset
        then click on on the delete Button
      </div>
    </dialog>
  )
}

export default DeleteModal
