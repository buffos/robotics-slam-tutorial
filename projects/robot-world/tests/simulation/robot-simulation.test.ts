import { describe, expect, it } from "vitest";
import { RobotSimulation } from "../../src/simulation/robot-simulation";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import type { RobotSimulation as Simulation } from "../../src/simulation/robot-simulation";
import type { DriveCommand, RobotPose } from "../../src/simulation/robot-state";

function drive(
  simulation: Simulation,
  command: DriveCommand,
  steps: number,
): void {
  for (let index = 0; index < steps; index++) simulation.update(command, 0.05);
}

function atPose(pose: RobotPose): Simulation {
  return new RobotSimulation({
    ...DEFAULT_WORLD,
    robot: { ...DEFAULT_WORLD.robot, startPose: pose },
  });
}

describe("robot simulation", () => {
  it("starts at the declared world pose", () => {
    expect(new RobotSimulation().pose).toEqual({ x: 0, y: 0, heading: 0 });
  });

  it("moves 1.8 meters in one second of forward driving", () => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 1, turn: 0 }, 20);
    expect(simulation.pose.x).toBeCloseTo(1.8);
    expect(simulation.pose.y).toBe(0);
    expect(simulation.pose.heading).toBe(0);
  });

  it("reverses along its current heading", () => {
    const simulation = atPose({ x: 0, y: 0, heading: Math.PI / 2 });
    drive(simulation, { forward: -1, turn: 0 }, 20);
    expect(simulation.pose.x).toBeCloseTo(0);
    expect(simulation.pose.y).toBeCloseTo(-1.8);
  });

  it.each([1, -1])("turns in place with direction %s", (direction) => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 0, turn: direction }, 20);
    expect(simulation.pose.x).toBe(0);
    expect(simulation.pose.y).toBe(0);
    expect(simulation.pose.heading).toBeCloseTo((direction * Math.PI) / 2);
  });

  it("can drive and turn at the same time", () => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 1, turn: 1 }, 20);
    expect(simulation.pose.x).toBeGreaterThan(1);
    expect(simulation.pose.y).toBeGreaterThan(1);
    expect(simulation.pose.heading).toBeCloseTo(Math.PI / 2);
  });

  it.each([
    { heading: 0, axis: "x" as const, limit: 7.62 },
    { heading: Math.PI, axis: "x" as const, limit: -7.62 },
    { heading: Math.PI / 2, axis: "y" as const, limit: 5.62 },
    { heading: -Math.PI / 2, axis: "y" as const, limit: -5.62 },
  ])(
    "keeps the footprint inside the wall at heading $heading",
    ({ heading, axis, limit }) => {
      const simulation = atPose({ x: 0, y: 0, heading });
      drive(simulation, { forward: 1, turn: 0 }, 200);
      expect(simulation.pose[axis]).toBeCloseTo(limit);
      expect(Math.abs(simulation.pose.x) + 0.38).toBeLessThanOrEqual(8);
      expect(Math.abs(simulation.pose.y) + 0.38).toBeLessThanOrEqual(6);
      simulation.update({ forward: -1, turn: 0 }, 0.05);
      expect(Math.abs(simulation.pose[axis])).toBeLessThan(Math.abs(limit));
    },
  );

  it("allows turning at a wall", () => {
    const simulation = atPose({ x: 7.62, y: 0, heading: 0 });
    drive(simulation, { forward: 0, turn: 1 }, 20);
    expect(simulation.pose.x).toBe(7.62);
    expect(simulation.pose.heading).toBeCloseTo(Math.PI / 2);
  });

  it("keeps heading bounded after many full turns", () => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 0, turn: 1 }, 1010);
    expect(simulation.pose.heading).toBeGreaterThanOrEqual(-Math.PI);
    expect(simulation.pose.heading).toBeLessThanOrEqual(Math.PI);
    expect(simulation.pose.heading).toBeCloseTo((-3 * Math.PI) / 4);
  });

  it("caps a delayed frame to 50 milliseconds", () => {
    const simulation = new RobotSimulation();
    simulation.update({ forward: 1, turn: 0 }, 30);
    expect(simulation.pose.x).toBeCloseTo(0.09);
  });

  it("honors elapsed time for ordinary frames", () => {
    const simulation = new RobotSimulation();
    simulation.update({ forward: 1, turn: 0 }, 0.01);
    expect(simulation.pose.x).toBeCloseTo(0.018);
  });

  it("clamps excessive commands to the declared speeds", () => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 20, turn: 0 }, 20);
    expect(simulation.pose.x).toBeCloseTo(1.8);
    drive(simulation, { forward: 0, turn: -20 }, 20);
    expect(simulation.pose.heading).toBeCloseTo(-Math.PI / 2);
  });

  it("does not move while idle or when no time has passed", () => {
    const simulation = new RobotSimulation();
    simulation.update({ forward: 0, turn: 0 }, 0.05);
    simulation.update({ forward: 1, turn: 1 }, 0);
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
  });

  it("pauses motion and resumes on the next toggle", () => {
    const simulation = new RobotSimulation();
    simulation.togglePause();
    drive(simulation, { forward: 1, turn: 1 }, 20);
    expect(simulation.paused).toBe(true);
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
    simulation.togglePause();
    simulation.update({ forward: 1, turn: 0 }, 0.05);
    expect(simulation.paused).toBe(false);
    expect(simulation.pose.x).toBeCloseTo(0.09);
  });

  it("resets position and heading while preserving pause", () => {
    const simulation = new RobotSimulation();
    drive(simulation, { forward: 1, turn: 1 }, 20);
    simulation.togglePause();
    simulation.reset();
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
    expect(simulation.paused).toBe(true);
  });

  it("returns independent pose snapshots and leaves landmarks unchanged", () => {
    const simulation = new RobotSimulation();
    const snapshot = simulation.pose;
    const landmarks = structuredClone(DEFAULT_WORLD.landmarks);
    drive(simulation, { forward: 1, turn: 1 }, 20);
    expect(snapshot).toEqual({ x: 0, y: 0, heading: 0 });
    expect(DEFAULT_WORLD.landmarks).toEqual(landmarks);
  });

  it.each([-1, Infinity, NaN])("rejects invalid elapsed time %s", (elapsed) => {
    const simulation = new RobotSimulation();
    expect(() => simulation.update({ forward: 1, turn: 0 }, elapsed)).toThrow(
      RangeError,
    );
    expect(simulation.pose).toEqual(DEFAULT_WORLD.robot.startPose);
  });

  it.each([
    { forward: NaN, turn: 0 },
    { forward: 0, turn: Infinity },
  ])("rejects non-finite commands", (command) => {
    expect(() => new RobotSimulation().update(command, 0.05)).toThrow(
      RangeError,
    );
  });
});
