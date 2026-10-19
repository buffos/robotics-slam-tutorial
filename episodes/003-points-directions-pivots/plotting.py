"""Draw supplied episode 003 geometry. The notebook owns every transform.

Equal axis scales preserve the visible meaning of distances and right angles.
Arrows can be drawn at different anchors without changing their vector values.
"""

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Polygon
import numpy as np

BEFORE = "#286d9a"
AFTER = "#a26a00"
PIVOT = "#8d398b"
WRONG = "#c33d51"


def axes_for(count, title, points):
    fig, axes = plt.subplots(1, count, figsize=(5 * count, 4.7),
                             squeeze=False, layout="constrained")
    extent = max(3, float(np.max(np.abs(points))) + 1.5)
    for ax in axes[0]:
        ax.set(xlim=(-extent, extent), ylim=(-extent, extent),
               xlabel="x / m", ylabel="y / m")
        ax.set_aspect("equal", adjustable="box")
        ax.axhline(0, color="#cbd5db", lw=0.8)
        ax.axvline(0, color="#cbd5db", lw=0.8)
        ax.grid(alpha=0.2)
    fig.suptitle(title, fontsize=12)
    return fig, axes[0]


def point(ax, value, name, color):
    ax.scatter(*value, color=color, s=50, zorder=5)
    ax.annotate(name, value, xytext=(7, -14), textcoords="offset points",
                color=color, fontsize=10, va="top")


def arrow(ax, anchor, direction, name, color, *, dashed=False):
    end = np.asarray(anchor) + direction
    ax.annotate("", xy=end, xytext=anchor,
                arrowprops={"arrowstyle": "->", "lw": 2.4, "color": color,
                            "linestyle": "--" if dashed else "-"})
    # Put vector descriptions in a legend so they cannot cover endpoint labels.
    ax.plot([], [], color=color, lw=2, ls="--" if dashed else "-", label=name)


def finish(fig):
    for ax in fig.axes:
        if ax.get_legend_handles_labels()[0]:
            ax.legend(loc="lower left", fontsize=8, framealpha=0.95)
    plt.show()
    plt.close(fig)


def show_anchored_arrow(a, b, direction):
    fig, (ax,) = axes_for(1, "A direction describes an offset, not a location", [a, b, direction])
    arrow(ax, np.zeros(2), direction, "same d drawn at O", BEFORE, dashed=True)
    arrow(ax, a, direction, "d = B - A", AFTER)
    point(ax, a, "A", AFTER)
    point(ax, b, "B", AFTER)
    ax.set_title(f"A=({a[0]:.2f}, {a[1]:.2f})   B=({b[0]:.2f}, {b[1]:.2f}) m\n"
                 f"d=({direction[0]:.2f}, {direction[1]:.2f}) m")
    finish(fig)


def show_weighted_transform(p, d, moved_p, moved_d):
    fig, axes = axes_for(2, "The same matrix, two different homogeneous weights",
                         [p, d, moved_p, moved_d])
    for ax, location, vector, name, color in zip(axes, [p, moved_p], [d, moved_d],
                                                ["Robot frame", "World frame"], [BEFORE, AFTER]):
        point(ax, location, "p", color)
        arrow(ax, np.zeros(2), vector, "direction, w=0", color)
        ax.set_title(f"{name}: point=({location[0]:.2f}, {location[1]:.2f}) m\n"
                     f"unit direction=({vector[0]:.2f}, {vector[1]:.2f})")
    finish(fig)


def show_endpoint_check(a, b, moved_a, moved_b, direct, wrong):
    values = [a, b, moved_a, moved_b, moved_a + direct]
    if wrong is not None:
        values.append(moved_a + wrong)
    fig, (left, right) = axes_for(2, "Endpoint subtraction checks the direction transform", values)
    point(left, a, "A", BEFORE)
    point(left, b, "B", BEFORE)
    arrow(left, a, b - a, "B - A", BEFORE)
    left.set_title("Endpoints in robot coordinates")
    point(right, moved_a, "A'", AFTER)
    point(right, moved_b, "B'", AFTER)
    arrow(right, moved_a, direct, "R d = B' - A'", AFTER)
    if wrong is not None:
        arrow(right, moved_a, wrong, "wrong: R d + t", WRONG, dashed=True)
    right.set_title(f"World offset d'=({direct[0]:.2f}, {direct[1]:.2f}) m")
    finish(fig)


def show_pivot_steps(p, c, relative, rotated, moved, arc, wrong):
    values = [p, c, relative, rotated, moved]
    if wrong is not None:
        values.append(wrong)
    fig, (first, second, third) = axes_for(3, "Shift to the pivot, rotate, restore the world position", values)
    arrow(first, np.zeros(2), relative, "p - c", BEFORE)
    point(first, relative, "q", BEFORE)
    first.set_title(f"1. Subtract the pivot\n({relative[0]:.2f}, {relative[1]:.2f}) m")
    arrow(second, np.zeros(2), rotated, "R (p - c)", AFTER)
    point(second, rotated, "q'", AFTER)
    second.set_title(f"2. Rotate the displacement\n({rotated[0]:.2f}, {rotated[1]:.2f}) m")
    point(third, c, "C", PIVOT)
    point(third, p, "P", BEFORE)
    point(third, moved, "P'", AFTER)
    arrow(third, c, rotated, "restore C", AFTER)
    third.plot(arc[:, 0], arc[:, 1], color=AFTER, lw=1.5)
    third.add_patch(Circle(c, np.linalg.norm(relative), fill=False, color=PIVOT, ls=":", alpha=0.35))
    if wrong is not None:
        point(third, wrong, "wrong: turn about O", WRONG)
    third.set_title(f"3. Add the pivot back\n({moved[0]:.2f}, {moved[1]:.2f}) m")
    finish(fig)


def show_robot_rotation(before_shape, after_shape, center, moved_center,
                        forward, moved_forward, pivot, arc, radius):
    fig, (left, right) = axes_for(2, "A robot center is a point; its forward axis is a direction",
                                 np.vstack([before_shape, after_shape, pivot, arc]))
    for ax, shape, origin, direction, title, color in zip(
        [left, right], [before_shape, after_shape], [center, moved_center],
        [forward, moved_forward], ["Before", "After rotation"], [BEFORE, AFTER],
    ):
        ax.add_patch(Polygon(shape, facecolor=color, edgecolor=color, alpha=0.25))
        point(ax, origin, "center", color)
        arrow(ax, origin, direction, "unit forward", color)
        point(ax, pivot, "C", PIVOT)
        ax.plot([pivot[0], origin[0]], [pivot[1], origin[1]], color=PIVOT, ls=":")
        ax.add_patch(Circle(pivot, radius, fill=False, color=PIVOT, ls=":", alpha=0.25))
        ax.set_title(f"{title}: center=({origin[0]:.2f}, {origin[1]:.2f}) m\n"
                     f"forward=({direction[0]:.2f}, {direction[1]:.2f}), radius={radius:.2f} m")
    right.plot(arc[:, 0], arc[:, 1], color=AFTER, lw=1.5)
    right.add_patch(Polygon(before_shape, fill=False, edgecolor=BEFORE, ls="--", alpha=0.4))
    finish(fig)
