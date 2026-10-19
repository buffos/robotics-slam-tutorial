import { DEFAULT_WORLD } from "./world";
import type { DriveCommand, RobotPose } from "./robot-state";
import type { WorldDefinition } from "./world";
import { poseFitsWorld, rotatePoseAboutPivot } from "./pivot-rotation";
import type { PivotRotationCommand } from "./pivot-rotation";

export const MAX_STEP_SECONDS = 0.05;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

/** Owns robot state. Inputs are commands and seconds; the output is a pose. */
export class RobotSimulation {
  private currentPose: RobotPose;
  private isPaused = false;

  constructor(readonly world: WorldDefinition = DEFAULT_WORLD) {
    this.currentPose = { ...world.robot.startPose };
  }

  get pose(): RobotPose {
    // Return a snapshot so a view or caller cannot change the internal state.
    return { ...this.currentPose };
  }

  get paused(): boolean {
    return this.isPaused;
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  reset(): void {
    // Reset the pose only; a paused experiment stays paused for inspection.
    this.currentPose = { ...this.world.robot.startPose };
  }

  /** Apply a paused geometry experiment atomically; reject an invalid footprint. */
  rotateAboutPivot(command: PivotRotationCommand): boolean {
    const candidate = rotatePoseAboutPivot(this.currentPose, command);
    if (!this.isPaused || !poseFitsWorld(candidate, this.world)) return false;
    this.currentPose = candidate;
    return true;
  }

  update(command: DriveCommand, elapsedSeconds: number): void {
    // Validate at the boundary before invalid numbers can enter the state.
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new RangeError("Elapsed time must be finite and non-negative.");
    }
    if (!Number.isFinite(command.forward) || !Number.isFinite(command.turn)) {
      throw new RangeError("Drive commands must be finite.");
    }
    if (this.isPaused || elapsedSeconds === 0) return;

    // Drop excess time after a browser stall instead of teleporting the robot.
    const step = Math.min(elapsedSeconds, MAX_STEP_SECONDS);
    const robot = this.world.robot;
    // A normalized command scales speed. Speed × seconds gives meters/radians.
    const distance = clamp(command.forward, -1, 1) * robot.linearSpeed * step;
    const turn = clamp(command.turn, -1, 1) * robot.angularSpeed * step;
    // During a combined drive and turn, approximate translation using the
    // halfway heading. Using only the old heading would bias the curved path.
    const middleHeading = this.currentPose.heading + turn / 2;
    const heading = this.currentPose.heading + turn;
    // Constrain the center by the footprint radius so the whole robot fits.
    const xLimit = this.world.width / 2 - robot.radius;
    const yLimit = this.world.height / 2 - robot.radius;

    this.currentPose = {
      // Project forward distance onto the world's x/y axes, then apply walls.
      x: clamp(
        this.currentPose.x + Math.cos(middleHeading) * distance,
        -xLimit,
        xLimit,
      ),
      y: clamp(
        this.currentPose.y + Math.sin(middleHeading) * distance,
        -yLimit,
        yLimit,
      ),
      // Wrap to [-π, π] without changing the direction the robot faces.
      heading: Math.atan2(Math.sin(heading), Math.cos(heading)),
    };
  }
}
