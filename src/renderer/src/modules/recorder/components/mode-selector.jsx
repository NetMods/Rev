import { RxEnterFullScreen as Fullscreen } from "react-icons/rx";
import { IoArrowBack as BackIcon } from 'react-icons/io5';
import { TbScreenshot as RecordingArea } from 'react-icons/tb';
import dslrSound from '../../../assets/dslr.wav';

const screenshotSound = new Audio(dslrSound);
screenshotSound.volume = 0.05;

export function ModeSelector({ onBack, type, devices }) {
  const handleFullScreen = async () => {
    try {
      const id = devices?.videoDevices.find(device => device.name.toLowerCase().includes("capture screen"))?.id || 1;
      await window.api.screenshot.create({ deviceIndex: id });
      try { screenshotSound.play(); } catch { /* ignore */ }
    } catch (err) {
      console.error('Failed to create fullscreen screenshot:', err);
    } finally {
      onBack();
    }
  };

  const handleArea = async () => {
    try {
      await window.api.screenshot.openAreaSelection();
      try { screenshotSound.play(); } catch { /* ignore */ }
    } catch (err) {
      console.error('Failed to open area selection:', err);
    } finally {
      onBack();
    }
  };

  return (
    <div className="w-full">
      <div className='fixed flex gap-1 py-1 px-1 bg-base-100 w-full'>
        <button
          className="bg-base-100 p-1 rounded-md hover:bg-base-300 cursor-pointer"
          onClick={onBack}
        >
          <BackIcon size={16} />
        </button>
        <h2 className="text-md font-semibold text-base-content drag">
          Select {type} Mode
        </h2>
      </div>

      <div className="flex flex-col justify-center items-center max-w-screen gap-2 px-2 pt-8 pb-4 no-drag h-screen overflow-auto noscrollbar">
        <button
          className={`w-full p-2 pb-1 shrink-0 cursor-pointer rounded-md transition-all duration-100 overflow-hidden bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content active:scale-95`}
          onClick={handleFullScreen}
        >
          <span className="inline-flex items-center justify-start whitespace-nowrap ">
            <span> <Fullscreen size={18} className="shrink-0" /></span>
            <span className="pl-2 text-left pr-5">Full Screen</span>
          </span>
        </button>

        <button
          className={`w-full p-2 pb-1 shrink-0 cursor-pointer rounded-md transition-all duration-100 overflow-hidden bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content active:scale-95`}
          onClick={handleArea}
        >
          <span className="inline-flex items-center justify-start whitespace-nowrap ">
            <span> <RecordingArea size={20} className="shrink-0" /></span>
            <span className="pl-2 text-left pr-5">Select An Area</span>
          </span>
        </button>
      </div>
    </div>
  )
}
