# Episode Workflow

## Choose the episode and outputs

When available, read the numbered table in tmp/skeleton.txt locally. It is private course-planning material and must remain Git-ignored. Use it to scope only the requested episode; do not copy future rows, chapter contents, or roadmap summaries into tracked files, commits, tags, or voiceovers. Ten-episode blocks are chapter arcs, not a request to implement ten episodes at once.

Use the row's Type as the deliverable contract:

| Type-field signal | Expected work |
|---|---|
| Contains Notebook | A new interactive notebook. |
| Contains TS or Three.js | The named TypeScript/Three.js capability in the relevant playground. |
| Contains both signals | Both deliverables, connected by the row's learning goal. |
| Names an architecture view | Create the requested diagram or architecture view; add code only if the row also names TS or Three.js. |

Existing repository conventions take precedence over example paths below. When no convention exists, use one notebook per episode under notebooks/NNN-topic.ipynb, one persistent robot arena under a clearly named playground directory, and voiceover documents under voiceovers/.

## Build the notebook

1. State the question the episode answers and connect it to prior learning.
2. Introduce the intuition, then work through a small numerical or geometric example.
3. Make the important quantities visible with runnable cells and plots or diagrams where useful.
4. Let the learner vary inputs and observe how the result changes; explain assumptions and edge cases.
5. End with the takeaway and a short bridge to the arena or the next numbered episode.

Keep cells runnable from a fresh kernel in order. Use the repository's established kernel and dependencies; if none exist, choose the simplest suitable setup and record it in the notebook. Prefer Python for numerical exploration unless the repository or episode has a reason to use another kernel.

For every substantive code cell, place a concise, speakable voiceover comment before the code using that cell language's comment syntax. The narration should explain the concept, the question being explored, and what to notice in the result. For a cell format that cannot contain comments safely, place the voiceover in the immediately preceding Markdown cell. By default, write tutorial narration in English for a broad audience; follow an explicit language choice from the user.

## Extend the arena

Before editing, trace only the relevant path through the current project. Keep simulation state, domain behavior, observation processing, and visualization in clear responsibilities as the current episode introduces them. Keep core behavior independent of rendering where practical; let Three.js present state rather than own every algorithm. This makes deterministic behavior testable without a browser or scene renderer.

Add a small public contract when another module needs to depend on a capability without knowing its implementation. Introduce dependency inversion or IoC when the episode teaches it or the current coupling gives a concrete reason. Do not introduce a generic plugin system, service container, or future modules just because a later topic might use one.

Keep the main robot arena cumulative. Create a separate focused playground when it makes a concept clearer or preserves a distinct state model; do not force every demonstration into the shared arena when that would obscure the lesson.

## Keep scope and evidence clear

Implement only the selected row's promised capability. Do not rewrite earlier notebooks to match a new style unless the requested episode requires it. Record manual run instructions in the notebook when useful. For code episodes, add or update and run the focused tests described in references/testing-strategy.md before handing the episode to slam-lesson-closer for commit and tags. For notebook-only or documentation-only episodes, report which checks were relevant and what remains unexecuted.
