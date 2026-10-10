"""Drawing support for episode 002. The notebook owns the transforms being taught.

These helpers only draw supplied matrices and coordinates. Axis lengths are
visual aids in meters; they do not change a frame's physical transformation.
"""

from math import ceil

import matplotlib.pyplot as plt
import numpy as np

WORLD_COLOR = "#4f6d7a"
ROBOT_COLOR = "#007c66"
SENSOR_COLOR = "#c76b32"


def draw_frame(ax, matrix, name, color, *, dashed=False):
    """Draw the supplied origin and the columns of its rotation matrix."""
    origin = matrix[:2, 2]
    for axis, direction in zip(("x", "y"), matrix[:2, :2].T):
        end = origin + 1.2 * direction
        ax.annotate(
            "", xy=end, xytext=origin,
            arrowprops={"arrowstyle": "->", "color": color, "lw": 2,
                        "linestyle": "--" if dashed else "-"},
        )
        prefix = {"world": "W", "robot": "R", "sensor": "S"}.get(name, "wrong")
        ax.text(*(end + 0.12 * direction), f"{prefix} {axis}", color=color,
                fontsize=9, ha="center", va="center",
                bbox={"facecolor": "white", "alpha": 0.8, "edgecolor": "none"})
    ax.scatter(*origin, color=color, s=25, zorder=4, label=name)


def draw_point(ax, point, name="L", color="#34495e"):
    ax.scatter(*point, color=color, s=60, zorder=5)
    # Keep coordinate text in the panel title so it cannot cover the axis labels.
    ax.annotate(name, point, xytext=(7, -14), textcoords="offset points",
                fontsize=10, fontweight="bold", va="top")


def finish_axes(ax, title, extent):
    # Equal scales make right angles and preserved lengths visible.
    limit = max(3, ceil(float(extent)) + 1)
    ax.set(xlim=(-limit, limit), ylim=(-limit, limit),
           xlabel="x / m", ylabel="y / m", title=title)
    ax.set_aspect("equal", adjustable="box")
    ax.axhline(0, color="#d7dde0", lw=0.8)
    ax.axvline(0, color="#d7dde0", lw=0.8)
    ax.grid(alpha=0.25)


def show_experiment(frames, world_point, local_points, *, recovered=None,
                    wrong_frame=None):
    """Compare one world picture with the provided point in each local frame.

    frames: sequence of (name, homogeneous matrix, color).
    local_points: sequence of (name, already calculated point, color).
    """
    fig, axes = plt.subplots(1, 1 + len(local_points),
                             figsize=(5 * (1 + len(local_points)), 4.7),
                             squeeze=False, layout="constrained")
    world_ax = axes[0, 0]
    world_extent = max(np.max(np.abs(world_point)), 2)
    for name, matrix, color in frames:
        draw_frame(world_ax, matrix, name, color)
        world_extent = max(world_extent, np.max(np.abs(matrix[:2, 2])) + 1.5)
    draw_point(world_ax, world_point)
    if recovered is not None:
        world_ax.scatter(*recovered, s=160, facecolors="none",
                         edgecolors=ROBOT_COLOR, lw=2, label="Recovered L", zorder=6)
    if wrong_frame is not None:
        draw_frame(world_ax, wrong_frame, "wrong order", "#b54652", dashed=True)
        world_extent = max(world_extent, np.max(np.abs(wrong_frame[:2, 2])) + 1.5)
    finish_axes(world_ax, f"World geometry\nL = ({world_point[0]:.2f}, {world_point[1]:.2f}) m", world_extent)
    world_ax.legend(loc="lower left", fontsize=8)

    for ax, (name, point, color) in zip(axes[0, 1:], local_points):
        draw_frame(ax, np.eye(3), name, color)
        ax.plot([0, point[0]], [0, point[1]], color=color, lw=1.5)
        ax.plot([point[0], point[0], 0], [0, point[1], point[1]],
                color=color, linestyle=":", alpha=0.6)
        draw_point(ax, point, color=color)
        finish_axes(ax, f"Same L in {name}\n({point[0]:.2f}, {point[1]:.2f}) m", np.max(np.abs(point)))
    plt.show()
    plt.close(fig)
