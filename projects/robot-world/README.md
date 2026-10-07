# Robot world

A standalone TypeScript and Three.js playground for [episode 001](../../episodes/001-robot-world/README.md). Drive a robot on a bounded floor with six fixed landmarks, and inspect it with orbit, pan, zoom, and camera presets.

## Setup

Use Node.js 22.x starting at 22.12, Node.js 24.x, or Node.js 26 or later, with npm. Run these commands from this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The browser needs WebGL 2. The application uses local npm dependencies and requires no external assets or API keys.

## Controls

| Action                        | Control                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| Focus keyboard driving        | Click the scene, or Tab to the canvas.                                  |
| Forward / reverse             | Hold W / S or Up / Down.                                                |
| Turn left / right             | Hold A / D or Left / Right.                                             |
| Drive with a pointer or touch | Hold a drive button.                                                    |
| Orbit the camera              | Left-drag in Perspective view, or drag with one finger.                 |
| Pan                           | Right-drag, modifier + left-drag, or drag with two fingers.             |
| Zoom                          | Scroll, middle-drag, or pinch with two fingers.                         |
| Inspect from above            | Top view. Rotation is disabled in this preset; pan and zoom still work. |
| Return to the starting camera | Perspective.                                                            |
| Stop / resume motion          | Pause simulation / Resume simulation.                                   |
| Restore the starting pose     | Reset robot. Pause state stays unchanged.                               |

You can also focus a drive button with Tab and hold Space or Enter. Releasing a drive control stops that command. Losing canvas focus, window focus, or tab visibility clears held keyboard input. Pointer release, cancellation, and lost capture clear held pointer input. Simulation actions clear all held input. Ctrl, Command, and Alt shortcuts retain their browser behavior.

The pose readout is ground truth. Landmarks do not block the robot, and the model does not simulate acceleration or wheel dynamics. Position uses meters; heading is stored in radians and displayed in degrees. Heading zero faces positive x, with positive turns toward positive y. An update uses the midpoint heading for translation and caps elapsed time at 50 milliseconds.

## Check and build

```sh
npm run check
```

This checks formatting, runs the full Vitest suite, performs strict TypeScript checking, and builds the production app with Vite. The simulation also compiles separately without DOM types or browser globals. Tests cover the simulator, key-to-command conversion, DOM input lifecycle, pose-to-rendering contract, page actions and readouts, and responsive camera framing. To run tests while editing, use `npm run test:watch`. Use `npm run format` to format the project.

To inspect the production build:

```sh
npm run preview
```

Browser smoke steps and their recorded results live in the [episode guide](../../episodes/001-robot-world/README.md#verification-plan).

## Code map

```text
src/
  main.ts                       Compose components; read → update → render
  simulation/
    robot-state.ts              Pose and drive command contracts, with units
    world.ts                    Floor, landmarks, and robot settings
    robot-simulation.ts         Pose, motion, bounds, pause, and reset
  controls/
    drive-command.ts            Held keys to normalized drive commands
    drive-controls.ts           DOM keyboard and pointer lifecycle
  view/
    robot-transform.ts          Planar pose to mesh position and orientation
    camera-framing.ts           Keep the floor visible on narrow canvases
    arena-view.ts               Three.js meshes, lighting, camera, and resizing
    playground-panel.ts         Page actions, status, and numeric readout
    style.css                   Responsive playground layout
tests/
  simulation/
    robot-simulation.test.ts    Simulator behavior, without a browser or GPU
  controls/
    drive-command.test.ts       Driving combinations and aliases
    drive-controls.test.ts      Focus, held input, release, and browser shortcuts
  view/
    robot-transform.test.ts     Simulation-to-view agreement
    camera-framing.test.ts      Wide and narrow camera coverage
    playground-panel.test.ts    Page actions, read-only values, and cleanup
tsconfig.simulation.json        Check the model without DOM or browser types
```

Dependencies point inward. The simulation owns state, physical geometry, and motion. It imports no controls, view, DOM, or Three.js code. Controls produce its `DriveCommand`; the view consumes its `RobotPose` and `WorldDefinition`. The page panel reports actions through callbacks. `main.ts` connects these pieces and owns the animation loop, without querying the DOM or formatting readouts.

For the lesson, start with `simulation/robot-state.ts`, `simulation/world.ts`, and `simulation/robot-simulation.ts`. Their comments explain units, heading, integration, and walls. Then read the short animation loop in `main.ts`, the key-to-command conversion, and `view/robot-transform.ts`. The [voiceover's learner code map](../../voiceovers/001-robot-world.md#learner-code-map) lists the study priority for each file.

Add calculations that describe the robot and its physical coordinate systems to `simulation/`. `view/robot-transform.ts` only adapts a finished planar pose to Three.js drawing axes. Mesh shapes, materials, lighting, CSS, and numeric display belong to `view/`; changing them does not change the robot's behavior.

This directory owns its package manifest, lockfile, tests, and build output. Keep project commands here. The episode checkpoint is the annotated Git tag `slam-ep-001` at the repository level.

## Library references

- [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [Vite setup and build commands](https://vite.dev/guide/)
- [Vitest test runner](https://vitest.dev/guide/)
