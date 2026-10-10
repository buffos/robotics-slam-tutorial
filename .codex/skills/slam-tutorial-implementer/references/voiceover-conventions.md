# Voiceover Conventions

## Notebook narration

A notebook is both an interactive experiment and a video script. Put a short voiceover comment immediately before each substantive code cell. Speak to the learner in complete, natural sentences; describe the idea, why the calculation or visualization matters, and what to notice in the result. Do not narrate every line or read identifiers aloud.

Follow the notebook's reasoning sequence: what we know, what we want to find, the action we take for that reason, and what its result shows. Use transitions such as "We now know the sensor's pose in the world. Our landmark is given in world coordinates, so we reverse the transformation to describe it from the sensor." Keep detailed derivations in the surrounding Markdown; the spoken comment should orient the learner to the current step.

Use valid comments for the active kernel, such as hash comments in Python or slash comments in TypeScript. If a magic command or other cell syntax cannot safely contain a comment, put the narration in the immediately preceding Markdown cell.

Default tutorial narration language is English for a broad audience. Keep the language consistent across the notebook and its voiceover unless the user requests otherwise.

## Episode voiceover draft

Create an episode-level voiceover draft under voiceovers/ that explains the learning goal and new capability in conceptual terms. Include a short map from changed file paths to the responsibility or capability each now supports, plus any important boundary or tradeoff.

Present the implementation as a chronological sequence of meaningful changes. Connect each step to the learning: "We learned this; we need this capability; we implement it here for this reason; its output lets us take the next step." Name the relevant file and responsibility at each transition, and trace how information flows through the calculation and into the view. The sequence should make clear why a change is introduced before the next one.

Do not make it a line-by-line changelog or list of function edits. Mention paths to orient the listener, not to narrate implementation trivia. Do not include private roadmap material; identify only the current episode.

The implementer leaves this as a draft for review. When the user later calls slam-lesson-closer, the closer aligns voiceover files with the final commit split so every commit has its own narration and file-to-capability map.
