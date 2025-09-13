import { currentPresetNameAtom, presetTypeAtom, setPresetConfigAtom, userPresetAtom } from "../../../../store";
import { SCREENSHOTTOOL } from "../../../../shared/constants";
import { PRESERTYPES, DEFAULT_CONFIG } from "../../constants";
import { cn } from "../../../../shared/utils"
import { MdDelete as DeleteIcon } from "react-icons/md";
// import log from 'electron-log/renderer'

import { FaSave } from "react-icons/fa";
import { useSetAtom, useAtom } from "jotai";
import { useEffect, useState } from "react";

const PresetDropdown = () => {

  const [currentPresetName, setCurrentPresetName] = useAtom(currentPresetNameAtom)
  const [presetType, setpresetType] = useAtom(presetTypeAtom)
  const [userPreset, setuserPreset] = useAtom(userPresetAtom)
  const setConfig = useSetAtom(setPresetConfigAtom)

  const handleDefaultPreset = () => {
    setpresetType(PRESERTYPES.DEFAULT)
    setCurrentPresetName(PRESERTYPES.DEFAULT)
    setConfig(DEFAULT_CONFIG)
  }

  const handleNewPreset = () => {
    setpresetType(PRESERTYPES.NEW)
    setCurrentPresetName(PRESERTYPES.NEW)
  }

  const handleCustomPreset = (name) => {
    setpresetType(PRESERTYPES.CUSTOM)
    setCurrentPresetName(name)
    setConfig(userPreset[name])
  }



  useEffect(() => {
    const getPresetData = async () => {
      const res = await window.api.screenshot.getUserPreset()
      if (!res) {
        setuserPreset({})
        return
      }
      setuserPreset(res)
    }
    getPresetData()
  }, [])


  return (
    <div className="mb-6 flex flex-col justify-center items-start no-drag w-full">
      <label className="text-base-content block mb-1 no-drag">Preset</label>
      <div className="flex justify-center items-center w-full gap-2">
        <div className="dropdown dropdown-bottom">
          <div tabIndex={0} id="preset-dropdown-bottom" role="button" className="btn m-1">{currentPresetName}</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            {Object.keys(userPreset).length > 0 && Object.keys(userPreset).map((name, idx) => (
              <li key={name}><a onClick={() => handleCustomPreset(name)} >{name}</a></li>
            ))}
            {Object.keys(userPreset).length > 0 && (
              <li><div className="divider">OR</div></li>
            )}
            <li><a onClick={handleDefaultPreset} > Default Preset </a></li>
            <li> <a onClick={handleNewPreset} > New Preset ... </a> </li>
          </ul>
        </div>
        <button className={cn("btn btn-soft flex items-center justify-center",
          presetType === PRESERTYPES.DEFAULT ? "hidden" : "",
          presetType === PRESERTYPES.NEW ? "btn-success" : "btn-warning"
        )}>
          {presetType === PRESERTYPES.NEW ? (
            <span className="hidden md:block" onClick={() => document.getElementById('save_modal').showModal()} >Save</span>
          ) : (<span className="hidden md:block" onClick={() => document.getElementById('delete_modal').showModal()} ><DeleteIcon /></span>)}
          <FaSave className="block md:hidden text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PresetDropdown;
