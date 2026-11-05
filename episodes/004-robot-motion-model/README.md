# Episode 004 · The robot motion model

## Goal and conditions

The robot already drove forward and backward and turned left and right in earlier episodes. Episode 4 does not add those visible abilities. It makes their motion calculation explicit: code that was inline in the simulator is separated into pure `move`, `rotate`, and `step` operations, so we can follow how a command changes the pose and test the geometry on its own.

The goal is to explain how a drive command changes the robot's position and heading over time. Hold **W** to move forward; add **A** or **D** to turn while moving. The robot should translate along its own forward direction, turn around its center, and combine both actions when the controls are held together.

The command reports desired forward and turning amounts between negative one and one. The simulator converts those normalized inputs into physical rates: at full input the robot travels at **1.8 meters per second** and turns at **90 degrees per second**. It multiplies each rate by elapsed time to get a travel distance and turn angle for that simulation step.

This is an idealized planar model. It has no acceleration or wheel dynamics. A combined move and turn uses the heading halfway through the turn to estimate the translation direction. Each browser update is limited to 50 milliseconds, and the robot's circular footprint must stay inside the arena. If a proposed center crosses a wall, the simulator clamps it to the allowed boundary.

## Follow one command through the model

1. Start with the robot's world pose: its center `(x, y)` in meters and its heading in radians. Heading zero points along world positive x; positive turns point toward positive y.
2. Turn a pose in place. This changes the heading while leaving the center fixed. `rotate` wraps equivalent angles to the range from `-π` to `π`; a full turn can add `2π` to the number without changing the direction, so wrapping keeps the stored value compact without changing where the robot faces.
3. Move along the robot's current forward direction. Positive distance goes forward; negative distance reverses. Translation changes the center but keeps the heading.
4. For one combined step, turn halfway, move using that halfway heading, and finish the turn. This midpoint estimate makes the small step follow a curve instead of projecting the whole distance along the old heading.
5. Convert the held controls and elapsed seconds into physical increments, cap unusually long frame times, and constrain the resulting center by the robot's radius.
6. Let the animation loop sample controls and elapsed time, advance the simulation, then render the resulting pose. Try holding **W+A** and compare it with holding **W** alone.

For example, a full forward-and-left command for a 50 millisecond step gives 0.09 meters of travel and a 4.5 degree turn. The halfway heading is 2.25 degrees, so the robot moves about 0.0899 meters in x and 0.0035 meters in y, then finishes at a 4.5 degree heading.

## Run and check

From `projects/robot-world/`, install dependencies if needed and start the playground:

```sh
npm ci
npm run dev
```

Hold **W**, then try **W+A** or **W+D**. Watch the robot center and heading readout. Pause and resume to check that motion stops and continues; reset returns it to its starting pose. The orbit and coordinate-frame panels remain available as earlier geometry experiments.

The pure motion model and simulator behavior are covered by focused tests. Run the full project check from `projects/robot-world/`:

```sh
npm run check
```

For the implementation story and learner code map, see the [Episode 004 voiceover](../../voiceovers/004-robot-motion-model.md).
