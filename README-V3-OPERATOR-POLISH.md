# SMB4 Franchise Central v3.1 - Operator Polish

This build is based on the V3 final-polish release and focuses on the controls used while running the league.

## Live scoring
- Sticky operator bar with matchup, score, inning, count, outs, Undo, count reset, setup toggle, and Finalize shortcut.
- Game setup can be hidden once the matchup is configured.
- New one-tap pitch/count deck: Ball, Called Strike, Swinging Strike, Foul, Out/Advance, Reset B/S, Clear Count + Bases, Undo.
- Broadcast moment buttons are collapsible so they do not crowd normal scoring.
- Game-status controls are grouped and visibly show the active status.
- Finalize & Save is visually separated as the primary end-of-game action.

## Quick editor
- Team search by city, name, or abbreviation.
- League filter: All / AL / NL.
- Progress filter: All / Still Playing / Finished.
- Sticky filter bar and live counts for teams visible/still playing.
- Cleaner division cards and more obvious positive/negative run differential.
- Existing W/L/RD controls and Firebase behavior are unchanged.

## Bracket Admin
- New postseason control-room layout.
- Selected-series overview shows matchup, series score, current game number, and wins needed.
- Larger score entry controls.
- Main result button previews the exact score being recorded.
- Quick-select Series Board: click any series directly.
- Filters for Active / Finished / All series.
- Clear-score action separated from destructive Reset Series action.

## Technical notes
- Added `resetLiveCountAndBases` to the shared page context; the function already existed in App.jsx.
- Added `styles/part-13.css`; App.css imports it last as an override/polish layer.
- Existing Firebase file is still intentionally not included. Keep your current `src/firebase.js`.
- Syntax validation: 0 JS/JSX parse errors.
- CSS brace validation: 0 errors.
