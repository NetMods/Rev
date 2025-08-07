import { IoClose as Close, } from 'react-icons/io5';
import { useSearchParams } from 'react-router';

export default function Page() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="p-2 font-sans bg-black/90 text-white/70 h-screen relative">
      <span>
        This is main window where you will see video of {id} and its editor
      </span>
      <div className='absolute right-2 top-2'>
        <button className="rounded cursor-pointer no-drag py-1 inline-flex justify-center hover:bg-neutral-800">
          <Close onClick={() => window.api.closeWindow()} size={23} />
        </button>
      </div>
    </div>
  )
}
