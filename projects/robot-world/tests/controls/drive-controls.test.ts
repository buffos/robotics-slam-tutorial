// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DriveControls } from "../../src/controls/drive-controls";

let canvas: HTMLCanvasElement;
let forward: HTMLButtonElement;
let left: HTMLButtonElement;
let controls: DriveControls;

function key(
  target: HTMLElement,
  type: "keydown" | "keyup",
  code: string,
  modifiers: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    ...modifiers,
    code,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function pointer(
  target: HTMLElement,
  type: string,
  pointerId = 1,
  button = 0,
): void {
  target.dispatchEvent(
    new PointerEvent(type, { pointerId, button, cancelable: true }),
  );
}

beforeEach(() => {
  document.body.innerHTML =
    '<canvas tabindex="0"></canvas><button data-drive="KeyW"></button><button data-drive="KeyA"></button>';
  canvas = document.querySelector("canvas")!;
  [forward, left] = [...document.querySelectorAll("button")] as [
    HTMLButtonElement,
    HTMLButtonElement,
  ];
  // A DOM test has no physical pointer. Browser smoke coverage checks capture off-button.
  forward.setPointerCapture = vi.fn();
  left.setPointerCapture = vi.fn();
  controls = new DriveControls(canvas, [forward, left]);
});

afterEach(() => {
  controls.dispose();
  document.body.replaceChildren();
});

describe("drive input lifecycle", () => {
  it("focuses the canvas for keyboard driving when clicked", () => {
    pointer(canvas, "pointerdown");
    expect(document.activeElement).toBe(canvas);
  });

  it("retains an alias until both held keys are released", () => {
    expect(key(canvas, "keydown", "KeyW").defaultPrevented).toBe(true);
    key(canvas, "keydown", "ArrowUp");
    key(canvas, "keyup", "KeyW");
    expect(controls.read()).toEqual({ forward: 1, turn: 0 });
    key(canvas, "keyup", "ArrowUp");
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("does not intercept unrelated keys", () => {
    expect(key(canvas, "keydown", "KeyQ").defaultPrevented).toBe(false);
    expect(key(canvas, "keyup", "KeyQ").defaultPrevented).toBe(false);
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
    "leaves browser shortcuts unchanged with %j",
    (modifiers) => {
      expect(key(canvas, "keydown", "KeyW", modifiers).defaultPrevented).toBe(
        false,
      );
      expect(controls.read()).toEqual({ forward: 0, turn: 0 });
      expect(key(canvas, "keyup", "KeyW", modifiers).defaultPrevented).toBe(
        false,
      );
    },
  );

  it("releases a held key even if a modifier is added before keyup", () => {
    key(canvas, "keydown", "KeyW");
    key(canvas, "keyup", "KeyW", { ctrlKey: true });
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("clears keyboard driving when the canvas loses focus", () => {
    key(canvas, "keydown", "KeyW");
    key(canvas, "keydown", "KeyA");
    canvas.dispatchEvent(new Event("blur"));
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("tracks multiple pointers independently", () => {
    pointer(forward, "pointerdown", 1);
    pointer(left, "pointerdown", 2);
    expect(controls.read()).toEqual({ forward: 1, turn: 1 });
    expect(forward.dataset.active).toBe("true");
    pointer(forward, "pointerup", 1);
    expect(controls.read()).toEqual({ forward: 0, turn: 1 });
    expect(forward.dataset.active).toBe("false");
    pointer(left, "pointerup", 2);
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it.each(["pointerup", "pointercancel", "lostpointercapture"])(
    "stops a pointer command on %s",
    (release) => {
      pointer(forward, "pointerdown");
      pointer(forward, release);
      expect(controls.read()).toEqual({ forward: 0, turn: 0 });
      expect(forward.dataset.active).toBe("false");
    },
  );

  it("ignores non-primary pointer buttons", () => {
    pointer(forward, "pointerdown", 1, 2);
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("supports holding Space or Enter on focused drive buttons", () => {
    key(forward, "keydown", "Enter");
    key(left, "keydown", "Space");
    expect(controls.read()).toEqual({ forward: 1, turn: 1 });
    key(left, "keyup", "Space");
    expect(controls.read()).toEqual({ forward: 1, turn: 0 });
    forward.dispatchEvent(new Event("blur"));
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("leaves unrelated button keys to the browser", () => {
    expect(key(forward, "keydown", "Tab").defaultPrevented).toBe(false);
    expect(key(forward, "keyup", "Tab").defaultPrevented).toBe(false);
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("does not drive from modified Enter on a button", () => {
    expect(
      key(forward, "keydown", "Enter", { altKey: true }).defaultPrevented,
    ).toBe(false);
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
    key(forward, "keydown", "Enter");
    key(forward, "keyup", "Enter", { altKey: true });
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it("combines keyboard and pointer input without amplifying speed", () => {
    key(canvas, "keydown", "KeyW");
    pointer(forward, "pointerdown");
    pointer(left, "pointerdown", 2);
    expect(controls.read()).toEqual({ forward: 1, turn: 1 });
    pointer(forward, "pointerup");
    expect(controls.read()).toEqual({ forward: 1, turn: 1 });
  });

  it.each(["blur", "visibilitychange"])("clears all input on %s", (event) => {
    key(canvas, "keydown", "KeyW");
    key(left, "keydown", "Space");
    pointer(forward, "pointerdown");
    (event === "blur" ? window : document).dispatchEvent(new Event(event));
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
    expect(forward.dataset.active).toBe("false");
    expect(left.dataset.active).toBe("false");
  });

  it("stops and removes event listeners when disposed", () => {
    pointer(forward, "pointerdown");
    controls.dispose();
    key(canvas, "keydown", "KeyW");
    pointer(left, "pointerdown");
    expect(controls.read()).toEqual({ forward: 0, turn: 0 });
  });

  it.each([undefined, "KeyQ"])(
    "rejects an invalid drive button key %s",
    (value) => {
      const invalid = document.createElement("button");
      if (value) invalid.dataset.drive = value;
      expect(() => new DriveControls(canvas, [invalid])).toThrow(
        "supported data-drive key",
      );
    },
  );
});
