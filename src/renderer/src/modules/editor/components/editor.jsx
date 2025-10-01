import Preview from "./preview"
import { Controls } from "./controls";
import Timeline from "./timeline";

export const Editor = ({ onExportModalOpen }) => {

  return (
    <div className='flex flex-col h-full gap-1 no-drag'>
      <Preview className="h-2/3 flex justify-center" />

      <Controls
        className="h-8 flex justify-between items-center"
        onExportModalOpen={onExportModalOpen}
      />

      <Timeline className="h-1/3 flex justify-center" />
    </div>
  )
}
