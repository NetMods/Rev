import { FaSave } from "react-icons/fa";

const PresetDropdown = () => {
  return (
    <div className="mb-6 flex flex-col justify-center items-start no-drag w-full">
      <label className="text-base-content block mb-1 no-drag">Preset</label>
      <div className="flex justify-center items-center w-full gap-2">
        <div className="flex-1">
          <div className="dropdown dropdown-bottom">
            <div tabIndex={0} role="button" className="btn m-1">Default Preset</div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Named Preset 1</a></li>
              <li><a>Named Preset 2</a></li>
            </ul>
          </div>
        </div>
        <button className="btn btn-soft btn-success flex items-center justify-center">
          <span className="hidden md:block">Save</span>
          <FaSave className="block md:hidden text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PresetDropdown;
