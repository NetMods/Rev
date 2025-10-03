import { getOS } from "../utils";

export class EffectsManager {
  constructor() {
    this.effects = [];
    this.resetDuration = 1; // seconds
    this.dpr = 1;

    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
  }

  init(effects) {
    this.effects = (effects || [])
      .filter((e) => !e?.isDeleted)
      .sort((a, b) => parseFloat(a.startTime) - parseFloat(b.startTime))

    if (getOS() !== "mac") this.dpr = window.devicePixelRatio || 1;
  }

  applyEffects(ctx, currentTime) {
    if (!ctx) return;
    const transform = this.calculateTransformAtTime(currentTime) || { scale: 1, translateX: 0, translateY: 0 };

    this.currentScale = transform.scale;
    this.currentTranslateX = transform.translateX;
    this.currentTranslateY = transform.translateY;

    // Use setTransform to avoid accumulation of translate/scale calls.
    ctx.setTransform(transform.scale, 0, 0, transform.scale, transform.translateX, transform.translateY);
  }

  calculateTransformAtTime(currentTime) {
    if (!this.effects || this.effects.length === 0) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Accumulate base transform from completed effects.
    let base = { scale: 1, translateX: 0, translateY: 0 };

    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];

      const { startTime: start, endTime: end } = effect;

      // Compute base at this effect's start (apply reset if gap from previous).
      let baseAtStart = this._applyResetIfGap(base, effect, i);

      // Before this effect starts: check for reset after previous.
      if (currentTime < start) {
        if (i > 0) {
          const prevEnd = this.effects[i - 1].endTime;
          if (currentTime >= prevEnd) {
            return this._calculateReset(base, currentTime - prevEnd);
          }
        }
        // Before first effect: identity.
        return { scale: 1, translateX: 0, translateY: 0 };
      }

      // Within this effect: interpolate.
      if (currentTime >= start && currentTime <= end) {
        return this._calculateEffectInProgress(effect, currentTime, baseAtStart);
      }

      // After this effect: advance base to its final state.
      base = this._calculateEffectInProgress(effect, end, baseAtStart);
    }

    // After all effects: apply final reset.
    const lastEnd = this.effects[this.effects.length - 1].endTime;
    return this._calculateReset(base, currentTime - lastEnd);
  }

  _applyResetIfGap(base, currentEffect, effectIndex) {
    if (effectIndex === 0) return base;

    const prevEnd = this.effects[effectIndex - 1].endTime;
    const gapDuration = currentEffect.startTime - prevEnd;
    if (gapDuration <= 0) return base;
    if (currentEffect.type === 'pan') {
      return base;
    }
    // Full reset in gap (since we're past the gap start).
    return { scale: 1, translateX: 0, translateY: 0 };
  }

  _calculateReset(base, elapsed) {
    const progress = Math.min(elapsed / this.resetDuration, 1);
    if (progress >= 1) return { scale: 1, translateX: 0, translateY: 0 };

    const eased = this.ease(progress);
    return {
      scale: base.scale + (1 - base.scale) * eased,
      translateX: base.translateX * (1 - eased),
      translateY: base.translateY * (1 - eased),
    };
  }

  _calculateEffectInProgress(effect, currentTime, initialTransform) {
    const start = parseFloat(effect.startTime);
    const end = parseFloat(effect.endTime);
    const duration = Math.max(end - start, 0);
    const rawProgress = duration > 0 ? Math.min((currentTime - start) / duration, 1) : 1;
    const eased = this.ease(rawProgress);

    const calculator = this._getEffectCalculator(effect.type);
    return calculator(effect, eased, initialTransform);
  }

  _getEffectCalculator(type) {
    const calculators = {
      zoom: this.calculateZoom.bind(this),
      pan: this.calculatePan.bind(this),
    };

    const calc = calculators[type];
    if (!calc) throw new Error(`Unsupported effect type: ${type}`);
    return calc;
  }

  calculateResetInProgress(currentTime, lastEffectEndTime, initialTransform) {
    const resetStartTime = lastEffectEndTime;
    const progress = Math.min((currentTime - resetStartTime) / this.resetDuration, 1);
    const eased = this.ease(progress);

    if (progress >= 1) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    const scale = initialTransform.scale + (1 - initialTransform.scale) * eased;
    const translateX = initialTransform.translateX + (0 - initialTransform.translateX) * eased;
    const translateY = initialTransform.translateY + (0 - initialTransform.translateY) * eased;

    return { scale, translateX, translateY };
  }

  calculateZoom(effect, easedProgress, initialTransform) {
    const { center, level } = effect;
    const targetScale = level;

    const centerX = center.x * this.dpr;
    const centerY = center.y * this.dpr;

    // target translation to keep center fixed if starting from identity.
    const targetTranslateX = centerX - targetScale * centerX;
    const targetTranslateY = centerY - targetScale * centerY;

    // Interpolate from initial state to target state
    const currentScale = initialTransform.scale + (targetScale - initialTransform.scale) * easedProgress;
    const currentTranslateX = initialTransform.translateX + (targetTranslateX - initialTransform.translateX) * easedProgress;
    const currentTranslateY = initialTransform.translateY + (targetTranslateY - initialTransform.translateY) * easedProgress;

    return {
      scale: currentScale,
      translateX: currentTranslateX,
      translateY: currentTranslateY,
    };
  }

  calculatePan(effect, easedProgress, initialTransform) {
    if (!effect.processedPath) {
      const scaledPath = (effect.path || []).map((p) => ({ x: p.x * this.dpr, y: p.y * this.dpr }));
      effect.processedPath = this.processPathForInterpolation(scaledPath);
    }

    const currentPosition = this.interpolateAlongPath(effect.processedPath, easedProgress);
    const startPosition = effect.processedPath[0] || { x: 0, y: 0 };

    const panOffsetX = currentPosition.x - startPosition.x;
    const panOffsetY = currentPosition.y - startPosition.y;

    // We subtract pan offset because moving the image left means translating canvas right
    return {
      scale: initialTransform.scale,
      translateX: initialTransform.translateX - panOffsetX,
      translateY: initialTransform.translateY - panOffsetY,
    };
  }

  processPathForInterpolation(path) {
    const processedPath = [];
    let totalDistance = 0;
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      let segmentDistance = 0;
      if (i > 0) {
        const prev = path[i - 1];
        segmentDistance = Math.hypot(point.x - prev.x, point.y - prev.y);
        totalDistance += segmentDistance;
      }
      processedPath.push({ ...point, cumulativeDistance: totalDistance });
    }
    processedPath.forEach((p) => {
      p.normalizedDistance = totalDistance > 0 ? p.cumulativeDistance / totalDistance : 0;
    });
    return processedPath;
  }

  interpolateAlongPath(processedPath, progress) {
    if (!processedPath || processedPath.length === 0) return { x: 0, y: 0 };
    if (progress <= 0) return processedPath[0];
    if (progress >= 1) return processedPath[processedPath.length - 1];

    for (let i = 1; i < processedPath.length; i++) {
      const p1 = processedPath[i - 1];
      const p2 = processedPath[i];
      if (progress >= p1.normalizedDistance && progress <= p2.normalizedDistance) {
        const seg = p2.normalizedDistance - p1.normalizedDistance;
        const local = seg > 0 ? (progress - p1.normalizedDistance) / seg : 0;
        return {
          x: p1.x + (p2.x - p1.x) * local,
          y: p1.y + (p2.y - p1.y) * local,
        };
      }
    }
    return processedPath[processedPath.length - 1];
  }

  updateEffects(newEffects) {
    this.effects = (newEffects || [])
      .filter((e) => !e?.isDeleted)
      .sort((a, b) => parseFloat(a.startTime) - parseFloat(b.startTime))
  }

  ease(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  destroy() {
    this.effects = [];
    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
  }
}
