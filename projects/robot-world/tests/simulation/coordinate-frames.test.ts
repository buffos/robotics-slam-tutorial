import { describe, expect, it } from "vitest";
import { coordinateFrameSnapshot } from "../../src/simulation/coordinate-frames";
import { transformPoint } from "../../src/simulation/rigid-transform";
import { DEFAULT_WORLD } from "../../src/simulation/world";

describe("world, robot, and sensor frames", () => {
  const pose = { x: 2, y: 1, heading: Math.PI / 2 };
  const mount = DEFAULT_WORLD.robot.sensorMount;
  const landmark = { id: "L3", x: 5, y: 2 };

  it("expresses the notebook's fixed landmark in all three frames", () => {
    const snapshot = coordinateFrameSnapshot(pose, mount, landmark);
    expect(snapshot.landmark.world).toEqual({ x: 5, y: 2 });
    expect(snapshot.landmark.robot.x).toBeCloseTo(1);
    expect(snapshot.landmark.robot.y).toBeCloseTo(-3);
    // Inverse sensor rotation: R(-30°) [0.75, -3.1].
    expect(snapshot.landmark.sensor.x).toBeCloseTo(
      (0.75 * Math.sqrt(3)) / 2 - 1.55,
    );
    expect(snapshot.landmark.sensor.y).toBeCloseTo(
      -0.375 - (3.1 * Math.sqrt(3)) / 2,
    );
    const recovered = transformPoint(
      snapshot.worldFromSensor,
      snapshot.landmark.sensor,
    );
    expect(recovered.x).toBeCloseTo(5);
    expect(recovered.y).toBeCloseTo(2);
  });

  it("keeps world coordinates and the mounting pose fixed during robot motion", () => {
    const before = coordinateFrameSnapshot(pose, mount, landmark);
    const after = coordinateFrameSnapshot(
      { x: -1, y: 2, heading: -0.4 },
      mount,
      landmark,
    );
    expect(after.landmark.world).toEqual(before.landmark.world);
    expect(after.robotFromSensor).toEqual(before.robotFromSensor);
    expect(after.worldFromSensor).not.toEqual(before.worldFromSensor);
    expect(after.landmark.robot).not.toEqual(before.landmark.robot);
    expect(after.landmark.sensor).not.toEqual(before.landmark.sensor);
  });

  it("changes only the selected point when another landmark is inspected", () => {
    const before = coordinateFrameSnapshot(pose, mount, landmark);
    const after = coordinateFrameSnapshot(pose, mount, {
      id: "L2",
      x: 1,
      y: 4,
    });
    expect(after.worldFromRobot).toEqual(before.worldFromRobot);
    expect(after.worldFromSensor).toEqual(before.worldFromSensor);
    expect(after.landmark.id).toBe("L2");
    expect(after.landmark.world).toEqual({ x: 1, y: 4 });
  });

  it("returns independent snapshots and leaves inputs unchanged", () => {
    const mutablePose = { ...pose };
    const mutableMount = { ...mount };
    const mutableLandmark = { ...landmark };
    const snapshot = coordinateFrameSnapshot(
      mutablePose,
      mutableMount,
      mutableLandmark,
    );
    mutablePose.x = 9;
    mutableMount.y = 9;
    mutableLandmark.x = 9;
    expect(snapshot.worldFromRobot.x).toBe(2);
    expect(snapshot.robotFromSensor.y).toBe(0.1);
    expect(snapshot.landmark.world.x).toBe(5);
    const frozen = coordinateFrameSnapshot(
      Object.freeze(pose),
      Object.freeze(mount),
      Object.freeze(landmark),
    );
    expect(frozen).toEqual(snapshot);
  });
});
