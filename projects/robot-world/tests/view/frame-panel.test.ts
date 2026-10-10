// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import page from "../../index.html?raw";
import { coordinateFrameSnapshot } from "../../src/simulation/coordinate-frames";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import { FramePanel } from "../../src/view/frame-panel";

let panel: FramePanel;
beforeEach(() => {
  const markup = new DOMParser().parseFromString(page, "text/html");
  markup.querySelectorAll("script").forEach((script) => script.remove());
  document.body.innerHTML = markup.body.innerHTML;
  panel = new FramePanel(DEFAULT_WORLD);
});
afterEach(() => document.body.replaceChildren());

function text(id: string): string | null {
  return document.getElementById(id)!.textContent;
}

describe("coordinate-frame page presentation", () => {
  it("populates the real native controls and describes the physical mount", () => {
    expect(
      [...panel.landmarkSelect.options].map((option) => option.value),
    ).toEqual(["L1", "L2", "L3", "L4", "L5", "L6"]);
    expect(panel.landmarkSelect.value).toBe("L1");
    expect(panel.axesToggle.checked).toBe(true);
    expect(text("sensor-mount")).toBe(
      "Sensor origin in robot: (0.25, 0.10) m, heading 30°.",
    );
  });

  it("formats the known three-frame example while preserving full precision", () => {
    const snapshot = coordinateFrameSnapshot(
      { x: 2, y: 1, heading: Math.PI / 2 },
      DEFAULT_WORLD.robot.sensorMount,
      { id: "L3", x: 5, y: 2 },
    );
    const original = structuredClone(snapshot);
    panel.render(snapshot);
    expect([text("frame-world-x"), text("frame-world-y")]).toEqual([
      "5.00",
      "2.00",
    ]);
    expect([text("frame-robot-x"), text("frame-robot-y")]).toEqual([
      "1.00",
      "-3.00",
    ]);
    expect([text("frame-sensor-x"), text("frame-sensor-y")]).toEqual([
      "-0.90",
      "-3.06",
    ]);
    expect(snapshot).toEqual(original);
  });

  it("updates readouts without changing the learner's inspection choices", () => {
    panel.landmarkSelect.value = "L3";
    panel.axesToggle.checked = false;
    panel.render(
      coordinateFrameSnapshot(
        { x: 0, y: 0, heading: 0 },
        DEFAULT_WORLD.robot.sensorMount,
        { id: "L3", x: 5, y: 2 },
      ),
    );
    expect(text("frame-robot-x")).toBe("5.00");
    expect(panel.landmarkSelect.value).toBe("L3");
    expect(panel.axesToggle.checked).toBe(false);
  });
});
