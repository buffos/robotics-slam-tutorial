# Learning SLAM

Small, runnable lessons in robotics and simultaneous localization and mapping.

Start with the [episode index](episodes/README.md). Each episode links its experiment, narration, checks, and Git checkpoint.

## Run the robot world

Use Node.js 22.x starting at 22.12, Node.js 24.x, or Node.js 26 or later, with npm. From the repository root:

```sh
cd projects/robot-world
npm ci
npm run dev
```

Open the local URL printed by Vite. See the [project guide](projects/robot-world/README.md) for controls and checks.

## Find your way around

```text
AGENTS.md                       Repository structure and contribution rules
episodes/
  README.md                     Episode index
  001-robot-world/
    README.md                   Lesson outline, experiments, and verification
  002-coordinate-frames/
    README.md                   Notebook setup, frame experiments, and verification
    coordinate-frames.ipynb      Progressive diagrams and interactive controls
    plotting.py                 Supporting frame and point drawing
    requirements.txt            Direct notebook dependencies
    requirements-lock.txt       Verified Windows dependency versions
    verify_notebook.py          Fresh-kernel execution and widget checks
projects/
  robot-world/
    README.md                   Setup, controls, and architecture
    package.json                Project commands and dependencies
    package-lock.json           Reproducible dependency versions
    src/                        Application code
    tests/                      Behavior and rendering-contract tests
voiceovers/
  001-robot-world.md             Script, learner code map, and file responsibilities
  002-coordinate-frames.md       Chronological frame lesson and implementation tour
```

Every lesson gets an `episodes/NNN-topic/` directory. When a lesson includes a notebook, keep its one notebook and exercise assets inside that directory. Use the episode README as the entry point, and link every implemented episode from the index.

Every application or focused playground gets its own `projects/name/` directory with its manifest, lockfile, code, tests, and README. Run its commands from that directory. Keep generated dependencies and build artifacts there too, outside Git. Share code only when an implemented lesson needs it.

The robot world is cumulative. Episode tags preserve earlier runnable states without copying the application into each lesson folder. The checkpoints are `slam-ep-001` for the original arena and `slam-ep-002` for coordinate frames.
