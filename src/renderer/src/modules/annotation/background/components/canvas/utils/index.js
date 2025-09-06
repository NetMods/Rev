export function getRelativePointPosition(point, node) {
  const transform = node.getAbsoluteTransform().copy();
  transform.invert();
  return transform.point(point);
}

export function getRelativePointerPosition(node) {
  const stage = node.getStage();
  const pointerPosition = stage.getPointerPosition();
  return getRelativePointPosition(pointerPosition, node);
}
