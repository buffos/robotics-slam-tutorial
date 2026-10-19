import {
  composeTransforms,
  rotationAboutPivot,
  transformDirection,
  transformPoint,
} from "./rigid-transform";
import type { Direction2, Point2, RigidTransform2 } from "./rigid-transform";
import type { RobotPose } from "./robot-state";
import type { WorldDefinition } from "./world";

/** Native input becomes this selection before any physical calculation. */
export interface PivotRotationSelection {
  readonly pivotId: string;
  readonly angle: number; // Counterclockwise radians, relative to the current pose.
}

export interface PivotRotationCommand {
  readonly pivot: Point2; // World meters, fixed during this rotation.
  readonly angle: number;
}

export interface PivotRotationSnapshot {
  readonly pivot: Point2;
  readonly angle: number;
  readonly before: RobotPose;
  readonly after: RobotPose;
  readonly forwardBefore: Direction2;
  readonly forwardAfter: Direction2;
  readonly radius: number; // Distance from the pivot to the robot center, meters.
  readonly arc: readonly Point2[];
  readonly fitsInWorld: boolean;
}

export function resolveRotationPivot(
  id: string,
  pose: RobotPose,
  world: WorldDefinition,
): Point2 {
  if (id === "robot") return { x: pose.x, y: pose.y };
  if (id === "world") return { x: 0, y: 0 };
  const landmark = world.landmarks.find((item) => item.id === id);
  if (!landmark) throw new RangeError("Choose a pivot defined in the world.");
  return { x: landmark.x, y: landmark.y };
}

/** Rotate the complete pose: its origin moves and its orientation turns. */
export function rotatePoseAboutPivot(
  pose: RobotPose,
  command: PivotRotationCommand,
): RigidTransform2 {
  return composeTransforms(
    rotationAboutPivot(command.pivot, command.angle),
    pose,
  );
}

/** Check the resulting footprint without clamping or changing the geometry. */
export function poseFitsWorld(
  pose: RobotPose,
  world: WorldDefinition,
): boolean {
  return (
    Math.abs(pose.x) <= world.width / 2 - world.robot.radius &&
    Math.abs(pose.y) <= world.height / 2 - world.robot.radius
  );
}

/** Calculate one preview. This function never changes the robot or the world. */
export function pivotRotationSnapshot(
  pose: RobotPose,
  command: PivotRotationCommand,
  world: WorldDefinition,
): PivotRotationSnapshot {
  const before = { ...pose };
  const pivot = { ...command.pivot };
  const rotation = rotationAboutPivot(pivot, command.angle);
  const after = composeTransforms(rotation, before);
  const forwardBefore = transformDirection(before, { x: 1, y: 0 });
  // Apply the very same transform with w=0: the pivot translation drops out.
  const forwardAfter = transformDirection(rotation, forwardBefore);
  const radius = Math.hypot(before.x - pivot.x, before.y - pivot.y);
  // These are world positions along a geometric rotation arc, not wheel motion.
  // Sampling lives here so the view only converts finished positions to axes.
  const arc = Array.from({ length: 49 }, (_, index) =>
    transformPoint(
      rotationAboutPivot(pivot, (command.angle * index) / 48),
      before,
    ),
  );
  return {
    pivot,
    angle: command.angle,
    before,
    after,
    forwardBefore,
    forwardAfter,
    radius,
    arc,
    fitsInWorld: poseFitsWorld(after, world),
  };
}
