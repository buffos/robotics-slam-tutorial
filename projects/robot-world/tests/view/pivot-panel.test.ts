// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import page from "../../index.html?raw";
import { pivotRotationSnapshot } from "../../src/simulation/pivot-rotation";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import { PivotPanel } from "../../src/view/pivot-panel";

let panel: PivotPanel;
beforeEach(() => {
  const markup = new DOMParser().parseFromString(page, "text/html");
  markup.querySelectorAll("script").forEach((script) => script.remove());
  document.body.innerHTML = markup.body.innerHTML;
  panel = new PivotPanel(DEFAULT_WORLD);
});
afterEach(() => document.body.replaceChildren());
const text = (id: string) => document.getElementById(id)!.textContent;
const preview = (angle = Math.PI / 2, pivot = { x: 1, y: 4 }) =>
  pivotRotationSnapshot(
    DEFAULT_WORLD.robot.startPose,
    { pivot, angle },
    DEFAULT_WORLD,
  );

describe("pivot preview presentation", () => {
  it("starts with the notebook's landmark orbit and offers turning in place separately", () => {
    expect([...panel.pivotSelect.options].map((item) => item.value)).toEqual([
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "world",
      "robot",
    ]);
    expect(panel.pivotSelect.value).toBe("L2");
  });

  it("formats the shared example without modifying its physical geometry", () => {
    const snapshot = preview();
    const before = structuredClone(snapshot);
    panel.pivotSelect.value = "L2";
    panel.angleInput.value = "90";
    panel.render(snapshot, true);
    expect(text("pivot-center-before")).toBe("(0.00, 0.00)");
    expect(text("pivot-center-after")).toBe("(5.00, 3.00)");
    expect(text("pivot-forward-before")).toBe("(1.00, 0.00)");
    expect(text("pivot-forward-after")).toBe("(0.00, 1.00)");
    expect(text("pivot-position")).toBe("(1.00, 4.00)");
    expect(text("pivot-radius")).toBe("4.12");
    expect(text("pivot-angle-value")).toBe("90°");
    expect(panel.applyButton.disabled).toBe(false);
    expect(panel.applyButton.textContent).toBe("Apply orbit");
    expect(text("pivot-mode")).toContain("center moves around the fixed point");
    expect(text("pivot-status")).toContain("new position and heading");
    expect(snapshot).toEqual(before);
    expect(panel.pivotSelect.value).toBe("L2");
    expect(panel.angleInput.value).toBe("90");
  });

  it("disables editing while running and explains rejected or zero rotations", () => {
    panel.render(preview(), false);
    expect(panel.pivotSelect.disabled).toBe(true);
    expect(panel.angleInput.disabled).toBe(true);
    expect(panel.applyButton.disabled).toBe(true);
    expect(text("pivot-status")).toContain("Pause");
    panel.render(preview(Math.PI, { x: 5, y: 2 }), true);
    expect(panel.pivotSelect.disabled).toBe(false);
    expect(panel.applyButton.disabled).toBe(true);
    expect(text("pivot-status")).toContain("outside the arena");
    panel.render(preview(0), true);
    expect(panel.applyButton.disabled).toBe(true);
    expect(text("pivot-status")).toContain("Set a nonzero angle");
  });

  it("explains when the selected point gives a turn in place instead of an orbit", () => {
    panel.pivotSelect.value = "robot";
    panel.render(preview(Math.PI / 2, { x: 0, y: 0 }), true);
    expect(panel.applyButton.textContent).toBe("Apply turn in place");
    expect(text("pivot-mode")).toContain("only the heading changes");
    expect(text("pivot-center-after")).toBe("(0.00, 0.00)");
    expect(text("pivot-status")).toContain("keeps the center fixed");
  });
});
