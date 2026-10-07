# Episode 001 · A world for the robot

Question: what are we moving, and in what world?

This episode builds a small TypeScript and Three.js simulator. Drive one robot around a bounded floor, use fixed landmarks to orient yourself, and inspect the same world through two camera views. Motion stays on a plane. The meshes have height so their shapes are easier to read.

## Lesson outline

1. Open the scene and identify the floor, robot, and six labeled landmarks.
2. Drive forward, reverse, and turn. Observe position and heading in the ground-truth readout.
3. Drive to a wall. The robot's full footprint stays inside the floor.
4. Orbit, pan, and zoom the camera. Switch to the top view and notice that the robot's pose stays the same.
5. Pause, inspect the scene, and reset the robot to repeat the experiment.
6. Trace the boundary between simulation state, controls, and rendering.

The [voiceover](../../voiceovers/001-robot-world.md) follows this sequence. The runnable application, dependencies, and tests are all in [projects/robot-world](../../projects/robot-world/README.md).

For the code tour, use the [learner code map](../../voiceovers/001-robot-world.md#learner-code-map). Begin with `simulation/robot-state.ts`, `simulation/world.ts`, and `simulation/robot-simulation.ts`, then trace the animation loop in `main.ts`. Comments explain the coordinate convention, motion calculation, and input flow. The `view/` directory owns page presentation and Three.js drawing.

## Try it

From the repository root:

```sh
cd projects/robot-world
npm ci
npm run dev
```

Click the world to focus keyboard driving. Hold W/S or Up/Down to move and A/D or Left/Right to turn. You can also hold the on-screen drive buttons. Drag the world to orbit, right-drag to pan, and scroll to zoom.

Try driving while turning, reaching each wall, and switching camera views while paused. The camera changes your view of the scene, not the robot's position.

## Assumptions

- The floor is 16 by 12 meters. Grid spacing is one meter.
- The robot has a circular footprint with a radius of 0.38 meters. Heading zero points toward positive x; positive heading turns toward positive y.
- The displayed pose is the exact simulation state. It is not a measurement or an estimate.
- Landmarks are fixed visual references. Their markers do not block motion.
- Motion is an idealized, speed-limited model with no acceleration or wheel dynamics. The browser loop caps each update at 50 milliseconds, dropping excess elapsed time after a stall.
- Pause stops robot motion. The camera still works. Reset restores the starting pose without changing whether the simulation is paused.

## Verification plan

The automated tests cover manual driving, turns, wall containment, pause, reset, elapsed-time handling, input combinations, the DOM input lifecycle, the robot's rendering transform, and responsive camera framing. Build the project with strict TypeScript and formatting checks.

The browser smoke check covers the visible robot and landmarks, keyboard and on-screen driving, both camera presets, camera interaction, pause/reset behavior, and a narrow viewport.

Run the project checks with:

```sh
npm run check
```

Verified on 2026-10-07 with Node.js 26.4.0 and npm 11.17.0:

A fresh `npm ci` installation succeeded before the final checks. npm reported zero known vulnerabilities in the installed dependencies.

| Check                                       | Result                                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run check`                             | Passed. Formatting, 72 tests in five files, strict TypeScript checks, and production build.                       |
| Keyboard driving in the browser             | Forward movement and left turning changed the ground-truth readout.                                               |
| Held pointer and release outside the button | Forward motion occurred during a drag off the button. Release cleared the command and active button state.        |
| Pause and reset                             | Pose stayed fixed while paused. Reset restored x, y, and heading to zero and preserved pause.                     |
| Camera presets, orbit, and zoom             | The view changed while the paused robot pose remained unchanged.                                                  |
| Narrow viewport at 390 × 844                | Both camera presets showed the floor. The page had no horizontal overflow. Drive targets measured 60 × 48 pixels. |
| Production preview                          | Loaded successfully in the browser with no new console errors or warnings.                                        |

Vite reports a bundle-size warning for the roughly 577 kB JavaScript entry, about 144 kB compressed with gzip. The build passes. The application currently ships its renderer in that entry.

Right-button panning, pinch zoom, and multi-touch gestures are supplied by OrbitControls and remain to be checked with those physical inputs. The desktop smoke check exercised orbit and wheel zoom.

Rechecked after separating simulation, controls, and presentation on 2026-10-08:

- `npm run check` passed with 77 tests in six files, formatting, both TypeScript checks, and the production build. `tsconfig.simulation.json` checks the model without DOM types or browser globals.
- Five page-boundary tests use the actual HTML to verify world data, read-only pose display, action callbacks, listener cleanup, accessible state, and the startup fallback.
- The production browser smoke check confirmed held forward input, release outside the button, pause/resume, reset while paused, and both camera presets. Switching cameras preserved the pose, and reset restored it to zero. No runtime errors or warnings were reported.

## Takeaway

The simulator owns the robot's pose. The scene displays it, and the camera lets us inspect it. These responsibilities can be changed and tested independently.

Checkpoint: `slam-ep-001`.
