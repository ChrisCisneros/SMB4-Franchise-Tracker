# Franchise Central V3 - Live Play Physics Update

## What's new

### Ball motion by play type
The animated baseball now has different movement profiles instead of simply sliding from point A to point B:
- Ground balls skim and bounce across the field.
- Line drives travel flatter and faster.
- Singles carry on a lower arc.
- Doubles and triples get progressively deeper flight.
- Fly outs and sacrifice flies climb before dropping.
- Pop ups rise steeply and hang.
- Home runs get the largest, longest arc.
- Every batted play still begins with a visible pitcher-to-home pitch and contact pop.

Runner animation waits for the ball flight to finish before beginning.

### 7-second ball reset
Manual ball locations and animated-play locations now reset automatically after about 7 seconds instead of 10.

### Manual runner override
If you move, add, remove, or advance runners manually before pressing Start Play, the current plate appearance switches to Manual Runners mode.

When Start Play is pressed:
- Existing runners you already positioned will NOT auto-advance a second time.
- The batter still receives the correct destination for a single/double/triple, reaches first on a walk/HBP/error/fielder's choice, or scores on a home run.
- Stats, count reset, outs, play log, and batter advancement still use the normal scoring engine.
- Manual Runners mode clears automatically after the play is logged.

The Live scoring console shows a `Manual runners` badge while the override is active.

### Remove accidental runners
When a base is occupied, Field Mode now shows an explicit `Remove 1B`, `Remove 2B`, or `Remove 3B` button. Removing a runner also enables Manual Runners mode for that plate appearance so Start Play does not recreate the runner unexpectedly.

## Existing behavior preserved
- Advance Everyone +1 still works and is undoable.
- Dragging runners to Home still scores them.
- The normal click-to-toggle bases remain available.
- Animated plays continue to use the existing scoring/stat/play-log engine.
- Dashboard GameCast continues to mirror the same synced play event through Firebase.
