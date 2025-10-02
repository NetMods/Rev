import { getOS } from "../utils";

export class EffectsManager {
  constructor() {
    this.effects = [];
    this.resetDuration = 1; // Smoother 0.5 second reset
    this.dpr = 1;

    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;
  }

  init(effects) {
    this.effects = effects.sort((a, b) => parseFloat(a.startTime) - parseFloat(b.startTime));
    if (getOS() !== 'mac') this.dpr = window.devicePixelRatio || 1;
  }

  applyEffects(ctx, video, currentTime) {
    if (!video || !ctx) return;

    const transform = this.calculateTransformAtTime(currentTime);

    // Store the calculated values (can be useful for debugging)
    this.currentScale = transform.scale;
    this.currentTranslateX = transform.translateX;
    this.currentTranslateY = transform.translateY;

    // Apply the final, correct transformation to the canvas
    ctx.translate(transform.translateX, transform.translateY);
    ctx.scale(transform.scale, transform.scale);
  }


  calculateTransformAtTime(currentTime) {
    // 1. Define the base transform
    let baseTransform = {
      scale: 1,
      translateX: 0,
      translateY: 0
    };

    // 2. Find all effects that have fully completed before the currentTime
    const completedEffects = this.effects.filter(
      effect => parseFloat(effect.endTime) <= currentTime
    );

    // 3. Apply the final state of each completed effect cumulatively
    for (const effect of completedEffects) {
      baseTransform = this.getEffectEndState(effect, baseTransform);
    }

    // 4. Find the currently active effect
    const activeEffect = this.effects.find(effect => {
      const start = parseFloat(effect.startTime);
      const end = parseFloat(effect.endTime);
      return currentTime >= start && currentTime <= end;
    });

    // 5. If an effect is active, calculate its progress based on the cumulative state
    if (activeEffect) {
      return this.calculateEffectInProgress(activeEffect, currentTime, baseTransform);
    }

    // 6. If no effect is active, check if a reset is needed
    const lastEffect = this.effects[this.effects.length - 1];
    const lastEffectEndTime = lastEffect ? parseFloat(lastEffect.endTime) : 0;

    if (currentTime > lastEffectEndTime) {
      // We are after the last effect, so we need to reset
      return this.calculateResetInProgress(currentTime, lastEffectEndTime, baseTransform);
    }

    // If we are between effects, hold the state of the last completed effect
    return baseTransform;
  }

  getEffectEndState(effect, initialTransform) {
    return this.calculateEffectInProgress(effect, parseFloat(effect.endTime), initialTransform);
  }


  calculateEffectInProgress(effect, currentTime, initialTransform) {
    const start = parseFloat(effect.startTime);
    const end = parseFloat(effect.endTime);
    const duration = end - start;
    const progress = duration > 0 ? Math.min((currentTime - start) / duration, 1) : 1;
    const eased = this.ease(progress);

    if (effect.type === 'zoom') {
      return this.calculateZoom(effect, eased, initialTransform);
    }
    if (effect.type === 'pan') {
      return this.calculatePan(effect, eased, initialTransform);
    }
    return initialTransform;
  }

  /**
   * Calculates the transformation for a reset animation that is in progress.
   */
  calculateResetInProgress(currentTime, lastEffectEndTime, initialTransform) {
    const resetStartTime = lastEffectEndTime;
    const progress = Math.min((currentTime - resetStartTime) / this.resetDuration, 1);
    const eased = this.ease(progress);

    if (progress >= 1) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Interpolate from the last known state back to the default
    const scale = initialTransform.scale + (1 - initialTransform.scale) * eased;
    const translateX = initialTransform.translateX + (0 - initialTransform.translateX) * eased;
    const translateY = initialTransform.translateY + (0 - initialTransform.translateY) * eased;

    return { scale, translateX, translateY };
  }

  /**
   * Pure calculation function for a zoom effect.
   */
  calculateZoom(effect, easedProgress, initialTransform) {
    const { center, level } = effect;
    const targetScale = level;

    // Calculate the target translation needed to zoom towards the center point
    const centerX = center.x * this.dpr;
    const centerY = center.y * this.dpr;

    const worldX = (centerX - initialTransform.translateX) / initialTransform.scale;
    const worldY = (centerY - initialTransform.translateY) / initialTransform.scale;

    const targetTranslateX = centerX - (targetScale * worldX);
    const targetTranslateY = centerY - (targetScale * worldY);

    // Interpolate scale and translation
    const currentScale = initialTransform.scale + (targetScale - initialTransform.scale) * easedProgress;
    const currentTranslateX = initialTransform.translateX + (targetTranslateX - initialTransform.translateX) * easedProgress;
    const currentTranslateY = initialTransform.translateY + (targetTranslateY - initialTransform.translateY) * easedProgress;

    return {
      scale: currentScale,
      translateX: currentTranslateX,
      translateY: currentTranslateY,
    };
  }

  /**
   * Pure calculation function for a pan effect.
   */
  calculatePan(effect, easedProgress, initialTransform) {
    if (!effect.processedPath) {
      // Pre-process and cache the path if it hasn't been done yet.
      const scaledPath = effect.path.map(p => ({ x: p.x * this.dpr, y: p.y * this.dpr }));
      effect.processedPath = this.processPathForInterpolation(scaledPath);
    }

    const currentPosition = this.interpolateAlongPath(effect.processedPath, easedProgress);
    const startPosition = effect.processedPath[0];

    // The offset is the difference between the current path point and the start point
    const panOffsetX = -(currentPosition.x - startPosition.x);
    const panOffsetY = -(currentPosition.y - startPosition.y);

    return {
      scale: initialTransform.scale, // Pan does not change scale
      translateX: initialTransform.translateX + panOffsetX,
      translateY: initialTransform.translateY + panOffsetY,
    };
  }

  processPathForInterpolation(path) {
    const processedPath = [];
    let totalDistance = 0;

    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      let segmentDistance = 0;
      if (i > 0) {
        const prevPoint = path[i - 1];
        segmentDistance = Math.sqrt(Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2));
        totalDistance += segmentDistance;
      }
      processedPath.push({ ...point, cumulativeDistance: totalDistance });
    }

    processedPath.forEach(point => {
      point.normalizedDistance = totalDistance > 0 ? point.cumulativeDistance / totalDistance : 0;
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
        const segmentRange = p2.normalizedDistance - p1.normalizedDistance;
        const localProgress = segmentRange > 0 ? (progress - p1.normalizedDistance) / segmentRange : 0;
        return {
          x: p1.x + (p2.x - p1.x) * localProgress,
          y: p1.y + (p2.y - p1.y) * localProgress,
        };
      }
    }
    return processedPath[processedPath.length - 1];
  }

  ease(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  destroy() {
    this.effects = [];
  }
}
