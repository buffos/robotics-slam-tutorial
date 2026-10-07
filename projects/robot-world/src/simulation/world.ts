import type { RobotPose } from "./robot-state";

/** A fixed point in the world; color, marker shape, and labels belong to the view. */
export interface Landmark {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export interface WorldDefinition {
  // The origin is the floor's center. Dimensions and positions use meters.
  readonly width: number;
  readonly height: number;
  readonly landmarks: readonly Landmark[];
  readonly robot: {
    // Physical footprint and motion limits, not Three.js mesh settings.
    readonly radius: number;
    readonly linearSpeed: number;
    // Angular speed uses radians per second; linear speed uses meters per second.
    readonly angularSpeed: number;
    readonly startPose: RobotPose;
  };
}

// Change the environment here; the simulation and view read the same definition.
export const DEFAULT_WORLD: WorldDefinition = {
  width: 16,
  height: 12,
  landmarks: [
    { id: "L1", x: -5, y: 4 },
    { id: "L2", x: 1, y: 4 },
    { id: "L3", x: 5, y: 2 },
    { id: "L4", x: -5, y: -3 },
    { id: "L5", x: 0, y: -4 },
    { id: "L6", x: 5, y: -3 },
  ],
  robot: {
    radius: 0.38,
    linearSpeed: 1.8,
    angularSpeed: Math.PI / 2,
    startPose: { x: 0, y: 0, heading: 0 },
  },
};
