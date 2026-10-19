import "./view/style.css";
import { DriveControls } from "./controls/drive-controls";
import { FrameControls } from "./controls/frame-controls";
import { PivotControls } from "./controls/pivot-controls";
import {
  pivotRotationSnapshot,
  resolveRotationPivot,
} from "./simulation/pivot-rotation";
import { coordinateFrameSnapshot } from "./simulation/coordinate-frames";
import { RobotSimulation } from "./simulation/robot-simulation";
import { DEFAULT_WORLD } from "./simulation/world";
import { ArenaView } from "./view/arena-view";
import { PlaygroundPanel } from "./view/playground-panel";
import { FramePanel } from "./view/frame-panel";
import { PivotPanel } from "./view/pivot-panel";

function start(): void {
  // Compose the independent model, input adapter, scene, and page presentation.
  const world = DEFAULT_WORLD;
  const simulation = new RobotSimulation(world);
  const panel = new PlaygroundPanel(world);
  const view = new ArenaView(panel.canvas, world);
  const drive = new DriveControls(panel.canvas, panel.driveButtons);
  const framePanel = new FramePanel(world);
  const frameControls = new FrameControls(
    framePanel.landmarkSelect,
    framePanel.axesToggle,
  );
  const pivotPanel = new PivotPanel(world);
  const pivotControls = new PivotControls(
    pivotPanel.pivotSelect,
    pivotPanel.angleInput,
    pivotPanel.applyButton,
  );

  function renderState(): void {
    const inspection = frameControls.read();
    const landmark = world.landmarks.find(
      (item) => item.id === inspection.landmarkId,
    );
    if (!landmark) throw new Error("Select a landmark defined in the world.");
    const pose = simulation.pose;
    // Physical transforms are calculated once. The mesh and table read that
    // same instant; camera movement and DOM formatting cannot change it.
    const frames = coordinateFrameSnapshot(
      pose,
      world.robot.sensorMount,
      landmark,
    );
    const rotation = pivotControls.read();
    const pivot = resolveRotationPivot(rotation.pivotId, pose, world);
    const preview = pivotRotationSnapshot(
      pose,
      { pivot, angle: rotation.angle },
      world,
    );
    view.render(
      frames,
      inspection.axesVisible,
      simulation.paused ? preview : null,
    );
    panel.renderPose(pose);
    framePanel.render(frames);
    pivotPanel.render(preview, simulation.paused);
  }

  pivotControls.bindApply((selection) => {
    drive.clear();
    const pivot = resolveRotationPivot(
      selection.pivotId,
      simulation.pose,
      world,
    );
    if (simulation.rotateAboutPivot({ pivot, angle: selection.angle }))
      pivotControls.resetAngle();
    renderState();
  });

  panel.bindActions({
    onPause: () => {
      drive.clear();
      simulation.togglePause();
      panel.setPaused(simulation.paused);
      renderState();
    },
    onReset: () => {
      drive.clear();
      simulation.reset();
      pivotControls.resetAngle();
      renderState();
    },
    onCamera: (camera) => {
      drive.clear();
      view.setCamera(camera);
      panel.setCamera(camera);
    },
  });
  panel.setPaused(simulation.paused);
  panel.setCamera("top");
  renderState();

  let previous = performance.now();
  let frame = 0;
  function animate(now: number): void {
    // 1. Sample held input; 2. advance the model by elapsed seconds.
    simulation.update(drive.read(), Math.max(0, now - previous) / 1000);
    previous = now;
    // 3. Derive frame geometry, then display the shared pose and frame snapshot.
    renderState();
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  import.meta.hot?.dispose(() => {
    cancelAnimationFrame(frame);
    panel.dispose();
    drive.dispose();
    pivotControls.dispose();
    view.dispose();
  });
}

try {
  start();
} catch (error) {
  PlaygroundPanel.showUnavailable();
  console.error("Robot world could not start.", error);
}
