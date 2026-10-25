# SMB4 Franchise Central v3.2 - Live Field / GameCast

This build adds an optional live field visualization without replacing the existing scoring workflow.

## Live controls

- New **Field Mode** toggle in the Live operator bar.
- Drag the batter token from home to 1B / 2B / 3B to place the batter-runner.
- Drag occupied runner tokens between bases.
- Drag an occupied runner to **HOME** to score one run; the real score, inning line score, and base occupancy update together.
- Existing base buttons still work normally.
- Choose a ball result (`HIT`, `1B`, `2B`, `3B`, `HR`, `OUT`, `ERROR`, `FOUL`) and drag the baseball to the play location.
- Ball placement is visual only, by design, so it cannot accidentally duplicate a hit/out/score entered with the normal scoring controls.
- **Clear Ball** removes the broadcast ball marker without changing game state.
- Runner movement remains undoable through the existing Undo control because it changes real game state.

## Dashboard

- Live matchups now display a read-only GameCast field beneath the broadcast score presentation.
- Occupied bases appear as runner markers.
- Manual runner moves create a short travel animation.
- Ball placement/result mirrors the Live field through Firebase.
- The latest play remains visible in the field footer on the full-size view.

## Data / compatibility

- Adds `currentGame.fieldState` with safe defaults, so existing saves and Firebase games continue to load normally.
- Field state is synchronized through the existing `currentGame` Firebase path.
- Resetting the current game/new season automatically returns the field to its default state.
- No existing scoring workflow is removed.

## Validation

- JS/JSX TypeScript parse/check: OK
- New CSS PostCSS parse: OK

Keep your existing `firebase.js` when installing this build.
