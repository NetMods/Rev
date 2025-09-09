// this file is for react based download scheme currenlty not in use shifted to IPC based downlaoding


import log from "electron-log/renderer"


export const getDataUrl = (stage, displayDims, padding) => {
  const exportDims = {
    x: displayDims.x - padding,
    y: displayDims.y - padding,
    width: displayDims.width + padding * 2,
    height: displayDims.height + padding * 2,
  };
  const dataUrl = stage.toDataURL({
    ...exportDims,
    pixelRatio: 2,
    mimeType: "image/png",
    quality: 1,
  });
  return dataUrl
}


export const downloadDataUrl = (dataUrl, filename = "screenshot.png") => {
  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;

  // Append to the DOM, trigger the click, and then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


function dataURLToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}


export const copyDataUrl = async (dataUrl) => {
  const blob = dataURLToBlob(dataUrl)

  log.info("Blob created:", blob.type, blob.size);

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
  } catch (err) {
    log.warn("failed to copy", err)
    return {
      status: "failed"
    }
  }

  return {
    status: "done"
  }
}
