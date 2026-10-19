# Episode 003 · Points, directions, and rotation pivots

Question: why does translation move a point but leave a direction unchanged, and how can we rotate an object around a chosen point?

Status: implemented; checkpoint `slam-ep-003`.

## Lesson outline

Episode 002 established coordinate frames and rigid transforms. This episode uses those operations to distinguish positions from directions and to build a rotation around a pivot.

1. Describe an arrow using two endpoints. Move both endpoints and observe that their difference stays the same.
2. Apply the same homogeneous matrix to a point with `w=1` and a direction with `w=0`. Vary translation first, then rotation.
3. Transform two endpoints, subtract them, and compare the result with transforming their direction directly. Diagnose the error caused by using `w=1` for a direction.
4. Rotate a point around a pivot in three purposeful steps: subtract the pivot, rotate the resulting displacement, and restore the pivot. Derive the corresponding matrix product.
5. Rotate a complete robot pose. Its center is a point; its forward axis is a direction. Preview the same operation in the cumulative playground.

The notebook is independent of the playground. Its editable controls, diagrams, worked examples, and assertions introduce one change at a time.

## Implementation sequence

1. Extend the existing ml-matrix utilities with `Direction2`, `transformDirection`, and `rotationAboutPivot`.
2. Calculate a read-only pivot-rotation snapshot and add a paused simulation command that applies a valid preview pose.
3. Add native pivot and angle controls, with a page panel that presents the supplied position, direction, and radius.
4. Draw the fixed pivot, rotation arc, preview footprint, and forward arrow through a dedicated view adapter and overlay.
5. Connect preview and apply through the existing input → simulation → rendering composition.
6. Execute the notebook from a fresh kernel, test public behavior, and inspect the production playground in a browser.

The [voiceover](../../voiceovers/003-points-directions-pivots.md) follows this learning and implementation sequence.

## Run the notebook

Open [points-directions-pivots.ipynb](points-directions-pivots.ipynb). It has five interactive experiments and a final editable check. Saved figures work in a notebook preview; live controls require a Python kernel.

Use Python 3.13. From this episode directory on Windows:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-lock.txt
.\.venv\Scripts\python.exe -m jupyterlab points-directions-pivots.ipynb
```

With uv, choose either environment installation or project management.

```powershell
uv venv .venv --python 3.13
uv pip install --python .venv/Scripts/python.exe -r requirements-lock.txt
.\.venv\Scripts\python.exe -m jupyterlab points-directions-pivots.ipynb
```

To make this directory a uv project, run this setup once:

```powershell
uv init --bare --python 3.13
uv python pin 3.13
uv add "numpy>=2.2,<3" "matplotlib>=3.10,<4" "ipywidgets>=8.1,<9"
uv add "ipykernel>=6.30,<8" "jupyterlab>=4.4,<5" "nbformat>=5.10,<6" "nbclient>=0.10,<0.11"
uv run python -m jupyterlab points-directions-pivots.ipynb
```

`uv init --bare` creates the minimal project manifest. The Python pin records the chosen minor version in `.python-version`. `uv add` declares and installs dependencies and writes `uv.lock`. On later visits, use the final `uv run` command. Keep the generated manifest, pin, and lockfile when sharing that project setup; keep `.venv` outside Git.

`requirements-lock.txt` records the verified Windows dependencies. On another platform, install the direct ranges in `requirements.txt`:

```sh
python3.13 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m jupyterlab points-directions-pivots.ipynb
```

Restart the kernel and run all cells. Predict first, move one slider, and release it to redraw. The notebook owns the calculations. [plotting.py](plotting.py) draws supplied values with equal axis scales, consistent colors, and legends that keep vector descriptions away from endpoint labels.

## Try the playground

Follow the [project setup guide](../../projects/robot-world/README.md). Run `npm ci` and `npm run dev` from `projects/robot-world/`.

1. Pause and reset. **L2** is the initial orbit center. Set **Orbit angle** to 90 degrees. The purple pivot is `(1,4)` meters; the center preview becomes `(5,3)` meters and the forward direction becomes `(0,1)`. Its radius stays approximately `4.12` meters, and its relative angle toward L2 stays constant.
2. Compare **Robot center** at the same angle. Its center stays at `(0,0)` while its forward direction becomes `(0,1)`, and the button changes to **Apply turn in place**. Return to **L2** for the orbit example.
3. Inspect the gold footprint, forward arrow, and arc. The solid robot stays at its current pose until you apply the rotation.
4. Click **Apply orbit**. The robot moves instantly to the preview position and heading, remains paused, and the relative angle resets to zero. The selected pivot stays selected.
5. Switch cameras and toggle the existing frame axes. The physical values stay unchanged. Select L3 in the landmark table: world `(5,2)` becomes robot `(-1,0)` meters at this pose.
6. Reset. Pause, pivot selection, landmark selection, and the frame-axes choice remain; the pose and relative angle return to their initial values.
7. Select L3 as pivot and set 180 degrees from the initial pose. The red preview is `(10,4)` meters, outside the arena, so Apply is disabled.

Applying is an instantaneous geometric pose change. The arc illustrates rotation about the pivot. The resulting footprint is checked against the arena; an invalid result is rejected rather than clamped. Driving remains the existing elapsed-time model. Preview controls are disabled while running.

## A shared numerical example

| Quantity                                 | Value                                    |
| ---------------------------------------- | ---------------------------------------- |
| Original robot center                    | `(0,0)` m                                |
| Original forward direction               | `(1,0)`, unit length                     |
| Fixed pivot, L2                          | `(1,4)` m                                |
| Rotation                                 | `+90°`, counterclockwise                 |
| Rotated robot center                     | `(5,3)` m                                |
| Rotated forward direction                | `(0,1)`, unit length                     |
| Center-to-pivot radius                   | `sqrt(17)` m, approximately `4.123106` m |
| Reversed rotation from the original pose | Center `(-3,5)` m, forward `(0,-1)`      |

The notebook, simulation tests, DOM tests, and browser checks use this example. Directions retain their magnitude: displacement vectors need not have unit length, while the playground's forward vector does.

## Code and information flow

The existing `rigid-transform.ts` builds homogeneous matrices with ml-matrix. `transformDirection` uses `[dx,dy,0]`; `transformPoint` uses `[x,y,1]`. `rotationAboutPivot` composes shift by minus the pivot, rotation, and shift back. Its source and result are positions in the same frame, so it actively moves geometry.

`pivot-rotation.ts` resolves a selected world pivot and calculates a read-only preview: original and rotated poses, forward directions, radius, arc positions, and whether the resulting footprint fits. `RobotSimulation.rotateAboutPivot` applies the same pose calculation only while paused and only if it fits. Neither previews nor rendering alter simulation state.

`PivotControls` samples native input and reports Apply. `PivotPanel` formats the snapshot and shows which actions are available. `pivot-view-state.ts` converts finished physical coordinates to drawing axes; `PivotOverlay` draws them. `main.ts` connects these pieces and shares the same instant with the robot mesh and existing frame table. This extends the arena through focused modules and composition.

The [voiceover's code map](../../voiceovers/003-points-directions-pivots.md#learner-code-map) follows this dependency sequence and identifies supporting graphics separately from the mathematics.

## Verification

From this episode directory:

```powershell
.\.venv\Scripts\python.exe verify_notebook.py
```

With the uv project workflow, use `uv run python verify_notebook.py`. The verifier starts a fresh temporary kernel using its own interpreter, executes all cells, changes every experiment's controls, checks results, restores initial views, and saves the executed notebook. Narration lives in the notebook's explanatory text and the separate voiceover; code-cell comment prefixes are optional. The verifier checks six figures and five widget views. Evidence goes into ignored `verification/`.

From `projects/robot-world/`, run `npm run check`. It checks formatting, all tests, strict TypeScript, the simulation without DOM types, and the production build.

Verified on 2026-10-19:

- A fresh Python 3.13.16 environment installed all 101 locked packages.
- Fresh-kernel execution passed all 13 code cells, five live widget callback checks, six figure outputs, and five widget views, including restored initial results.
- `npm run check` passed 129 tests in 15 files, both TypeScript checks, formatting, and build. Tests cover direction weights, endpoint differences, signed pivot rotations, preserved radii, independent snapshots, paused application, bounds rejection, input disposal, and page/view contracts.
- The current L2 orbit was confirmed in the production playground: applying it changes the robot's center. Earlier browser checks also verified the shared preview, applied pose, camera and frame-axis changes, reset behavior, and rejection of an out-of-bounds preview.

- Earlier browser checks at a 390 × 844 viewport confirmed the page and pivot table fit without horizontal overflow. Resuming disabled rotation controls; a half-second forward hold moved the robot approximately `0.90` meters.
- JupyterLab rendered all 13 sliders. Increasing anchor x from `1.00` to `1.25` redrew the arrow with A `(1.25,1)` and B `(3.25,2)`, while the direction stayed `(2,1)`. Display equations rendered as matrices.
- No console warnings or errors were recorded in the production playground; the live notebook reported no console errors.

The existing Vite size warning remains: the entry is approximately 642 kB, about 160 kB compressed, and the build passes.
