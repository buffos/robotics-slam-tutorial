import type { RobotPose } from "../simulation/robot-state";

/** Adapt a finished simulation pose to rendering axes; do not update motion. */
export function robotTransform(pose: RobotPose): {
  x: number;
  y: number;
  z: number;
  rotationY: number;
} {
  // The model moves on x/y; Three.js uses Y for height, so the floor is x/z.
  // World +y becomes scene -z. A positive Y rotation turns the mesh's +x nose
  // toward -z, preserving the model's positive (left) heading convention.
  return { x: pose.x, y: 0, z: -pose.y, rotationY: pose.heading };
}
