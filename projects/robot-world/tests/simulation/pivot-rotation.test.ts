import { describe, expect, it } from "vitest";
import {
  pivotRotationSnapshot,
  resolveRotationPivot,
  rotatePoseAboutPivot,
} from "../../src/simulation/pivot-rotation";
import { RobotSimulation } from "../../src/simulation/robot-simulation";
import {
  rotationAboutPivot,
  transformDirection,
  transformPoint,
} from "../../src/simulation/rigid-transform";
import { DEFAULT_WORLD } from "../../src/simulation/world";

describe("points and directions", () => {
  it("translates a point while leaving a direction unchanged", () => {
    const transform = { x: 7, y: -4, heading: 0 };
    expect(transformPoint(transform, { x: 2, y: 1 })).toEqual({ x: 9, y: -3 });
    expect(transformDirection(transform, { x: 2, y: 1 })).toEqual({
      x: 2,
      y: 1,
    });
  });

  it("matches the difference of transformed endpoints and preserves magnitude", () => {
    const transform = { x: 6, y: -3, heading: Math.PI / 2 };
    const a = transformPoint(transform, { x: 1, y: 1 });
    const b = transformPoint(transform, { x: 3, y: 2 });
    const direction = transformDirection(transform, { x: 2, y: 1 });
    expect(direction.x).toBeCloseTo(b.x - a.x);
    expect(direction.y).toBeCloseTo(b.y - a.y);
    expect(direction.x).toBeCloseTo(-1);
    expect(direction.y).toBeCloseTo(2);
    expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(Math.sqrt(5));
    expect(transformDirection(transform, { x: 0, y: 0 })).toEqual({
      x: 0,
      y: 0,
    });
  });

  it.each([
    [
      { x: NaN, y: 0, heading: 0 },
      { x: 1, y: 0 },
    ],
    [
      { x: 0, y: 0, heading: Infinity },
      { x: 1, y: 0 },
    ],
    [
      { x: 0, y: 0, heading: 0 },
      { x: 1, y: NaN },
    ],
  ])("rejects non-finite direction transformations", (transform, direction) => {
    expect(() => transformDirection(transform, direction)).toThrow(RangeError);
  });
});

describe("rotation around a fixed pivot", () => {
  it("keeps the pivot fixed and rotates a known point around it", () => {
    const pivot = { x: 1, y: 1 };
    const rotation = rotationAboutPivot(pivot, Math.PI / 2);
    const fixed = transformPoint(rotation, pivot);
    const moved = transformPoint(rotation, { x: 3, y: 1 });
    expect(fixed.x).toBeCloseTo(1);
    expect(fixed.y).toBeCloseTo(1);
    expect(moved.x).toBeCloseTo(1);
    expect(moved.y).toBeCloseTo(3);
    // A unit forward axis rotates, without acquiring the pivot's translation.
    const direction = transformDirection(rotation, { x: 1, y: 0 });
    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(1);
  });

  it("turns in place around the robot center and reverses an arbitrary rotation", () => {
    const pose = { x: 2, y: -1, heading: 0.4 };
    const inPlace = rotatePoseAboutPivot(pose, { pivot: pose, angle: 0.7 });
    expect(inPlace.x).toBeCloseTo(pose.x);
    expect(inPlace.y).toBeCloseTo(pose.y);
    expect(inPlace.heading).toBeCloseTo(1.1);
    const pivot = { x: -1, y: 2 };
    const rotated = rotatePoseAboutPivot(pose, { pivot, angle: -0.8 });
    const recovered = rotatePoseAboutPivot(rotated, { pivot, angle: 0.8 });
    expect(recovered.x).toBeCloseTo(pose.x);
    expect(recovered.y).toBeCloseTo(pose.y);
    expect(recovered.heading).toBeCloseTo(pose.heading);
  });

  it("produces independent poses, unit directions, and a constant-radius arc", () => {
    const pose = { x: 0, y: 0, heading: 0 };
    const pivot = { x: 1, y: 4 };
    const worldBefore = structuredClone(DEFAULT_WORLD);
    const snapshot = pivotRotationSnapshot(
      pose,
      { pivot, angle: Math.PI / 2 },
      DEFAULT_WORLD,
    );
    expect(snapshot.after.x).toBeCloseTo(5);
    expect(snapshot.after.y).toBeCloseTo(3);
    expect(snapshot.after.heading).toBeCloseTo(Math.PI / 2);
    expect(snapshot.forwardAfter.x).toBeCloseTo(0);
    expect(snapshot.forwardAfter.y).toBeCloseTo(1);
    expect(snapshot.radius).toBeCloseTo(Math.sqrt(17));
    for (const point of snapshot.arc) {
      expect(Math.hypot(point.x - pivot.x, point.y - pivot.y)).toBeCloseTo(
        snapshot.radius,
      );
    }
    expect(snapshot.arc[0]!.x).toBeCloseTo(0);
    expect(snapshot.arc.at(-1)!.x).toBeCloseTo(snapshot.after.x);
    expect(snapshot.fitsInWorld).toBe(true);
    pose.x = 9;
    pivot.y = 9;
    expect(snapshot.before.x).toBe(0);
    expect(snapshot.pivot.y).toBe(4);
    expect(DEFAULT_WORLD).toEqual(worldBefore);
  });

  it("resolves the robot, world origin, and fixed landmarks", () => {
    const pose = { x: 2, y: 1, heading: 0 };
    expect(resolveRotationPivot("robot", pose, DEFAULT_WORLD)).toEqual({
      x: 2,
      y: 1,
    });
    expect(resolveRotationPivot("world", pose, DEFAULT_WORLD)).toEqual({
      x: 0,
      y: 0,
    });
    expect(resolveRotationPivot("L2", pose, DEFAULT_WORLD)).toEqual({
      x: 1,
      y: 4,
    });
    expect(() => resolveRotationPivot("missing", pose, DEFAULT_WORLD)).toThrow(
      RangeError,
    );
  });

  it.each([
    { pivot: { x: NaN, y: 0 }, angle: 0 },
    { pivot: { x: 0, y: 0 }, angle: Infinity },
  ])("rejects invalid pivots and angles", ({ pivot, angle }) => {
    expect(() => rotationAboutPivot(pivot, angle)).toThrow(RangeError);
  });
});

describe("paused pivot rotation command", () => {
  it("applies the preview pose while preserving pause and the world", () => {
    const simulation = new RobotSimulation();
    const command = { pivot: { x: 1, y: 4 }, angle: Math.PI / 2 };
    const preview = pivotRotationSnapshot(
      simulation.pose,
      command,
      DEFAULT_WORLD,
    );
    expect(simulation.rotateAboutPivot(command)).toBe(false);
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
    simulation.togglePause();
    expect(simulation.rotateAboutPivot(command)).toBe(true);
    expect(simulation.pose).toEqual(preview.after);
    expect(simulation.paused).toBe(true);
    simulation.reset();
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
    expect(simulation.paused).toBe(true);
  });

  it("rejects an out-of-bounds result atomically rather than clamping it", () => {
    const simulation = new RobotSimulation();
    simulation.togglePause();
    const command = { pivot: { x: 5, y: 2 }, angle: Math.PI };
    const snapshot = pivotRotationSnapshot(
      simulation.pose,
      command,
      DEFAULT_WORLD,
    );
    expect(snapshot.fitsInWorld).toBe(false);
    expect(simulation.rotateAboutPivot(command)).toBe(false);
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
  });
});
