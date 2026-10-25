# V3 Live Field polish

This update refines the live GameCast field and runner motion.

- Field proportions and outfield/infield geometry were cleaned up.
- Runner animations now follow the baseball basepath instead of cutting across the diamond.
- Home -> 2B routes through 1B.
- Home -> 3B routes through 1B and 2B.
- 1B -> 3B routes through 2B.
- Clicking an empty base now creates a runner animation from Home to that base before the runner settles there.
- The destination runner is hidden while its travel animation is active to avoid the duplicate/teleport look.
- Existing drag controls, score-on-home behavior, ball placement, Firebase sync, and quick base toggles remain intact.
