import { useAtom, useAtomValue } from "jotai";
import { currentTimeAtom, effectsAtom, isFullscreenAtom, isPlayingAtom, projectAtom, videoDurationAtom, videoPreviewInstanceAtom, zoomLevelAtom } from "../../../store/editor";

export const useVideoEditor = () => {
  const project = useAtomValue(projectAtom);

  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [videoDuration, setVideoDuration] = useAtom(videoDurationAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const zoomLevel = useAtomValue(zoomLevelAtom)

  const [videoPreviewInstance, setVideoPreviewInstance] = useAtom(videoPreviewInstanceAtom);
  const [effects, setEffects] = useAtom(effectsAtom);

  const handleTimeUpdate = (time, duration) => {
    setCurrentTime(time);
    setVideoDuration(duration);
  };

  const handlePreviewState = ({ isPlaying: p, isFullscreen: f }) => {
    setIsPlaying(p);
    setIsFullscreen(f);
  };

  return {
    id: project.id,
    videoPath: project.data?.videoPath,
    webcamPath: project.data?.webcamPath,
    effects,
    currentTime,
    videoDuration,
    isPlaying,
    isFullscreen,
    zoomLevel,
    videoPreviewInstance,
    setEffects,
    setCurrentTime,
    setVideoPreviewInstance,
    handlePreviewState,
    handleTimeUpdate,
  }
}
