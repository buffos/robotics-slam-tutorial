import { pageElement } from "./page-element";
import type { CoordinateFrameSnapshot } from "../simulation/coordinate-frames";
import type { WorldDefinition } from "../simulation/world";

/** Show frame geometry supplied by the simulation; do not calculate transforms here. */
export class FramePanel {
  readonly landmarkSelect = pageElement<HTMLSelectElement>("#frame-landmark");
  readonly axesToggle = pageElement<HTMLInputElement>("#show-frames");
  private readonly cells = {
    world: {
      x: pageElement("#frame-world-x"),
      y: pageElement("#frame-world-y"),
    },
    robot: {
      x: pageElement("#frame-robot-x"),
      y: pageElement("#frame-robot-y"),
    },
    sensor: {
      x: pageElement("#frame-sensor-x"),
      y: pageElement("#frame-sensor-y"),
    },
  };

  constructor(world: WorldDefinition) {
    this.landmarkSelect.replaceChildren(
      ...world.landmarks.map((landmark) => {
        const option = document.createElement("option");
        option.value = landmark.id;
        option.textContent = `${landmark.id} · world (${landmark.x}, ${landmark.y}) m`;
        return option;
      }),
    );
    const mount = world.robot.sensorMount;
    pageElement("#sensor-mount").textContent =
      `Sensor origin in robot: (${mount.x.toFixed(2)}, ${mount.y.toFixed(2)}) m, heading ${((mount.heading * 180) / Math.PI).toFixed(0)}°.`;
  }

  render(snapshot: CoordinateFrameSnapshot): void {
    for (const frame of ["world", "robot", "sensor"] as const) {
      const point = snapshot.landmark[frame];
      // Rounding belongs to the page. The snapshot retains full precision.
      this.cells[frame].x.textContent = point.x.toFixed(2);
      this.cells[frame].y.textContent = point.y.toFixed(2);
    }
  }
}
