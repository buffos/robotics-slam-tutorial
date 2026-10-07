import { DRIVE_KEYS, driveCommandFromKeys } from "./drive-command";
import type { DriveCommand } from "../simulation/robot-state";

function isBrowserShortcut(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey;
}

export class DriveControls {
  // Remember which keys are held between animation frames. A Set makes browser
  // key-repeat harmless: repeated keydown events do not amplify the command.
  private readonly keyboard = new Set<string>();
  private readonly buttonKeyboard = new Map<HTMLButtonElement, string>();
  private readonly pointers = new Map<number, string>();
  private readonly listeners = new AbortController();

  constructor(
    canvas: HTMLCanvasElement,
    private readonly buttons: readonly HTMLButtonElement[],
  ) {
    for (const button of buttons) {
      if (!button.dataset.drive || !DRIVE_KEYS.has(button.dataset.drive)) {
        throw new Error(
          "Each drive button must declare a supported data-drive key.",
        );
      }
    }
    const options = { signal: this.listeners.signal };
    canvas.addEventListener("pointerdown", () => canvas.focus(), options);
    canvas.addEventListener(
      "keydown",
      (event) => {
        if (!DRIVE_KEYS.has(event.code) || isBrowserShortcut(event)) return;
        event.preventDefault();
        // Record intent here; main.ts samples it with read() on each frame.
        // Motion belongs to the simulation, not to the keydown event rate.
        this.keyboard.add(event.code);
      },
      options,
    );
    canvas.addEventListener(
      "keyup",
      (event) => {
        if (!DRIVE_KEYS.has(event.code)) return;
        // Releasing a key removes its intent from the next read().
        this.keyboard.delete(event.code);
        if (!isBrowserShortcut(event)) event.preventDefault();
      },
      options,
    );
    // A lost focus/visibility can hide a keyup event. Clear held input to avoid
    // continuing to drive after the user has left the canvas or browser tab.
    canvas.addEventListener("blur", () => this.keyboard.clear(), options);
    window.addEventListener("blur", () => this.clear(), options);
    document.addEventListener("visibilitychange", () => this.clear(), options);

    for (const button of buttons) {
      const key = button.dataset.drive!;
      button.addEventListener(
        "pointerdown",
        (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          button.setPointerCapture(event.pointerId);
          this.pointers.set(event.pointerId, key);
          this.updateButtons();
        },
        options,
      );
      const release = (event: PointerEvent): void => {
        this.pointers.delete(event.pointerId);
        this.updateButtons();
      };
      button.addEventListener("pointerup", release, options);
      button.addEventListener("pointercancel", release, options);
      button.addEventListener("lostpointercapture", release, options);
      button.addEventListener(
        "keydown",
        (event) => {
          if (event.code !== "Space" && event.code !== "Enter") return;
          if (isBrowserShortcut(event)) return;
          event.preventDefault();
          this.buttonKeyboard.set(button, key);
          this.updateButtons();
        },
        options,
      );
      button.addEventListener(
        "keyup",
        (event) => {
          if (event.code !== "Space" && event.code !== "Enter") return;
          this.buttonKeyboard.delete(button);
          if (!isBrowserShortcut(event)) event.preventDefault();
          this.updateButtons();
        },
        options,
      );
      button.addEventListener(
        "blur",
        () => {
          this.buttonKeyboard.delete(button);
          this.updateButtons();
        },
        options,
      );
    }
  }

  read(): DriveCommand {
    // Merge held input sources without double-counting, then expose only the
    // simulation's command type. No keyboard or pointer event enters the model.
    return driveCommandFromKeys(
      new Set([
        ...this.keyboard,
        ...this.pointers.values(),
        ...this.buttonKeyboard.values(),
      ]),
    );
  }

  clear(): void {
    // Pause, reset, and camera actions call this before changing application state.
    this.keyboard.clear();
    this.buttonKeyboard.clear();
    this.pointers.clear();
    this.updateButtons();
  }

  dispose(): void {
    this.clear();
    this.listeners.abort();
  }

  private updateButtons(): void {
    const active = new Set([
      ...this.pointers.values(),
      ...this.buttonKeyboard.values(),
    ]);
    for (const button of this.buttons) {
      button.dataset.active = String(active.has(button.dataset.drive ?? ""));
    }
  }
}
