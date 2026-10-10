# Episode Workflow

## Choose the episode and outputs

When available, read the numbered table in tmp/skeleton.txt locally. It is private course-planning material and must remain Git-ignored. Use it to scope only the requested episode; do not copy future rows, chapter contents, or roadmap summaries into tracked files, commits, tags, or voiceovers. Ten-episode blocks are chapter arcs, not a request to implement ten episodes at once.

Use the row's Type as the deliverable contract:

| Type-field signal | Expected work |
|---|---|
| Contains Notebook | A new interactive notebook. |
| Contains TS or Three.js | The named TypeScript/Three.js capability in the relevant playground. |
| Contains both signals | Both deliverables, connected by the row's learning goal. |
| Names an architecture view | Create the requested diagram or architecture view; add code only if the row also names TS or Three.js. |

Existing repository conventions take precedence over example paths below. When no convention exists, use one notebook per episode under notebooks/NNN-topic.ipynb, one persistent robot arena under a clearly named playground directory, and voiceover documents under voiceovers/.

## Build the notebook

1. Start each experiment with a concrete question and its physical setup, connected to prior learning. State what we know and what we want to find. Identify each quantity's meaning, units, and frame where relevant, and explain why the desired result is useful.
2. Introduce the intuition with a small numerical or geometric example. Define new objects and relationships before using them in formulas. For example, a sensor mounting defined in the robot frame is measured relative to the robot; that alone does not imply coincident origins or aligned axes.
3. Present the calculation as a sequence of purposeful steps: "We do this because we need that." For each new operation, identify its input, what it produces, and how that result supports the next step. Introduce the code after explaining the need it satisfies.
4. Show the mathematical bridge between those steps. Use LaTeX for equations and matrices. Expand a new expression into components or a worked example when compact notation hides the reasoning, then introduce the compact form. Explain representation choices such as matrix blocks, multiplication order, and the extra homogeneous coordinate when they first appear. Define a transformation's source and target, and motivate an inverse by stating which coordinates we have and which we need.
5. Make the result visible with runnable plots or diagrams for geometric and numerical experiments. Connect arrows, origins, colors, and displayed numbers to the quantities just calculated. Explain what should change and what stays fixed before asking the learner to predict the result.
6. Provide controls or editable inputs and an exploration sequence with progressive difficulty. Begin with a simple configuration, vary one quantity at a time, then combine changes once their separate effects are clear. Introduce diagnostic comparisons, such as a deliberately incorrect matrix product, after the correct result is understood.
7. End with the takeaway and a short bridge to the arena or the next numbered episode. State any actual dependencies. When the notebook is independent, present the arena as the next application of the idea and identify the capability to implement there.

Scale the explanation to the calculation. A familiar one-step operation may need one sentence; a new chain of frames needs explicit steps. Keep the reasoning in learner-facing Markdown, with code comments supporting the implementation. A formula or a long comment alone is not a substitute for explaining why the calculation is needed.

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

Before handoff, read each experiment as a learner encountering the idea for the first time. Check that the question, known inputs, desired output, reason for each operation, and connection to the visual result are clear. Check that the prose, equations, code, and figures agree on units and frame direction, and that new compact notation follows enough explanation to reconstruct the calculation.
