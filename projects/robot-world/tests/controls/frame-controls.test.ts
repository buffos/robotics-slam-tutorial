// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { FrameControls } from "../../src/controls/frame-controls";

let select: HTMLSelectElement;
let toggle: HTMLInputElement;
let controls: FrameControls;

beforeEach(() => {
  select = document.createElement("select");
  for (const id of ["L1", "L3"]) {
    const option = document.createElement("option");
    option.value = id;
    select.append(option);
  }
  toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = true;
  controls = new FrameControls(select, toggle);
});

describe("frame inspection input", () => {
  it("samples the native selected landmark and axes choice", () => {
    expect(controls.read()).toEqual({ landmarkId: "L1", axesVisible: true });
    select.value = "L3";
    toggle.checked = false;
    expect(controls.read()).toEqual({ landmarkId: "L3", axesVisible: false });
  });

  it("returns independent snapshots without changing the input elements", () => {
    const before = controls.read();
    select.value = "L3";
    const after = controls.read();
    expect(before.landmarkId).toBe("L1");
    expect(after.landmarkId).toBe("L3");
    expect(toggle.checked).toBe(true);
  });
});
