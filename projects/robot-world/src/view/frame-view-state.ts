import { robotTransform } from "./robot-transform";
import { IDENTITY_TRANSFORM } from "../simulation/rigid-transform";
import type { CoordinateFrameSnapshot } from "../simulation/coordinate-frames";

/** Rendering axes are adapted only after the physical frame calculations finish. */
export function frameViewState(snapshot: CoordinateFrameSnapshot) {
  return {
    world: robotTransform(IDENTITY_TRANSFORM),
    robot: robotTransform(snapshot.worldFromRobot),
    sensor: robotTransform(snapshot.worldFromSensor),
    landmark: {
      x: snapshot.landmark.world.x,
      y: 0,
      z: -snapshot.landmark.world.y,
    },
  };
}

export type FrameViewState = ReturnType<typeof frameViewState>;
