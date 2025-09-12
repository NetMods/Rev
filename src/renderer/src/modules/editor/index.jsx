import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import log from 'electron-log/renderer';
import { Editor } from './components/editor';
import { TopBar } from '../../shared/ui/topbar';
import { createPortal } from "react-dom";
import Export from '../export';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const projectData = await window.api.project.get(id);
        if (!projectData) {
          throw new Error('Failed to load project data');
        }
        setData(projectData);
      } catch (error) {
        log.error('Error loading project:', error);
      }
    })();
  }, [id]);

  const openExportModal = () => setShowExportModal(true)

  return (
    <div className="p-2 pt-0 font-sans bg-base-300 text-base-content h-screen overflow-hidden flex flex-col">
      <TopBar title={id} />

      <div className="flex-1 relative">
        {data ? (
          <Editor data={data} onExportModalOpen={openExportModal} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm opacity-60">Loading…</div>
        )}
      </div>


      {showExportModal && createPortal(
        <Export
          onClose={() => setShowExportModal(false)}
          videoPath={data.videoPath}
          webcamPath={data.webcamPath}
          effects={data.effects}
        />,
        document.body
      )}
    </div>
  );
}
