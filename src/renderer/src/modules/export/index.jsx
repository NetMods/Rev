import { useRef, useState, useEffect } from "react";
import { LuX as X } from "react-icons/lu";
import { TbProgressBolt as Bolt } from "react-icons/tb";
import {
  LuSettings as Setting,
  LuPlay as Start,
  LuSquare as Stop,
  LuFileVideo as FileVideo,
  LuCheck as Check
} from "react-icons/lu";
import useModalFocus from "./hooks/use-modal-focus";
import { VideoExporter } from "./lib/video-export";
import Select from "../../shared/ui/select";
import { useAtomValue } from "jotai";
import { projectAtom } from "../../store/editor";

const settingOptions = {
  Format: [
    { label: "MP4", value: "MP4" },
    { label: "WEBM", value: "WEBM" },
    { label: "MOV", value: "MOV" },
  ],
  Fps: [
    { label: "24 FPS", value: 24 },
    { label: "30 FPS (Smooth)", value: 30 },
    { label: "60 FPS (Smoother)", value: 60 },
  ],
  Resolution: [
    { label: "4K (3840x2160)", value: "3840x2160" },
    { label: "1080p (1920x1080)", value: "1920x1080" },
    { label: "720p (1280x720)", value: "1280x720" },
    { label: "Highest", value: "hr" },
  ],
};

export default function ExportModal({ onClose }) {
  const { id, data } = useAtomValue(projectAtom)
  const { videoPath, webcamPath, audioPath, effects } = data

  const modalRef = useRef(null);
  useModalFocus(modalRef);

  const [exportSettings, setExportSettings] = useState({
    Format: "MP4",
    Fps: 30,
    Resolution: "1920x1080",
  });

  const [frames, setFrames] = useState({
    currentFrame: 0,
    totalFrames: 0,
  });
  const [exportStatus, setExportStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Ready to export");
  const [exportInfo, setExportInfo] = useState({ hasAudio: false, hasMuxedAudio: false });
  const exporterRef = useRef(null);

  useEffect(() => {
    const exporter = new VideoExporter();
    exporterRef.current = exporter;
    if (!exporter) return

    exporter.init(videoPath, webcamPath, audioPath, effects, id)

    exporter.onExportProgress = ({ current, total }) => {
      setFrames({ currentFrame: current, totalFrames: total });
    };

    exporter.onExportComplete = (result) => {
      setExportStatus(prev => (prev !== "cancelled" ? "completed" : prev));
      if (result) {
        setExportInfo({
          hasAudio: result.hasAudio || false,
          hasMuxedAudio: result.hasMuxedAudio || false
        });
      }
    };
    exporter.onExportError = () => setExportStatus("error");

    // New status message handler
    exporter.onStatusMessage = (message) => {
      setStatusMessage(message);
    };

    return () => {
      exporter.destroy();
    };
  }, []);

  const handleSettingChange = (settingKey, value) => {
    setExportSettings(prevSettings => ({
      ...prevSettings,
      [settingKey]: value,
    }));
  };

  const handleStartExport = async () => {
    if (!exporterRef.current) return;
    try {
      setExportStatus("exporting");
      const [width, height] = exportSettings.Resolution.split('x').map(Number);

      await exporterRef.current.startExport({
        format: exportSettings.Format.toLowerCase(),
        fps: Number(exportSettings.Fps),
        width: width,
        height: height,
        quality: 0.95,
      });
    } catch {
      setExportStatus("error");
    }
  };

  const handleStopExport = () => {
    exporterRef.current?.cancelExport();
    setExportStatus("cancelled");
    setFrames({ currentFrame: 0, totalFrames: frames.totalFrames });
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

          <div className="py-6">
            <div className="font-semibold inline-flex justify-center items-center text-base-content gap-1 pb-2">
              <Setting className="size-4 text-base-content/70" />
              Export Settings
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
              <Select
                label="Format"
                options={settingOptions.Format}
                value={exportSettings.Format}
                onChange={(newValue) => handleSettingChange('Format', newValue)}
                isDisabled={true}
              />
              <Select
                label="Fps"
                options={settingOptions.Fps}
                value={exportSettings.Fps}
                onChange={(newValue) => handleSettingChange('Fps', newValue)}
                isDisabled={true}
              />
              <Select
                label="Resolution"
                options={settingOptions.Resolution}
                value={'hr'}
                onChange={(newValue) => handleSettingChange('Resolution', newValue)}
                isDisabled={true}
              />
            </div>
          </div>

          {exportStatus !== 'idle' && (
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
                  {frames.totalFrames > 0 ? ((frames.currentFrame / frames.totalFrames) * 100).toFixed(1) : 0}% Complete
                </span>
              </div>

              <div className="text-center pb-4">
                {exportStatus === "completed" ? (
                  <div className="font-medium">
                    <div className="border border-base-content/20 bg-base-200 text-base-content/60 rounded px-3 py-1 inline-flex items-center gap-1 mb-2 text-sm">
                      <Check size={20} />
                      {statusMessage}
                    </div>
                    {exportInfo.hasAudio && (
                      <div className="text-xs pt-1 text-base-content/80">
                        {exportInfo.hasMuxedAudio ?
                          "Video exported with audio track" :
                          "Video exported but audio muxing failed"
                        }
                      </div>
                    )}
                  </div>
                ) : exportStatus === "exporting" ? (
                  <div className="text-base-content/80 font-medium">
                    {statusMessage}
                  </div>
                ) : exportStatus === "cancelled" ? (
                  <div className="text-warning font-medium">
                    {statusMessage || "Export cancelled by user"}
                  </div>
                ) : exportStatus === "error" ? (
                  <div className="text-error font-medium">
                    {statusMessage || "Export failed due to an error"}
                  </div>
                ) : (
                  <div className="text-base-content/80">{statusMessage}</div>
                )}
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex flex-col items-center gap-2">
            {exportStatus !== 'exporting' ? (
              <div className="flex gap-3">
                <button
                  className="btn bg-primary/80 hover:bg-primary text-primary-content w-40 inline-flex items-center gap-2"
                  onClick={handleStartExport}
                  disabled={exportStatus === "exporting"}
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
