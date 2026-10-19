import { CanvasTexture, Sprite, SpriteMaterial } from "three";

/** Camera-facing text shared by landmarks, frame axes, and pivot previews. */
export function sceneLabel(text: string, color = "#f1c49e"): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("A 2D canvas context is required for scene labels.");
  // Longer captions need a wider texture at the same font height. Resizing a
  // canvas clears its drawing state, so set the font again before writing.
  context.font = "600 42px system-ui, sans-serif";
  canvas.width = Math.max(128, Math.ceil(context.measureText(text).width) + 24);
  context.fillStyle = "#142d38";
  context.beginPath();
  context.roundRect(4, 4, canvas.width - 8, 56, 12);
  context.fill();
  context.fillStyle = color;
  context.font = "600 42px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, 32);
  const texture = new CanvasTexture(canvas);
  const sprite = new Sprite(
    new SpriteMaterial({ map: texture, transparent: true }),
  );
  sprite.scale.set((1.2 * canvas.width) / 128, 0.6, 1);
  return sprite;
}
