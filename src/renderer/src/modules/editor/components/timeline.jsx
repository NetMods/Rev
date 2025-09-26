import { TbVideo as ClipIcon } from "react-icons/tb";
import { useTimeline } from "../hooks/use-timeline/index";
import { cn } from "../../../shared/utils";

const Timeline = ({ className, data }) => {
  const { videoDuration, preview, currentTime, setCurrentTime, zoomLevel, handleEffectsChange, effects } = data;

  const {
    ticks,
    videoWidth,
    containerWidth,
    handleTimelineClick,
    timelineContainer,
    playheadRef,
    effectsRowRef
  } = useTimeline({ preview, videoDuration, currentTime, setCurrentTime, effects, handleEffectsChange, zoomLevel });

  return (
    <div className={cn("rounded border-2 border-base-content/10 bg-base-200", className)}>
      <div
        className="relative flex flex-col gap-3 size-full px-5 pb-2 overflow-x-auto noscrollbar scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-500"
        ref={timelineContainer}
        onClick={handleTimelineClick}
      >
        {/* Play head */}
        <div
          ref={playheadRef}
          className="absolute bottom-0 top-1 z-50 bg-primary w-px rounded-full cursor-ew-resize"
          style={{
            left: "20px",
            willChange: "transform",
            transform: "translate3d(0px,0,0)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="absolute -top-1 -left-[0.35rem] w-3 h-3 rounded-full bg-primary border-primary border-2 cursor-ew-resize" />
        </div>

        {/*Time stamps*/}
        <div className="relative h-8 cursor-grab">
          {ticks.map((tick, idx) => (
            <div key={idx}>
              <div
                className="absolute top-0 bg-base-content/20 w-px"
                style={{ left: `${tick.x}px`, height: `8px` }}
              />
              {tick.label && (
                <div
                  className="pointer-events-none text-base-content/50 absolute select-none font-mono text-[0.7rem]"
                  style={{ left: `${tick.x}px`, bottom: "0px", transform: "translateX(-50%)" }}
                >
                  {tick.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/*Clip row*/}
        <div
          className="w-full h-1/2 rounded relative flex overflow-hidden"
          style={{ width: `${videoWidth > containerWidth ? videoWidth : containerWidth}px` }}
        >
          <div style={{ width: `${videoWidth}px` }} className="rounded relative group">
            <div className="absolute top-0 left-0 flex gap-1 justify-center items-center bg-accent/60 w-full">
              <ClipIcon className="text-accent-content" />
              <span className="pl-1 text-accent-content text-sm"> Clip </span>
              <span className="pl-1 text-accent-content text-sm">{String(videoDuration).split('.')[0]}s</span>
            </div>

            <div className="flex size-full rounded items-center justify-center border-1 border-accent/70 bg-accent/55 grain-overlay" />

            <div className="absolute left-1 top-1/2 h-1/2 w-1 translate-y-[-50%] bg-accent-content/70 cursor-ew-resize z-50 rounded hidden group-hover:hidden" />
            <div className="absolute right-1 top-1/2 h-1/2 w-1 translate-y-[-50%] bg-accent-content/70 cursor-ew-resize z-50 rounded hidden group-hover:hidden" />
          </div>
        </div>

        {/*Effects row*/}
        <div
          ref={effectsRowRef}
          className="w-full h-1/2 rounded relative flex overflow-hidden"
          style={{ width: `${videoWidth > containerWidth ? videoWidth : containerWidth}px` }}
        ></div>
      </div>
    </div>
  );
};

export default Timeline;
