# Episodes

| Episode                                        | Question                               | Experiment                                       | Voiceover                                  | Checkpoint    |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------ | ------------------------------------------ | ------------- |
| [001 · Robot world](001-robot-world/README.md) | What are we moving, and in what world? | [Robot world](../projects/robot-world/README.md) | [Script](../voiceovers/001-robot-world.md) | `slam-ep-001` |

Open a lesson's README first. Its folder holds that lesson's notebook or exercise assets when needed. Project guides contain the commands for executable applications.

After an episode has been reviewed and tagged, explore its checkpoint without changing this checkout:

```sh
git worktree add --detach ../learning-slam-ep-001 slam-ep-001
cd ../learning-slam-ep-001/projects/robot-world
npm ci
npm run dev
```
