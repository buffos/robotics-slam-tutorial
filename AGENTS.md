# Repository conventions

This repository is a series of numbered SLAM lessons with independently runnable projects.

## Keep lessons and projects navigable

- Put each lesson in `episodes/NNN-topic/`, with its README as the entry point. Add implemented lessons to `episodes/README.md`.
- When a lesson needs a notebook, keep its single notebook and exercise assets inside that lesson's directory. Do not accumulate lessons in one notebook.
- Put every application or focused playground in its own `projects/name/` directory. Keep its package manifest, lockfile, source, tests, configuration, and setup guide together. Run its commands from that directory.
- Extend the cumulative arena in `projects/robot-world/`. Use episode Git tags to recover earlier versions rather than copying the arena into lesson folders.
- Keep episode narration in `voiceovers/NNN-topic.md`. Each checkpoint needs a conceptual script and a map of changed files to responsibilities.
- Add shared packages only when implemented projects have an actual shared dependency. Keep application code out of the repository root.

## Robot world boundaries and checks

- Keep robot state, physical geometry, motion, and coordinate calculations in `src/simulation/`, independent of the DOM and Three.js. Define shared state and command types there; controls and views consume those types.
- Keep input handling in `src/controls/`, and Three.js rendering, camera behavior, page presentation, and styles in `src/view/`. The view reads simulation values without changing them. Rendering-axis conversion belongs in the view; physical coordinate calculations belong in the simulation.
- Keep `src/main.ts` as application composition and a readable input → simulation → rendering loop. Put DOM queries and readout formatting in the view.
- Mirror `simulation/`, `controls/`, and `view/` under `tests/`. Check the simulation separately without DOM types using `tsconfig.simulation.json`.
- Add educational comments to the files a learner studies. Explain units, coordinate conventions, mathematical choices, and state flow. Keep a learner code map in each episode's voiceover, distinguishing robot behavior from supporting graphics and browser code.
- Add focused behavior tests at public boundaries. Use the DOM environment for input lifecycle tests and browser smoke checks for visible scene behavior.
- Before checkpointing code, run `npm run check` from `projects/robot-world/`. It checks formatting, tests, TypeScript, and the production build.
- Keep `node_modules/`, `dist/`, caches, and generated reports outside Git.

## Local curriculum

`tmp/skeleton.txt` is a private, ignored planning source. Read only the requested episode's scope. Keep future entries out of tracked artifacts, narration, commits, and tags. Follow the local tutorial skills for implementation and closeout.
