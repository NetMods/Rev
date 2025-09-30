import Select from "../../../../shared/ui/select";
import { currentPresetNameAtom, presetTypeAtom, setPresetConfigAtom, userPresetAtom } from "../../../../store/screenshot";
import { PRESET_TYPES, DEFAULT_CONFIG } from "../../constants";
import { cn } from "../../../../shared/utils";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import { useSetAtom, useAtom } from "jotai";
import { useEffect } from "react";

const PresetDropdown = () => {
  const [currentPresetName, setCurrentPresetName] = useAtom(currentPresetNameAtom);
  const [presetType, setpresetType] = useAtom(presetTypeAtom);
  const [userPreset, setuserPreset] = useAtom(userPresetAtom);
  const setConfig = useSetAtom(setPresetConfigAtom);

  const handleDefaultPreset = () => {
    setpresetType(PRESET_TYPES.DEFAULT);
    setCurrentPresetName(PRESET_TYPES.DEFAULT);
    setConfig(DEFAULT_CONFIG);
  };

  const handleNewPreset = () => {
    setpresetType(PRESET_TYPES.NEW);
    setCurrentPresetName(PRESET_TYPES.NEW);
  };

  const handleCustomPreset = (name) => {
    setpresetType(PRESET_TYPES.CUSTOM);
    setCurrentPresetName(name);
    // guard in case userPreset[name] is undefined
    if (userPreset && userPreset[name]) {
      setConfig(userPreset[name]);
    } else {
      // fallback: reset to default config if missing
      setConfig(DEFAULT_CONFIG);
    }
  };

  useEffect(() => {
    const getPresetData = async () => {
      const res = await window.api.screenshot.getUserPreset();
      if (!res) {
        setuserPreset({});
        return;
      }
      setuserPreset(res);
    };
    getPresetData();
  }, [setuserPreset]);

  const options = [
    ...Object.keys(userPreset || {}).map((name) => ({ value: name, label: name })),
    { value: PRESET_TYPES.DEFAULT, label: "Default Preset" },
    { value: PRESET_TYPES.NEW, label: "New Preset" },
  ];

  const handleChange = (value) => {
    if (value === PRESET_TYPES.DEFAULT) return handleDefaultPreset();
    if (value === PRESET_TYPES.NEW) return handleNewPreset();
    return handleCustomPreset(value);
  };

  return (
    <div className="pb-4 flex flex-col justify-center items-start no-drag w-full">
      <label className="text-base-content block no-drag text-sm">Preset</label>

      <div className="flex justify-center items-center w-full gap-2">
        <div className="w-full max-w-xs pt-2">
          <Select
            options={options}
            value={currentPresetName}
            onChange={handleChange}
          />
        </div>

        <button
          className={cn(
            "btn btn-soft flex items-center justify-center",
            presetType === PRESET_TYPES.DEFAULT ? "hidden" : "",
            presetType === PRESET_TYPES.NEW ? "btn-success" : "btn-warning"
          )}
        >
          {presetType === PRESET_TYPES.NEW ? (
            <span
              className="hidden md:block"
              onClick={() => document.getElementById("save_modal")?.showModal()}
            >
              Save
            </span>
          ) : (
            <span
              className="hidden md:block"
              onClick={() => document.getElementById("delete_modal")?.showModal()}
            >
              <DeleteIcon />
            </span>
          )}
          <FaSave className="block md:hidden text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PresetDropdown;
