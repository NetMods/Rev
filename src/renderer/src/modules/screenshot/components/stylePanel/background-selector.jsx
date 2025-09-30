import { cn } from '../../../../shared/utils'
import { TbBackground } from "react-icons/tb";
import { useSetAtom, useAtomValue } from 'jotai';
import { setbackgroundImageAtom, getbackgroundImageAtom } from '../../../../store/screenshot';
import { MdOutlineRemoveCircleOutline as RemoveIcon } from "react-icons/md";

const BackgroundSelector = ({ backgrounds, selected, setSelected }) => {
  const setBackgroundAtom = useSetAtom(setbackgroundImageAtom)
  const backgroundImageAtom = useAtomValue(getbackgroundImageAtom)

  const handelFileChange = async (evt) => {
    const files = evt?.target?.files;
    if (!files || files.length === 0) {
      return;
    }

    const FileInputDiv = document.getElementById("background-file-input")

    const FILESIZE = 5 * 1024 * 1024

    const file = files[0];

    if (file.size > FILESIZE) {
      alert("Keep the file size less than 5 MB")
      if (FileInputDiv) {
        FileInputDiv.value = ''
      }
      setBackgroundAtom(null)
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setBackgroundAtom(dataUrl);
      };
      reader.onerror = () => {
        alert("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Failed to read file shifting to electron native ");
    }
  };

  const clearFile = () => {
    const FileInputDiv = document.getElementById("background-file-input")
    setBackgroundAtom(null)
    if (FileInputDiv) {
      FileInputDiv.value = ''
    }
  }

  return (
    <div className="pb-4 no-drag">
      <label className="text-base-content block pb-4 no-drag text-sm">Background</label>
      <div className="grid grid-cols-5 gap-2 no-drag pb-4">
        {backgrounds.map((bg, idx) => (
          <div
            key={idx}
            onClick={() => { setSelected({ backgroundcolor: bg.value }) }}
            className={cn("cursor-pointer", selected === bg.value && "rounded-md ring-2 ring-base-content")}
          >
            <div
              style={{ background: bg.value }}
              className={cn("h-12 rounded-md")}
            >
              {bg.value === "transparent" && (<TbBackground size={50} className='border border-base-content/40 rounded-md' />)}
            </div>
          </div>
        ))}
      </div>

      <fieldset className="fieldset mt-2">
        <legend className="fieldset-legend text-sm">Pick a Background Image</legend>
        <div className='flex flex-row gap-1'>
          <input id='background-file-input' type="file" className="file-input" accept='image/*' onChange={handelFileChange} />
          <button className={cn("btn btn-square", backgroundImageAtom === null ? "btn-disabled" : "")} onClick={clearFile} >
            <RemoveIcon />
          </button>
        </div>
        <p className='label'> Keep the file-Size less than 5mb </p>
      </fieldset>
    </div>
  )
}

export default BackgroundSelector
