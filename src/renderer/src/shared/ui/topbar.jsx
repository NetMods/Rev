import { LuX as Close, LuMinus as Minimize, LuSquare as Maximize } from "react-icons/lu";
import { HiOutlineSquare2Stack as Stack } from "react-icons/hi2";
import { getOS } from '../utils';
import log from 'electron-log/renderer';
import { useState } from "react";

function NormalControls({ handleMaximize, isMaximized }) {
  return (
    <div className="ml-auto no-drag flex items-center">
      <button
        aria-label="Minimize"
        title="Minimize"
        onClick={() => window.api.core.minimizeWindow()}
        className="size-7 flex items-center justify-center rounded-sm hover:bg-base-100 active:bg-base-300 transition-colors"
      >
        <Minimize size={17} />
      </button>

      <button
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        title={isMaximized ? 'Restore' : 'Maximize'}
        onClick={handleMaximize}
        className="size-7 flex items-center justify-center rounded-sm hover:bg-base-100 active:bg-base-300 transition-colors"
      >
        {isMaximized ? <Stack size={15} /> : <Maximize size={11} />}
      </button>

      <button
        aria-label="Close"
        title="Close"
        onClick={() => window.api.core.closeWindow()}
        className="size-7 flex items-center justify-center rounded-sm hover:bg-red-700 hover:text-white active:bg-red-600 transition-colors"
      >
        <Close size={15} />
      </button>
    </div>
  )
}

function MacosControls({ handleMaximize, isMaximized }) {
  return (
    <div
      style={{ WebkitAppRegion: "no-drag" }}
      className="flex items-center gap-2 ml-3"
    >
      <button
        aria-label={isMaximized ? "Restore" : "Maximize"}
        title={isMaximized ? "Restore" : "Maximize"}
        onClick={handleMaximize}
        className="relative size-3 rounded-full bg-[#21c844] group hover:bg-green-600 flex items-center justify-center"
      >
        <Maximize className="absolute size-2 text-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out" />
      </button>

      <button
        aria-label="Minimize"
        title="Minimize"
        onClick={() => window.api.core.minimizeWindow()}
        className="relative size-3 rounded-full bg-[#f8c024] group hover:bg-yellow-500 flex items-center justify-center"
      >
        <Minimize className="absolute size-2.5 text-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out" />
      </button>


      <button
        aria-label="Close"
        title="Close"
        onClick={() => window.api.core.closeWindow()}
        className="relative size-3 rounded-full bg-[#ff5c5c] group hover:bg-red-600 flex items-center justify-center"
      >
        <Close className="absolute size-2.5 text-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out" />
      </button>
    </div>
  );
}

export function TopBar({ title }) {
  const [isMaximized, setIsMaximized] = useState(true);
  const os = getOS()

  const handleMaximize = () => {
    try {
      window.api.core.toggleMaximizeWindow();
      setIsMaximized((s) => !s);
    } catch (error) {
      log.error('maximizeWindow error', error);
    }
  };

  return (
    <div
      className="w-full drag h-7 flex items-center bg-base-300 border-b border-base-200 place-content-end shadow-sm select-none relative"
      onDoubleClick={handleMaximize}
    >
      {/* Center Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="text-sm font-semibold tracking-wide opacity-80">
          {title ?? 'Untitled Project'}
        </div>
      </div>

      {os === "mac" ? (
        <MacosControls
          handleMaximize={handleMaximize}
          isMaximized={isMaximized}
        />
      ) : (
        <NormalControls
          handleMaximize={handleMaximize}
          isMaximized={isMaximized}
        />
      )}
    </div>
  );
}
