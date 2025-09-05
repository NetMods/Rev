import { useEffect, useState } from "react";
import useImage from "use-image";
import { Group, Rect, Image } from "react-konva";

const URLImage = ({
  src,
  stageWidth,
  stageHeight,
  padding = 0,
  borderRadius = 10,
  onLayout,
}) => {
  const [image] = useImage(src, "anonymous");
  const [dims, setDims] = useState(null);

  useEffect(() => {
    if (!image || !stageWidth || !stageHeight) return;

    const imgW = image.width;
    const imgH = image.height;

    // Space available for the image after padding (never negative)
    const availW = Math.max(0, stageWidth - padding * 2);
    const availH = Math.max(0, stageHeight - padding * 2);

    // Fit image (contain) inside available space
    const scale = Math.min(availW / imgW, availH / imgH);
    const newW = imgW * scale;
    const newH = imgH * scale;

    const x = (stageWidth - newW) / 2;
    const y = (stageHeight - newH) / 2;

    const next = { x, y, width: newW, height: newH };
    setDims(next);

    // Report layout metrics to parent for export
    // onLayout?.({
    //   natural: { width: imgW, height: imgH },
    //   scaled: next,
    //   padding,
    // });
  }, [image, stageWidth, stageHeight, padding, onLayout]);

  if (!image || !dims) return null;

  return (
    <Group>
      {/* Background Rect (padding box) */}
      <Rect
        x={dims.x - padding}
        y={dims.y - padding}
        width={dims.width + padding * 2}
        height={dims.height + padding * 2}
        fill="#222831"
      />

      {/* Image with rounded corners */}
      <Image
        image={image}
        x={dims.x}
        y={dims.y}
        width={dims.width}
        height={dims.height}
        cornerRadius={borderRadius}
        listening={false}
      />
    </Group>
  );
};

export default URLImage;
