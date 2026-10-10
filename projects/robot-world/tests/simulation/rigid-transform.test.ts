import { describe, expect, it } from "vitest";
import {
  composeTransforms,
  IDENTITY_TRANSFORM,
  invertTransform,
  transformPoint,
} from "../../src/simulation/rigid-transform";
import type { Point2 } from "../../src/simulation/rigid-transform";

function expectPoint(actual: Point2, expected: Point2): void {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
}

describe("planar rigid transforms", () => {
  it("preserves a point under identity and translates the source origin", () => {
    const point = { x: -3, y: 2 };
    expect(transformPoint(IDENTITY_TRANSFORM, point)).toEqual(point);
    expect(transformPoint({ x: 2, y: -1, heading: 0 }, { x: 0, y: 0 })).toEqual(
      { x: 2, y: -1 },
    );
  });

  it.each([
    { heading: Math.PI / 2, expected: { x: 2, y: 2 } },
    { heading: -Math.PI / 2, expected: { x: 2, y: 0 } },
    { heading: Math.PI, expected: { x: 1, y: 1 } },
  ])(
    "rotates before translating at heading $heading",
    ({ heading, expected }) => {
      expectPoint(
        transformPoint({ x: 2, y: 1, heading }, { x: 1, y: 0 }),
        expected,
      );
    },
  );

  it("rotates a sensor mounting offset when the robot turns", () => {
    const result = composeTransforms(
      { x: 2, y: 1, heading: Math.PI / 2 },
      { x: 0.25, y: 0.1, heading: Math.PI / 6 },
    );
    expectPoint(result, { x: 1.9, y: 1.25 });
    expect(result.heading).toBeCloseTo((2 * Math.PI) / 3);
  });

  it("matches sequential transforms and detects reversed composition order", () => {
    const worldFromRobot = { x: 2, y: 1, heading: Math.PI / 2 };
    const robotFromSensor = { x: 1, y: 0, heading: 0 };
    const point = { x: 0.5, y: 1 };
    const composed = transformPoint(
      composeTransforms(worldFromRobot, robotFromSensor),
      point,
    );
    expectPoint(composed, { x: 1, y: 2.5 });
    expectPoint(
      composed,
      transformPoint(worldFromRobot, transformPoint(robotFromSensor, point)),
    );
    const reversed = transformPoint(
      composeTransforms(robotFromSensor, worldFromRobot),
      point,
    );
    expectPoint(reversed, { x: 2, y: 1.5 });
  });

  it("composes translated frames with opposing rotations", () => {
    const result = composeTransforms(
      { x: 1.2, y: -0.8, heading: -Math.PI / 3 },
      { x: -0.3, y: 0.4, heading: Math.PI / 6 },
    );
    expectPoint(result, {
      x: 1.2 - 0.15 + 0.2 * Math.sqrt(3),
      y: -0.8 + 0.15 * Math.sqrt(3) + 0.2,
    });
    expect(result.heading).toBeCloseTo(-Math.PI / 6, 10);
  });

  it("composes a transform and its inverse into identity in either order", () => {
    const transform = { x: -2.5, y: 1.7, heading: 0.37 };
    const inverse = invertTransform(transform);
    for (const result of [
      composeTransforms(transform, inverse),
      composeTransforms(inverse, transform),
    ]) {
      expectPoint(result, IDENTITY_TRANSFORM);
      expect(result.heading).toBeCloseTo(0, 10);
    }
  });

  it.each([0, Math.PI / 2, -Math.PI / 2, Math.PI, 0.37])(
    "recovers a point through the inverse at heading %s",
    (heading) => {
      const transform = { x: -2.5, y: 1.7, heading };
      const point = { x: 0.8, y: -3.2 };
      expectPoint(
        transformPoint(
          invertTransform(transform),
          transformPoint(transform, point),
        ),
        point,
      );
      expectPoint(
        transformPoint(
          transform,
          transformPoint(invertTransform(transform), point),
        ),
        point,
      );
    },
  );

  it("uses a rotated inverse translation", () => {
    const inverse = invertTransform({ x: 2, y: 1, heading: Math.PI / 2 });
    expectPoint(inverse, { x: -1, y: 2 });
    expect(inverse.heading).toBe(-Math.PI / 2);
  });

  it("normalizes an inverse heading while preserving its physical direction", () => {
    const inverse = invertTransform({ x: 2, y: 1, heading: (3 * Math.PI) / 2 });
    expectPoint(inverse, { x: 1, y: -2 });
    expect(inverse.heading).toBeCloseTo(Math.PI / 2, 10);
    expectPoint(transformPoint(inverse, { x: 1, y: 0 }), { x: 1, y: -1 });
  });

  it("preserves distances and handedness", () => {
    const transform = { x: 4, y: -2, heading: 0.71 };
    const origin = transformPoint(transform, { x: 0, y: 0 });
    const xAxis = transformPoint(transform, { x: 1, y: 0 });
    const yAxis = transformPoint(transform, { x: 0, y: 1 });
    expect(Math.hypot(xAxis.x - yAxis.x, xAxis.y - yAxis.y)).toBeCloseTo(
      Math.SQRT2,
    );
    const cross =
      (xAxis.x - origin.x) * (yAxis.y - origin.y) -
      (xAxis.y - origin.y) * (yAxis.x - origin.x);
    expect(cross).toBeCloseTo(1);
  });

  it("wraps composed headings without changing the point's direction", () => {
    const result = composeTransforms(
      { x: 0, y: 0, heading: (3 * Math.PI) / 4 },
      { x: 0, y: 0, heading: (3 * Math.PI) / 4 },
    );
    expect(result.heading).toBeCloseTo(-Math.PI / 2);
    expectPoint(transformPoint(result, { x: 1, y: 0 }), { x: 0, y: -1 });
  });

  it("does not mutate input points or transforms", () => {
    const transform = Object.freeze({ x: 2, y: 1, heading: 0.4 });
    const point = Object.freeze({ x: 1, y: -1 });
    transformPoint(transform, point);
    composeTransforms(transform, transform);
    invertTransform(transform);
    expect(transform).toEqual({ x: 2, y: 1, heading: 0.4 });
    expect(point).toEqual({ x: 1, y: -1 });
  });

  it.each([NaN, Infinity, -Infinity])(
    "rejects non-finite geometry %s",
    (value) => {
      expect(() =>
        transformPoint(IDENTITY_TRANSFORM, { x: value, y: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        transformPoint({ x: 0, y: value, heading: 0 }, { x: 0, y: 0 }),
      ).toThrow(RangeError);
      expect(() => invertTransform({ x: 0, y: 0, heading: value })).toThrow(
        RangeError,
      );
      expect(() =>
        composeTransforms(IDENTITY_TRANSFORM, { x: 0, y: 0, heading: value }),
      ).toThrow(RangeError);
      expect(() =>
        composeTransforms({ x: 0, y: 0, heading: value }, IDENTITY_TRANSFORM),
      ).toThrow(RangeError);
    },
  );
});
