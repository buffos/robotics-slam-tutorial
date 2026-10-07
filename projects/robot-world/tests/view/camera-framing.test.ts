import { describe, expect, it } from "vitest";
import { cameraFieldOfView } from "../../src/view/camera-framing";

describe("camera framing", () => {
  it("uses a 45 degree field of view on a wide canvas", () => {
    expect(cameraFieldOfView(16 / 9)).toBeCloseTo(45);
  });

  it("widens the view on a narrow canvas", () => {
    expect(cameraFieldOfView(0.9)).toBeGreaterThan(45);
    expect(cameraFieldOfView(0.9)).toBeLessThan(65);
  });

  it("preserves horizontal coverage across narrow aspect ratios", () => {
    const horizontalCoverage = (aspect: number): number =>
      Math.tan((cameraFieldOfView(aspect) * Math.PI) / 360) * aspect;
    expect(horizontalCoverage(0.7)).toBeCloseTo(horizontalCoverage(1.2));
  });

  it.each([0, -1, Infinity, NaN])("rejects invalid aspect %s", (aspect) => {
    expect(() => cameraFieldOfView(aspect)).toThrow(RangeError);
  });
});
