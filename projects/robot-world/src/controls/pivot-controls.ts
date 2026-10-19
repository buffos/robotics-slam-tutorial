import type { PivotRotationSelection } from "../simulation/pivot-rotation";

/** Native inspection input and the explicit apply action; no robot state here. */
export class PivotControls {
  private readonly events = new AbortController();

  constructor(
    private readonly pivotSelect: HTMLSelectElement,
    private readonly angleInput: HTMLInputElement,
    private readonly applyButton: HTMLButtonElement,
  ) {}

  read(): PivotRotationSelection {
    return {
      pivotId: this.pivotSelect.value,
      // The browser displays degrees; physical commands use radians.
      angle: (this.angleInput.valueAsNumber * Math.PI) / 180,
    };
  }

  bindApply(action: (selection: PivotRotationSelection) => void): void {
    this.applyButton.addEventListener("click", () => action(this.read()), {
      signal: this.events.signal,
    });
  }

  resetAngle(): void {
    // A successful apply starts the next preview at zero relative rotation.
    this.angleInput.value = "0";
  }

  dispose(): void {
    this.events.abort();
  }
}
