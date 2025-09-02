import { useRef, useEffect } from "react"

export default function Page() {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const getImageDimensions = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    const imgAspect = image.width / image.height;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      offsetY = 0;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    return { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight };
  };

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (!canvas || !ctx || !image) return;

    const { x, y, width, height } = getImageDimensions();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, x, y, width, height);
  };

  const createImage = (url) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      imageRef.current = img;
      drawImage();
    };
  };

  const onResize = () => {
    setupCanvas();
    drawImage();
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    /* High DPI / crispness */
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  useEffect(() => {
    setupCanvas();
    window.api.screenshot.show((data) => {
      // createImage(data);
      createImage("https://placewaifu.com/image");
    })

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", drawImage);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <canvas ref={canvasRef} className="bg-background"></canvas>
    </div>
  )
}
