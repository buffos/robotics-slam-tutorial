# Commit and Tag Convention

## Commit layout

Prefer one commit for one video episode. Split into two only when the notebook exploration and arena implementation are independently useful, testable learning chunks.

- One commit: message tutorial(ep-NNN): topic; annotated tag slam-ep-NNN.
- Two commits: messages tutorial(ep-NNN-notebook): topic and tutorial(ep-NNN-arena): capability. Tag each commit slam-ep-NNN-notebook and slam-ep-NNN-arena. Add the canonical annotated tag slam-ep-NNN to the final commit.

The voiceover document for each commit must be included in that commit and describe its conceptual change and the responsibility of each changed file. Use the episode draft from slam-tutorial-implementer and split or refine it to match the final commit boundaries. Include the tag name in the voiceover metadata when useful, but never include future curriculum details.

## Safe local closeout

Create annotated tags locally after the corresponding commits. Check all names first. If a tag already exists, do not move or force-update it; stop and report the collision. The canonical episode tag points to the complete episode state.

Stage only the episode's code, notebook, tests, and voiceover files. Do not force-add tmp/skeleton.txt. If unrelated staged files exist, preserve them and do not run a normal commit that would include them. Do not push tags or commits; pushing is a separate user action.
