# Voiceover Conventions

## Notebook narration

A notebook is both an interactive experiment and a video script. Put a short voiceover comment immediately before each substantive code cell. Speak to the learner in complete, natural sentences; describe the idea, why the calculation or visualization matters, and what to notice in the result. Do not narrate every line or read identifiers aloud.

Follow the notebook's reasoning sequence: the physical goal and required conditions first, then known inputs, desired outputs, the action we take for that reason, and what its result shows. State chosen behavior explicitly, such as what must happen to orientation while a position changes. The learner should understand the task before seeing the calculation.

When introducing a matrix, describe its purpose and connect it to the actual matrix displayed in the notebook. Recording cues should identify which expanded matrix or numerical multiplication to show at that point. Avoid leaving the listener with only "build the pose matrix" or "apply the transform." Explain which input it acts on and what the result enables next. Describe formulas in speakable words for TTS; keep their LaTeX and detailed derivations in the surrounding Markdown.

Use transitions such as "We now know the sensor's pose in the world. Our landmark is given in world coordinates, so we reverse the transformation to describe it from the sensor." End the experiment by connecting the observed results to its stated conditions.

Use valid comments for the active kernel, such as hash comments in Python or slash comments in TypeScript. If a magic command or other cell syntax cannot safely contain a comment, put the narration in the immediately preceding Markdown cell.

Default tutorial narration language is English for a broad audience. Keep the language consistent across the notebook and its voiceover unless the user requests otherwise.

## Episode voiceover draft

Create an episode-level voiceover draft under voiceovers/ that explains the learning goal and new capability in conceptual terms. Include a short map from changed file paths to the responsibility or capability each now supports, plus any important boundary or tradeoff.

Present the implementation as a chronological sequence of meaningful changes. Connect each step to the learning: "We learned this; we need this capability; we implement it here for this reason; its output lets us take the next step." Name the relevant file and responsibility at each transition, and trace how information flows through the calculation and into the view. The sequence should make clear why a change is introduced before the next one.

Do not make it a line-by-line changelog or list of function edits. Mention paths to orient the listener, not to narrate implementation trivia. Do not include private roadmap material; identify only the current episode.

The implementer leaves this as a draft for review. When the user later calls slam-lesson-closer, the closer aligns voiceover files with the final commit split so every commit has its own narration and file-to-capability map.
