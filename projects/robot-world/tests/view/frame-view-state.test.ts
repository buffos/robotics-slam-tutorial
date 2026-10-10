import { describe, expect, it } from "vitest";
import { coordinateFrameSnapshot } from "../../src/simulation/coordinate-frames";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import { frameViewState } from "../../src/view/frame-view-state";

describe("coordinate-frame rendering boundary", () => {
  it("maps all origins and the landmark to Three.js drawing axes", () => {
    const snapshot = coordinateFrameSnapshot(
      { x: 2, y: 1, heading: Math.PI / 2 },
      DEFAULT_WORLD.robot.sensorMount,
      { id: "L3", x: 5, y: 2 },
    );
    const original = structuredClone(snapshot);
    const state = frameViewState(snapshot);
    expect(state.world).toEqual({ x: 0, y: 0, z: -0, rotationY: 0 });
    expect(state.robot).toEqual({ x: 2, y: 0, z: -1, rotationY: Math.PI / 2 });
    expect(state.sensor.x).toBeCloseTo(1.9);
    expect(state.sensor.z).toBeCloseTo(-1.25);
    expect(state.sensor.rotationY).toBeCloseTo((2 * Math.PI) / 3);
    expect(state.landmark).toEqual({ x: 5, y: 0, z: -2 });
    expect(snapshot).toEqual(original);
  });
});
