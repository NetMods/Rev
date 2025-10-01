import { atom } from 'jotai';

// Base atoms
export const projectAtom = atom(null)

export const currentTimeAtom = atom(0);
export const videoDurationAtom = atom(0);
export const isPlayingAtom = atom(false);
export const isFullscreenAtom = atom(false);

export const videoPreviewInstanceAtom = atom(null);

export const zoomLevelAtom = atom(6);

export const effectsAtom = atom([]);

// Deprived atoms
export const increaseZoomAtom = atom(
  null,
  (get, set) => {
    const current = get(zoomLevelAtom);
    set(zoomLevelAtom, Math.min(8, current + 1));
  }
);

export const decreaseZoomAtom = atom(
  null,
  (get, set) => {
    const current = get(zoomLevelAtom);
    set(zoomLevelAtom, Math.max(0, current - 1));
  }
);

export const updateEffectsAtom = atom(
  null,
  async (get, set, { newEffects }) => {
    set(effectsAtom, newEffects);
    const project = get(projectAtom)
    const preview = get(videoPreviewInstanceAtom);
    preview?.updateEffects(newEffects);
    await window.api.project.updateEffects(project.id, newEffects);
  }
);
