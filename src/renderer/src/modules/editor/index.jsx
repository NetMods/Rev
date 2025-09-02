import { IoClose as Close } from 'react-icons/io5';
import { useSearchParams } from 'react-router';
import log from 'electron-log/renderer';
import { Editor } from './components/editor';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState(null);

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

  return (
    <div className="p-2 font-sans bg-background text-foreground/80 **:no-drag border-1 border-white/30 rounded no-drag h-screen relative">
      {data && <Editor data={data} />}
      <div className="absolute right-2 top-2">
        <button
          className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800"
          onClick={() => window.api.core.closeWindow()}
        >
          <Close size={23} />
        </button>
      </div>
    </div>
  );
}
