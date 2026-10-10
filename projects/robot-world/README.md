# Robot world

A cumulative TypeScript and Three.js playground for [episode 001](../../episodes/001-robot-world/README.md) and [episode 002](../../episodes/002-coordinate-frames/README.md). Drive a robot on a bounded floor with six fixed landmarks, inspect its coordinate frames, and compare one landmark's world, robot, and sensor coordinates.

## Setup

Use Node.js 22.x starting at 22.12, Node.js 24.x, or Node.js 26 or later, with npm. Run these commands from this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The browser needs WebGL 2. The application uses local npm dependencies and requires no external assets or API keys.

## Controls

| Action                             | Control                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Focus keyboard driving             | Click the scene, or Tab to the canvas.                                            |
| Forward / reverse                  | Hold W / S or Up / Down.                                                          |
| Turn left / right                  | Hold A / D or Left / Right.                                                       |
| Drive with a pointer or touch      | Hold a drive button.                                                              |
| Orbit the camera                   | Left-drag in Perspective view, or drag with one finger.                           |
| Pan                                | Right-drag, modifier + left-drag, or drag with two fingers.                       |
| Zoom                               | Scroll, middle-drag, or pinch with two fingers.                                   |
| Inspect from above                 | Top view. Rotation is disabled in this preset; pan and zoom still work.           |
| Return to the starting camera      | Perspective.                                                                      |
| Inspect a landmark in three frames | Choose a point in the landmark selector below the scene.                          |
| Hide / show frame axes             | Toggle Show labeled frame axes. The selected-point ring and table remain visible. |
| Stop / resume motion               | Pause simulation / Resume simulation.                                             |
| Restore the starting pose          | Reset robot. Pause state stays unchanged.                                         |

You can also focus a drive button with Tab and hold Space or Enter. Releasing a drive control stops that command. Losing canvas focus, window focus, or tab visibility clears held keyboard input. Pointer release, cancellation, and lost capture clear held pointer input. Simulation actions clear all held input. Ctrl, Command, and Alt shortcuts retain their browser behavior.

The pose readout is ground truth. Landmarks do not block the robot, and the model does not simulate acceleration or wheel dynamics. Position uses meters; heading is stored in radians and displayed in degrees. Heading zero faces positive x, with positive turns toward positive y. An update uses the midpoint heading for translation and caps elapsed time at 50 milliseconds.

Episode 002 starts in Top view to make planar axes easier to read. W labels the world axes, R the robot axes, and S the sensor axes. The table uses matching colors. The sensor origin is `(0.25, 0.10)` meters in the robot frame, at a relative heading of `30°`. Its mounting remains fixed as the robot drives and turns.

The selected landmark stays fixed in the world while its robot and sensor coordinates change. Camera and axes choices affect presentation. Reset preserves pause, selected landmark, and axes choice. Axis lengths and vertical lifts are visual spacing; the physical model remains planar.

## Transform calculations

The simulation uses `ml-matrix` 6.15.0 for homogeneous 3 × 3 matrix calculations. It is pinned in `package.json` and `package-lock.json`; `npm ci` installs it with the other project dependencies.

`src/simulation/rigid-transform.ts` keeps the public `Point2` and `RigidTransform2` contracts as ordinary TypeScript data. It builds a matrix from `{ x, y, heading }` when calculating:

- Applying a transform multiplies its matrix by the point column `[x, y, 1]` and reads the first two coordinates.
- Composing source → middle → target multiplies `targetFromMiddle` by `middleFromSource`, with the right-hand matrix acting first.
- Reversing a transform uses the library's `inverse` operation.

To return a pose, the helper reads x and y from the translation column and heading from the direction of the first rotation column. Both composition and inversion return headings in `[-π, π]`. The functions validate finite inputs and return new values.

These calculations run on the CPU with double-precision numbers. The frame snapshot and rendering consume their results. The [episode 002 notebook](../../episodes/002-coordinate-frames/coordinate-frames.ipynb) explores the same matrices with NumPy.

## Check and build

```sh
npm run check
```

This checks formatting, runs the full Vitest suite, performs strict TypeScript checking, and builds the production app with Vite. The simulation also compiles separately without DOM types or browser globals. Tests cover the simulator, key-to-command conversion, DOM input lifecycle, pose-to-rendering contract, page actions and readouts, and responsive camera framing. To run tests while editing, use `npm run test:watch`. Use `npm run format` to format the project.

To inspect the production build:

```sh
npm run preview
```

Browser smoke steps and results live in the [episode 001 guide](../../episodes/001-robot-world/README.md#verification-plan) and [episode 002 guide](../../episodes/002-coordinate-frames/README.md#verification).

## Code map

```text
src/
  main.ts                       Compose components; read → update → render
  simulation/
    robot-state.ts              Pose and drive command contracts, with units
    rigid-transform.ts          Planar poses and ml-matrix transform operations
    world.ts                    Floor, landmarks, and robot settings
    robot-simulation.ts         Pose, motion, bounds, pause, and reset
    coordinate-frames.ts        Sensor pose and one landmark in three frames
  controls/
    drive-command.ts            Held keys to normalized drive commands
    drive-controls.ts           DOM keyboard and pointer lifecycle
    frame-controls.ts           Native landmark and axes inspection choices
  view/
    robot-transform.ts          Planar pose to mesh position and orientation
    camera-framing.ts           Keep the floor visible on narrow canvases
    arena-view.ts               Three.js meshes, lighting, camera, and resizing
    frame-view-state.ts         Frame snapshot to rendering axes
    frame-overlay.ts            Labeled axes and selected-landmark highlight
    scene-label.ts              Shared camera-facing labels
    playground-panel.ts         Page actions, status, and numeric readout
    frame-panel.ts              Choices and coordinate-table presentation
    page-element.ts             Shared required-element lookup
    style.css                   Responsive playground layout
tests/
  simulation/
    robot-simulation.test.ts    Simulator behavior, without a browser or GPU
    rigid-transform.test.ts     Direction, inverse, composition, and invariants
    coordinate-frames.test.ts   Physical frames and landmark coordinates
  controls/
    drive-command.test.ts       Driving combinations and aliases
    drive-controls.test.ts      Focus, held input, release, and browser shortcuts
    frame-controls.test.ts      Native selection and visibility choices
  view/
    robot-transform.test.ts     Simulation-to-view agreement
    camera-framing.test.ts      Wide and narrow camera coverage
    playground-panel.test.ts    Page actions, read-only values, and cleanup
    frame-view-state.test.ts    Physical frames to drawing-axis agreement
    frame-panel.test.ts         Real HTML and three-frame readouts
tsconfig.simulation.json        Check the model without DOM or browser types
```

Dependencies point inward. The simulation owns state, physical geometry, and motion. It imports no controls, view, DOM, or Three.js code. Controls produce its `DriveCommand`; the view consumes its `RobotPose` and `WorldDefinition`. The page panel reports actions through callbacks. `main.ts` connects these pieces and owns the animation loop, without querying the DOM or formatting readouts.

For the lesson, start with `simulation/robot-state.ts`, `simulation/world.ts`, and `simulation/robot-simulation.ts`. Their comments explain units, heading, integration, and walls. Then read the short animation loop in `main.ts`, the key-to-command conversion, and `view/robot-transform.ts`. The [voiceover's learner code map](../../voiceovers/001-robot-world.md#learner-code-map) lists the study priority for each file.

Add calculations that describe the robot and its physical coordinate systems to `simulation/`. `view/robot-transform.ts` only adapts a finished planar pose to Three.js drawing axes. Mesh shapes, materials, lighting, CSS, and numeric display belong to `view/`; changing them does not change the robot's behavior.

For episode 002, study `rigid-transform.ts`, then mounting data in `world.ts` and the snapshot in `coordinate-frames.ts`. Follow the output through `main.ts` into `frame-overlay.ts` and `frame-panel.ts`. The [chronological voiceover](../../voiceovers/002-coordinate-frames.md#5-build-the-capability-in-order) explains each change and maps every changed file to its responsibility.

This directory owns its package manifest, lockfile, tests, and build output. Keep commands here. The repository's annotated episode tags are `slam-ep-001` for the original arena and `slam-ep-002` for coordinate frames.

## Library references

- [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [ml-matrix numerical operations](https://mljs.github.io/matrix/modules.html)
- [Vite setup and build commands](https://vite.dev/guide/)
- [Vitest test runner](https://vitest.dev/guide/)
