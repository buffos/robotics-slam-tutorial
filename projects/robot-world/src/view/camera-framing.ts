export function cameraFieldOfView(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError("Camera aspect must be finite and positive.");
  }
  // Keep horizontal room for the floor when the canvas becomes narrow.
  const fit = Math.min(aspect / 1.2, 1);
  return (2 * Math.atan(Math.tan(Math.PI / 8) / fit) * 180) / Math.PI;
}
