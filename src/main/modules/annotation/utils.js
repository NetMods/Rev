export const isValidWindow = (window) => {
  return window && !window.isDestroyed();
};
