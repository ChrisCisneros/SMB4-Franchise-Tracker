# SMB4 Franchise Central refactor — verified latest source

This refactor was rebuilt/verified against the latest files uploaded on 2026-10-24:

- `App(20261024-041801).jsx` — SHA-256 `65372e6e4e65f68743ff2aa8165fef91882266c2c81c620fb4d1ee70a54644ec`
- `App(20261024-041802).css` — SHA-256 `8f9bbbc2c2002b6d50a7e05049772e54366d4cf5e68c630989cee344637c3716`

The uploaded JSX was byte-for-byte identical to the fixed bracket version from the previous session, so the bracket seed/team fix and the recent postseason/dashboard work are included.

## Structure

- `src/App.jsx` — top-level coordinator/shared live-game controller (~1,400 lines instead of ~5,550).
- `src/pages/` — Dashboard, Live, Daily, Bracket, Standings, Quick, History, Bracket Admin, Admin.
- `src/controllers/createPlayoffController.jsx` — playoff picture, series labels, seeds, bracket rendering/admin scoring.
- `src/controllers/createDailyResultsController.js` — bulk/daily result parsing and application.
- `src/controllers/createGameFinalizationController.js` — playoff/regular game finalization and game resets.
- `src/actions/` — admin CRUD and season archive/reset actions.
- `src/config/` — constants and all team/postseason color definitions.
- `src/utils/` — playoff, standings, game-state, and display helpers.
- `src/hooks/usePersistence.js` — Firebase listeners/writes and local persistence.
- `src/components/GameWidgets.jsx` — shared small game UI pieces.
- `src/styles/part-01.css` … `part-08.css` — original CSS split in exact original order. `App.css` imports them in order.

## Important

Keep your existing `src/firebase.js`. It is intentionally not included because it was not part of the uploaded files.

## Verification performed

- Latest uploaded JSX matches the previously fixed bracket source byte-for-byte.
- Concatenating all eight CSS chunks reproduces the uploaded CSS byte-for-byte.
- All relative imports resolve except the intentionally external existing `src/firebase.js`.
- TypeScript JS/JSX checking found no undefined identifiers introduced by the refactor. Missing React/Firebase package type errors in the isolated sandbox are expected because the full project dependencies were not uploaded.

## Install safely

1. Back up your current `src` folder.
2. Keep your existing `firebase.js`.
3. Copy the contents of this package's `src/` over your project `src/`.
4. Start the app.
5. Click through Dashboard, Live, Daily, Bracket, Standings, Quick, History, Bracket Admin, and Admin.
6. Verify Firebase data loads before using any sync/reset controls.
7. Once that passes, use this refactored version as the base for League Records.

## Current file sizes

- `src/App.css` — 8 lines
- `src/App.jsx` — 1414 lines
- `src/actions/createAdminActions.js` — 216 lines
- `src/actions/createSeasonActions.js` — 140 lines
- `src/components/GameWidgets.jsx` — 79 lines
- `src/config/constants.js` — 12 lines
- `src/config/teamColors.js` — 365 lines
- `src/controllers/createDailyResultsController.js` — 207 lines
- `src/controllers/createGameFinalizationController.js` — 311 lines
- `src/controllers/createPlayoffController.jsx` — 558 lines
- `src/hooks/usePersistence.js` — 171 lines
- `src/pages/AdminPage.jsx` — 123 lines
- `src/pages/BracketAdminPage.jsx` — 123 lines
- `src/pages/BracketPage.jsx` — 109 lines
- `src/pages/DailyPage.jsx` — 112 lines
- `src/pages/DashboardPage.jsx` — 342 lines
- `src/pages/HistoryPage.jsx` — 201 lines
- `src/pages/LivePage.jsx` — 389 lines
- `src/pages/QuickPage.jsx` — 126 lines
- `src/pages/StandingsPage.jsx` — 171 lines
- `src/styles/part-01.css` — 522 lines
- `src/styles/part-02.css` — 516 lines
- `src/styles/part-03.css` — 530 lines
- `src/styles/part-04.css` — 525 lines
- `src/styles/part-05.css` — 509 lines
- `src/styles/part-06.css` — 516 lines
- `src/styles/part-07.css` — 537 lines
- `src/styles/part-08.css` — 174 lines
- `src/utils/gameDisplay.js` — 50 lines
- `src/utils/gameState.js` — 142 lines
- `src/utils/playoffUtils.js` — 137 lines
- `src/utils/standingsUtils.js` — 267 lines

## League Records page

Added after the refactor:
- `src/pages/LeagueRecordsPage.jsx`
- `src/utils/recordsUtils.js`
- `src/styles/part-09.css`

The Records page is read-only and derives its data from `data.seasonHistory`. Archiving a new season automatically updates the record book. It currently includes championships, World Series appearances and streaks, playoff appearances/game wins/series wins, division titles, #1 seeds, regular-season all-time totals, single-season records, droughts, and achievement lists.

Single-game records are intentionally not included yet because the archive does not currently retain complete finalized-game history for every season.

## Records polish + News Feed update

This package adds the next roadmap pass on top of the verified refactor:

- Records leaderboard lists now use compact vertical scroll areas instead of stretching the full page.
- Long franchise pill lists also scroll inside their cards.
- Added `src/pages/NewsPage.jsx` as a standalone page.
- Added `src/utils/newsUtils.js` for generated league headlines.
- Added `src/styles/part-10.css` for News styling.
- Added a **News** navigation button in `App.jsx`.

### News Feed v1 sources

The feed only generates stories from data the app actually stores today:

- the most recent finalized game (`lastFinalGame`)
- current-season standings / run differential / division races
- archived season champions and best regular-season teams
- archived playoff bracket win totals
- all-time leaders calculated from `seasonHistory`

Because full finalized-game history is not stored yet, the app intentionally does **not** invent older game-specific headlines. When finalized-game history is added later, the News feed can expand into a permanent game-by-game archive, upset alerts, record-breaking games, streak stories, and more.


## League Universe expansion
This build adds a new League Hub with Team Profiles, live Power Rankings, persistent Season Awards, League Timeline, Dynasty Tracker, Trophy Case, postseason Rivalries, persistent Hall of Fame / Legends, Season Preview + Recap, and On This Day. The Bracket page also includes Playoff Hub summary cards. Awards and Hall of Fame entries sync through Firebase at `leagueExtras`. Rivalries and On This Day are deliberately designed to expand automatically when permanent finalized-game history is added later.
