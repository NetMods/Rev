export class EffectsManager {
  constructor() {
    this.effects = [];
  }

  init(effects) {
    this.effects = effects;
  }

  getActiveEffectsAtTime(currentTime) {
    return this.effects.filter(effect => {
      const start = parseFloat(effect.startTime);
      const end = parseFloat(effect.endTime);
      return currentTime >= start && currentTime <= end;
    });
  }

  applyEffects(ctx, video, currentTime) {
    if (!video || !ctx) return;

    const activeEffects = this.getActiveEffectsAtTime(currentTime);

    activeEffects.forEach(effect => {
      if (effect.type === 'zoom') {
        this.applyZoomEffect(effect, currentTime);
      }

      if (effect.type === 'pan') {
        this.applyPanEffect(effect, currentTime);
      }
    });
  }

  applyZoomEffect(effect, currentTime) {
    console.log(effect, currentTime)
  }

  applyPanEffect(effect, currentTime) {
    console.log(effect, currentTime)
  }

  updateEffects(newEffects) {
    this.effects = newEffects || [];
  }

  destroy() {
    this.effects = []
  }
}



{/*
export class EffectsManager {
  constructor() {
    this.effects = [];
    this.videoZoomLevel = 1;
    this.lastCenter = null;
    this.lastFrameTime = null;
  }

  getActiveEffectsAtTime(currentTime) {
    return this.effects.filter(effect => {
      const start = parseFloat(effect.startTime);
      const end = parseFloat(effect.endTime);
      return currentTime >= start && currentTime <= end;
    });
  }

  applyEffects(ctx, video, currentTime) {
    if (!video || !ctx) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    const activeEffects = this.getActiveEffectsAtTime(currentTime);
    let hasZoom = false;
    let hasPan = false;

    activeEffects.forEach(effect => {
      if (effect.type === 'zoom') {
        this.applyZoomEffect(effect, currentTime);
        hasZoom = true;
      }

      if (effect.type === 'pan') {
        this.applyPanEffect(effect, currentTime);
        hasPan = true;
      }
    });

    if (!hasZoom && !hasPan && this.videoZoomLevel > 1) {
      const zoomOutRate = 1;
      const currentFrameTime = performance.now();
      if (this.lastFrameTime !== null) {
        const deltaTime = (currentFrameTime - this.lastFrameTime) / 1000;
        this.videoZoomLevel = Math.max(1, this.videoZoomLevel - zoomOutRate * deltaTime);
      }
      this.lastFrameTime = currentFrameTime;
    } else if (hasZoom || hasPan) {
      this.lastFrameTime = performance.now();
    }

    const s = this.videoZoomLevel;
    if (s > 1) {
      let cx = this.lastCenter ? this.lastCenter.x : w / 2;
      let cy = this.lastCenter ? this.lastCenter.y : h / 2;

      if (!hasZoom && !hasPan) {
        const half_w = w / (2 * s);
        const half_h = h / (2 * s);
        cx = Math.max(half_w, Math.min(cx, w - half_w));
        cy = Math.max(half_h, Math.min(cy, h - half_h));
        this.lastCenter = { x: cx, y: cy };
      }

      ctx.translate(w / 2, h / 2);
      ctx.scale(s, s);
      ctx.translate(-cx, -cy);
    }
  }

  applyZoomEffect(effect, currentTime) {
    if (!effect.center || typeof effect.level !== 'number') return;

    const { x, y } = effect.center;
    const start = parseFloat(effect.startTime);
    const end = parseFloat(effect.endTime);
    const progress = Math.min(1, Math.max(0,
      (currentTime - start) / (end - start)
    ));

    this.videoZoomLevel = 1 + (effect.level - 1) * progress;

    const w = effect.videoWidth || 1920; // Default width if not provided
    const h = effect.videoHeight || 1080; // Default height if not provided
    let cx = x;
    let cy = y;
    const half_w = w / (2 * this.videoZoomLevel);
    const half_h = h / (2 * this.videoZoomLevel);
    cx = Math.max(half_w, Math.min(cx, w - half_w));
    cy = Math.max(half_h, Math.min(cy, h - half_h));

    this.lastCenter = { x: cx, y: cy };
  }

  applyPanEffect(effect, currentTime) {
    const w = effect.videoWidth || 1920; // Default width if not provided
    const h = effect.videoHeight || 1080; // Default height if not provided
    const s = this.videoZoomLevel;
    if (s <= 1) return;

    const path = effect.path.map(point => ({
      x: point.x,
      y: point.y,
      t: parseFloat(point.time)
    }));

    let cx, cy;
    const now = currentTime;
    const first = path[0];
    const last = path[path.length - 1];

    if (now < first.t) {
      cx = first.x;
      cy = first.y;
    } else if (now > last.t) {
      cx = last.x;
      cy = last.y;
    } else {
      let found = false;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (now >= p1.t && now <= p2.t) {
          const segDur = p2.t - p1.t;
          const prog = segDur > 0 ? (now - p1.t) / segDur : 0;
          cx = p1.x + (p2.x - p1.x) * prog;
          cy = p1.y + (p2.y - p1.y) * prog;
          found = true;
          break;
        }
      }
      if (!found) {
        cx = last.x;
        cy = last.y;
      }
    }

    const half_w = w / (2 * s);
    const half_h = h / (2 * s);
    cx = Math.max(half_w, Math.min(cx, w - half_w));
    cy = Math.max(half_h, Math.min(cy, h - half_h));

    this.lastCenter = { x: cx, y: cy };
  }

  updateEffects(newEffects) {
    this.effects = newEffects || [];
  }
}
    */}
