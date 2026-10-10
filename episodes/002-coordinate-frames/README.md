# Episode 002 · Coordinate frames

Question: how can one point have different coordinates in the world, robot, and sensor frames?

## Lesson outline

The notebook introduces one change at a time. Each experiment includes a diagram, an editable control, a prediction to make, and a numerical check.

1. Move a frame's origin while a landmark stays fixed. Compare its world and local coordinates.
2. Rotate the frame. Read the directions of its x and y axes before inspecting the coordinates.
3. Combine translation and rotation in a homogeneous 3 × 3 transform. Check a quarter-turn example.
4. Invert the transform. Move a point between frames and recover its starting coordinates.
5. Mount a sensor on the robot. Compose sensor → robot → world, then reverse the order to see why it matters.

Repeat the same ideas in the cumulative robot world. Drive, inspect the three frames, and compare a selected landmark's coordinates. The values come from the exact simulator geometry.

## Implementation sequence

This sequence also guides the [voiceover](../../voiceovers/002-coordinate-frames.md).

1. Establish units, axes, and the direction named by a transform. Add `ml-matrix` to the playground, then implement and test homogeneous matrix operations behind the simulation's point and pose contracts.
2. Define the sensor mounting transform and derive a snapshot of the three frames and the selected landmark.
3. Add a view adapter and draw labeled axes and a landmark highlight from that snapshot.
4. Add landmark selection and an axes visibility control. Present the snapshot's coordinates in a table.
5. Connect input → pose → frame snapshot → rendering in the application loop.
6. Execute the notebook, run project checks, and verify the visible behavior in a browser.

## Run the notebook

Open [coordinate-frames.ipynb](coordinate-frames.ipynb). Its five interactive experiments use Matplotlib and ipywidgets. Each has a saved reference figure, controls, a prediction prompt, and a numerical example. The last experiment also has a landmark selector and a wrong-order checkbox. A final editable example compares the distance between two landmarks in two frames.

Use Python 3.13. Run these PowerShell commands from this episode directory:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-lock.txt
.\.venv\Scripts\python.exe -m jupyterlab coordinate-frames.ipynb
```

Alternatively, choose one of these two uv workflows.

**Create an environment and install a requirements file:**

```powershell
uv venv .venv --python 3.13
uv pip install --python .venv/Scripts/python.exe -r requirements-lock.txt
.\.venv\Scripts\python.exe -m jupyterlab coordinate-frames.ipynb
```

**Let uv manage a project:**

Run this setup once from the episode directory:

```powershell
uv init --bare --python 3.13
uv python pin 3.13
uv add "numpy>=2.2,<3" "matplotlib>=3.10,<4" "ipywidgets>=8.1,<9"
uv add "ipykernel>=6.30,<8" "jupyterlab>=4.4,<5" "nbformat>=5.10,<6" "nbclient>=0.10,<0.11"
uv run python -m jupyterlab coordinate-frames.ipynb
```

1. `uv init --bare --python 3.13` creates a minimal `pyproject.toml` for this notebook project and sets its minimum supported Python version.
2. `uv python pin 3.13` writes `.python-version`, telling uv to select Python 3.13 for this project. The minor-version pin allows compatible 3.13 patch releases.
3. The two `uv add` commands declare the notebook and Jupyter dependencies in `pyproject.toml`, record the resolved versions in `uv.lock`, and install them into `.venv`.
4. `uv run` brings the project environment up to date and launches JupyterLab using that environment's Python. On later visits, repeat just this last command to open the notebook.

The package ranges match `requirements.txt`. In place of the two explicit `uv add` commands, you can import all those requirements with `uv add -r requirements.txt`. Keep `pyproject.toml`, `.python-version`, and `uv.lock` with the notebook when sharing this project setup; `.venv` remains ignored.

`requirements-lock.txt` records the verified Windows environment. On another platform, use Python 3.13 and install `requirements.txt` instead:

```sh
python3.13 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m jupyterlab coordinate-frames.ipynb
```

In JupyterLab, choose **Restart Kernel and Run All Cells**. Make a prediction, move one slider, and release it to redraw the diagram. Controls update on release to keep plotting responsive. Saved figures help when reading a preview; live controls require an executing Python kernel.

The notebook contains the mathematics being taught. [plotting.py](plotting.py) supplies arrows, labels, equal axis scales, and coordinate panels. Adjust the notebook's values and functions during the exercises.

## Try the playground

Follow the [robot-world setup guide](../../projects/robot-world/README.md). From the project directory:

```sh
npm ci
npm run dev
```

1. Start in Top view. Identify W x/W y, R x/R y, and S x/S y. The table uses matching colors.
2. Select L3. Its world coordinates stay at `(5, 2)` meters.
3. Drive forward, then turn. Observe the robot and sensor axes and their changing coordinate rows.
4. Pause and switch to Perspective. The view changes while the pose and coordinates stay fixed.
5. Hide and show frame axes. The coordinate table and selected-landmark ring remain available.
6. Reset while paused. The robot returns to the origin, the landmark stays selected, and pause remains active.

The sensor mounting is fixed at `(0.25, 0.10)` meters and `30°`, expressed in the robot frame. Axis lengths, label sizes, and vertical lifts are presentation choices. The physical calculations remain two-dimensional. The table uses exact simulator geometry, rounded to two decimal places for display.

## A shared numerical example

The notebook, simulation tests, and view tests use robot pose `(2, 1, 90°)`, sensor mounting `(0.25, 0.10, 30°)`, and L3 at world `(5, 2)` meters.

| Quantity                                | Expected value                           |
| --------------------------------------- | ---------------------------------------- |
| Robot point `(1, 0)` expressed in world | `(2, 2)` m                               |
| Sensor origin expressed in world        | `(1.90, 1.25)` m                         |
| Sensor heading expressed in world       | `120°`                                   |
| L3 expressed in robot                   | `(1.00, -3.00)` m                        |
| L3 expressed in sensor                  | Approximately `(-0.900481, -3.059679)` m |

Driving uses elapsed time, so the browser demonstration need not stop at this exact pose. Use the notebook for the reproducible numerical example and the playground to observe continuous changes.

## Code and narration

The [voiceover](../../voiceovers/002-coordinate-frames.md) pairs each idea with the reason for its implementation, in dependency order. Its learner map includes every changed source, test, lesson, and setup file.

The simulation owns transform mathematics and frame snapshots. Native inspection input belongs to controls. The overlay and table consume the snapshot. `main.ts` connects them, preserving the readable input → simulation → rendering flow.

The notebook uses NumPy to explore homogeneous 3 × 3 matrices. The TypeScript playground uses `ml-matrix` for the same calculations in `src/simulation/rigid-transform.ts`: `mmul` applies a transform to `[x, y, 1]` or composes two transforms, and `inverse` reverses a transform. The notebook derives the inverse's rotation and translation blocks explicitly; the library calculates that same inverse in the playground.

The application continues to pass poses as `{ x, y, heading }`. The transform helper builds matrices from those values, performs the operation, and reads the resulting origin from the last column and heading from the first rotation column. Both composition and inversion express the output heading in `[-π, π]`. The frame snapshot, table, and renderer share the resulting geometry.

## Verification

Run the repeatable notebook check from this episode directory:

```powershell
.\.venv\Scripts\python.exe verify_notebook.py
```

If you chose the uv project workflow, run the same check through its environment:

```powershell
uv run python verify_notebook.py
```

The verifier creates a temporary kernel using its own interpreter, executes all cells in order, checks narration comments, and changes controls in all five interactive experiments. It restores their initial values and saves the executed notebook. Figure exports go into the ignored `verification/` directory. It does not register a kernel globally.

Run application checks from the robot-world project:

```sh
npm run check
```

The `ml-matrix` implementation was verified on 2026-10-10:

- A clean dependency installation from the updated manifest and lockfile passed. The installed library reproduced the quarter-turn point `(2, 2)` and inverse origin `(-1, 2)`.
- `npm run check` passed formatting, 108 tests in 11 files, both TypeScript checks, and the production build. Three additional transform tests cover opposing rotations, inverse composition in both orders, and normalized inverse headings.
- The production browser check selected L3, drove forward, turned, and paused. World coordinates stayed fixed while robot and sensor coordinates changed. Camera and axes choices preserved the table, and reset preserved pause and selection. No console warnings or errors were recorded.
- The notebook's structure was validated after updating its playground bridge. Its Python calculations were unchanged and were not re-executed for this matrix-library change.

Closeout verification on 2026-10-10 reran `npm run check` successfully with 108 tests and executed `verify_notebook.py` from a fresh kernel. All 12 code cells, six reference figures, and five interactive views passed, including the widget callback checks. The notebook's leading voiceover comments were aligned with the verifier while preserving its executable source and learner annotations.

Initial episode verification on 2026-10-08 used Python 3.13.16, Node.js 26.4.0, and npm 11.17.0:

| Check                              | Result                                                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh Python environment           | Installed successfully; exact versions recorded in `requirements-lock.txt`.                                                                                    |
| Clean-kernel notebook execution    | Passed all 12 code cells, with six saved figures and five interactive views.                                                                                   |
| Widget callbacks                   | Translation, rotation, combined-pose, inverse, and sensor control changes produced expected results.                                                           |
| JupyterLab browser interaction     | Restarted and ran all cells; changing the origin slider from `1.00` to `1.25` updated the diagram and robot coordinates from `(1.00, 1.00)` to `(0.75, 1.00)`. |
| `npm run check`                    | Passed formatting, 105 tests in 11 files, both TypeScript checks, and production build. Episode 002 adds 28 tests.                                             |
| Production browser movement        | Forward input moved about 1.80 m; turning changed heading and local coordinates while world coordinates stayed fixed.                                          |
| Pause, camera, and axes visibility | Driving while paused left the table unchanged. Camera and axis visibility changes preserved coordinates.                                                       |
| Selection and reset                | Selecting L3 changed the inspected point and highlight. Reset preserved pause and selection; L2 at the origin showed world/robot `(1.00, 4.00)`.               |
| Narrow viewport, 390 × 844         | Controls and table fit without horizontal overflow.                                                                                                            |
| Browser runtime                    | No console warnings or errors during production smoke checks.                                                                                                  |

The current build reports Vite's bundle-size warning for the approximately 636 kB JavaScript entry, about 158 kB compressed. The build passes.

The complete episode checkpoint is the annotated Git tag `slam-ep-002`. Its voiceover and learner code map are included with the notebook and playground.

## References

- [ipywidgets interactive controls](https://ipywidgets.readthedocs.io/en/stable/examples/Using%20Interact.html)
- [nbclient notebook execution](https://nbclient.readthedocs.io/en/latest/client.html)
- [uv project creation](https://docs.astral.sh/uv/concepts/projects/init/)
- [uv project dependencies](https://docs.astral.sh/uv/concepts/projects/dependencies/)
- [uv running project commands](https://docs.astral.sh/uv/concepts/projects/run/)
- [ml-matrix numerical operations](https://mljs.github.io/matrix/modules.html)
