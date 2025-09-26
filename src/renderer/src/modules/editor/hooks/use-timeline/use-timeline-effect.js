import { useEffect } from "react";

const createEffectDiv = (width, xShift, effect, duration, onDelete) => {
  const effectDiv = document.createElement("div");
  effectDiv.style.width = `${width}px`;
  effectDiv.style.transform = `translateX(${xShift}px)`;
  effectDiv.className =
    "rounded absolute top-0 h-full border-1 group border-base-content/30";

  const inner = document.createElement("div");
  inner.className =
    "flex text-base-content/70 size-full rounded items-center justify-center grain-overlay overflow-hidden";
  inner.textContent = `${String(duration).split('.')[0]}s`

  const topBar = document.createElement("div");
  topBar.className =
    "absolute top-0 left-0 flex justify-between items-center bg-base-200 w-full rounded-t overflow-hidden";

  const label = document.createElement("span");
  label.className = "text-xs text-base-content pl-2 capitalize";
  label.innerHTML = `
  <span class="flex justify-center items-center gap-1">
    ${effect.type}
  </span>
  `

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
         class="w-3 h-3"
         fill="none"
         viewBox="0 0 24 24"
         stroke="currentColor"
         stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  deleteBtn.className =
    "text-xs p-1 bg-base-content/20 rounded-bl cursor-pointer hover:bg-base-content/30 group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 pointer-events-none ";
  deleteBtn.onclick = () => onDelete(effect.id);

  topBar.appendChild(label);
  topBar.appendChild(deleteBtn);

  const leftBar = document.createElement("div");
  leftBar.className =
    "absolute left-1 top-1/2 h-1/2 w-px -translate-y-1/2 bg-base-content/70 cursor-ew-resize z-50 rounded hidden";

  const rightBar = document.createElement("div");
  rightBar.className =
    "absolute right-1 top-1/2 h-1/2 w-px -translate-y-1/2 bg-base-content/70 cursor-ew-resize z-50 rounded hidden";

  effectDiv.appendChild(topBar);
  effectDiv.appendChild(inner);
  effectDiv.appendChild(leftBar);
  effectDiv.appendChild(rightBar);

  return effectDiv;
};

export const useTimelineEffects = (effects, effectsRowRef, pixelsPerSecond, onEffectsChange) => {
  useEffect(() => {
    const effectsRow = effectsRowRef.current;
    if (!effectsRow) return;

    effectsRow.innerHTML = "";

    effects.forEach((effect) => {
      const { startTime, endTime, id } = effect;

      const duration = (endTime - startTime) || 0;
      const xShift = startTime * pixelsPerSecond;
      const width = duration * pixelsPerSecond;

      if (width <= 0) return;

      const effectDiv = createEffectDiv(width, xShift, effect, duration, () => {
        const updatedEffects = effects.filter((e) => e.id !== id);
        onEffectsChange(updatedEffects);
      });
      effectsRow.appendChild(effectDiv);
    });
  }, [effects, pixelsPerSecond, effectsRowRef, onEffectsChange]);
};
