export class EffectsManager {
  constructor() {
    this.effects = [];
    this.currentScale = 1;
    this.currentTranslateX = 0;
    this.currentTranslateY = 0;

    this.isResetting = false;
    this.resetStartTime = 0;
    this.resetDuration = 1;
    this.resetStartScale = 1;
    this.resetStartTranslateX = 0;
    this.resetStartTranslateY = 0;
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

    if (activeEffects.length > 0) {
      this.isResetting = false;
      activeEffects.forEach(effect => {
        if (effect.type === 'zoom') {
          this.applyZoomEffect(effect, currentTime, ctx);
        }
        if (effect.type === 'pan') {
          this.applyPanEffect(effect, currentTime, ctx);
        }
      });
    } else {
      if (this.currentScale !== 1 || this.currentTranslateX !== 0 || this.currentTranslateY !== 0) {
        this.resetZoomEffect(ctx, currentTime)
      }
      else {
        this.isResetting = false;
      }
    }
  }

  applyZoomEffect(effect, currentTime, ctx) {
    const { startTime, endTime, center, level } = effect
    const duration = endTime - startTime

    if (!effect._started) {
      effect._started = true;
      effect.initialScale = this.currentScale;

      effect.initialTranslateX = this.currentTranslateX;
      effect.initialTranslateY = this.currentTranslateY;

      const dpr = window.devicePixelRatio || 1
      const centerX = center.x * dpr, centerY = center.y * dpr
      const worldX = (centerX - effect.initialTranslateX) / effect.initialScale;
      const worldY = (centerY - effect.initialTranslateY) / effect.initialScale;

      effect.targetTranslateX = centerX - (level * worldX);
      effect.targetTranslateY = centerY - (level * worldY);

      effect.targetTranslateX = Math.abs(effect.targetTranslateX) < 200 ? 0 : effect.targetTranslateX
      effect.targetTranslateY = Math.abs(effect.targetTranslateY) < 200 ? 0 : effect.targetTranslateY
    }

    const targetScale = level;
    const progress = Math.min((currentTime - startTime) / duration, 1)
    const eased = this.ease(progress)

    this.currentScale = effect.initialScale + (targetScale - effect.initialScale) * eased
    this.currentTranslateX = effect.initialTranslateX + (effect.targetTranslateX - effect.initialTranslateX) * eased;
    this.currentTranslateY = effect.initialTranslateY + (effect.targetTranslateY - effect.initialTranslateY) * eased;

    ctx.translate(this.currentTranslateX, this.currentTranslateY);
    ctx.scale(this.currentScale, this.currentScale);
  }

  applyPanEffect(effect, currentTime, ctx) {
    const { startTime, endTime, path } = effect;
    const totalDuration = parseFloat(endTime) - parseFloat(startTime);

    console.log(effect)
    if (!effect._started) {
      effect._started = true;
      effect.initialTranslateX = this.currentTranslateX;
      effect.initialTranslateY = this.currentTranslateY;
      effect.initialScale = this.currentScale;

      // ADD THIS: Get DPR here, same as in zoom
      const dpr = window.devicePixelRatio || 1;

      // UPDATE THIS: Scale the entire path by DPR upfront (assuming recorded path coords are in logical pixels)
      const scaledPath = path.map(point => ({
        x: point.x * dpr,
        y: point.y * dpr,
        time: point.time
      }));

      // UPDATE THIS: Process the scaled path instead
      effect.processedPath = this.processPathForInterpolation(scaledPath, startTime, endTime);
    }

    const currentProgress = Math.min((currentTime - parseFloat(startTime)) / totalDuration, 1);
    const easedProgress = this.ease(currentProgress);

    // Find the current position along the path
    const currentPosition = this.interpolateAlongPath(effect.processedPath, easedProgress);

    // Calculate the pan offset (negative because we're moving the canvas, not the content)
    const panOffsetX = -(currentPosition.x - effect.processedPath[0].x);
    const panOffsetY = -(currentPosition.y - effect.processedPath[0].y);

    // Apply the pan offset to the current transformation
    this.currentTranslateX = effect.initialTranslateX + panOffsetX;
    this.currentTranslateY = effect.initialTranslateY + panOffsetY;
    this.currentScale = effect.initialScale; // Maintain current scale during pan

    ctx.translate(this.currentTranslateX, this.currentTranslateY);
    ctx.scale(this.currentScale, this.currentScale);
  }
  processPathForInterpolation(path) {
    const processedPath = [];
    let totalDistance = 0;

    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      let segmentDistance = 0;

      if (i > 0) {
        const prevPoint = path[i - 1];
        segmentDistance = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) +
          Math.pow(point.y - prevPoint.y, 2)
        );
        totalDistance += segmentDistance;
      }

      processedPath.push({
        x: point.x,
        y: point.y,
        time: parseFloat(point.time),
        cumulativeDistance: totalDistance,
        segmentDistance: segmentDistance
      });
    }

    // Normalize distances to 0-1 range for easier interpolation
    processedPath.forEach(point => {
      point.normalizedDistance = totalDistance > 0 ? point.cumulativeDistance / totalDistance : 0;
    });

    return processedPath;
  }

  interpolateAlongPath(processedPath, progress) {
    if (processedPath.length === 0) return { x: 0, y: 0 };
    if (processedPath.length === 1) return { x: processedPath[0].x, y: processedPath[0].y };
    if (progress <= 0) return { x: processedPath[0].x, y: processedPath[0].y };
    if (progress >= 1) return { x: processedPath[processedPath.length - 1].x, y: processedPath[processedPath.length - 1].y };

    // Find the segment where the current progress falls
    for (let i = 0; i < processedPath.length - 1; i++) {
      const currentPoint = processedPath[i];
      const nextPoint = processedPath[i + 1];

      if (progress >= currentPoint.normalizedDistance && progress <= nextPoint.normalizedDistance) {
        // Calculate local progress within this segment
        const segmentRange = nextPoint.normalizedDistance - currentPoint.normalizedDistance;
        const localProgress = segmentRange > 0 ?
          (progress - currentPoint.normalizedDistance) / segmentRange : 0;

        // Linear interpolation between the two points
        return {
          x: currentPoint.x + (nextPoint.x - currentPoint.x) * localProgress,
          y: currentPoint.y + (nextPoint.y - currentPoint.y) * localProgress
        };
      }
    }

    // Fallback to the last point
    return {
      x: processedPath[processedPath.length - 1].x,
      y: processedPath[processedPath.length - 1].y
    };
  }

  resetZoomEffect(ctx, currentTime) {
    if (!this.isResetting) {
      this.isResetting = true;
      this.resetStartTime = currentTime;
      this.resetStartScale = this.currentScale;
      this.resetStartTranslateX = this.currentTranslateX;
      this.resetStartTranslateY = this.currentTranslateY;
    }

    const progress = Math.min((currentTime - this.resetStartTime) / this.resetDuration, 1);
    const eased = this.ease(progress);

    this.currentScale = this.resetStartScale + (1 - this.resetStartScale) * eased;
    this.currentTranslateX = this.resetStartTranslateX + (0 - this.resetStartTranslateX) * eased;
    this.currentTranslateY = this.resetStartTranslateY + (0 - this.resetStartTranslateY) * eased;

    ctx.translate(this.currentTranslateX, this.currentTranslateY);
    ctx.scale(this.currentScale, this.currentScale);

    if (progress >= 1) {
      this.isResetting = false;
      this.currentScale = 1;
      this.currentTranslateX = 0;
      this.currentTranslateY = 0;
    }
  }

  updateEffects(newEffects) {
    this.effects = newEffects || [];
  }

  ease(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  destroy() {
    this.effects = []
  }
}
