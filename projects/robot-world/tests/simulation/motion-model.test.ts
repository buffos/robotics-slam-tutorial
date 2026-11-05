import { describe, expect, it } from "vitest";
import { move, rotate, step } from "../../src/simulation/motion-model";
import type { RobotPose } from "../../src/simulation/robot-state";

describe("pure robot motion model", () => {
  it("moves along the robot's current heading without changing it", () => {
    const pose = { x: 1, y: 2, heading: Math.PI / 2 };
    const forward = move(pose, 3);
    expect(forward.x).toBeCloseTo(1);
    expect(forward.y).toBeCloseTo(5);
    expect(forward.heading).toBe(Math.PI / 2);
    const reverse = move(pose, -3);
    expect(reverse.x).toBeCloseTo(1);
    expect(reverse.y).toBeCloseTo(-1);
    expect(reverse.heading).toBe(Math.PI / 2);
    expect(pose).toEqual({ x: 1, y: 2, heading: Math.PI / 2 });
  });

  it("rotates in place and wraps the displayed heading", () => {
    const pose = { x: 1, y: 2, heading: 0 };
    const turned = rotate(pose, (3 * Math.PI) / 2);
    expect(turned.x).toBe(1);
    expect(turned.y).toBe(2);
    expect(turned.heading).toBeCloseTo(-Math.PI / 2);
  });

  it("uses the halfway heading when translation and turning happen together", () => {
    const result = step(
      { x: 0, y: 0, heading: 0 },
      { distanceMeters: 1, turnRadians: Math.PI / 2 },
    );
    expect(result.x).toBeCloseTo(Math.SQRT1_2);
    expect(result.y).toBeCloseTo(Math.SQRT1_2);
    expect(result.heading).toBeCloseTo(Math.PI / 2);
  });

  it("turns in place when a step has no travel", () => {
    expect(
      step(
        { x: 2, y: -1, heading: 0 },
        { distanceMeters: 0, turnRadians: Math.PI / 2 },
      ),
    ).toEqual({ x: 2, y: -1, heading: Math.PI / 2 });
  });

  it("rejects non-finite poses and motion values", () => {
    const valid: RobotPose = { x: 0, y: 0, heading: 0 };
    expect(() => move(valid, Infinity)).toThrow(RangeError);
    expect(() => rotate(valid, NaN)).toThrow(RangeError);
    expect(() =>
      step(valid, { distanceMeters: 0, turnRadians: Infinity }),
    ).toThrow(RangeError);
    expect(() => move({ ...valid, x: NaN }, 1)).toThrow(RangeError);
  });
});
