---
name: slam-tutorial-implementer
description: Implements one incremental episode in the SLAM learning series, pairing interactive Jupyter exploration with only the TypeScript and Three.js robot-arena changes the episode needs. Use when creating or continuing a numbered SLAM tutorial, its notebook, arena capability, episode voiceover draft or a reviewable lesson.
---

# SLAM Tutorial Implementer

Build the series one video episode at a time. Each episode should teach one idea, make it explorable in a notebook when the curriculum calls for one, and add only the corresponding capability to the arena.

## Quick start

Treat tmp/skeleton.txt as a private, local-only curriculum source when it is available. One numbered row is one video episode, and each group of ten is a learning arc. The file is intentionally Git-ignored: never stage it, copy its future entries into tracked artifacts, or disclose them in commits or narration. Implement one episode per run unless the user explicitly requests a range. Read [tutorial-workflow.md](references/tutorial-workflow.md), [testing-strategy.md](references/testing-strategy.md), and [voiceover-conventions.md](references/voiceover-conventions.md) before making episode changes.

## Workflow

1. Inspect repository instructions, current files, Git status, existing notebooks, commits, and tags. Preserve existing user work.
2. Resolve the episode from the user request. If asked for the next episode, consult the private curriculum only in this checkout and compare its entries with notebooks, commits, and tags. Do not guess when the source is unavailable, and do not reveal future entries.
3. Write the episode outline and its voiceover plan before implementation. Follow the row's Type field: notebook, arena, or both. A notebook-only episode should not cause unrelated arena changes.
4. Start each experiment with its physical goal and explicit conditions: what should change, what must remain fixed, and which behavior we choose. Then give the known inputs, desired outputs, and purposeful calculation steps. Show the actual matrices and why each is needed before using them in products or code. Follow [tutorial-workflow.md](references/tutorial-workflow.md#build-the-notebook). Explore the idea interactively, then extend the smallest relevant arena boundary. Keep each episode cumulative without implementing later topics early.
5. Apply SOLID principles at the scale the episode justifies. Add interfaces, inversion of control, or extension points when they solve a concrete dependency or teach that concept; avoid speculative frameworks.
6. Put spoken voiceover comments before notebook code cells and create an episode voiceover draft with conceptual narration and a file-to-capability map. Connect each learned idea to the reason for the next implementation step, following [voiceover-conventions.md](references/voiceover-conventions.md).
7. For behavior-changing arena work, add or update focused automated tests and run the relevant checks before handoff for closeout. Follow references/testing-strategy.md.
8. Summarize the idea taught, artifacts, tests added or updated, checks run, and any remaining verification. Leave all changes uncommitted and untagged for review. Use slam-lesson-closer only when the user asks to checkpoint the episode.

## Guardrails

- Keep one notebook per episode; do not turn it into a growing transcript of the whole course.
- Keep math and estimation logic independent of Three.js rendering where practical.
- Use a separate focused playground when a concept is clearer outside the shared robot arena.
- This skill never creates commits or tags. Keep notebook-only or documentation-only episodes free of unrelated test scaffolding. Never claim an unrun notebook, test, or application was executed successfully.
