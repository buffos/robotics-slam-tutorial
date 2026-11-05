# Episodes

| Episode                                                                        | Question                                                           | Experiment                                                                                                                 | Voiceover                                               | Checkpoint    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- |
| [001 · Robot world](001-robot-world/README.md)                                 | What are we moving, and in what world?                             | [Robot world](../projects/robot-world/README.md)                                                                           | [Script](../voiceovers/001-robot-world.md)              | `slam-ep-001` |
| [002 · Coordinate frames](002-coordinate-frames/README.md)                     | How can one point have different coordinates?                      | [Notebook](002-coordinate-frames/coordinate-frames.ipynb) · [Robot world](../projects/robot-world/README.md)               | [Script](../voiceovers/002-coordinate-frames.md)        | `slam-ep-002` |
| [003 · Points, directions, and pivots](003-points-directions-pivots/README.md) | Why does translation move a point but leave a direction unchanged? | [Notebook](003-points-directions-pivots/points-directions-pivots.ipynb) · [Robot world](../projects/robot-world/README.md) | [Script](../voiceovers/003-points-directions-pivots.md) | `slam-ep-003` |
| [004 · The robot motion model](004-robot-motion-model/README.md)                          | What calculations turn each drive command into a new pose?          | [Robot world](../projects/robot-world/README.md)                                                                          | [Script](../voiceovers/004-robot-motion-model.md)       | Draft         |

Open a lesson's README first. Its folder holds that lesson's notebook or exercise assets when needed. Project guides contain the commands for executable applications.

After an episode has been reviewed and tagged, explore its checkpoint without changing this checkout:

```sh
git worktree add --detach ../learning-slam-ep-001 slam-ep-001
cd ../learning-slam-ep-001/projects/robot-world
npm ci
npm run dev
```
