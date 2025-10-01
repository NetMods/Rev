import { useRef, useEffect } from "react";
import { VideoPreview } from "../lib/video-preview";
import { useVideoEditor } from "./use-video-editor";
import { useAtomValue } from "jotai";
import { projectAtom } from "../../../store/editor";

export function useVideoPreview() {
  const canvasRef = useRef(null);
  const videoPreview = useRef(null)

  const project = useAtomValue(projectAtom)
  const { effects } = project.data

  const {
    videoPath,
    webcamPath,
    handleTimeUpdate,
    handlePreviewState,
    setEffects,
    setVideoPreviewInstance
  } = useVideoEditor()

  useEffect(() => {
    if (canvasRef.current) {
      videoPreview.current = new VideoPreview();

      videoPreview.current.init(
        canvasRef.current,
        videoPath,
        webcamPath,
        effects,
        handleTimeUpdate,
        handlePreviewState
      );

      setVideoPreviewInstance(videoPreview.current)
      setEffects(effects)
    }

    return () => videoPreview.current.destroy()
  }, []);

  return { canvasRef };
}
