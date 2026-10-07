import { describe, expect, it } from "vitest";
import { driveCommandFromKeys } from "../../src/controls/drive-command";

describe("manual drive commands", () => {
  it("stops when no driving keys are held", () => {
    expect(driveCommandFromKeys(new Set())).toEqual({ forward: 0, turn: 0 });
  });

  it.each([
    ["KeyW", 1, 0],
    ["ArrowUp", 1, 0],
    ["KeyS", -1, 0],
    ["ArrowDown", -1, 0],
    ["KeyA", 0, 1],
    ["ArrowLeft", 0, 1],
    ["KeyD", 0, -1],
    ["ArrowRight", 0, -1],
  ])("maps %s to its drive direction", (key, forward, turn) => {
    expect(driveCommandFromKeys(new Set([key as string]))).toEqual({
      forward,
      turn,
    });
  });

  it("combines forward driving and a left turn", () => {
    expect(driveCommandFromKeys(new Set(["KeyW", "ArrowLeft"]))).toEqual({
      forward: 1,
      turn: 1,
    });
  });

  it("cancels opposing controls", () => {
    expect(
      driveCommandFromKeys(new Set(["KeyW", "ArrowDown", "KeyA", "KeyD"])),
    ).toEqual({ forward: 0, turn: 0 });
  });

  it("does not double speed when aliases are held together", () => {
    expect(
      driveCommandFromKeys(new Set(["KeyW", "ArrowUp", "KeyA", "ArrowLeft"])),
    ).toEqual({ forward: 1, turn: 1 });
  });

  it("ignores unrelated keys", () => {
    expect(driveCommandFromKeys(new Set(["Space", "KeyQ"]))).toEqual({
      forward: 0,
      turn: 0,
    });
  });
});
