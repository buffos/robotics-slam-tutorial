import "./view/style.css";
import { DriveControls } from "./controls/drive-controls";
import { RobotSimulation } from "./simulation/robot-simulation";
import { DEFAULT_WORLD } from "./simulation/world";
import { ArenaView } from "./view/arena-view";
import { PlaygroundPanel } from "./view/playground-panel";

function start(): void {
  // Compose the independent model, input adapter, scene, and page presentation.
  const world = DEFAULT_WORLD;
  const simulation = new RobotSimulation(world);
  const panel = new PlaygroundPanel(world);
  const view = new ArenaView(panel.canvas, world);
  const drive = new DriveControls(panel.canvas, panel.driveButtons);

  panel.bindActions({
    onPause: () => {
      drive.clear();
      simulation.togglePause();
      panel.setPaused(simulation.paused);
    },
    onReset: () => {
      drive.clear();
      simulation.reset();
      panel.renderPose(simulation.pose);
    },
    onCamera: (camera) => {
      drive.clear();
      view.setCamera(camera);
      panel.setCamera(camera);
    },
  });
  panel.setPaused(simulation.paused);
  panel.renderPose(simulation.pose);

  let previous = performance.now();
  let frame = 0;
  function animate(now: number): void {
    // 1. Sample held input; 2. advance the model by elapsed seconds.
    simulation.update(drive.read(), Math.max(0, now - previous) / 1000);
    previous = now;
    // 3. Send the same pose snapshot to the scene and the numeric readout.
    const pose = simulation.pose;
    view.render(pose);
    panel.renderPose(pose);
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  import.meta.hot?.dispose(() => {
    cancelAnimationFrame(frame);
    panel.dispose();
    drive.dispose();
    view.dispose();
  });
}

try {
  start();
} catch (error) {
  PlaygroundPanel.showUnavailable();
  console.error("Robot world could not start.", error);
}
