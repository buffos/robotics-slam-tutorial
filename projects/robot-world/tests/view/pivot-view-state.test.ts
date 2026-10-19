import { describe, expect, it } from "vitest";
import { pivotRotationSnapshot } from "../../src/simulation/pivot-rotation";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import { pivotViewState } from "../../src/view/pivot-view-state";

describe("pivot geometry to drawing axes", () => {
  it("converts points and directions without translating or changing their source", () => {
    const snapshot = pivotRotationSnapshot(
      DEFAULT_WORLD.robot.startPose,
      { pivot: { x: 1, y: 4 }, angle: Math.PI / 2 },
      DEFAULT_WORLD,
    );
    const original = structuredClone(snapshot);
    const state = pivotViewState(snapshot);
    expect(state.pivot).toEqual({ x: 1, y: 0, z: -4 });
    expect(state.after.x).toBeCloseTo(5);
    expect(state.after.z).toBeCloseTo(-3);
    expect(state.after.rotationY).toBeCloseTo(Math.PI / 2);
    expect(state.forwardAfter.x).toBeCloseTo(0);
    expect(state.forwardAfter.z).toBeCloseTo(-1);
    expect(state.arc.at(-1)!.x).toBeCloseTo(state.after.x);
    expect(state.arc.at(-1)!.z).toBeCloseTo(state.after.z);
    expect(state.fitsInWorld).toBe(true);
    expect(snapshot).toEqual(original);
  });
});
