import { useRef } from "react";
import { LiaFileVideoSolid as ClipIcon } from "react-icons/lia";
import { useTimeline } from "../hooks/use-timeline/index";
import { cn } from "../../../shared/utils";

const Timeline = ({ className, data }) => {
  const { videoDuration, preview, currentTime, setCurrentTime, zoomLevel, effects } = data;
  const timelineContainer = useRef(null);
  const playheadRef = useRef(null);
  const effectsRowRef = useRef(null);

  const {
    ticks,
    videoWidth = 0,
    containerWidth = 0,
    handlePlayheadMouseDown,
    handleTimelineClick,
  } = useTimeline({
    zoomLevel,
    timelineContainer,
    videoDuration,
    preview,
    currentTime,
    setCurrentTime,
    playheadRef,
    effects,
    effectsRowRef
  });

  return (
    <div className={cn("bg-card rounded border", className)}>
      <div
        className="relative flex flex-col gap-3 size-full px-5 pb-2 overflow-x-auto scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-500"
        ref={timelineContainer}
        onClick={handleTimelineClick}
      >
        {/* Play head */}
        <div
          ref={playheadRef}
          className="absolute bottom-0 top-4 z-50 w-px rounded-full bg-foreground cursor-ew-resize"
          style={{
            left: "20px",
            willChange: "transform",
            transform: "translate3d(0px,0,0)",
            backfaceVisibility: "hidden",
          }}
          onMouseDown={handlePlayheadMouseDown}
        >
          <div className="absolute -top-1 -left-[0.35rem] w-3 h-3 rounded-full border-2 border-background bg-foreground cursor-ew-resize" />
        </div>

        {/*Time stamps*/}
        <div className="relative h-8 cursor-grab">
          {ticks.map((tick, idx) => (
            <div key={idx}>
              <div
                className="absolute top-0 bg-foreground/30 w-px"
                style={{ left: `${tick.x}px`, height: `8px` }}
              />
              {tick.label && (
                <div
                  className="pointer-events-none absolute select-none font-mono text-[0.7rem] text-foreground/30"
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
          className="w-full h-1/2 bg-muted rounded relative flex overflow-hidden"
          style={{ width: `${videoWidth > containerWidth ? videoWidth : containerWidth}px` }}
        >
          <div style={{ width: `${videoWidth}px` }} className="rounded">
            <div className="flex size-full rounded items-center justify-center bg-[#458588] grain-overlay">
              <ClipIcon />
              <span className="pl-1"> Clip </span>
            </div>
          </div>
        </div>

        {/*Effects row*/}
        <div
          ref={effectsRowRef}
          className="w-full h-1/2 bg-muted rounded relative flex overflow-hidden"
          style={{ width: `${videoWidth > containerWidth ? videoWidth : containerWidth}px` }}
        ></div>
      </div>
    </div>
  );
};

export default Timeline;
