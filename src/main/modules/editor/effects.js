import { screen } from 'electron'
import { randomUUID as uuid } from "crypto"

export const createZoomAndPanEffects = (mouseClicks, mouseDrags) => {
  const effects = [];

  const getScreenRelativeCoords = (x, y) => {
    const point = { x, y };
    const { bounds, scaleFactor } = screen.getDisplayNearestPoint(point);
    const screenWidth = bounds.x * scaleFactor;
    const screenHeight = bounds.y * scaleFactor;
    return {
      x: x - screenWidth,
      y: y - screenHeight
    };
  };

  const createZoomEffect = (record) => {
    const { x: relX, y: relY } = getScreenRelativeCoords(record.x, record.y);
    const duration = 1;
    const startTime = parseFloat(Math.max(0, record.elapsedTime - duration)).toFixed(3);

    return {
      id: uuid().slice(0, 8),
      type: 'zoom',
      startTime,
      endTime: record.elapsedTime,
      level: 2,
      center: { x: relX, y: relY }
    };
  };

  const createPanEffect = (startRecord, endRecord, path = null) => {
    const startCoords = getScreenRelativeCoords(startRecord.x || startRecord.startX, startRecord.y || startRecord.startY);
    const endCoords = getScreenRelativeCoords(endRecord.x || endRecord.endX, endRecord.y || endRecord.endY);

    const deltaX = endCoords.x - startCoords.x;
    const deltaY = endCoords.y - startCoords.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const startTime = startRecord.elapsedTime || startRecord.startTime;
    const endTime = endRecord.elapsedTime || endRecord.endTime;

    const dragDuration = endTime - startTime;
    const effectDuration = Math.max(300, Math.min(dragDuration * 1000, 2000));

    const panPath = path || [
      { x: startCoords.x, y: startCoords.y, time: startTime },
      { x: endCoords.x, y: endCoords.y, time: endTime }
    ];

    return {
      id: uuid().slice(0, 8),
      type: 'pan',
      startTime,
      endTime,
      startPosition: startCoords,
      endPosition: endCoords,
      delta: { x: deltaX, y: deltaY },
      distance: Math.round(distance),
      duration: effectDuration,
      path: panPath
    };
  };

  // Cluster mouse clicks by time proximity (1-second threshold)
  const createClickClusters = (clicks) => {
    if (!clicks.length) return [];

    const clusters = [];
    let currentCluster = [clicks[0]];

    for (let i = 1; i < clicks.length; i++) {
      const timeDiff = clicks[i].elapsedTime - currentCluster[currentCluster.length - 1].elapsedTime;

      if (timeDiff >= 2.5) {
        clusters.push(currentCluster);
        currentCluster = [clicks[i]];
      } else {
        currentCluster.push(clicks[i]);
      }
    }

    clusters.push(currentCluster);
    return clusters;
  };

  // Process mouse clicks
  const clusters = createClickClusters(mouseClicks);

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      // Single click: create zoom effect
      effects.push(createZoomEffect(cluster[0]));
    } else {
      // Multiple clicks: zoom on first, pan between subsequent ones
      effects.push(createZoomEffect(cluster[0]));

      for (let i = 1; i < cluster.length; i++) {
        effects.push(createPanEffect(cluster[i - 1], cluster[i]));
      }
    }
  }

  // Process mouse drags
  for (const drag of mouseDrags) {
    const transformedPath = drag.path?.map(point => {
      const coords = getScreenRelativeCoords(point.x, point.y);
      return { ...coords, time: point.time };
    });

    effects.push(createPanEffect(drag, drag, transformedPath));
  }

  return effects;
};
