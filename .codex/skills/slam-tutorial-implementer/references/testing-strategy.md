# Testing Strategy

The robot arena is cumulative software, so behavior tests are part of its design and its safety net. Every episode that changes arena behavior should add or update focused automated tests in the same episode work. Do not postpone basic testability until the arena becomes large.

## Put tests at stable boundaries

- Test deterministic domain and mathematical behavior without Three.js where practical.
- Test module contracts and important interactions at their public boundaries. Prefer a few behavior-focused cases over tests coupled to private implementation details.
- For stochastic behavior, inject or seed the random source so tests are repeatable. Check invariants and distributions with robust tolerances rather than brittle exact samples.
- When an episode changes rendering, test the state or view-model contract first. Add browser or visual smoke coverage only when it protects a user-visible behavior; avoid large pixel snapshots of the whole arena by default.
- In notebooks, use small assertions beside mathematical examples when they help learners catch a wrong result. These checks complement the arena's automated suite; they do not replace it.

## Run checks before checkpointing

Use the repository's existing test runner and run the focused tests for the changed capability before handing the episode to slam-lesson-closer for its commit and tag. Run the broader suite when it is reasonably fast and relevant. If no runner exists, introduce the smallest fitting test setup as part of the first code episode that needs it; avoid a separate speculative testing framework project.

A failing test blocks the episode's commit/tag until the behavior is corrected or the failure is clearly reported. Never update or create an episode tag for code that has not passed its relevant checks. Keep tests in the same conceptual commit as the behavior they protect when possible.

Notebook-only, prose, and diagram-only episodes do not need unrelated arena tests. If executable notebook cells are changed and the environment supports notebook execution, run the notebook from a clean kernel when the episode's requested verification includes it; otherwise report that it was not executed. Do not claim checks passed unless they actually ran and passed.
