import { useEffect } from "react";

const createEffectDiv = (width, xShift, effect, onDelete) => {
  const effectDiv = document.createElement("div");
  effectDiv.style.width = `${width}px`;
  effectDiv.style.transform = `translateX(${xShift}px)`;
  effectDiv.className = "rounded absolute top-0 h-full border-1";

  const inner = document.createElement("div");
  inner.className = "flex size-full rounded items-center justify-center grain-overlay";
  inner.textContent = effect.type.slice(0, 1).toUpperCase();

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.className = "absolute top-1 right-1 text-xs";
  deleteBtn.onclick = () => onDelete(effect.id);

  inner.appendChild(deleteBtn);
  effectDiv.appendChild(inner);
  return effectDiv;
};

export const useTimelineEffects = (effects, effectsRowRef, pixelsPerSecond, onEffectsChange) => {
  useEffect(() => {
    const effectsRow = effectsRowRef.current;
    if (!effectsRow) return;

    // Clear old effects
    effectsRow.innerHTML = "";

    effects.forEach((effect) => {
      const { startTime, endTime, id } = effect;

      const duration = (endTime - startTime) || 0;
      const xShift = startTime * pixelsPerSecond;
      const width = duration * pixelsPerSecond;

      if (width <= 0) return;

      const effectDiv = createEffectDiv(width, xShift, effect, () => {
        const updatedEffects = effects.filter((e) => e.id !== id);
        onEffectsChange(updatedEffects);
      });
      effectsRow.appendChild(effectDiv);
    });
  }, [effects, pixelsPerSecond, effectsRowRef, onEffectsChange]);
};
