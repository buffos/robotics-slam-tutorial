import type { RobotPose } from "../simulation/robot-state";
import type { WorldDefinition } from "../simulation/world";
import type { CameraView } from "./arena-view";

export interface PlaygroundActions {
  readonly onPause: () => void;
  readonly onReset: () => void;
  readonly onCamera: (view: CameraView) => void;
}

function element<T extends HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Required page element is missing: ${selector}`);
  return result;
}

/** Page presentation: show values and report actions to the composition layer. */
export class PlaygroundPanel {
  readonly canvas = element<HTMLCanvasElement>("#world-canvas");
  readonly driveButtons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-drive]"),
  ];
  private readonly pauseButton = element<HTMLButtonElement>("#pause-button");
  private readonly resetButton = element<HTMLButtonElement>("#reset-button");
  private readonly perspectiveButton = element<HTMLButtonElement>(
    "#perspective-button",
  );
  private readonly topButton = element<HTMLButtonElement>("#top-button");
  private readonly status = element("#simulation-status");
  private readonly poseX = element("#pose-x");
  private readonly poseY = element("#pose-y");
  private readonly poseHeading = element("#pose-heading");
  private readonly events = new AbortController();

  constructor(world: WorldDefinition) {
    element("#world-size").textContent = `${world.width} × ${world.height} m`;
    element("#robot-radius").textContent = world.robot.radius.toFixed(2);
    element("#landmark-list").replaceChildren(
      ...world.landmarks.map((landmark) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        name.className = "landmark-name";
        name.textContent = landmark.id;
        const position = document.createElement("span");
        position.className = "landmark-position";
        position.textContent = `x ${landmark.x} · y ${landmark.y}`;
        item.append(name, position);
        return item;
      }),
    );
  }

  bindActions(actions: PlaygroundActions): void {
    // Callbacks carry intent outward. The panel does not own a RobotSimulation.
    const options = { signal: this.events.signal };
    this.pauseButton.addEventListener("click", actions.onPause, options);
    this.resetButton.addEventListener("click", actions.onReset, options);
    this.perspectiveButton.addEventListener(
      "click",
      () => actions.onCamera("perspective"),
      options,
    );
    this.topButton.addEventListener(
      "click",
      () => actions.onCamera("top"),
      options,
    );
  }

  renderPose(pose: RobotPose): void {
    // Degrees and rounding are display choices; the model keeps radians and
    // full precision. Read the snapshot without modifying it.
    this.poseX.textContent = pose.x.toFixed(2);
    this.poseY.textContent = pose.y.toFixed(2);
    this.poseHeading.textContent = ((pose.heading * 180) / Math.PI).toFixed(1);
  }

  setPaused(paused: boolean): void {
    this.pauseButton.textContent = paused
      ? "Resume simulation"
      : "Pause simulation";
    this.pauseButton.setAttribute("aria-pressed", String(paused));
    this.status.textContent = paused ? "Paused" : "Running";
    this.status.dataset.state = paused ? "paused" : "running";
  }

  setCamera(view: CameraView): void {
    this.perspectiveButton.setAttribute(
      "aria-pressed",
      String(view === "perspective"),
    );
    this.topButton.setAttribute("aria-pressed", String(view === "top"));
  }

  dispose(): void {
    this.events.abort();
  }

  static showUnavailable(): void {
    element("#webgl-error").hidden = false;
    element("#world-canvas").hidden = true;
    const status = element("#simulation-status");
    status.textContent = "Unavailable";
    status.dataset.state = "paused";
    document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
      button.disabled = true;
    });
  }
}
