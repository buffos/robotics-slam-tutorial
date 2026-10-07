import { describe, expect, it } from "vitest";
import { robotTransform } from "../../src/view/robot-transform";

describe("simulation-to-view contract", () => {
  it("places the robot on the floor and maps world y to negative scene z", () => {
    expect(robotTransform({ x: 2, y: 3, heading: 0 })).toEqual({
      x: 2,
      y: 0,
      z: -3,
      rotationY: 0,
    });
  });

  it.each([0, Math.PI / 2, -Math.PI / 2, Math.PI])(
    "keeps the rendered nose aligned with world heading %s",
    (heading) => {
      const transform = robotTransform({ x: 0, y: 0, heading });
      // A +X-facing mesh rotated about +Y points toward scene -Z on a left turn.
      const sceneNose = {
        x: Math.cos(transform.rotationY),
        z: -Math.sin(transform.rotationY),
      };
      expect(sceneNose.x).toBeCloseTo(Math.cos(heading));
      expect(-sceneNose.z).toBeCloseTo(Math.sin(heading));
    },
  );

  it("does not change the simulation pose", () => {
    const pose = Object.freeze({ x: -2, y: 1, heading: 0.5 });
    robotTransform(pose);
    expect(pose).toEqual({ x: -2, y: 1, heading: 0.5 });
  });
});
