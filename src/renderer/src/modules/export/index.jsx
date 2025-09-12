import { useRef, useState, useEffect } from "react";
import {
  LuSettings as Setting,
  LuPlay as Start,
  LuSquare as Stop,
  LuFileVideo as FileVideo,
  LuCheck as Check
} from "react-icons/lu";
import { LuX as X } from "react-icons/lu";
import { TbProgressBolt as Bolt } from "react-icons/tb";
import useModalFocus from "./hooks/use-modal-focus";

export default function ExportModal({ onClose }) {
  const modalRef = useRef(null);
  useModalFocus(modalRef);

  const settings = {
    Format: "MP4",
    Quality: "High",
    Resolution: "1920x1080",
  };

  const [frames, setFrames] = useState({
    currentFrame: 0,
    totalFrames: 2234,
  });
  const [exportStatus, setExportStatus] = useState("idle"); // "idle", "exporting", "completed"

  const progressPercentage = (frames.currentFrame / frames.totalFrames) * 100;

  useEffect(() => {
    let interval;
    if (exportStatus === "exporting" && frames.currentFrame < frames.totalFrames) {
      interval = setInterval(() => {
        setFrames((prev) => {
          const nextFrame = prev.currentFrame + 10; // Increment frames
          if (nextFrame >= prev.totalFrames) {
            setExportStatus("completed");
            return { ...prev, currentFrame: prev.totalFrames };
          }
          return { ...prev, currentFrame: nextFrame };
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [exportStatus, frames.currentFrame, frames.totalFrames]);

  const handleStartExport = () => {
    setExportStatus("exporting");
    setFrames((prev) => ({ ...prev, currentFrame: 1 }));
  };

  const handleStopExport = () => {
    setExportStatus("idle");
    setFrames((prev) => ({ ...prev, currentFrame: 0 }));
  };

  return (
    <div className="fixed inset-0 bg-base-100/50 z-50 backdrop-blur-md font-sans">
      <div className="flex justify-center items-center h-full">
        <div
          ref={modalRef}
          className="rounded-box h-fit w-2/3 max-w-5xl relative bg-base-300 border border-base-content/20 p-6 shadow-lg"
        >
          <span className="font-bold text-sm absolute left-0 top-1 flex justify-center w-full text-base-content/50 py-0.5 gap-1 border-b border-base-content/10">
            <FileVideo className="size-4" />
            <span> Export </span>
          </span>

          {/* SETTINGS */}
          <div className="py-6">
            <div className="font-semibold inline-flex justify-center items-center text-base-content gap-1 pb-2">
              <Setting className="size-4 text-base-content/70" />
              Export Settings
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
              {Object.entries(settings).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-base-200 rounded-md shadow-md shadow-base-100/30 border border-base-content/10"
                >
                  <div className="text-[11px] uppercase tracking-wide text-base-content/60 font-medium pb-0.5">
                    {key}
                  </div>
                  <div className="text-sm text-base-content font-semibold">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROGRESS */}
          {exportStatus !== 'idle' &&
            <div className="mb-4">
              <div className="flex justify-between items-center pb-1">
                <div className="font-semibold inline-flex justify-center items-center text-base-content gap-1">
                  <Bolt className="size-5 text-base-content/70" />
                  Progress
                </div>
                <span className="text-xs text-base-content/60">
                  {frames.currentFrame} / {frames.totalFrames} Frames
                </span>
              </div>

              <progress
                className="progress progress-secondary w-full"
                value={frames.currentFrame}
                max={frames.totalFrames}
              />

              <div className="py-2 text-center">
                <span className="text-sm font-medium text-primary/70">
                  {progressPercentage.toFixed(1)}% Complete
                </span>
              </div>

              <div className="text-center pb-4">
                {exportStatus === "completed" ? (
                  <div className="text-success font-medium inline-flex items-center gap-1">
                    <Check size={20} />
                    Export completed successfully!
                  </div>
                ) : exportStatus === "exporting" ? (
                  <div className="text-base-content/80 font-medium">
                    Exporting your video...
                  </div>
                ) : (
                  <div className="text-base-content/80">
                    Ready to export
                  </div>
                )}
              </div>
            </div>
          }

          {/* BUTTONS */}
          <div className="flex flex-col items-center gap-2">
            {exportStatus === "idle" || exportStatus === "completed" ? (
              <div className="flex gap-3">
                <button
                  className="btn bg-primary/80 hover:bg-primary text-primary-content w-40 inline-flex items-center gap-2"
                  onClick={handleStartExport}
                >
                  <Start />
                  Start Exporting
                </button>
                <button
                  className="bg-base-200 border rounded-field border-base-content/15 w-40 inline-flex justify-center cursor-pointer items-center gap-2 hover:text-base-content/90 text-base-content/70 transition-all ease-linear"
                  onClick={onClose}
                >
                  <X />
                  Close
                </button>
              </div>
            ) : (
              <button
                className="btn w-40 inline-flex items-center gap-2"
                onClick={handleStopExport}
              >
                <Stop />
                Stop Exporting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
