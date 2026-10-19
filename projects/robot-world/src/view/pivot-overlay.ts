import {
  ArrowHelper,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { sceneLabel } from "./scene-label";
import type { PivotViewState } from "./pivot-view-state";

/** Draw an already calculated preview. No mesh feeds back into physical state. */
export class PivotOverlay {
  readonly object = new Group();
  private readonly color = 0xffe2a2;
  private readonly pivot = new Mesh(
    new SphereGeometry(0.12, 16, 10),
    new MeshBasicMaterial({ color: 0xf1b9ff }),
  );
  private readonly pivotLabel = sceneLabel("Pivot", "#f1b9ff");
  // A floor ring remains visible when a landmark's mast covers the origin dot.
  private readonly pivotRing = new Mesh(
    new TorusGeometry(0.62, 0.045, 8, 48),
    new MeshBasicMaterial({ color: 0xf1b9ff }),
  );
  private readonly previewLabel = sceneLabel("Preview", "#ffffff");
  private readonly previewMaterial = new MeshBasicMaterial({
    color: this.color,
  });
  private readonly preview: Mesh;
  private readonly beforeArrow = new ArrowHelper(
    new Vector3(1, 0, 0),
    new Vector3(),
    1,
    0x8ee4ce,
    0.2,
    0.13,
  );
  private readonly afterArrow = new ArrowHelper(
    new Vector3(1, 0, 0),
    new Vector3(),
    1,
    this.color,
    0.2,
    0.13,
  );
  private readonly arcGeometry = new BufferGeometry();
  private readonly radiusGeometry = new BufferGeometry();
  private readonly lineMaterial = new LineBasicMaterial({ color: this.color });

  constructor(radius: number) {
    this.preview = new Mesh(
      new TorusGeometry(radius, 0.055, 8, 48),
      this.previewMaterial,
    );
    this.preview.rotation.x = Math.PI / 2;
    this.pivotRing.rotation.x = Math.PI / 2;
    this.arcGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(49 * 3), 3),
    );
    this.radiusGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(4 * 3), 3),
    );
    const radii = new LineSegments(
      this.radiusGeometry,
      new LineBasicMaterial({
        color: 0xf1b9ff,
        transparent: true,
        opacity: 0.5,
      }),
    );
    this.object.add(
      this.pivot,
      this.pivotRing,
      this.pivotLabel,
      this.preview,
      this.previewLabel,
      this.beforeArrow,
      this.afterArrow,
      new Line(this.arcGeometry, this.lineMaterial),
      radii,
    );
    this.object.visible = false;
  }

  render(state: PivotViewState | null): void {
    this.object.visible = state !== null;
    if (!state) return;
    const color = state.fitsInWorld ? this.color : 0xff7d85;
    this.previewMaterial.color.setHex(color);
    this.lineMaterial.color.setHex(color);
    this.afterArrow.setColor(color);
    this.pivot.position.set(state.pivot.x, 0.12, state.pivot.z);
    this.pivotRing.position.set(state.pivot.x, 0.08, state.pivot.z);
    this.pivotLabel.position.set(state.pivot.x, 0.7, state.pivot.z - 0.5);
    this.preview.position.set(state.after.x, 0.08, state.after.z);
    this.previewLabel.position.set(
      state.after.x + 1.15,
      0.9,
      state.after.z + 0.3,
    );
    this.beforeArrow.position.set(state.before.x, 0.65, state.before.z);
    this.afterArrow.position.set(state.after.x, 0.3, state.after.z);
    this.beforeArrow.setDirection(
      new Vector3(state.forwardBefore.x, 0, state.forwardBefore.z).normalize(),
    );
    this.afterArrow.setDirection(
      new Vector3(state.forwardAfter.x, 0, state.forwardAfter.z).normalize(),
    );
    const arc = this.arcGeometry.getAttribute("position");
    state.arc.forEach((point, index) =>
      arc.setXYZ(index, point.x, 0.055, point.z),
    );
    arc.needsUpdate = true;
    this.arcGeometry.computeBoundingSphere();
    const radii = this.radiusGeometry.getAttribute("position");
    [state.pivot, state.before, state.pivot, state.after].forEach(
      (point, index) => radii.setXYZ(index, point.x, 0.06, point.z),
    );
    radii.needsUpdate = true;
    this.radiusGeometry.computeBoundingSphere();
  }
}
