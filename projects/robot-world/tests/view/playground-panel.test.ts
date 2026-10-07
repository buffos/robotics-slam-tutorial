// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import page from "../../index.html?raw";
import { DEFAULT_WORLD } from "../../src/simulation/world";
import { PlaygroundPanel } from "../../src/view/playground-panel";

let panel: PlaygroundPanel;

function element<T extends HTMLElement>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

beforeEach(() => {
  // Use the actual page so a changed element ID cannot silently break startup.
  const markup = new DOMParser().parseFromString(page, "text/html");
  // Exercise the panel here; the browser smoke check starts the WebGL app.
  markup.querySelectorAll("script").forEach((script) => script.remove());
  document.body.innerHTML = markup.body.innerHTML;
  panel = new PlaygroundPanel(DEFAULT_WORLD);
});

afterEach(() => {
  panel.dispose();
  document.body.replaceChildren();
});

describe("page presentation boundary", () => {
  it("connects the real page to world data and drive input targets", () => {
    expect(panel.canvas.id).toBe("world-canvas");
    expect(panel.driveButtons.map((button) => button.dataset.drive)).toEqual([
      "KeyW",
      "KeyA",
      "KeyD",
      "KeyS",
    ]);
    expect(element("#world-size").textContent).toBe("16 × 12 m");
    expect(element("#robot-radius").textContent).toBe("0.38");
    expect(document.querySelectorAll("#landmark-list li")).toHaveLength(6);
    expect(element("#landmark-list").textContent).toContain("L1x -5 · y 4");
  });

  it("formats a pose snapshot without changing its units or precision", () => {
    const pose = Object.freeze({ x: 1.234, y: -2.356, heading: Math.PI / 2 });
    panel.renderPose(pose);
    expect(element("#pose-x").textContent).toBe("1.23");
    expect(element("#pose-y").textContent).toBe("-2.36");
    expect(element("#pose-heading").textContent).toBe("90.0");
    expect(pose).toEqual({ x: 1.234, y: -2.356, heading: Math.PI / 2 });
  });

  it("reports action intents and removes their listeners when disposed", () => {
    const actions = { onPause: vi.fn(), onReset: vi.fn(), onCamera: vi.fn() };
    panel.bindActions(actions);
    element("#pause-button").click();
    element("#reset-button").click();
    element("#top-button").click();
    element("#perspective-button").click();
    expect(actions.onPause).toHaveBeenCalledTimes(1);
    expect(actions.onReset).toHaveBeenCalledTimes(1);
    expect(actions.onCamera.mock.calls).toEqual([["top"], ["perspective"]]);
    // A click reports intent; the application must supply the resulting state.
    expect(element("#simulation-status").textContent).toBe("Running");

    panel.dispose();
    element("#pause-button").click();
    element("#reset-button").click();
    element("#top-button").click();
    element("#perspective-button").click();
    expect(actions.onPause).toHaveBeenCalledTimes(1);
    expect(actions.onReset).toHaveBeenCalledTimes(1);
    expect(actions.onCamera).toHaveBeenCalledTimes(2);
  });

  it("reflects supplied pause and camera states in accessible controls", () => {
    panel.setPaused(true);
    panel.setCamera("top");
    expect(element("#pause-button").textContent).toBe("Resume simulation");
    expect(element("#pause-button").getAttribute("aria-pressed")).toBe("true");
    expect(element("#simulation-status").dataset.state).toBe("paused");
    expect(element("#top-button").getAttribute("aria-pressed")).toBe("true");
    expect(element("#perspective-button").getAttribute("aria-pressed")).toBe(
      "false",
    );
    panel.setPaused(false);
    panel.setCamera("perspective");
    expect(element("#pause-button").textContent).toBe("Pause simulation");
    expect(element("#pause-button").getAttribute("aria-pressed")).toBe("false");
    expect(element("#simulation-status").dataset.state).toBe("running");
    expect(element("#top-button").getAttribute("aria-pressed")).toBe("false");
    expect(element("#perspective-button").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("shows a startup failure and disables controls that cannot act", () => {
    PlaygroundPanel.showUnavailable();
    expect(element("#webgl-error").hidden).toBe(false);
    expect(panel.canvas.hidden).toBe(true);
    expect(element("#simulation-status").textContent).toBe("Unavailable");
    expect(
      [...document.querySelectorAll("button")].every(
        (button) => button.disabled,
      ),
    ).toBe(true);
  });
});
