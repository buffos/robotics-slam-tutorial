// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PivotControls } from "../../src/controls/pivot-controls";

let select: HTMLSelectElement;
let slider: HTMLInputElement;
let button: HTMLButtonElement;
let controls: PivotControls;
beforeEach(() => {
  select = document.createElement("select");
  for (const value of ["robot", "L2"]) {
    const option = document.createElement("option");
    option.value = value;
    select.append(option);
  }
  slider = document.createElement("input");
  slider.type = "range";
  slider.min = "-180";
  slider.max = "180";
  slider.value = "0";
  button = document.createElement("button");
  controls = new PivotControls(select, slider, button);
});

describe("pivot rotation input", () => {
  it("samples native values and converts signed degrees to radians", () => {
    const before = controls.read();
    select.value = "L2";
    slider.value = "-90";
    expect(controls.read()).toEqual({ pivotId: "L2", angle: -Math.PI / 2 });
    expect(before).toEqual({ pivotId: "robot", angle: 0 });
  });

  it("applies only an explicit action and removes the listener on disposal", () => {
    const apply = vi.fn();
    controls.bindApply(apply);
    select.value = "L2";
    slider.value = "90";
    slider.dispatchEvent(new Event("input"));
    expect(apply).not.toHaveBeenCalled();
    button.click();
    expect(apply).toHaveBeenCalledWith({ pivotId: "L2", angle: Math.PI / 2 });
    controls.dispose();
    button.click();
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("resets the relative angle while preserving the selected pivot", () => {
    select.value = "L2";
    slider.value = "45";
    controls.resetAngle();
    expect(controls.read()).toEqual({ pivotId: "L2", angle: 0 });
  });
});
