# V3 Live Field — Stolen Base + Operator Polish

This update builds on the Live Play Physics version.

## Fixes
- Fixed the base-toggle crash when removing an occupied base by clicking it.
- Explicit Remove 1B / Remove 2B / Remove 3B controls remain available.

## Stolen bases
Field Mode now shows contextual stolen-base actions:
- Steal 2B when a runner is on 1B and 2B is open.
- Steal 3B when a runner is on 2B and 3B is open.
- Steal Home when a runner is on 3B.

A stolen base:
- moves only that runner,
- preserves the batter and ball/strike count,
- writes a Stolen base entry to Latest Play and the play log,
- animates the runner on Live and Dashboard through Firebase currentGame sync,
- scores normally on a steal of home.

## Smoother ball motion
Batted-ball animations now use longer, multi-stage motion curves for:
- ground balls,
- liners,
- singles,
- doubles/triples,
- fly balls,
- popups,
- home runs.

Runner timing was lengthened to wait until the new ball flight completes.
Ball markers still reset after about 7 seconds.

## Operator layout
On wider screens the GameCast field and Animated Play console now sit side-by-side, and the play console remains sticky while working the field. The layout falls back to one column below 1180px.
