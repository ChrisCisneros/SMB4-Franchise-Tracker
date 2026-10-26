# SMB4 Franchise Central V3 - GameCast Broadcast Polish

This build extends the Live Field/GameCast system without adding pitcher-info presentation.

## New viewer-facing play visuals
- Swinging strikeout: large `K`
- Called strikeout: large backwards `ꓘ`
- Play-result ribbon for animated plays
- OUT / DP / FC / E / BB / HBP / SF / HR field markers
- Run-scoring pulse (`RUN SCORES` / `N RUNS SCORE`)
- Home-run celebration burst
- Faint last-play ball trajectory that fades with the seven-second play window
- Subtle LF / CF / RF / SS / 2B / C field-position labels

## Pitch-deck cues
The existing quick pitch/count buttons now briefly show on the field:
- BALL
- CALLED STRIKE
- SWING
- FOUL
- K on a swinging strikeout
- ꓘ on a called strikeout

These cues use the same synced `currentGame.fieldState`, so a Dashboard open on another device can react too.

## Animated Play additions
The Field Mode Out group now includes:
- Strikeout (K)
- Called K (ꓘ)

They log through the existing play/stat logic, including strikeout career/season counters.

## Existing behavior preserved
- Seven-second ball reset
- Manual runner override
- Remove runner controls
- Stolen-base controls
- Advance Everyone +1
- Play-type-specific ball physics
- Undo/history behavior
- Firebase current-game sync

No pitcher-info strip or pitcher presentation widgets were added.
