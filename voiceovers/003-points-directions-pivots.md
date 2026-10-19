# Episode 003 · Points, directions, and rotation pivots

Status: draft for recording. Language: English. Checkpoint: slam-ep-003.

Format: five progressive notebook experiments, an editable check, a playground demonstration, and an implementation tour.

Recording cues are not spoken. The narration describes formulas in words so it can be used with TTS. Read ml-matrix as "em el matrix".

## 1. A location and an offset

Recording cue: show experiment one. Identify A and B before moving the anchor. Pause for the prediction.

In episode two, we described the same landmark in the world, robot, and sensor frames. We used a transformation matrix to convert its coordinates.

Now we need to distinguish two quantities we have been drawing. A point tells us where something is. A direction tells us an offset, without choosing a location for it.

Look at this arrow. Its start is one meter across and one meter up. Its end is three meters across and two meters up. To describe the offset, we subtract the starting point from the endpoint. The arrow goes two meters right and one meter up.

Move its start one meter to the right. Both endpoints move, but their difference stays the same. We can draw that same direction at the origin, or at the new starting point. Its anchor changes. Its components and length do not.

This vector has a length greater than one. We keep that length because it describes a displacement. Later, our robot's forward axis will be a unit direction, with length one. Both are directions, and neither has a location of its own.

## 2. Why the last entry is different

Recording cue: identify the blue input point and forward direction in the robot panel, then their gold results in the world panel. Reveal the expanded multiplication after explaining the required behavior. Vary translation with angle zero, reset both shifts to zero, then turn 90 degrees. Finally add translation again.

We learned that moving an arrow does not change its offset. Now we want one transformation matrix to handle both a point's position and the robot's forward direction.

We know a point two meters across and one meter up in robot coordinates. We also know the robot's forward direction, pointing along its local horizontal axis. Our matrix describes the robot's origin and orientation in the world. We want the point's world position and the forward direction expressed along world axes.

First, decide what should happen. If the robot moves right without turning, the point moves with it. The robot still points the same way. Translation must affect the point's location, while the direction stays unchanged. Turning the robot, however, must affect both.

We already have a matrix with three columns. To multiply it by our two-component input, we need to append a third entry. We call that entry a homogeneous coordinate, or weight. It describes the representation, not a height or another physical axis.

Look at the expanded multiplication. The rotation acts on the original two components. Each translation component is multiplied by the extra entry. That tells us how to choose it.

For a point, we need the translation to contribute once, so we append one. For a direction, we need no translation contribution, so we append zero. Both inputs then use the same matrix, and both still receive its rotation.

Start with no turn, one meter of translation to the right, and one meter down. The point's world position is three and zero. The direction still points right. Change either translation slider. Watch the gold point move while the gold arrow stays unchanged.

Next, reset both translations to zero and turn ninety degrees counterclockwise. The point is now one meter left and two meters up. The direction points up, and its length is still one. Add translation again. The point moves, but the arrow keeps pointing up.

The left panel holds the robot-frame inputs fixed. The right panel shows the calculated world results. We draw the direction at each panel's origin to compare its components. That drawing anchor does not give the direction a location of its own.

This is what we wanted to check. One matrix handles positions and directions correctly because their extra entries encode whether translation should contribute. Next, we will check the direction result independently using two endpoints.

## 3. Check the direction using two points

Recording cue: show experiment three, vary translation, then enable the deliberate mistake. Set both translation controls to zero afterwards.

We now have a direction helper. We want an independent way to check what it calculates.

We know the arrow's two endpoints, so we transform each of them as a point. Both receive the same translation. Next we subtract the transformed starting point from the transformed endpoint.

The input endpoints use robot coordinates. The transformed endpoints and the resulting offset use world coordinates.

The translations cancel. What remains is the original offset, turned by the rotation. It matches the direction helper's result.

In the example, a quarter-turn changes the offset from two and one to minus one and two. Moving the transformed endpoints further right changes their locations, but leaves that offset unchanged.

Now enable the deliberate mistake. We give the direction a point's weight, and the red arrow receives translation too. It no longer joins the transformed endpoints.

Set both translations to zero. The error disappears. That explains why we check with a nonzero translation: a test performed only at the origin would not reveal this mistake.

## 4. Choose where the rotation happens

Recording cue: show experiment four's three panels and the point at three and one. Identify the pivot at one and one. Reveal the compact matrix product after walking through the steps.

We learned how a rotation acts on a direction. Now we want to rotate a point around a chosen pivot.

The point is three meters across and one meter up. Our pivot is one meter across and one meter up. We want a ninety-degree counterclockwise turn around that pivot.

First, we need an offset from the pivot to the point. We subtract the pivot's position. The result is two meters right and zero meters up. This is a displacement from the pivot, rather than a world location.

Next, we rotate that displacement. A quarter-turn changes it to zero meters right and two meters up. It still starts at the pivot.

Finally, we need the endpoint in world coordinates again. We add the pivot's position back. The rotated point is now one meter across and three meters up.

Each panel shows the output needed by the next step. First we have the pivot-relative displacement. Then we have its rotated version. Then we recover a world point.

Recording cue: show the two pure translation matrices and the rotation matrix before revealing their product. Connect each matrix to its step and to the corresponding call in the notebook helper.

We can put those steps into one matrix product. First, we define the matrices we need. A pure translation has no rotation. Its last column holds the horizontal and vertical shift.

The first translation subtracts the pivot's coordinates. This shifts the point and temporarily places the pivot at the origin. The middle matrix rotates the shifted point. The final translation adds the pivot's coordinates back, giving us the final world position.

Throughout this matrix chain, we are transforming a point, so its extra homogeneous entry remains one. Its intermediate coordinates match the offset we calculated earlier, but the matrix representation still lets the last translation act on it.

We multiply those matrices with the final translation on the left and the initial translation on the right. As we learned in episode two, the right-hand matrix acts first. The helper below builds the same three matrices in that order.

Apply that product to the pivot itself. It stays exactly where it was. Apply it to the point, and the point follows a circle around the pivot. Its distance from the pivot stays the same.

Try a negative turn, then choose another pivot. Every preview starts with the same original point. The slider does not accumulate rotations.

This is a movement inside the world frame. The point's physical world location changes, and the world axes stay fixed. Earlier, our frame conversions described one fixed point using different axes.

## 5. Orbit with a fixed angle toward the landmark

Recording cue: start experiment five with L2 selected, Start at zero, and Turn at zero. Identify the two centers and the forward arrow. Present the two conditions before showing any matrix. Show the notebook's explicit initial pose matrix, orbit matrix, their product, and the point/direction multiplications as their purposes enter the narration.

In part four, we moved a point around a fixed pivot. Now that point is the robot's center, and the pivot is landmark L2. We want the robot to orbit the landmark. We also need to say exactly how its body should turn.

We choose two conditions. First, the center follows a circle around L2 at a constant distance. Second, the angle between the robot's forward direction and the line from its center toward L2 stays constant.

This means the body must turn by the same angle as the orbit. If the robot initially faces the landmark, it keeps facing it. If it initially faces at an angle to the landmark, it keeps that angle.

Our starting center is at the world origin, and the robot faces right. L2 is one meter right and four meters up. We want a ninety-degree counterclockwise orbit. Our outputs will be the new center and the new forward direction.

First, describe where the robot already is. A pose combines a position and an orientation. Its matrix places robot-local points into the world. The upper left contains the current rotation, and the last column contains the current center.

Look at the initial pose matrix on screen. With zero heading and a center at the origin, it is the identity. Changing the Start control changes this matrix's rotation. We need it because the robot's outline and forward axis are defined using its own local axes.

Next, describe the movement we want to apply. We reuse the pivot rotation from part four. Subtract the landmark position, rotate, then add the landmark position back. This matrix acts on geometry already expressed in the world.

For L2 and a ninety-degree turn, the resulting matrix has a quarter-turn rotation and a translation of five and three. The notebook shows the complete matrix and how that translation comes from the two pivot shifts.

We now have two different jobs: placing local geometry at the current pose, and moving that world geometry around L2. A local point must go through them in that order. We put the movement matrix on the left of the current pose matrix, because the right-hand matrix acts first.

The product is the new robot pose. In this example the starting pose is the identity, so the product equals the orbit matrix. It contains both the new center and the new orientation.

To read the center, transform the local origin as a point. Its extra entry is one, allowing translation to contribute. The result is five meters right and three meters up in the world.

To read the forward direction, transform the local forward axis with an extra entry of zero. The result points up. The code performs the same calculation in two stages: express the initial forward direction in the world, then rotate it with the orbit movement.

Each triangle vertex is also a local point. We apply the new pose to every vertex, so the entire body moves and turns together.

Now check our conditions. The center's distance from L2 remains the square root of seventeen meters. The forward arrow turns ninety degrees, and the line from the center toward L2 also turns ninety degrees. Their relative angle therefore stays unchanged.

We can check that second condition using the inverse poses from episode two. Reverse the initial pose and the final pose to describe L2 in robot coordinates. In both cases, L2 is one meter forward and four meters to the robot's left. Its distance and angle relative to the robot agree before and after the orbit.

Recording cue: compare the colored forward arrows with the purple center-to-pivot lines. Turn to 90 degrees, then try a negative turn. Keep L2 and Turn at 90, and change Start to 30. Finish with Robot center as the pivot.

Changing Turn moves along the orbit and turns the body by the same amount. Changing Start chooses a different initial body orientation. With a thirty-degree start and a ninety-degree orbit, the final heading is one hundred and twenty degrees. The center still ends at five and three. We have chosen a different initial angle toward L2, and that angle stays constant during this new orbit.

Finally, select Robot center as the pivot. The orbit radius is now zero, so the center stays still and the robot turns in place. There is no center-to-pivot direction in this special case, so the relative-angle condition has no angle to measure. World origin gives the same result here because our starting center is at the origin.

Each preview is calculated from the chosen starting pose. Moving the slider does not accumulate rotations.

## 6. Preview and apply in the playground

Recording cue: pause and reset. Start with the default L2 orbit center and set Orbit angle to 90 degrees. Compare with Robot center, then return to L2 and Apply orbit. Switch cameras, inspect L3, and reset. Show a rejected L3/180-degree preview last.

We learned the operation in the notebook. We now want to inspect it in the robot world while keeping the starting pose available for comparison.

Pause and reset. L2 is selected as the orbit center. Set the orbit angle to ninety degrees. The gold footprint moves to five and three, and its forward direction points up. The purple pivot stays at one and four. The arc shows the geometric orbit around it.

Compare that with Robot center. The preview now turns in place: the center stays at the origin, and only the heading changes. The button explicitly says Apply turn in place. Return to L2. The button says Apply orbit, and the table shows both a new center and a new direction.

The solid robot has not moved. Moving the slider only changes the preview. Apply is a separate action.

Click Apply orbit. The robot immediately receives the preview position and heading and remains paused. The relative angle returns to zero, ready for another experiment around the same selected pivot.

Select L3 in the existing landmark table. Its world coordinates stay five and two. With the robot at five and three, facing up, the landmark is one meter behind it in robot coordinates.

Switch cameras and hide the frame axes. The view changes while the physical values stay fixed. Reset preserves the pause and selections, and restores the starting pose and zero relative angle.

From that starting pose, choose L3 as pivot and set one hundred and eighty degrees. The preview lies outside the arena. It turns red and Apply becomes unavailable. We reject that result rather than changing it by clamping, which would break the rotation's geometry.

## 7. Build the capability in order

### Step 1. Give points and directions separate operations

Recording cue: open `src/simulation/rigid-transform.ts`, then the new simulation tests.

We learned that the homogeneous weight decides whether translation contributes. First we extend rigid-transform with a direction contract and a direction helper. The existing point helper uses one, and the new helper uses zero. Both use the same ml-matrix calculation.

Next we add rotation-about-pivot. We reuse the composition operation already introduced in episode two. Its product expresses the shift, turn, and shift-back sequence we just worked through.

The tests compare a transformed direction with the difference of transformed endpoints. They also check that a pivot stays fixed, the radius stays constant, and signed rotations can be reversed. We now have the physical operations needed for a preview.

### Step 2. Calculate a preview and a state-changing command

Recording cue: open `src/simulation/pivot-rotation.ts`, then `robot-simulation.ts`.

We want the picture and table to describe the same proposed rotation. First pivot-rotation resolves the selected pivot into a world point. It calculates the original and rotated poses, their unit forward directions, the radius, and the arc positions.

The result is a read-only snapshot. It also tells us whether the rotated footprint fits inside the world. Creating it leaves the simulation unchanged.

Next we add a focused command to robot-simulation. It uses the same pose calculation, checks that the simulation is paused, and checks the resulting footprint. Only then does it replace the current pose.

This separates asking what a rotation would do from applying it. The tests verify that the applied pose agrees with the preview and that rejected commands leave state untouched.

### Step 3. Supply input and show the numbers

Recording cue: show `index.html`, `src/controls/pivot-controls.ts`, and `src/view/pivot-panel.ts`.

We now need a way to choose the pivot and angle. The page adds native controls and a comparison table. Pivot-controls samples their values and converts the displayed degrees into the radians used by physical commands. It reports Apply as an explicit action and removes its listener on disposal.

Pivot-panel presents the snapshot. It formats positions, directions, and radius, and shows whether Apply is available. It owns the page presentation, while the controls own input and the simulation owns geometry.

The styles keep the new controls and table readable on narrow screens. DOM tests use the actual page, so a missing element or broken connection is caught before the browser demonstration.

### Step 4. Make the proposed rotation visible

Recording cue: open `src/view/pivot-view-state.ts`, `pivot-overlay.ts`, `scene-label.ts`, and the integration in `arena-view.ts`.

We have finished physical values and want to draw them. First pivot-view-state converts world positions and directions to the rendering axes. It changes the drawing convention without adding a location to a direction.

Next pivot-overlay draws the pivot marker, radius lines, arc, preview footprint, and forward arrows. It reads the snapshot without calculating physical motion.

We reuse the existing camera-facing labels, allowing longer captions to fit without clipping. Arena-view adds the overlay to the scene. The overlay is visible during the paused experiment, while the solid robot continues to display the current simulation pose.

### Step 5. Connect the information flow

Recording cue: open `src/main.ts` and follow preview, Apply, and Reset.

Finally, main connects the controls with the calculations and presentations. It reads the current pose and pivot selection, calculates the preview, and shares the results with the scene and panel.

Apply resolves the chosen pivot and sends the command to the simulation. After a successful application, the angle input returns to zero. Reset clears held drive input, resets the pose and preview angle, and uses the same presentation path immediately.

The order remains input, then simulation and geometry, then presentation. Views do not update the robot. The existing frame table receives the resulting actual pose, so it stays synchronized when a rotation is applied.

### Step 6. Verify and make the experiment runnable

Recording cue: show the mirrored test folders, `verify_notebook.py`, and the episode guide.

We test the mathematics without the browser or Three.js. Separate tests cover input actions, disposal, page values, and drawing-axis conversion.

The notebook verifier starts a fresh kernel, runs every cell, changes all five experiments' controls, and checks their new results. It restores the initial views before saving.

The episode guide contains notebook setup, both uv workflows, the shared numerical example, and browser experiments. The episode index and project code map connect these materials with the cumulative playground.

## 8. Closing

Recording cue: return to the paused pivot preview. Show the center, forward arrow, and fixed pivot together.

We learned how to distinguish a location from an offset. That gives us the correct homogeneous weight for points and directions. We then used those operations to rotate a complete robot pose around a chosen pivot.

Choose another pivot and predict the center and forward direction before moving the slider. Use the picture, then the numbers, to check that prediction.

## Learner code map

Application paths are relative to `projects/robot-world/`. Step numbers follow the implementation tour.

| Step | Changed file                              | Responsibility                                                                    | Study priority                   |
| ---- | ----------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| 1    | `src/simulation/rigid-transform.ts`       | Direction weight zero and the pivot transform product.                            | Essential mathematics.           |
| 1, 2 | `tests/simulation/pivot-rotation.test.ts` | Directions, fixed pivot, radius, reversal, snapshots, paused command, bounds.     | Read with the mathematics.       |
| 2    | `src/simulation/pivot-rotation.ts`        | Selection/command contracts, world pivot, rotated pose, preview, footprint check. | Essential physical geometry.     |
| 2    | `src/simulation/robot-simulation.ts`      | Apply a valid paused rotation atomically.                                         | Essential state ownership.       |
| 3    | `src/controls/pivot-controls.ts`          | Native selection, angle sampling, Apply intent, disposal, angle reset.            | Essential input boundary.        |
| 3    | `tests/controls/pivot-controls.test.ts`   | Sampling, explicit action, independent snapshots, listener cleanup.               | Verify input behavior.           |
| 3    | `src/view/pivot-panel.ts`                 | Options, comparison numbers, status, available actions.                           | Supporting presentation.         |
| 3    | `tests/view/pivot-panel.test.ts`          | Actual page, shared numbers, pause/bounds/zero-angle availability.                | Verify presentation.             |
| 3    | `index.html`                              | Episode introduction and native preview controls/table.                           | Supporting page structure.       |
| 3    | `src/view/style.css`                      | Responsive pivot controls and table.                                              | Supporting styling.              |
| 4    | `src/view/pivot-view-state.ts`            | Supplied world points and directions to drawing axes.                             | Understand the drawing boundary. |
| 4    | `tests/view/pivot-view-state.test.ts`     | Axis agreement and read-only conversion.                                          | Verify the drawing boundary.     |
| 4    | `src/view/pivot-overlay.ts`               | Pivot, arc, radius lines, footprint, and forward arrows.                          | Supporting graphics.             |
| 4    | `src/view/scene-label.ts`                 | Fit longer camera-facing captions without clipping.                               | Supporting graphics.             |
| 4    | `src/view/arena-view.ts`                  | Integrate the optional paused preview overlay.                                    | Supporting scene composition.    |
| 5    | `src/main.ts`                             | Read → calculate → present; Apply, Reset, and cleanup.                            | Essential information flow.      |
| 6    | `README.md`                               | Setup, controls, transform semantics, and cumulative code map.                    | Run and navigate.                |

Lesson paths are relative to the repository root.

| Stage        | Changed file                                                           | Responsibility                                                                                         |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Notebook     | `episodes/003-points-directions-pivots/points-directions-pivots.ipynb` | Purposeful derivations, five interactive experiments, predictions, editable check, narration comments. |
| Notebook     | `episodes/003-points-directions-pivots/plotting.py`                    | Draw supplied values, equal scales, and readable labels.                                               |
| Verification | `episodes/003-points-directions-pivots/verify_notebook.py`             | Fresh-kernel execution, live callbacks, restored views, saved figures.                                 |
| Setup        | `episodes/003-points-directions-pivots/requirements.txt`               | Direct Python dependency ranges.                                                                       |
| Setup        | `episodes/003-points-directions-pivots/requirements-lock.txt`          | Exact verified Windows environment.                                                                    |
| Setup        | `episodes/003-points-directions-pivots/.gitignore`                     | Exclude environments, caches, and evidence.                                                            |
| Guide        | `episodes/003-points-directions-pivots/README.md`                      | Scope, sequence, setup, numerical example, and checks.                                                 |
| Navigation   | `episodes/README.md`                                                   | Episode entry and checkpoint tag.                                                                      |
| Navigation   | `README.md`                                                            | Episode and notebook in the repository map.                                                            |
| Narration    | `voiceovers/003-points-directions-pivots.md`                           | TTS-ready script, recording cues, chronological tour, and this map.                                    |

## Design boundaries

Simulation owns positions, directions, pivots, transforms, preview geometry, and state application. Controls own native input and action lifecycle. Views adapt and present finished snapshots. The new capability uses focused data contracts and composition, with no service container or speculative extension framework.

The notebook's triangular outline is a teaching shape. The playground's circular footprint uses the existing physical robot radius. Its arc illustrates the geometry; Apply changes the pose instantly and checks the resulting footprint. Wheel dynamics are outside this experiment.
