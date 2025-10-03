import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import log from 'electron-log/renderer';
import { Editor } from './components/editor';
import { TopBar } from '../../shared/ui/topbar';
import { createPortal } from "react-dom";
import Export from '../export';
import { projectAtom } from '../../store/editor';
import { useAtom } from 'jotai';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [project, setProject] = useAtom(projectAtom);
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const projectData = await window.api.project.get(id);
        if (!projectData) {
          throw new Error('Failed to load project data');
        }
        setProject({ id, data: projectData });
      } catch (error) {
        log.error('Error loading project:', error);
        window.api.core.showError({ error: "Error while loading project", message: error.message })
        window.api.core.closeWindow()
      }
    })();
  }, [id]);

  return (
    <div className="p-2 pt-0 font-sans bg-base-300 text-base-content h-screen overflow-hidden flex flex-col">
      <TopBar title={id} />

      <div className="flex-1 relative">
        {project ? (
          <Editor onExportModalOpen={() => setShowExportModal(true)} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm opacity-60">Loading…</div>
        )}
      </div>

      {showExportModal && createPortal(
        <Export onClose={() => setShowExportModal(false)} />,
        document.body
      )}
    </div>
  );
}
