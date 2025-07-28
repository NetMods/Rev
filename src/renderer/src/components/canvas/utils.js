export function getRelativePointPosition(point, node) {
  // Get the absolute transform of the node and invert it
  const transform = node.getAbsoluteTransform().copy();
  transform.invert();

  // Apply the inverted transform to the point
  return transform.point(point);
}

export function getRelativePointerPosition(node) {
  const stage = node.getStage();
  const pointerPosition = stage.getPointerPosition();
  return getRelativePointPosition(pointerPosition, node);
}
