---
name: slam-lesson-closer
description: Closes a reviewed SLAM tutorial in local Git by validating its final changes, creating its commit or commits, and adding annotated episode tags. Use only after the user is ready to checkpoint an episode; never push.
---

# SLAM Lesson Closer

Use this skill only after the tutorial implementation and requested corrections are complete. Calling it authorizes the local commit and tag workflow for the named episode. It never pushes to a remote.

## Workflow

1. Confirm the episode number and inspect repository instructions, branch, status, index, final diff, recent history, and existing tags. Preserve all unrelated or pre-staged work.
2. Review the final episode scope. Ensure the relevant tests and voiceover are present. Never stage or commit the ignored curriculum file or future roadmap material.
3. Run the focused tests for the final code and the broader suite when relevant and reasonably fast. If code changed since the last test run, rerun the affected checks. If checks fail, leave the episode uncommitted and untagged; report the failure for the implementer to fix.
4. Choose one commit by default. Use two only when the notebook and arena changes are independent learning chunks that can each be reviewed and tested. Ensure each planned commit has its own concept-level voiceover file; split or update the draft before committing.
5. Check every planned tag name for collisions before creating commits. Never force-update or move an existing tag. If a name is already taken, stop and report it.
6. Review the exact files to include. Stage only files belonging to this episode. If unrelated files are already staged, stop without resetting the index and report their paths.
7. Create the commit or commits and their annotated tags using references/commit-and-tag.md. Verify the resulting commit contents, tags, and remaining worktree state.
8. Report the commit hashes, tag names, tests run, voiceover files, and any unrelated changes left untouched.

## Guardrails

- Do not implement feature fixes or expand the episode during closeout. Return code or test problems to slam-tutorial-implementer.
- Do not push, amend, rebase, squash, reset, or force-update tags as part of this skill.
- Do not close a tutorial plan or a worktree that the user has not declared ready for checkpointing.
