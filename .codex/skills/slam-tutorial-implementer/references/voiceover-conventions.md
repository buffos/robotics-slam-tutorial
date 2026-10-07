# Voiceover Conventions

## Notebook narration

A notebook is both an interactive experiment and a video script. Put a short voiceover comment immediately before each substantive code cell. Speak to the learner in complete, natural sentences; describe the idea, why the calculation or visualization matters, and what to notice in the result. Do not narrate every line or read identifiers aloud.

Use valid comments for the active kernel, such as hash comments in Python or slash comments in TypeScript. If a magic command or other cell syntax cannot safely contain a comment, put the narration in the immediately preceding Markdown cell.

Default tutorial narration language is English for a broad audience. Keep the language consistent across the notebook and its voiceover unless the user requests otherwise.

## Episode voiceover draft

Create an episode-level voiceover draft under voiceovers/ that explains the learning goal and new capability in conceptual terms. Include a short map from changed file paths to the responsibility or capability each now supports, plus any important boundary or tradeoff.

Do not make it a line-by-line changelog or list of function edits. Mention paths to orient the listener, not to narrate implementation trivia. Do not include private roadmap material; identify only the current episode.

The implementer leaves this as a draft for review. When the user later calls slam-lesson-closer, the closer aligns voiceover files with the final commit split so every commit has its own narration and file-to-capability map.
