import { inverse, Matrix } from "ml-matrix";

/** A point in a named planar frame. Distances use meters. */
export interface Point2 {
  readonly x: number;
  readonly y: number;
}

/**
 * A source frame's pose in a target frame. The translation is the source
 * origin expressed in target meters; heading is counterclockwise in radians.
 * Name values targetFromSource, for example worldFromRobot.
 */
export interface RigidTransform2 extends Point2 {
  readonly heading: number;
}

export const IDENTITY_TRANSFORM: RigidTransform2 = Object.freeze({
  x: 0,
  y: 0,
  heading: 0,
});

function validatePoint(point: Point2): void {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new RangeError("Point coordinates must be finite.");
  }
}

function validateTransform(transform: RigidTransform2): void {
  validatePoint(transform);
  if (!Number.isFinite(transform.heading)) {
    throw new RangeError("Transform heading must be finite.");
  }
}

/** Build T_target_source = [R t; 0 0 1], with one array per matrix row. */
function toHomogeneousMatrix(transform: RigidTransform2): Matrix {
  validateTransform(transform);
  const cosine = Math.cos(transform.heading);
  const sine = Math.sin(transform.heading);
  return new Matrix([
    [cosine, -sine, transform.x],
    [sine, cosine, transform.y],
    [0, 0, 1],
  ]);
}

/** Read the source origin and orientation from a computed rigid matrix. */
function fromHomogeneousMatrix(matrix: Matrix): RigidTransform2 {
  return {
    x: matrix.get(0, 2),
    y: matrix.get(1, 2),
    // The first column is the source +x unit axis in target coordinates.
    // atan2 reads its direction in [-π, π]; no physical rotation is added.
    heading: Math.atan2(matrix.get(1, 0), matrix.get(0, 0)),
  };
}

/** Express a source-frame point in the target frame: p_target = R p_source + t. */
export function transformPoint(
  targetFromSource: RigidTransform2,
  pointInSource: Point2,
): Point2 {
  const matrix = toHomogeneousMatrix(targetFromSource);
  validatePoint(pointInSource);
  // The extra 1 lets the translation column contribute to the point's position.
  const homogeneousPoint = Matrix.columnVector([
    pointInSource.x,
    pointInSource.y,
    1,
  ]);
  const pointInTarget = matrix.mmul(homogeneousPoint);
  return {
    x: pointInTarget.get(0, 0),
    y: pointInTarget.get(1, 0),
  };
}

/**
 * Compose source → middle → target. The right-hand transform acts first,
 * exactly as in the homogeneous product T_target_middle T_middle_source.
 */
export function composeTransforms(
  targetFromMiddle: RigidTransform2,
  middleFromSource: RigidTransform2,
): RigidTransform2 {
  const targetFromSource = toHomogeneousMatrix(targetFromMiddle).mmul(
    toHomogeneousMatrix(middleFromSource),
  );
  return fromHomogeneousMatrix(targetFromSource);
}

/**
 * Reverse direction: R_inverse = Rᵀ and t_inverse = -Rᵀ t.
 * Reading the inverse matrix expresses its heading in [-π, π].
 */
export function invertTransform(
  targetFromSource: RigidTransform2,
): RigidTransform2 {
  const sourceFromTarget = inverse(toHomogeneousMatrix(targetFromSource));
  return fromHomogeneousMatrix(sourceFromTarget);
}
