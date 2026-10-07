import type { DriveCommand } from "../simulation/robot-state";

export const DRIVE_KEYS = new Set([
  "KeyW",
  "KeyS",
  "KeyA",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export function driveCommandFromKeys(keys: ReadonlySet<string>): DriveCommand {
  // Aliases express the same intent: W + Up still means one forward command.
  const forward = keys.has("KeyW") || keys.has("ArrowUp");
  const reverse = keys.has("KeyS") || keys.has("ArrowDown");
  const left = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  return {
    // Opposing intents cancel. Forward and turn remain independent, so W + A
    // requests forward motion and a left turn in the same simulation update.
    forward: Number(forward) - Number(reverse),
    turn: Number(left) - Number(right),
  };
}
