# Episode Workflow

## Choose the episode and outputs

When available, read the numbered table in tmp/skeleton.txt locally. It is private course-planning material and must remain Git-ignored. Use it to scope only the requested episode; do not copy future rows, chapter contents, or roadmap summaries into tracked files, commits, tags, or voiceovers. Ten-episode blocks are chapter arcs, not a request to implement ten episodes at once.

Use the row's Type as the deliverable contract:

| Type-field signal          | Expected work                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Contains Notebook          | A new interactive notebook.                                                                            |
| Contains TS or Three.js    | The named TypeScript/Three.js capability in the relevant playground.                                   |
| Contains both signals      | Both deliverables, connected by the row's learning goal.                                               |
| Names an architecture view | Create the requested diagram or architecture view; add code only if the row also names TS or Three.js. |

Existing repository conventions take precedence over example paths below. When no convention exists, use one notebook per episode under notebooks/NNN-topic.ipynb, one persistent robot arena under a clearly named playground directory, and voiceover documents under voiceovers/.

## Build the notebook

1. State the physical goal and its conditions before calculations. Say what should move or change, what must stay fixed, and which behavior is being chosen. Name any required invariants explicitly. A goal such as "orbit the landmark" leaves the robot's orientation unspecified; define its required behavior before calculating it. Explain why the result is useful and connect it to prior learning.
2. Give the known inputs and desired outputs using a small numerical or geometric setup. Define each quantity's meaning, units, and frame before using it in formulas. Distinguish the initial state from the requested change, such as starting heading versus orbit angle. Define relationships explicitly: a sensor mounting given in the robot frame does not by itself imply coincident origins or aligned axes.
3. Present the calculation as a sequence of purposeful steps: "We do this because we need that." For each new operation, identify its input, what it produces, and how that result supports the next step. Introduce the code after explaining the need it satisfies.
4. Show the mathematical bridge between those steps. Use LaTeX for equations and matrices, following the matrix guidance below. Expand expressions and work through concrete values before relying on compact notation. Explain representation choices such as matrix blocks and the extra homogeneous coordinate when they first appear. Motivate an inverse by stating which coordinates we have and which we need.
5. Make the result visible with runnable plots or diagrams for geometric and numerical experiments. Connect arrows, origins, colors, and displayed numbers to the quantities just calculated. Explain which visual comparison demonstrates each stated condition, including its limits, such as an undefined bearing when two centers coincide.
6. Provide controls or editable inputs and an exploration sequence with progressive difficulty. Begin with a simple configuration, vary one quantity at a time, then combine changes once their separate effects are clear. Explain which controls change the starting setup and which change the requested operation. Introduce diagnostic comparisons, such as a deliberately incorrect matrix product, after the correct result is understood.
7. End with the takeaway and a short bridge to the arena or the next numbered episode. State any actual dependencies. When the notebook is independent, present the arena as the next application of the idea and identify the capability to implement there.

Scale the explanation to the calculation. A familiar one-step operation may need one sentence; a new chain of frames needs explicit steps. Keep the reasoning in learner-facing Markdown, with code comments supporting the implementation. A formula or a long comment alone is not a substitute for explaining why the calculation is needed.

### Make each matrix explicit

- Explain the need first. State what the matrix receives, what it produces, and why that output is needed next. Distinguish a matrix describing the current pose from one describing a movement applied to it. For frame conversions, name the source and target frames.
- Show the actual matrix in LaTeX. Define its symbols, dimensions, rotation part, translation column, and homogeneous row as relevant. Explain what their entries mean physically. An instruction such as "build the robot pose matrix" is incomplete unless the reader can see which matrix is meant.
- Substitute the worked example's values and show a multiplication with its result. A previously explained matrix need not be derived again, but show the concrete matrix used here. Define shorthand such as translation by a vector or rotation embedded in a larger matrix before composing it.
- Explain products through the sequence of operations on an input. Show the intermediate quantities and why each becomes the next input. Then give the product in its correct order and connect it to the final physical result.
- Map the displayed matrices and calculations to the code variables or helpers that implement them. Explain why points and directions need different homogeneous entries when that distinction matters. The code should implement a calculation the reader already understands.

For example, an orbit experiment might require both a constant distance to a landmark and a constant angle between the robot's forward direction and the line toward that landmark. State both conditions first. Explain why they require the body to turn by the orbit angle, then show the initial pose matrix, the orbit matrix, and their composition. The local forward axis being `(1,0)` is a coordinate convention; it does not specify how the robot should turn in the world.

### Example: a sensor mounted on a robot

Use this as an example of the reasoning sequence, adapting the detail to the episode:

- **Question and knowns:** Given a landmark's world position, the robot's world pose, and the sensor's mounting relative to the robot, find the landmark's sensor coordinates. Explain the mounting offset and angle so the learner can picture the three frames.
- **First step and reason:** Build `world_from_robot` because we know the robot pose in the world; it converts robot coordinates into world coordinates.
- **Next step and reason:** Build `robot_from_sensor` because we know the mounting relative to the robot; it converts sensor coordinates into robot coordinates.
- **Join the steps:** Show sensor → robot → world before writing `world_from_sensor = world_from_robot @ robot_from_sensor`. Substitute one point-transformation equation into the other to explain why the right-hand matrix acts first.
- **Answer the question:** The known landmark is in world coordinates, so invert the composed matrix to obtain world → sensor, then transform that landmark. Explain the meaning of the resulting sensor coordinates.
- **Explore gradually:** Start with zero mounting offset and angle, add an offset, add an angle, then move the robot while holding the mounting fixed. Tie each change to the figure.

Keep cells runnable from a fresh kernel in order. Use the repository's established kernel and dependencies; if none exist, choose the simplest suitable setup and record it in the notebook. Prefer Python for numerical exploration unless the repository or episode has a reason to use another kernel.

For every substantive code cell, place a concise, speakable voiceover comment before the code using that cell language's comment syntax. The narration should explain the concept, the question being explored, and what to notice in the result. For a cell format that cannot contain comments safely, place the voiceover in the immediately preceding Markdown cell. By default, write tutorial narration in English for a broad audience; follow an explicit language choice from the user.

## Extend the arena

Before editing, trace only the relevant path through the current project. Keep simulation state, domain behavior, observation processing, and visualization in clear responsibilities as the current episode introduces them. Keep core behavior independent of rendering where practical; let Three.js present state rather than own every algorithm. This makes deterministic behavior testable without a browser or scene renderer.

Add a small public contract when another module needs to depend on a capability without knowing its implementation. Introduce dependency inversion or IoC when the episode teaches it or the current coupling gives a concrete reason. Do not introduce a generic plugin system, service container, or future modules just because a later topic might use one.

Keep the main robot arena cumulative. Create a separate focused playground when it makes a concept clearer or preserves a distinct state model; do not force every demonstration into the shared arena when that would obscure the lesson.

## Keep scope and evidence clear

Implement only the selected row's promised capability. Do not rewrite earlier notebooks to match a new style unless the requested episode requires it. Record manual run instructions in the notebook when useful. For code episodes, add or update and run the focused tests described in references/testing-strategy.md before handing the episode to slam-lesson-closer for commit and tags. For notebook-only or documentation-only episodes, report which checks were relevant and what remains unexecuted.

Before handoff, read each experiment as a learner encountering the idea for the first time. The reader should be able to state the goal and its conditions before reaching the formulas, identify every matrix and its purpose, and follow the worked inputs through to the result. Check that the figures and numerical checks demonstrate the stated conditions, and that prose, equations, code, and figures agree on units and frame direction. Compact notation must follow enough explanation to reconstruct the calculation.
