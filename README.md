# SMB4 Franchise Central — Version 4.24


## V4.25 — Legacy & Culture
The Baseball Museum, season-based anniversaries, franchise drought stories, Golden Eras / Dark Ages, and stronger stable fan voices give the league more memory and personality.

- League Center navigation is reorganized into League Intelligence, Storylines, Players & Awards, Records & Milestones, Snapshots, and Hall of Glory.
- Global League Search can find teams, milestones, awards, records, archived seasons, history events, and Chronicle snapshots.
- Each completed calendar week automatically creates a Season Chronicle draft. Review & Lock freezes it and feeds the existing standings-movement system.
- Manual snapshots can be created at any time, while Week 4 produces a dedicated Midseason Review and preserved second-half predictions.
- Quick Results now shows changes since the last locked snapshot and supports Undo Last Record Change with safe streak restoration.
- League Office adds a Commissioner Inbox for snapshot drafts, unassigned ceremonies, schedule gaps, record movement, and season-award reminders.
- Milestone Backfill supports retroactive/date-unknown career milestones; public milestone ladders emphasize the newest tier while preserving the full journey.
- Award Race tracking is separate from permanent winners and supports REGULAR and POSTSEASON leaderboards.
- Career Record Watch tracks active chases without requiring full player-stat entry.
- History gains filters for games, championships, player milestones, records, awards, ceremonies, rivalries, cultural moments, and snapshots.
- Team Profiles add a compact Team Legacy summary for championships, pennants, milestones, awards, retired numbers, and signature recorded wins.

## V4.22 — Hall of Glory
The championship legacy update: commissioner-controlled ceremony placement, grand custom rings/trophies/banners, full reveal presentations, permanent hardware displays, ceremony replays, championship journeys, franchise prestige and legacy alerts.


## Media + Memory

Version 4.16 builds on the Living Universe with a major social-variety and media-memory pass.

### Upgrade
Replace the matching `src` files with this package and keep your existing `src/firebase.js` unchanged.

### Highlights
- Social Variety 3.0 with larger ambient banks, stronger anti-repeat memory, and silence-before-repeat behavior.
- Quick Results streak controls (`W+`, `L+`, clear) so News/Fandom can identify hot and cold clubs.
- Ticket Forecast, Hot/Cold Board, Around the League Tonight, Fans Are Talking About, weekly media roundup.
- Season Scrapbook and rivalry timelines in League Hub.
- Fake podcasts, dynamic commercials, fanbase grudges, honor-only interviews, and milestone ceremony suggestions.
- Live Chatter Heat meter beside simulated Live Watching.
- Focused client/operator polish without disturbing the stable Live, bracket, records, or history workflows.

See the other three major-version docs for the older foundation and Living Universe systems.

### Current build: 4.17 — Supercharged Universe
The living-world layer now includes evolving media personalities, fan relationships, topic lifecycles, prediction receipts, franchise reputations, stadium folklore, traditions, off-day activity, and season-defining cultural memory. Quick positive W/L record edits also update streaks automatically.

- **4.18:** Quick Results responsive containment fix for desktop/iPad after streak controls were added.

## Version 4.21 — Calendar & Ceremony Polish

The league now reacts to more than the scoreboard. Ballpark Life, extreme-game alerts, road/home-aware official social posts, fanbase alliances, humiliation-driven grudges, revenge games, city buzz and consequence chains all connect the public universe to the games you actually play.

\n## V4.20.1 — Ballpark Broadcast & Game Day Control


## V4.21 — Calendar & Ceremony Polish
- Added First Pitch Paint mode: choose DAY / AFTERNOON / TWILIGHT / NIGHT once, then click existing calendar games to apply it rapidly.
- Kept the precise Game Day dropdown editor for themed/special games.
- Latest-champion ceremony seeding now focuses on the most recently archived season and replaces stale opening-cycle championship ceremonies.
- Latest World Series champion receives the combined banner, trophy and ring ceremony; other league champion receives its banner ceremony.
- Added a Custom Ceremony path with title, optional team, detail, selected game and pregame/in-game/postgame timing.


## V4.21 Championship Ceremony Fix
- Latest championship ceremony lookup now selects the highest/latest archived season rather than relying on array order.
- Latest league champions receive banner ceremony presets; the World Series champion receives a combined banner, trophy and rings ceremony.
- Ceremony presets auto-attach to the first scheduled matchup against each champion when available, otherwise remain unassigned for manual placement.


## V4.21 — Rings & Rafters
- Added a full Championship Ceremony Presentation Engine on Dashboard. Scheduled championship ceremonies now launch a controlled intro → banner → trophy → ring → finale sequence.
- Completing a ceremony permanently records its reveal and prevents accidental replay as an unfinished ceremony.
- Rebuilt League Center legacy display as the Trophy Room. Older archived seasons display as legacy hardware; the newest championship cycle remains covered until its ceremonies are performed.
- League championship banners use the champion's team colors and show team abbreviation + league + CHAMPIONS. World Series rings use team colors and show abbreviation + WORLD SERIES CHAMPIONS.
- White-primary teams automatically fall back to a darker team color for readable hardware; NYY receives a navy championship treatment.


## V4.23 — Milestones & Momentum
- Player milestone capture now preserves achievements and history together.
- Manual milestones surface in League Center and the player's team League Hub.
- Season awards use named league honors and only render when a winner is entered.
- Win probability is more sensitive to inning, outs, runners, score, and late-game survival.
- New matchups automatically enter Warmup; delays support reasons and fan/media reactions.
- History events, custom records, and player milestones can be edited or deleted in League Office.
- GameCast removes the redundant giant field-level OUT marker.
- Bracket presentation receives a midseason/postseason visual overhaul.
