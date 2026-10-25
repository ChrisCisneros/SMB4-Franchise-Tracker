# SMB4 Franchise Central — Version 3

Version 3 is the Season 4-ready release of the franchise tracker. It keeps the modular refactor from Version 2 and adds permanent league-history systems, deeper player/franchise tracking, and a redesigned baseball-app dashboard.

## Upgrade

1. Back up your current `src` folder.
2. Replace the matching files in your project's `src` folder with the files in this package.
3. **Keep your existing `src/firebase.js`**. It is intentionally not included here.
4. Run `npm run dev`.
5. Click through Dashboard, Standings, Bracket, History, Records, News, League Hub, then the unlocked control pages.

Existing Firebase team/player/bracket/season-history data is preserved. New Version 3 fields default safely when they do not exist yet.

## Major Version 3 additions

### Permanent finalized-game history
- Live-game finals are permanently added to `games` and synced to Firebase.
- Daily/bulk regular-season results also create permanent game records.
- Games are tagged with the active season, game type, final score, inning length, pitchers, margin, total runs, and walk-off status when inferable.
- Final records strip undo history and trim play logs to keep storage smaller.
- Existing untagged games remain usable as legacy history; new season snapshots only attach games explicitly tagged to the active season.

### Game Archive / advanced records
- Full schedule/result archive.
- Biggest blowout.
- Highest-scoring game.
- Longest game.
- Highest single-team score.
- Walk-offs, extra-inning games, shutouts, one-run games.
- Team home/away records.
- Longest winning/losing streaks.
- V3 head-to-head rivalry records.

### Player career tracking
Tracking begins with Version 3; older player stats cannot be reconstructed automatically.

Tracked season + career fields now include:
- AB / hits / average
- doubles / triples / home runs
- walks / strikeouts / HBP
- pitcher wins / losses

Season player snapshots are stored when a season is archived, so future player career pages can show year-by-year history.

### League Universe expansion
- Team profiles with championship banners.
- Franchise trend chart.
- Retired-number wall.
- V3 franchise game records.
- Power Rankings with saved snapshots and movement arrows.
- Player Career Center + leader cards.
- Rivalry Center using permanent head-to-head games.
- Transactions.
- Injury history.
- Manager history.
- Draft/prospect log.
- Rebrand/relocation history.
- Hall of Fame / Legends.
- Season comparison lab.
- On This Day using permanent games.
- Season preview / recap.
- Opening Day date + countdown.
- Season tagline / branding.
- Printable season almanac view.

### Newsroom integration
News can now surface:
- game finals and walk-offs
- V3 game-record alerts
- transactions
- injury reports
- awards
- regular league-watch and postseason/archive stories

### Dashboard V3
The dashboard is now designed as the app's baseball home screen:
- Version 3 / active-season masthead
- Season progress meter
- Opening Day countdown
- defending-champion status
- broadcast-style live/final hero
- compact linescore
- top stories
- power five
- franchise focus
- record watch
- postseason clinch graphics
- playoff race
- league pulse
- recent finals

### Safety / cleanup
- The top danger button is now **Emergency Local Reset**.
- It requires typing `RESET LOCAL` and explicitly warns that Firebase is not erased.
- Proper new-season reset clears team streaks and V3 season player stats while preserving career totals and permanent game history.

## Data notes

- Season 1–3 team/season records still come from your archived `seasonHistory` snapshots.
- Player career statistics begin when Version 3 starts tracking them; the app does not invent missing historical player data.
- Any pre-Version-3 items already sitting in the local `games` array can still appear in the permanent game archive, but they do not have reliable season tags unless they were recorded with one.
- The `firebase.js` file remains your existing project file and should not be replaced.

## Final Season 4 polish

- Franchise profiles now display separate AL/NL championship pennants from archived ALCS/NLCS winners, alongside World Series banners.
- Standings received a full Version 3 presentation pass: season masthead, league sections, team-color accents, clinching legend, improved division tables, run-differential emphasis, and a broadcast-style playoff picture with a visible cut line.
- Preseason standings now use intentional empty-state language until the first Season 4 result is recorded.
