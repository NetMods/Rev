import { IoClose as Close } from 'react-icons/io5';
import { useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import log from 'electron-log/renderer';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [videoSrc, setVideoSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProject(projectId) {
      try {
        const projectData = await window.api.project.get(projectId);
        if (!projectData) {
          log.error('Failed to load project data');
          setError('Project not found');
          return;
        }

        const { videoPath, mouseClickRecords, timestamp } = projectData;
        setVideoSrc(videoPath);
        log.info('Mouse Click Records:', mouseClickRecords);
        log.info('Timestamp:', timestamp);
      } catch (error) {
        log.error('Error loading project:', error);
        setError('Failed to load project');
      }
    }

    if (id) {
      loadProject(id);
    }
  }, [id]);

  return (
    <div className="p-2 font-sans bg-black/90 text-white/70 border-1 border-white/30 rounded h-screen relative">
      <span>project id: {id}</span>
      <div className="absolute right-2 top-2">
        <button
          className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800"
          onClick={() => window.api.core.closeWindow()}
        >
          <Close size={23} />
        </button>
      </div>
      <div className="mt-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : videoSrc ? (
          <video
            src={videoSrc}
            controls
            autoPlay
            style={{ maxWidth: '100%' }}
            onError={(e) => {
              log.error('Video error:', e.target.error);
              setError('Failed to load video');
            }}
          />
        ) : (
          <p>Loading video...</p>
        )}
      </div>
    </div>
  );
}
