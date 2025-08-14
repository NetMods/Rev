import { IoClose as Close } from 'react-icons/io5';
import { useSearchParams } from 'react-router';
import { useState, useEffect } from 'react';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const buffer = await window.api.getProjectVideoBlob(id);
        if (buffer) {
          const blob = new Blob([buffer], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    }
    fetchVideo();
  }, [id]);

  return (
    <div className="p-2 font-sans bg-black/90 text-white/70 h-screen relative">
      {videoUrl ? (
        <video
          controls
          src={videoUrl}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      ) : (
        <span>Loading video for project {id}...</span>
      )}
      <span>Video of project id: ${id}</span>
      <div className='absolute right-2 top-2'>
        <button className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800">
          <Close onClick={() => window.api.closeWindow()} size={23} />
        </button>
      </div>
    </div>
  );
}
