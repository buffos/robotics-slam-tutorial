import type { RigidTransform2 } from "./rigid-transform";

/**
 * The robot frame's pose in the world: worldFromRobot. Positions use meters,
 * heading uses radians. Zero faces +x; a positive angle turns toward +y.
 */
export type RobotPose = RigidTransform2;

/** Desired motion: zero is idle, +forward drives ahead, +turn turns left. */
export interface DriveCommand {
  // Controls produce values in [-1, 1]; the simulation clamps other inputs.
  readonly forward: number;
  readonly turn: number;
}
