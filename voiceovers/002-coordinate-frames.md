# Episode 002 · Coordinate frames

Status: draft for recording. Language: English.
Format: five progressive notebook experiments, a playground demonstration, and a chronological implementation tour.
Checkpoint: `slam-ep-002`. One commit contains the notebook, playground, and tutorial guidance.

## 1. One point, different coordinates

Recording cue: show notebook experiment one before touching the controls. Pause for each prediction throughout the notebook tour.

In episode one, we drove a robot through a world of fixed landmarks. Now look at this point. Its world coordinates are two meters across and one meter up.

Move the robot's origin one meter to the right. The point stays where it was, but its coordinates relative to the robot change. That is our question: how can one physical point have different coordinates in the world, robot, and sensor frames?

Our first experiment changes only the origin. To describe the fixed point from that new origin, subtract the origin's world position. Move the origin onto the point, and both local coordinates become zero.

We learned that coordinates depend on the origin. Now keep the origin at zero and rotate the axes instead. Turn the robot frame ninety degrees counterclockwise. Its forward axis points along world positive y. The same world point has robot coordinates one and minus two. That negative coordinate tells us the point lies opposite the robot's positive y direction.

The rotation matrix describes the robot's unit axes in the world. Its transpose reverses the direction. Try negative angles too, and watch the signs. The physical distance stays the same.

## 2. Combine and reverse

Recording cue: show experiments three and four, beginning with the known quarter-turn example.

We learned translation and rotation separately. A robot pose needs both, so we combine them in a homogeneous matrix. The name world-from-robot states the direction. First rotate a robot-frame point, then add the robot's world position.

Put the robot at two meters across, one meter up, facing ninety degrees. A point one meter ahead is at world coordinates two and two. We will check this example in both Python and TypeScript.

To go back, remove the translation and undo the rotation. The inverse translation must be rotated too. Simply negating the original translation gives the wrong result after a turn.

The green ring marks the point recovered by going from world to robot and back. It overlaps the original point. Change the pose and inspect the residual, which stays near numerical zero.

## 3. Mount a sensor

Recording cue: show experiment five with the default mounting and L3. Increase mount x briefly to separate the origins, then restore it.

We learned how to move a point between two frames. A sensor mounted on the robot adds another step. Its origin is defined in robot coordinates. In our playground it sits a quarter of a meter forward and a tenth of a meter left, at a relative heading of thirty degrees.

Sensor coordinates go to robot coordinates first, then to world coordinates. In the matrix product, the right-hand matrix acts first. Watch the mounting offset when the robot turns. The offset turns with it because it belongs to the robot frame.

Enable the wrong-order checkbox. The dashed red frame shows the geometry produced by reversing the multiplication order. Compare the origins, then try an identity pose where the difference disappears.

Both local panels describe the same landmark. Their numbers differ because their origins and axes differ. Inverting the composed transform gives the landmark's sensor coordinates.

## 4. Return to the playground

Recording cue: in Top view, select L3, drive forward, turn, pause, and switch to Perspective. Hide and restore the axes, then reset while paused.

Now we can see those relationships in the moving robot world. The W axes stay fixed. The R axes move with the robot, and the S axes follow the mounting. Their letters and colors match the table.

Choose L3 and drive. Its world coordinates stay at five and two. Its robot and sensor coordinates change as the robot moves and turns. These values come from the exact simulation geometry.

Pause and switch cameras. The picture changes, but every coordinate stays fixed. Hide the axes if they cover something you want to inspect. The table and selected-point ring remain visible. Reset while paused to inspect the starting pose again.

The axes have different visual lengths and heights to keep them readable. Those drawing choices do not add a physical third dimension to the model.

## 5. Build the capability in order

Introduce each need before opening its implementation. Follow the output of each step into the next one.

### Step 1. Calculate the transforms with matrices

Recording cue: show `package.json` and `package-lock.json`, then open `src/simulation/rigid-transform.ts` and its tests. Follow matrix construction, point application, composition, inversion, and reading the result.

We learned to represent rotation and translation in a three-by-three matrix. We now want the playground to perform the same matrix operations. First we add ml-matrix to the project's dependencies. The package manifest records the chosen version, and the lockfile makes the installation reproducible.

Next we implement the geometry in rigid-transform. The rest of the application describes a pose using x, y, and heading. Points use meters, and headings use radians. Names such as world-from-robot state the direction of the conversion. We keep that data contract and build a matrix when we need to calculate.

The first helper builds the homogeneous matrix from a pose. Its upper-left block describes the orientation of the source axes in the target frame. The last column gives the source origin's position in that frame. The bottom row preserves the extra coordinate used for translation.

We first use this matrix to transform a point. We put the point's x and y coordinates in a column and append one. That one lets the translation column contribute to the result. It is part of the representation; our physical point still has two coordinates. Matrix multiplication produces the target coordinates, and we read x and y from the first two rows.

Next we join two transformations. We know the robot's pose in the world and the sensor's mounting relative to the robot. We want the sensor's pose directly in the world. We build a matrix for each relationship and multiply the robot-to-world matrix by the sensor-to-robot matrix. The right-hand matrix acts first, giving us the path from sensor, to robot, to world. The product combines the rotations and rotates the mounting offset before placing it in the world.

We now have a matrix, but the snapshot and the views consume a pose. A second helper reads the source origin from the last column. The first column describes the source's positive x axis in the target frame. We use its two components to recover the heading. This gives an angle between minus one hundred and eighty and plus one hundred and eighty degrees, stored in radians. The represented direction stays the same.

Finally, we implement the reverse transformation. Our landmark is given in world coordinates, and we need its robot or sensor coordinates. We ask the library to invert the forward matrix, then read the resulting pose with the same helper. The inverse contains the transposed rotation and the rotated negative translation we derived in the notebook. We can now apply it to the known world point.

These functions consume ordinary TypeScript data and return new values. The library calculates with double-precision numbers on the CPU. The quarter-turn test checks our notebook example. The mounting and opposing-rotation tests check how origins and axes combine. The composition test catches the wrong order, and composing a transform with its inverse must recover identity in both orders.

We now have the operations needed to calculate the frames.

### Step 2. Derive one geometry snapshot

Recording cue: open `src/simulation/robot-state.ts`, `world.ts`, and `coordinate-frames.ts`, in that order.

The robot pose already describes the robot frame in the world. We express that relationship by using the transform type in robot-state. Next we add the fixed mounting to world, as physical position and heading in robot coordinates.

Then coordinate-frames composes the sensor pose and expresses one landmark in all three frames. Its result is a read-only snapshot for one instant. The picture and the table will consume that same data.

### Step 3. Make the axes visible

Recording cue: open `src/view/frame-view-state.ts`, `frame-overlay.ts`, `scene-label.ts`, and the integration in `arena-view.ts`.

We want to see the axes that explain the coordinates. First frame-view-state adapts the finished physical values to drawing axes. The model's x and y floor becomes Three.js x and z, with positive model y drawn along negative scene z.

Next frame-overlay draws the arrows, axis labels, origin dots, and selected-landmark ring. Its spacing belongs to the picture. Scene-label supplies camera-facing text for both the new axes and the existing landmarks.

Finally, arena-view adds the overlay to the scene and updates it from the adapted snapshot. We now have a picture of the geometry we calculated.

We also need to recognize the robot's forward direction among the frame arrows. Arena-view gives its nose a dark matte material and a larger shape so it remains visible against the light robot body.

### Step 4. Choose a landmark and present its numbers

Recording cue: show `index.html` and `src/view/style.css`, then open `src/controls/frame-controls.ts` and `src/view/frame-panel.ts`.

We want to inspect different points. First the page adds a native selector, an axes checkbox, and a table. The styles match frame colors and keep the table readable on a narrow screen.

Frame-controls samples the two inspection choices. They do not change robot motion or the mounting. Frame-panel populates the choices and formats the snapshot's coordinates. Rounding happens here; the calculations keep full precision.

Both panels use page-element to find their required elements. Playground-panel still presents the robot pose and reports simulation actions. Its startup fallback now disables the new controls too.

We now have inspection input and two presentations of the same geometry.

### Step 5. Connect the information flow

Recording cue: open `src/main.ts` and follow one animation frame.

Finally, main connects the pieces. Drive input produces a command and the simulation advances the robot. Inspection input chooses a landmark. The frame calculation combines that pose with the fixed mounting to produce one snapshot.

That same pose and snapshot go to the scene and the panels. The renderer draws, and the table formats. Neither changes the physical state. Reset uses this same presentation path immediately, including while paused.

The flow is input, then simulation and frame calculation, then presentation. That ordering keeps the arrows and the numbers synchronized.

### Step 6. Verify and make the lesson runnable

Recording cue: show the mirrored test directories, `verify_notebook.py`, and the episode guide.

We check the mathematics separately from the browser. Simulation tests cover known coordinates, inverse direction, composition order, distances, and independent snapshots. Controls and view tests check native choices, table values, and the drawing-axis conversion.

The notebook verifier starts a fresh kernel, runs every cell, and changes the controls of all five experiments. It checks their results and restores the starting views. The episode guide records dependency setup and browser behavior. Both the notebook and application now use frame conventions and examples we can reproduce.

The explanation sequence is also recorded in the tutorial implementer skill: state what we know, what we want to find, and why each step is needed. Its notebook and voiceover guidance carry that teaching approach into subsequent implementations.

## 6. Closing

Recording cue: return to the sensor experiment or paused playground.

We learned that coordinates belong to a frame. We can name a transformation's direction, reverse it, and join compatible steps. The axes explain why a fixed landmark's local coordinates change as the robot moves.

Choose a landmark, predict one change, and try it. Use the picture to explain the result before returning to the code.

## Learner code map and file responsibilities

Application paths below are relative to `projects/robot-world/`. Step numbers follow the chronological implementation tour.

| Step | Changed file                                 | Responsibility                                                               | Study priority                    |
| ---- | -------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| 1    | `package.json`                               | Declare the pinned ml-matrix numerical dependency.                           | Understand the calculation setup. |
| 1    | `package-lock.json`                          | Reproduce the numerical and application dependency installation.             | Supporting setup.                 |
| 1    | `src/simulation/rigid-transform.ts`          | Pose-to-matrix conversion; ml-matrix apply, compose, and inverse operations. | Essential mathematics.            |
| 1    | `tests/simulation/rigid-transform.test.ts`   | Direction, inverse, composition, distances, handedness, and valid inputs.    | Read with the mathematics.        |
| 2    | `src/simulation/robot-state.ts`              | Robot pose as world-from-robot.                                              | Essential state contract.         |
| 2    | `src/simulation/world.ts`                    | Fixed mounting in robot meters/radians.                                      | Essential physical configuration. |
| 2    | `src/simulation/coordinate-frames.ts`        | Sensor world pose and one landmark in three frames.                          | Essential frame calculation.      |
| 2    | `tests/simulation/coordinate-frames.test.ts` | Numerical example, motion invariants, selection, and snapshots.              | Verify physical meaning.          |
| 3    | `src/view/frame-view-state.ts`               | Finished physical data to Three.js drawing axes.                             | Understand the drawing boundary.  |
| 3    | `src/view/frame-overlay.ts`                  | Axis arrows, labels, origin dots, and point highlight.                       | Supporting graphics.              |
| 3    | `src/view/scene-label.ts`                    | Shared camera-facing labels.                                                 | Supporting graphics.              |
| 3    | `src/view/arena-view.ts`                     | Overlay integration, initial Top view, and a visible robot direction marker. | Supporting scene integration.     |
| 3    | `tests/view/frame-view-state.test.ts`        | Drawing-axis agreement for origins, angle, and point.                        | Verify the drawing boundary.      |
| 4    | `src/controls/frame-controls.ts`             | Sample native selection and axes choice.                                     | Understand inspection input.      |
| 4    | `tests/controls/frame-controls.test.ts`      | Native choices and independent input snapshots.                              | Verify input behavior.            |
| 4    | `src/view/frame-panel.ts`                    | Choices, mounting description, and coordinate table.                         | Supporting presentation.          |
| 4    | `src/view/page-element.ts`                   | Shared required-element lookup.                                              | Supporting DOM plumbing.          |
| 4    | `src/view/playground-panel.ts`               | Shared lookup and extended startup fallback.                                 | Supporting presentation.          |
| 4    | `index.html`                                 | Introduction, inspection controls, table, and camera state.                  | Supporting page structure.        |
| 4    | `src/view/style.css`                         | Frame colors, table, controls, and responsive layout.                        | Supporting styling.               |
| 4    | `tests/view/frame-panel.test.ts`             | Real page, mounting data, readouts, and choice preservation.                 | Verify presentation.              |
| 4    | `tests/view/playground-panel.test.ts`        | Fallback disables new controls.                                              | Verify failure presentation.      |
| 5    | `src/main.ts`                                | Compose and share one pose/frame snapshot per render.                        | Essential information flow.       |
| 6    | `README.md`                                  | Updated setup, controls, code map, and lesson links.                         | Run and navigate.                 |

Lesson files below are relative to the repository root:

| Stage        | Changed file                                                                  | Responsibility                                                                   |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Notebook     | `episodes/002-coordinate-frames/coordinate-frames.ipynb`                      | Progressive diagrams, controls, predictions, exercises, and voiceover comments.  |
| Notebook     | `episodes/002-coordinate-frames/plotting.py`                                  | Draw supplied frames and points.                                                 |
| Setup        | `episodes/002-coordinate-frames/requirements.txt`                             | Direct dependency ranges.                                                        |
| Setup        | `episodes/002-coordinate-frames/requirements-lock.txt`                        | Exact verified Windows dependency versions.                                      |
| Verification | `episodes/002-coordinate-frames/verify_notebook.py`                           | Fresh-kernel execution and widget callback checks.                               |
| Setup        | `episodes/002-coordinate-frames/.gitignore`                                   | Ignore environments, caches, and generated evidence.                             |
| Guide        | `episodes/002-coordinate-frames/README.md`                                    | Outline, setup, implementation sequence, examples, and checks.                   |
| Navigation   | `episodes/README.md`                                                          | Lesson entry and checkpoint tag.                                                 |
| Navigation   | `README.md`                                                                   | Notebook and episode in the repository map.                                      |
| Narration    | `voiceovers/002-coordinate-frames.md`                                         | Chronological script and this responsibility map.                                |
| Guidance     | `.codex/skills/slam-tutorial-implementer/SKILL.md`                            | Require purposeful steps connected to learning and implementation.               |
| Guidance     | `.codex/skills/slam-tutorial-implementer/references/tutorial-workflow.md`     | Explain known inputs, desired outputs, derivations, and progressive experiments. |
| Guidance     | `.codex/skills/slam-tutorial-implementer/references/voiceover-conventions.md` | Connect concepts to a chronological implementation narrative.                    |

## Design boundaries

Transform functions handle geometry; the snapshot derives one instant's data; controls sample inspection intent; views present supplied values. The new overlay and panel extend the arena by composition. Consumers depend on focused data contracts, and the simulation imports no DOM or Three.js code.

The transform module contains the ml-matrix dependency and its temporary homogeneous matrices. Its public point and pose types stay ordinary TypeScript data. NumPy in the notebook and ml-matrix in the playground implement the same frame mathematics; rendering receives the finished geometry.

The existing motion model and drive-input lifecycle remain the starting point. Sensor coordinates use exact geometry. The fixed mounting is the only sensor behavior introduced here.
