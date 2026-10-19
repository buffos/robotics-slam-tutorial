"""Execute this notebook in a fresh kernel and exercise its five live experiments.

Use this episode's Python environment. A temporary kernel spec selects that
interpreter without registering anything globally. Evidence is Git-ignored.
"""

import base64
import json
from pathlib import Path
import sys
from tempfile import TemporaryDirectory

import nbformat
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager
from nbclient import NotebookClient


CALLBACK_CHECKS = """
import contextlib
import io
with contextlib.redirect_stdout(io.StringIO()):
    anchor_lab.children[0].value = -1.0
    np.testing.assert_allclose(anchor_lab.result['a'], [-1, 1])
    np.testing.assert_allclose(anchor_lab.result['b'], [1, 2])
    np.testing.assert_allclose(anchor_lab.result['direction'], [2, 1])

    weights_lab.children[0].value = 2.0
    np.testing.assert_allclose(weights_lab.result['point'], [4, 0])
    np.testing.assert_allclose(weights_lab.result['direction'], [1, 0])
    weights_lab.children[2].value = 90.0
    np.testing.assert_allclose(weights_lab.result['point'], [1, 1], atol=1e-12)
    np.testing.assert_allclose(weights_lab.result['direction'], [0, 1], atol=1e-12)

    endpoints_lab.children[0].value = -2.0
    np.testing.assert_allclose(endpoints_lab.result['direct'], [-1, 2], atol=1e-12)
    np.testing.assert_allclose(endpoints_lab.result['wrong'], [-3, 3], atol=1e-12)
    endpoints_lab.children[3].value = True
    assert endpoints_lab.kwargs['show_wrong'] is True
    endpoints_lab.children[0].value = 0.0
    endpoints_lab.children[1].value = 0.0
    assert endpoints_lab.result['error'] < 1e-12

    pivot_lab.children[0].value = 0.0
    np.testing.assert_allclose(pivot_lab.result['point'], [0, 4], atol=1e-12)
    pivot_lab.children[1].value = 0.0
    pivot_lab.children[2].value = -90.0
    np.testing.assert_allclose(pivot_lab.result['point'], [1, -3], atol=1e-12)
    np.testing.assert_allclose(pivot_lab.result['pivot'], [0, 0], atol=1e-12)
    pivot_lab.children[3].value = True
    assert pivot_lab.kwargs['show_origin_rotation'] is True

    robot_lab.children[0].value = 'robot'
    np.testing.assert_allclose(robot_lab.result['center'], [0, 0], atol=1e-12)
    robot_lab.children[2].value = 30.0
    np.testing.assert_allclose(robot_lab.result['forward'], [-0.5, np.sqrt(3)/2], atol=1e-12)
    robot_lab.children[0].value = 'L2'
    robot_lab.children[1].value = -90.0
    np.testing.assert_allclose(robot_lab.result['center'], [-3, 5], atol=1e-12)
    np.testing.assert_allclose(robot_lab.result['forward'], [0.5, -np.sqrt(3)/2], atol=1e-12)
    np.testing.assert_allclose(robot_lab.result['radius'], np.sqrt(17))

    # Restore each initial figure before saving the notebook's widget state.
    for lab, values in [
        (anchor_lab, [1.0, 1.0]),
        (weights_lab, [1.0, -1.0, 0.0]),
        (endpoints_lab, [2.0, 1.0, 90.0, False]),
        (pivot_lab, [1.0, 1.0, 90.0, False]),
        (robot_lab, ['L2', 90.0, 0.0]),
    ]:
        for control, value in zip(lab.children, values):
            control.value = value

    np.testing.assert_allclose(robot_lab.result['center'], [5, 3], atol=1e-12)
    np.testing.assert_allclose(robot_lab.result['forward'], [0, 1], atol=1e-12)
    np.testing.assert_allclose(transform_point(rotation_about_pivot([1, 1], 90), [3, 1]), [1, 3], atol=1e-12)
    np.testing.assert_allclose(moved_center, [-3, 5], atol=1e-12)
    np.testing.assert_allclose(recovered_center, [0, 0], atol=1e-12)
print('Five widget callbacks and their restored initial results passed.')
"""


def main():
    directory = Path(__file__).resolve().parent
    path = directory / "points-directions-pivots.ipynb"
    notebook = nbformat.read(path, as_version=4)
    nbformat.validate(notebook)
    original_count = len(notebook.cells)
    notebook.cells.append(nbformat.v4.new_code_cell(CALLBACK_CHECKS))

    with TemporaryDirectory(prefix="slam-ep-003-") as temporary:
        kernels = Path(temporary)
        spec_directory = kernels / "episode003"
        spec_directory.mkdir()
        (spec_directory / "kernel.json").write_text(json.dumps({
            "argv": [sys.executable, "-m", "ipykernel_launcher", "-f", "{connection_file}"],
            "display_name": "Episode 003 verification", "language": "python",
        }), encoding="utf-8")
        manager = KernelManager(kernel_name="episode003",
                                kernel_spec_manager=KernelSpecManager(kernel_dirs=[str(kernels)]))
        client = NotebookClient(notebook, km=manager, timeout=120,
                                resources={"metadata": {"path": str(directory)}},
                                store_widget_state=True)
        try:
            client.execute()
        finally:
            if manager.has_kernel:
                manager.shutdown_kernel(now=True)

    notebook.cells = notebook.cells[:original_count]
    figure_count = sum("image/png" in output.get("data", {})
                       for cell in notebook.cells if cell.cell_type == "code"
                       for output in cell.outputs)
    widget_count = sum("application/vnd.jupyter.widget-view+json" in output.get("data", {})
                       for cell in notebook.cells if cell.cell_type == "code"
                       for output in cell.outputs)
    if figure_count != 6 or widget_count != 5:
        raise AssertionError(f"Expected six figures and five widget views; got {figure_count}, {widget_count}.")
    nbformat.write(notebook, path)
    evidence = directory / "verification"
    evidence.mkdir(exist_ok=True)
    for index, cell in enumerate(notebook.cells):
        for output in cell.get("outputs", []):
            png = output.get("data", {}).get("image/png")
            if png:
                (evidence / f"cell-{index:02d}.png").write_bytes(base64.b64decode(png))
    print(f"Passed: {sum(cell.cell_type == 'code' for cell in notebook.cells)} code cells, "
          f"{figure_count} reference figures, {widget_count} interactive views.")


if __name__ == "__main__":
    main()
