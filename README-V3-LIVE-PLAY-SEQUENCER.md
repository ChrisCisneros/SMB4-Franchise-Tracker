# SMB4 Franchise Central V3 - Live Play Sequencer

This build extends the V3 Live Field / GameCast system.

## New controls

- Advance Everyone +1
  - Batter moves Home -> 1B.
  - Existing runners advance one base.
  - A runner on 3B scores.
  - Uses the normal game history so Undo can restore the previous state.

- Animated Play console
  1. Turn on Field Mode.
  2. Drag the baseball to the destination of the play.
  3. Choose Hits, Outs, or Other.
  4. Choose the play result.
  5. Press Start Play.

The sequence is synced as one event and animates locally on Live and Dashboard:

Pitcher -> Home -> batted-ball destination -> runner movement.

The existing `applyQuickPlay` scoring/stat logic is reused after the animation begins, so hits, outs, errors, runs, player stats, pitch counts, batter advancement, and play log entries use the same logic as the existing scorer.

## Result-specific animation behavior

- Single / Double / Triple / HR: pitch, contact, ball flight, then base-running routes.
- Fly Out / Ground Out / Line Out / Pop Up / FC / DP / Error / Sac Fly: pitch, contact, ball flight, then applicable runners.
- Walk / HBP: pitch to home, then forced runner movement.
- Pickoffs: pitcher to selected base.
- Caught Stealing: runner-only animation.
- Challenge result buttons: log normally without pretending there was a batted ball.

## Ball reset

Manual ball placement and animated plays automatically clear the ball marker after about 10 seconds. The ball returns to its staging position and the completed play event is cleared so newly opened Dashboard screens do not replay an old event.

## Field polish

The field now has a cleaner outfield shape, warning track, grass infield diamond, stronger foul lines, and improved visual depth.

Keep your existing `firebase.js` when applying this build.
