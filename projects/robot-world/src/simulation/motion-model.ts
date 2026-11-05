import type { RobotPose } from "./robot-state";

/** Motion accumulated over one simulation step: signed meters and radians. */
export interface MotionIncrement {
  readonly distanceMeters: number;
  readonly turnRadians: number;
}

function assertFinitePose(pose: RobotPose): void {
  if (
    !Number.isFinite(pose.x) ||
    !Number.isFinite(pose.y) ||
    !Number.isFinite(pose.heading)
  ) {
    throw new RangeError("Robot pose values must be finite.");
  }
}

function wrapAngle(angle: number): number {
  // Full turns point the same way. Recover that direction's compact signed
  // angle so repeated rotation does not leave an ever-growing heading value.
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/** Move along the robot's current forward axis; a negative distance reverses. */
export function move(pose: RobotPose, distanceMeters: number): RobotPose {
  assertFinitePose(pose);
  if (!Number.isFinite(distanceMeters)) {
    throw new RangeError("Travel distance must be finite.");
  }

  return {
    x: pose.x + Math.cos(pose.heading) * distanceMeters,
    y: pose.y + Math.sin(pose.heading) * distanceMeters,
    heading: pose.heading,
  };
}

/** Turn in place; positive radians turn counterclockwise toward world +y. */
export function rotate(pose: RobotPose, angleRadians: number): RobotPose {
  assertFinitePose(pose);
  if (!Number.isFinite(angleRadians)) {
    throw new RangeError("Turn angle must be finite.");
  }

  return {
    ...pose,
    heading: wrapAngle(pose.heading + angleRadians),
  };
}

/**
 * Apply one constant-command step using midpoint-heading integration.
 *
 * We first turn halfway, move at that halfway heading, then finish the turn.
 * This is a simple approximation of simultaneous forward and angular motion;
 * it is not a model of wheels or acceleration. Distances use meters and turns
 * use radians so the simulator can convert command rates using elapsed seconds.
 */
export function step(pose: RobotPose, motion: MotionIncrement): RobotPose {
  assertFinitePose(pose);
  if (
    !Number.isFinite(motion.distanceMeters) ||
    !Number.isFinite(motion.turnRadians)
  ) {
    throw new RangeError("Motion increments must be finite.");
  }

  const halfwayPose = rotate(pose, motion.turnRadians / 2);
  const translatedPose = move(halfwayPose, motion.distanceMeters);
  return rotate(translatedPose, motion.turnRadians / 2);
}
