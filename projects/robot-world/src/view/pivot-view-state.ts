import { robotTransform } from "./robot-transform";
import type { PivotRotationSnapshot } from "../simulation/pivot-rotation";
import type { Direction2, Point2 } from "../simulation/rigid-transform";

/** Axis conversion only: physical +y is Three.js -Z, without an added location. */
export function pivotViewState(snapshot: PivotRotationSnapshot) {
  const position = (point: Point2) => ({ x: point.x, y: 0, z: -point.y });
  const direction = (vector: Direction2) => ({
    x: vector.x,
    y: 0,
    z: -vector.y,
  });
  return {
    pivot: position(snapshot.pivot),
    before: robotTransform(snapshot.before),
    after: robotTransform(snapshot.after),
    forwardBefore: direction(snapshot.forwardBefore),
    forwardAfter: direction(snapshot.forwardAfter),
    arc: snapshot.arc.map(position),
    fitsInWorld: snapshot.fitsInWorld,
  };
}

export type PivotViewState = ReturnType<typeof pivotViewState>;
