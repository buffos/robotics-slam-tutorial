# Robot world

A cumulative TypeScript and Three.js playground for [episode 001](../../episodes/001-robot-world/README.md), [episode 002](../../episodes/002-coordinate-frames/README.md), and [episode 003](../../episodes/003-points-directions-pivots/README.md). Drive a robot on a bounded floor with six fixed landmarks, inspect its coordinate frames, and preview a rotation around a chosen pivot.

## Setup

Use Node.js 22.x starting at 22.12, Node.js 24.x, or Node.js 26 or later, with npm. Run these commands from this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The browser needs WebGL 2. The application uses local npm dependencies and requires no external assets or API keys.

## Controls

| Action                             | Control                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Focus keyboard driving             | Click the scene, or Tab to the canvas.                                             |
| Forward / reverse                  | Hold W / S or Up / Down.                                                           |
| Turn left / right                  | Hold A / D or Left / Right.                                                        |
| Drive with a pointer or touch      | Hold a drive button.                                                               |
| Orbit the camera                   | Left-drag in Perspective view, or drag with one finger.                            |
| Pan                                | Right-drag, modifier + left-drag, or drag with two fingers.                        |
| Zoom                               | Scroll, middle-drag, or pinch with two fingers.                                    |
| Inspect from above                 | Top view. Rotation is disabled in this preset; pan and zoom still work.            |
| Return to the starting camera      | Perspective.                                                                       |
| Inspect a landmark in three frames | Choose a point in the landmark selector below the scene.                           |
| Hide / show frame axes             | Toggle Show labeled frame axes. The selected-point ring and table remain visible.  |
| Stop / resume motion               | Pause simulation / Resume simulation.                                              |
| Restore the starting pose          | Reset robot. Pause state stays unchanged.                                          |
| Preview an orbit                   | Pause, choose a fixed point, and adjust Orbit angle. L2 is selected initially.     |
| Apply an orbit                     | Apply orbit. The robot receives the preview position and heading, staying paused.  |
| Turn in place                      | Select Robot center. Apply turn in place changes heading while keeping the center. |

You can also focus a drive button with Tab and hold Space or Enter. Releasing a drive control stops that command. Losing canvas focus, window focus, or tab visibility clears held keyboard input. Pointer release, cancellation, and lost capture clear held pointer input. Simulation actions clear all held input. Ctrl, Command, and Alt shortcuts retain their browser behavior.

The pose readout is ground truth. Landmarks do not block the robot, and the model does not simulate acceleration or wheel dynamics. Position uses meters; heading is stored in radians and displayed in degrees. Heading zero faces positive x, with positive turns toward positive y. An update uses the midpoint heading for translation and caps elapsed time at 50 milliseconds.

Episode 002 starts in Top view to make planar axes easier to read. W labels the world axes, R the robot axes, and S the sensor axes. The table uses matching colors. The sensor origin is `(0.25, 0.10)` meters in the robot frame, at a relative heading of `30°`. Its mounting remains fixed as the robot drives and turns.

The selected landmark stays fixed in the world while its robot and sensor coordinates change. Camera and axes choices affect presentation. Reset preserves pause, selected landmark, and axes choice. Axis lengths and vertical lifts are visual spacing; the physical model remains planar.

Episode 003 adds **Orbit the robot around a point** below the scene. L2 is selected initially to match the notebook's landmark example. Pause, reset, and set **Orbit angle** to 90 degrees: the center preview moves from `(0,0)` to `(5,3)` meters, and the forward direction becomes `(0,1)`. The orbit preserves the distance and the angle between the robot's forward direction and the line toward the fixed point.

Choose a landmark or the world origin for an orbit around a fixed world point. **Robot center** gives a turn in place. The panel explains this difference and names the action **Apply orbit** or **Apply turn in place**. The world origin also gives a turn in place when the robot is already at `(0,0)`.

Positive angles turn counterclockwise. The purple marker is the fixed pivot; gold shows the proposed footprint, center arc, and forward direction. The comparison table gives world positions in meters and unit forward vectors. The separate **Inspect one landmark** selector controls frame inspection; the orbit center is chosen in the orbit panel.

The preview leaves the current robot pose unchanged. Apply uses the same geometry, checks that the simulation is paused and the resulting footprint fits, then replaces the pose. This is an instantaneous geometry experiment. Its arc illustrates rotation rather than a simulated driving trajectory. A preview outside the arena is red and cannot be applied; the result is rejected rather than clamped.

Applying resets the relative angle to zero and preserves the pivot choice. Reset restores the starting pose and zero angle while preserving pause, pivot selection, and frame inspection choices. Rotation controls are disabled while running.

## Transform calculations

The simulation uses `ml-matrix` 6.15.0 for homogeneous 3 × 3 matrix calculations. It is pinned in `package.json` and `package-lock.json`; `npm ci` installs it with the other project dependencies.

`src/simulation/rigid-transform.ts` keeps the public `Point2`, `Direction2`, and `RigidTransform2` contracts as ordinary TypeScript data. It builds a matrix from `{ x, y, heading }` when calculating:

- Applying a transform multiplies its matrix by the point column `[x, y, 1]` and reads the first two coordinates.
- Composing source → middle → target multiplies `targetFromMiddle` by `middleFromSource`, with the right-hand matrix acting first.
- Reversing a transform uses the library's `inverse` operation.
- Transforming a direction uses `[dx, dy, 0]`, so rotation contributes while translation drops out. Its magnitude is retained.
- Rotating geometry around a pivot composes `T(+pivot) R(angle) T(-pivot)`, with the right-hand shift acting first. Points move; directions only turn.

To return a pose, the helper reads x and y from the translation column and heading from the direction of the first rotation column. Both composition and inversion return headings in `[-π, π]`. The functions validate finite inputs and return new values.

These calculations run on the CPU with double-precision numbers. The frame snapshot and rendering consume their results. The [episode 002 notebook](../../episodes/002-coordinate-frames/coordinate-frames.ipynb) explores the same matrices with NumPy.

The [episode 003 notebook](../../episodes/003-points-directions-pivots/points-directions-pivots.ipynb) derives the point/direction distinction and the pivot product. `pivot-rotation.ts` calculates a read-only preview from the current pose and a world pivot. Its command/selection contracts are shared with input and simulation; the scene and table consume the finished geometry.

## Check and build

```sh
npm run check
```

This checks formatting, runs the full Vitest suite, performs strict TypeScript checking, and builds the production app with Vite. The simulation also compiles separately without DOM types or browser globals. Tests cover the simulator, key-to-command conversion, DOM input lifecycle, pose-to-rendering contract, page actions and readouts, and responsive camera framing. To run tests while editing, use `npm run test:watch`. Use `npm run format` to format the project.

To inspect the production build:

```sh
npm run preview
```

Browser smoke steps and results live in the [episode 001 guide](../../episodes/001-robot-world/README.md#verification-plan), [episode 002 guide](../../episodes/002-coordinate-frames/README.md#verification), and [episode 003 guide](../../episodes/003-points-directions-pivots/README.md#verification).

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
    pivot-rotation.ts           World pivot, rotated pose, preview, footprint check
  controls/
    drive-command.ts            Held keys to normalized drive commands
    drive-controls.ts           DOM keyboard and pointer lifecycle
    frame-controls.ts           Native landmark and axes inspection choices
    pivot-controls.ts           Pivot/angle sampling, explicit Apply, and cleanup
  view/
    robot-transform.ts          Planar pose to mesh position and orientation
    camera-framing.ts           Keep the floor visible on narrow canvases
    arena-view.ts               Three.js meshes, lighting, camera, and resizing
    frame-view-state.ts         Frame snapshot to rendering axes
    frame-overlay.ts            Labeled axes and selected-landmark highlight
    scene-label.ts              Shared camera-facing labels
    playground-panel.ts         Page actions, status, and numeric readout
    frame-panel.ts              Choices and coordinate-table presentation
    pivot-panel.ts              Pivot choices, comparison table, and action status
    pivot-view-state.ts         Physical pivot points and directions to drawing axes
    pivot-overlay.ts            Fixed pivot, arc, radii, and preview footprint/arrows
    page-element.ts             Shared required-element lookup
    style.css                   Responsive playground layout
tests/
  simulation/
    robot-simulation.test.ts    Simulator behavior, without a browser or GPU
    rigid-transform.test.ts     Direction, inverse, composition, and invariants
    coordinate-frames.test.ts   Physical frames and landmark coordinates
    pivot-rotation.test.ts      Directions, pivots, preview isolation, paused apply
  controls/
    drive-command.test.ts       Driving combinations and aliases
    drive-controls.test.ts      Focus, held input, release, and browser shortcuts
    frame-controls.test.ts      Native selection and visibility choices
    pivot-controls.test.ts      Sampling, explicit Apply, reset, and disposal
  view/
    robot-transform.test.ts     Simulation-to-view agreement
    camera-framing.test.ts      Wide and narrow camera coverage
    playground-panel.test.ts    Page actions, read-only values, and cleanup
    frame-view-state.test.ts    Physical frames to drawing-axis agreement
    frame-panel.test.ts         Real HTML and three-frame readouts
    pivot-panel.test.ts         Real page, pivot values, and available actions
    pivot-view-state.test.ts    Point/direction drawing-axis agreement
tsconfig.simulation.json        Check the model without DOM or browser types
```

Dependencies point inward. The simulation owns state, physical geometry, and motion. It imports no controls, view, DOM, or Three.js code. Controls produce its `DriveCommand`; the view consumes its `RobotPose` and `WorldDefinition`. The page panel reports actions through callbacks. `main.ts` connects these pieces and owns the animation loop, without querying the DOM or formatting readouts.

For the lesson, start with `simulation/robot-state.ts`, `simulation/world.ts`, and `simulation/robot-simulation.ts`. Their comments explain units, heading, integration, and walls. Then read the short animation loop in `main.ts`, the key-to-command conversion, and `view/robot-transform.ts`. The [voiceover's learner code map](../../voiceovers/001-robot-world.md#learner-code-map) lists the study priority for each file.

Add calculations that describe the robot and its physical coordinate systems to `simulation/`. `view/robot-transform.ts` only adapts a finished planar pose to Three.js drawing axes. Mesh shapes, materials, lighting, CSS, and numeric display belong to `view/`; changing them does not change the robot's behavior.

For episode 002, study `rigid-transform.ts`, then mounting data in `world.ts` and the snapshot in `coordinate-frames.ts`. Follow the output through `main.ts` into `frame-overlay.ts` and `frame-panel.ts`. The [chronological voiceover](../../voiceovers/002-coordinate-frames.md#5-build-the-capability-in-order) explains each change and maps every changed file to its responsibility.

For episode 003, start with `transformDirection` and `rotationAboutPivot`, then `pivot-rotation.ts` and the paused command in `robot-simulation.ts`. Follow the preview through `main.ts` to the panel and overlay. The [episode voiceover](../../voiceovers/003-points-directions-pivots.md#7-build-the-capability-in-order) presents the reasons and information flow in that order.

This directory owns its package manifest, lockfile, tests, and build output. Keep commands here. The repository's annotated episode tags are `slam-ep-001` for the original arena and `slam-ep-002` for coordinate frames.

## Library references

- [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [ml-matrix numerical operations](https://mljs.github.io/matrix/modules.html)
- [Vite setup and build commands](https://vite.dev/guide/)
- [Vitest test runner](https://vitest.dev/guide/)
