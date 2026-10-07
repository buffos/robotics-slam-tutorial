/** Position in world meters and heading in radians, independent of drawing. */
export interface RobotPose {
  readonly x: number;
  readonly y: number;
  // Zero faces +x; a positive angle turns toward +y (counterclockwise).
  readonly heading: number;
}

/** Desired motion: zero is idle, +forward drives ahead, +turn turns left. */
export interface DriveCommand {
  // Controls produce values in [-1, 1]; the simulation clamps other inputs.
  readonly forward: number;
  readonly turn: number;
}
