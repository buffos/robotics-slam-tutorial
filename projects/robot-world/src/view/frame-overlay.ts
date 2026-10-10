import {
  ArrowHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { sceneLabel } from "./scene-label";
import type { FrameViewState } from "./frame-view-state";

/** Labeled planar axes and a selected-point ring. This object owns graphics only. */
export class FrameOverlay {
  readonly object = new Group();
  private readonly axes = new Group();
  private readonly world = this.createFrame("W", 0xaac3d2, 2.4);
  private readonly robot = this.createFrame("R", 0x8ee4ce, 1.2);
  private readonly sensor = this.createFrame("S", 0xffb584, 0.8);
  private readonly selected = new Mesh(
    new TorusGeometry(0.5, 0.035, 8, 40),
    new MeshBasicMaterial({ color: 0xffe2a2 }),
  );

  constructor() {
    this.axes.add(this.world, this.robot, this.sensor);
    this.selected.rotation.x = Math.PI / 2;
    this.object.add(this.axes, this.selected);
  }

  render(state: FrameViewState, axesVisible: boolean): void {
    this.axes.visible = axesVisible;
    // Vertical lifts are visual spacing, not a sensor's physical z coordinate.
    this.place(this.world, state.world, 0.04);
    this.place(this.robot, state.robot, 0.6);
    this.place(this.sensor, state.sensor, 1.05);
    this.selected.position.set(state.landmark.x, 0.035, state.landmark.z);
  }

  private place(
    group: Group,
    pose: FrameViewState["robot"],
    height: number,
  ): void {
    group.position.set(pose.x, height, pose.z);
    group.rotation.y = pose.rotationY;
  }

  private createFrame(prefix: string, color: number, length: number): Group {
    const group = new Group();
    // Model +x is scene +X; model +y is scene -Z. Both are in the floor plane.
    group.add(
      new ArrowHelper(
        new Vector3(1, 0, 0),
        new Vector3(),
        length,
        color,
        0.16,
        0.09,
      ),
    );
    group.add(
      new ArrowHelper(
        new Vector3(0, 0, -1),
        new Vector3(),
        length,
        color,
        0.16,
        0.09,
      ),
    );
    group.add(
      new Mesh(
        new SphereGeometry(0.04, 12, 8),
        new MeshBasicMaterial({ color }),
      ),
    );
    const textColor = `#${color.toString(16).padStart(6, "0")}`;
    const xLabel = sceneLabel(`${prefix} x`, textColor);
    xLabel.position.set(length + 0.35, 0.12, 0);
    const yLabel = sceneLabel(`${prefix} y`, textColor);
    yLabel.position.set(0, 0.12, -length - 0.35);
    group.add(xLabel, yLabel);
    return group;
  }
}
