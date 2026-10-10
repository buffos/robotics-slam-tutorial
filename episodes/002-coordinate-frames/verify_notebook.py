"""Execute this lesson in a fresh local kernel and check its visual experiments.

Run with the episode's virtual-environment Python. A temporary kernel spec
uses that same interpreter; no machine-wide Jupyter registration is required.
Generated evidence belongs in the ignored verification directory.
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


def main():
    directory = Path(__file__).resolve().parent
    path = directory / "coordinate-frames.ipynb"
    notebook = nbformat.read(path, as_version=4)
    nbformat.validate(notebook)
    original_count = len(notebook.cells)
    for index, cell in enumerate(notebook.cells):
        if cell.cell_type == "code" and not cell.source.startswith("# Voiceover:"):
            raise AssertionError(f"Code cell {index} needs its voiceover first.")

    # These checks operate actual widget values. A broken callback or a stale
    # picture-producing experiment fails here, even if static examples passed.
    notebook.cells.append(nbformat.v4.new_code_cell("""
import contextlib
import io
with contextlib.redirect_stdout(io.StringIO()):
    translation_lab.children[0].value = 2.0
    np.testing.assert_allclose(translation_lab.result, [0, 1])
    rotation_lab.children[0].value = -90.0
    np.testing.assert_allclose(rotation_lab.result, [-1, 2], atol=1e-12)
    rigid_lab.children[0].value = 2.0
    np.testing.assert_allclose(rigid_lab.result, [np.sqrt(2), np.sqrt(2)], atol=1e-12)
    inverse_lab.children[2].value = -90.0
    assert inverse_lab.result < 1e-12
    before = sensor_lab.result['world_from_sensor'].copy()
    sensor_lab.children[0].value = -1.0
    after = sensor_lab.result['world_from_sensor']
    assert not np.allclose(before, after)
    np.testing.assert_allclose(after[:2, 2], [-1.1, 1.25], atol=1e-12)
    sensor_lab.children[7].value = True
    assert sensor_lab.kwargs['show_wrong_order'] is True
    # Restore initial views before saving the learner's notebook.
    translation_lab.children[0].value = 1.0
    rotation_lab.children[0].value = 90.0
    rigid_lab.children[0].value = 1.0
    inverse_lab.children[2].value = 90.0
    sensor_lab.children[0].value = 2.0
    sensor_lab.children[7].value = False
print('Five experiments ran; widget changes invoked their callbacks.')
"""))

    with TemporaryDirectory(prefix="slam-ep-002-") as temporary:
        kernels = Path(temporary)
        spec_directory = kernels / "episode002"
        spec_directory.mkdir()
        (spec_directory / "kernel.json").write_text(json.dumps({
            "argv": [sys.executable, "-m", "ipykernel_launcher", "-f", "{connection_file}"],
            "display_name": "Episode 002 verification", "language": "python",
        }), encoding="utf-8")
        manager = KernelManager(kernel_name="episode002",
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
    if figure_count < 6 or widget_count != 5:
        raise AssertionError(f"Expected six reference figures and five widget views; got {figure_count}, {widget_count}.")
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
