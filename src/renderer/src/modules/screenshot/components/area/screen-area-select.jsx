import { useState, useRef, useEffect } from "react";
import { RxCross2 as Cross, RxCheck as Check } from "react-icons/rx";
import log from 'electron-log/renderer'

const AreaSelection = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [image, setImage] = useState(null)

  const handleDone = async () => {
    if (origin && endPos) {
      const deviceList = await window.api?.core?.getIOdevices();
      let filteredDevices = ["Video", "Screenshot"].includes(deviceList) ? deviceList.videoDevices : deviceList.audioDevices;
      const screenDevice = filteredDevices.find(device =>
        device.name.toLowerCase().includes("capture screen")
      );
      window.api?.screenshot.create({ origin: origin, rectPos: endPos, deviceIndex: screenDevice?.id });
      window.api?.core.closeWindow();
    }
  };

  useEffect(() => {
    const getImage = async () => {
      const imageData = await window.api.screenshot.getImageData()
      setImage(imageData)
    }
    getImage()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (origin && endPos) {
        const x = Math.min(origin.x, endPos.x);
        const y = Math.min(origin.y, endPos.y);
        const width = Math.abs(endPos.x - origin.x);
        const height = Math.abs(endPos.y - origin.y);

        ctx.clearRect(x, y, width, height);
        ctx.strokeStyle = 'red';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(x, y, width, height);
      }
    };

    const handleMouseDown = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setIsDrawing(true);
      setEndPos(null);
      setOrigin(pos);
      setShowButtons(false);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const pos = { x: e.clientX, y: e.clientY };
      setEndPos(pos);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      if (origin && endPos) setShowButtons(true);
    };


    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    draw();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, origin, endPos]);

  useEffect(() => {
    // const overlay = document.getElementById("screenshot-overlay")
    const handleKeyPress = (evt) => {
      if (evt.key === "Escape" || evt.keyCode === 27) {
        window.api?.core.closeWindow();
      }
    }
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }

  })

  return (
    <div id="screenshot-overlay" tabIndex={0} className="h-full w-full no-drag">
      {image && (<img
        src={image}
        alt="background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />)
      }
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      {showButtons && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 1000
          }}>
          <button onClick={() => window.api?.core.closeWindow()} className="btn btn-circle" >
            <Cross size={20} />
          </button>
          <button onClick={handleDone} className="btn btn-circle btn-accent" >
            <Check size={23} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AreaSelection;
