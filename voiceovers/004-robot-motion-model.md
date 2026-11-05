# Episode 004 · The robot motion model

## Voiceover

Before this episode, the robot already drove forward and backward, and it already turned left and right. That behavior was part of the robot world from the earlier lessons. Episode 4 does not add a new driving ability. The change is inside the code: the motion calculation that was written directly in the simulation update is now separated into a small, pure motion model. This lets us see what one step does and test that geometry on its own.

Our question is: given the robot's current pose, a drive command, and the time that has passed, how do we calculate its next pose? The command can ask the robot to move forward, turn, or do both at once. We want the center to travel along the direction the robot faces, and we want a turn to change the heading around that same center. The visible behavior should stay the same; what changes is how clearly the code expresses the steps that produce it.

There are a few conditions. The model is planar. Position is measured in meters, heading in radians, and time in seconds. The controls provide normalized values from negative one to one. At full input, this robot moves at one point eight meters per second and turns at ninety degrees per second. We use an idealized model with no acceleration and no wheel dynamics. The arena also limits how far the robot's circular body can travel.

Before this change, one update function inside the simulator handled the movement arithmetic inline. Let's open the new file, `motion-model.ts`. Here we move that pose geometry into its own module and name three operations. Each one takes a pose and returns a new pose. They do not know about keys, the browser, or the Three.js scene. Their job is just to describe the robot's planar motion.

First, find the `rotate` function in this file. It adds a turn angle to the heading while keeping x and y fixed. Positive turns are counterclockwise. Then look at `wrapAngle`. Why do we need it? If we keep adding turns, the number could grow past several full rotations, even though the robot may be pointing in the same direction as before. For example, zero and one full turn describe the same direction. We convert the angle to its sine and cosine, then use `atan2` to recover the equivalent signed angle between minus pi and pi. This keeps the value compact and easy to read. It changes only how we write the heading, not the direction the robot faces.

Next, still in `motion-model.ts`, look at the `move` function. It takes a signed distance and moves along the robot's current forward direction. At heading zero, forward motion increases world x. At a heading of ninety degrees, forward motion increases world y. A negative distance reverses along that same direction. The heading itself does not change.

Now, in the same file, look at `step`, which combines those two ideas. If the robot turns and moves during the same short time step, which heading should determine its direction of travel? Using only the starting heading ignores the turn. Using only the ending heading applies the turn too early. So `step` divides the turn into two equal parts. It turns halfway, moves along that halfway heading, and then completes the turn.

For a full forward-and-left command lasting fifty milliseconds, the robot travels nine centimeters and turns four point five degrees. Halfway through, it faces two point two five degrees from its starting direction. The model projects the nine centimeters along that halfway direction, then stores the final four point five degree heading. This is a midpoint approximation for a small time step. It is not a wheel model, and it does not simulate acceleration.

Now let's switch to `robot-simulation.ts`. This is where the simulator connects the geometric operations to the controls. We rename its update method to `step` because each call advances the robot by one time interval. That method delegates the pose calculation to the new pure function. The simulator still clamps each normalized control to its allowed range. It multiplies forward input by the robot's linear speed and elapsed seconds to get meters traveled. It multiplies turn input by angular speed and elapsed seconds to get radians turned. Then it passes those two increments to the pure motion model.

The simulation also handles rules that do not belong inside the geometric operation. A browser can pause for a while, so we cap one update at fifty milliseconds rather than letting the robot jump across the arena after a stall. After motion, we clamp the center to the floor limits, leaving enough space for the robot's radius. When paused, the command does not move the pose.

Next, open `main.ts`. The animation loop samples the held controls and measures the time since the previous frame. It passes both to the simulator's step method, then derives the frame snapshot and renders the new pose. The loop now calls a more clearly named operation, but the input and visible driving behavior remain as before. The view displays the result; it does not calculate or change the physical motion.

Let's also look at `index.html`, where we update the playground introduction to match this lesson. It now tells us to inspect one drive step and makes the combined W and A experiment easy to find. These page changes guide the learner; they do not add movement behavior.

Finally, open the two motion tests. `motion-model.test.ts` checks the new pose operations on their own. `robot-simulation.test.ts` checks how commands, elapsed time, arena limits, pause, and reset still work together. These tests help confirm that we reorganized the existing motion calculation without changing what the robot can do.

Try holding W to move straight. Then add A or D. The robot should follow a curved path as its position and heading change together. Pause it, resume it, and reset it to see how those controls affect the simulation state.

## Build the capability in order

1. **Define the pose operations** in `projects/robot-world/src/simulation/motion-model.ts`. `move` projects signed distance onto the heading; `rotate` changes heading in place; `step` uses the halfway heading for combined motion.
2. **Connect physical rates and constraints** in `projects/robot-world/src/simulation/robot-simulation.ts`. The simulator validates inputs, clamps normalized controls, converts rates to meters and radians for elapsed time, caps long frame steps, and keeps the robot footprint inside the arena.
3. **Keep the frame loop readable** in `projects/robot-world/src/main.ts`. It samples the command and elapsed time, advances the model, then calculates snapshots and renders.
4. **Make the experiment visible** in `projects/robot-world/index.html`. The page labels the lesson, explains the combined W+A experiment, and states the robot's maximum rates. The existing Three.js view follows the resulting pose.
5. **Verify the mathematical boundaries** in `projects/robot-world/tests/simulation/motion-model.test.ts` and `robot-simulation.test.ts`. The first checks move, rotate, and combined steps without a browser; the second checks rate conversion, time limits, walls, pause, and reset.
6. **Use the lesson guide** in `episodes/004-robot-motion-model/README.md` to see the goal, assumptions, numerical example, and hands-on checks.

## Learner code map

- Start with `motion-model.ts` for the pose-only operations and midpoint integration.
- Read `robot-state.ts` for the meaning and units of a pose and normalized drive command, then `world.ts` for the arena dimensions and motion rates.
- Follow `RobotSimulation.step` in `robot-simulation.ts` to see how commands become increments and how pause, time caps, and arena bounds apply.
- Read `drive-command.ts` and `drive-controls.ts` to see how held keys become normalized forward and turn inputs.
- Read the animation loop in `main.ts` to follow input and elapsed time into simulation, then rendering.
- Read `robot-transform.ts` and `arena-view.ts` to see how the final planar pose becomes a Three.js drawing. These files visualize the state; they do not decide how the robot moves.
