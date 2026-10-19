import { pageElement } from "./page-element";
import type { PivotRotationSnapshot } from "../simulation/pivot-rotation";
import type { Point2 } from "../simulation/rigid-transform";
import type { WorldDefinition } from "../simulation/world";

/** Present supplied geometry and available actions; calculation stays in simulation. */
export class PivotPanel {
  readonly pivotSelect = pageElement<HTMLSelectElement>("#rotation-pivot");
  readonly angleInput = pageElement<HTMLInputElement>("#pivot-angle");
  readonly applyButton = pageElement<HTMLButtonElement>("#apply-rotation");
  private readonly angleOutput = pageElement("#pivot-angle-value");
  private readonly position = pageElement("#pivot-position");
  private readonly radius = pageElement("#pivot-radius");
  private readonly before = pageElement("#pivot-center-before");
  private readonly after = pageElement("#pivot-center-after");
  private readonly forwardBefore = pageElement("#pivot-forward-before");
  private readonly forwardAfter = pageElement("#pivot-forward-after");
  private readonly mode = pageElement("#pivot-mode");
  private readonly status = pageElement("#pivot-status");

  constructor(world: WorldDefinition) {
    const choices = [
      ...world.landmarks.map((point) => [
        point.id,
        `${point.id} · (${point.x}, ${point.y}) m`,
      ]),
      ["world", "World origin · (0, 0) m"],
      ["robot", "Robot center · turn in place"],
    ];
    this.pivotSelect.replaceChildren(
      ...choices.map(([value, label]) => {
        const option = document.createElement("option");
        option.value = value!;
        option.textContent = label!;
        return option;
      }),
    );
    // Start with the notebook's landmark example, so the first experiment
    // moves the robot center instead of defaulting to a turn in place.
    this.pivotSelect.value =
      world.landmarks.find((point) => point.id === "L2")?.id ??
      world.landmarks[0]?.id ??
      "world";
  }

  render(snapshot: PivotRotationSnapshot, paused: boolean): void {
    const turnsInPlace = snapshot.radius === 0;
    this.applyButton.textContent = turnsInPlace
      ? "Apply turn in place"
      : "Apply orbit";
    const mode = turnsInPlace
      ? "Turn in place: the pivot is the robot center, so only the heading changes. Choose a landmark to move the center."
      : "Orbit: the center moves around the fixed point. Distance and the angle between the forward direction and the line toward that point stay constant.";
    if (this.mode.textContent !== mode) this.mode.textContent = mode;
    this.pivotSelect.disabled = !paused;
    this.angleInput.disabled = !paused;
    this.applyButton.disabled =
      !paused || !snapshot.fitsInWorld || snapshot.angle === 0;
    this.angleOutput.textContent = `${((snapshot.angle * 180) / Math.PI).toFixed(0)}°`;
    this.position.textContent = this.pair(snapshot.pivot);
    this.radius.textContent = snapshot.radius.toFixed(2);
    this.before.textContent = this.pair(snapshot.before);
    this.after.textContent = this.pair(snapshot.after);
    this.forwardBefore.textContent = this.pair(snapshot.forwardBefore);
    this.forwardAfter.textContent = this.pair(snapshot.forwardAfter);
    const message = !paused
      ? "Pause the simulation, then choose an angle to preview the orbit."
      : !snapshot.fitsInWorld
        ? "The red preview is outside the arena. Choose another angle or pivot."
        : snapshot.angle === 0
          ? "Set a nonzero angle to preview a new pose. The robot stays at its current pose until you apply it."
          : turnsInPlace
            ? "Gold previews the new heading. Apply turn in place keeps the center fixed."
            : "Gold previews a new position and heading. Apply orbit moves the robot there instantly; the pivot stays fixed.";
    // Avoid repeating an unchanged live-region message every animation frame.
    if (this.status.textContent !== message) this.status.textContent = message;
  }

  private pair(point: Point2): string {
    const format = (value: number) =>
      (Math.abs(value) < 0.005 ? 0 : value).toFixed(2);
    return `(${format(point.x)}, ${format(point.y)})`;
  }
}
