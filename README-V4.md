# SMB4 Franchise Central — Version 4.0

## Living League release

Version 4.0 adds a new **V4 Center** plus major Dashboard and Standings upgrades. It builds on the full V3 stack: GameCast, permanent game history, player careers, News Network, league records, team profiles, operator polish, direct K buttons, and verified walk-off detection.

### New V4 Center
The new navigation item opens five large centers:

1. **League Intelligence**
   - Magic numbers and elimination numbers
   - Home/away splits
   - Strength of schedule
   - V4 playoff projection
   - Momentum meter
   - Team personality cards
   - Standings movement snapshots / "What Changed?"
   - Playoff bubble
   - Clinch-scenario summaries
   - Games That Matter grading
   - Record chase cards
   - Team of the Week
   - Playoff race projection graph

2. **Banners & Legacy**
   - Banner Room (World Series, pennants, division crowns, #1 seeds)
   - Trophy / league map
   - Cinderella runs
   - Dynasty score
   - Team eras
   - Franchise first-ever milestones
   - League firsts
   - Custom achievement cabinets
   - Custom league record editor
   - Manual franchise / league history events

3. **Broadcast Studio**
   - Automatic Opening Day / rivalry / playoff / championship themes
   - V4 win-probability-style game-state estimate
   - Leverage indicator
   - Crowd momentum meter
   - Clutch Play badge
   - No-hitter / perfect-game watch
   - Cycle / multi-HR / four-hit alerts when tracked data supports them
   - Fake SMB Network fan poll
   - News-anchor picks
   - Manual broadcast commentary
   - Top Play feed
   - Game excitement score
   - Instant Classic badge / Best Games list
   - Manual classic-game entry for simulated games
   - End-game notes
   - Playoff and World Series intro presentation

4. **Season Center**
   - Opening Day package
   - Dashboard bunting on Opening Day
   - Game 20 / All-Star Break package and bunting
   - Midseason report
   - End-of-season report / team grades
   - Franchise trajectory
   - Generated team nicknames
   - League calendar
   - Storyline tracker
   - Bracket predictions
   - Animated Season Intro card

5. **Players & Ceremonies**
   - Baseball-style player cards
   - Hall of Fame ballot and voting
   - Induct from ballot into existing Hall of Fame
   - Retirement Ceremony mode for retired numbers
   - Special achievement alerts
   - Franchise milestone timeline

### Dashboard V4 presentation
The Dashboard now includes:
- Version 4 branding
- Automatic broadcast theme detection
- Opening Day / All-Star bunting
- Win probability estimate
- Leverage
- Crowd energy
- Game-importance label
- Rivalry context
- No-hit watch milestone banner

### Standings V4 intelligence
The Standings page adds an intelligence strip for:
- Closest magic number
- Bubble team and V4 projection
- Toughest strength of schedule
- Biggest standings mover (after snapshots exist)

## Important modeling notes
- **V4 Playoff Projection** is a deterministic entertainment/projection score from current record, remaining games, run differential, momentum, and current playoff cutoff. It is not a calibrated statistical probability model.
- **V4 Win Probability** is a game-state visualization based on score, inning, bases, current team strength, and run differential. It is not a real MLB win-expectancy model.
- **Perfect-game watch** can only use the information the tracker stores. The app can reliably see tracked hits/errors; walks/HBP history is not yet preserved as a complete opponent-baserunner ledger across every inning, so the label is intentionally phrased as a possible condition.
- Fake fan polls and anchor picks are intentionally fictional presentation elements based on league data.

## Upgrade
1. Back up the current project.
2. Replace the matching `src` files with this build.
3. Keep your existing `firebase.js`.
4. Run `npm run dev`.
5. Open **V4 Center** from the navigation.

All new persistent manual V4 data lives inside `leagueExtras` and is synchronized through the existing Firebase leagueExtras path.
