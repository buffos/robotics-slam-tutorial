import {
  composeTransforms,
  invertTransform,
  transformPoint,
} from "./rigid-transform";
import type { Point2, RigidTransform2 } from "./rigid-transform";
import type { RobotPose } from "./robot-state";
import type { Landmark } from "./world";

/** One physical point, expressed in three coordinate frames. */
export interface LandmarkInFrames {
  readonly id: string;
  readonly world: Point2;
  readonly robot: Point2;
  readonly sensor: Point2;
}

/** Read-only geometry at one instant; every consumer receives the same snapshot. */
export interface CoordinateFrameSnapshot {
  readonly worldFromRobot: RigidTransform2;
  readonly robotFromSensor: RigidTransform2;
  readonly worldFromSensor: RigidTransform2;
  readonly landmark: LandmarkInFrames;
}

export function coordinateFrameSnapshot(
  pose: RobotPose,
  sensorMount: RigidTransform2,
  landmark: Landmark,
): CoordinateFrameSnapshot {
  // A robot pose already is worldFromRobot. The mounting pose is robotFromSensor.
  // Copy inputs so a later simulation update cannot change this instant's data.
  const worldFromRobot = { ...pose };
  const robotFromSensor = { ...sensorMount };
  const worldFromSensor = composeTransforms(worldFromRobot, robotFromSensor);
  const world = { x: landmark.x, y: landmark.y };
  return {
    worldFromRobot,
    robotFromSensor,
    worldFromSensor,
    landmark: {
      id: landmark.id,
      world,
      robot: transformPoint(invertTransform(worldFromRobot), world),
      sensor: transformPoint(invertTransform(worldFromSensor), world),
    },
  };
}
