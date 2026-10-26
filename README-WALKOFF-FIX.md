# Walk-Off Detection Fix

This patch replaces the old broad walk-off heuristic.

Previously, any home-team win finalized while the game was left on Bottom 9+ could be saved as a walk-off.

Now a walk-off is only verified when the home team actually crosses from tied/behind to ahead while batting in the bottom of the 9th inning or later.

Changes:
- Added `currentGame.walkoffCandidate`.
- Normal scoring and manual score controls arm it only on a true late home lead change.
- Finalized games save `walkoffVerified` and `walkoffDetectionVersion: 2`.
- News only calls a game a walk-off when `walkoffVerified === true`.
- Game-record walk-off counts also use verified walk-offs, preventing older false positives from polluting the stat.
