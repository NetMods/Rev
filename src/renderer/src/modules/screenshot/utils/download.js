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
