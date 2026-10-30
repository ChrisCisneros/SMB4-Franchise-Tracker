# V4.x — Living World / Culture

## Current release: V4.16 — Media + Memory

V4.5–V4.12 built the living-world layer: Fandom, team fan districts, live social feeds, official team/league accounts, Live Watching, Game Day Social, chronological chatter, large ambient phrase banks, promotions/giveaways, Ballpark Life, reseller/collector culture, World Pulse, League Office, and the Hall of Banners & Awards.

V4.13 turns that culture into an actual season rhythm.
### V4.13.1 calendar clock patch
- The highlighted season day advances only when the configured calendar club (default `SF`) finishes a regular-season game.
- Streaming other league games no longer consumes a Giants calendar game number, promotion, or day.
- The active Game Day is highlighted across calendar views.
- Giveaway resellers appear only on giveaway day and for up to two fictional calendar days afterward; historical items remain in the Collector Vault.
- League Office → Season & Calendar now starts with the matchup importer, followed by date placement and promotions.


### Real eight-week season calendar
- eight Monday–Sunday weeks / 56 calendar slots
- exactly 40 assignable Game Days
- click empty dates in League Office to place games in season order
- optional compact matchup import (`a LAD` = @ LAD, `SD` = vs SD)
- home/away matchup labels, promotions, ceremonies and finals share the same calendar square
- completed regular-season games store their season game number so the schedule becomes a season diary
- public Fandom calendar is view-only and printable
- Game 20 remains the natural All-Star midpoint

### Ceremonies & traditions
- reusable ceremony engine
- prior AL/NL league champions can receive banner unveilings
- the World Series champion receives the combined championship-opening package: league banner, World Series trophy and championship rings
- retired-number, Hall of Fame, alumni, anniversary, first-pitch and franchise-legend ceremony types are supported
- official team accounts, fan pages and SMBL can all react with different voices
- the Hall corridor shows league pennants/banners, World Series trophy hardware and championship rings season by season

### Living-world integration
- `Today in the League` package on Dashboard
- scheduled promotions/ceremonies flow into Game Day Social
- shared World Pulse ribbon reaches the quieter public pages too
- team profiles show fan identity, cult-hero/public-enemy signals, social reach and ticket atmosphere
- player career pages show player-fan culture and popularity
- League Hub includes a Culture & Lore section with rivalry lore, fan surveys/awards, collector market, analyst pick records, debates, local businesses and game-thread memory
- rivalry names can be set from League Office
- finalized promotion nights are snapshotted into game history so collectibles can gain an archived/legacy market identity

### Social Engine polish
- Dashboard thread keeps newest posts at the top and ages out the oldest after 10
- recent-text memory reduces repetition
- reply/quote context lets rivalry chatter and receipts read like conversations
- postgame wire now moves through reaction-chaos, celebration/blame, analysis, then memes/receipts before aging out
- play events permanently carry batting side, fielding side, beneficiary side, inning/half, outs before/after and score before/after so defensive plays remain attributed to the correct club after inning flips

### GameCast motion pass
- denser calculated curve sampling
- continuous linear segment timing instead of jerky easing between sparse points
- smooth grounders
- no fake bounce at the end of fly outs
- flatter line drives
- taller popups / clearer fly-ball and home-run arcs
- brighter trajectory trail that follows the same parabola as the animated baseball

### Moderator controls
Unlock with `SF`, then use **League Office** for schedule placement, matchup import, promotions, ceremonies, rivalry naming, world moments, history/records and league branding. Public viewers can browse the resulting world without seeing edit controls.

### League identity
`officialLeagueName` and `officialLeagueAbbr` remain configurable so the temporary Super Mega Baseball League / SMBL identity can be replaced later.

### V4.13.3 schedule rail containment
The League Office matchup editor now stays within the page frame at all schedule lengths. Games 1-40 remain on a fixed-width horizontal rail with local scrolling instead of expanding the whole League Office layout.

### V4.14 Season Atmosphere
- Calendar now uses franchise-color home cards, slate road cards, muted off-days, current-day gold, W/L result accents, weekly records, series/milestone labels, and a full-width All-Star Break intermission.
- Dashboard adds a next-three-games strip plus a live “What’s Happening” universe card.
- World Pulse on quieter public pages now includes the current franchise matchup and promotion.
- News adds a Today’s Baseball World / Daily Diamond edition strip.
- The overall shell subtly changes mood for Opening Week, All-Star, second half, pennant race and season finale.
- Fandom districts get stronger team-color atmosphere; League Office gets a commissioner status strip.
- GameCast adds restrained big-play broadcast emphasis and stronger airborne ball depth.
- Promotion bank adds Fan Club Meetup, Ballpark Photo, Autograph, Season Ticket Holder, Mascot Race, Retro Scoreboard, City Night and Fan Cam Night.

## Version 4.16 — Media + Memory / Social Variety 3.0

- Social game threads remember substantially more recent text and phrase families.
- If no fresh social candidate is available, the thread may stay quiet instead of immediately repeating itself.
- Added additional stadium-life voices: concourse, restroom lines, scorekeepers, optimists, doomers, seat neighbors, group chats, hecklers, broadcast watchers, ticket talk, memories and offbeat baseball side quests.
- Quick Results can directly maintain W/L streaks, powering Hot/Cold coverage throughout the public app.
- Added Ticket Forecast, Fans Are Talking About, Around the League Tonight, Hot/Cold Board and Live Chatter Heat.
- Added Season Scrapbook, rivalry timeline, fanbase grudges, fake podcasts, dynamic fictional advertising, weekly media roundups and honor-only interview cards.
- League Office surfaces milestone ceremony suggestions when the current league data supports one.

## Version 4.18 — Fandom Districts
- Media outlets now have recurring tones, biases, credibility/heat profiles, and different takes on the same league story.
- Topic lifecycles classify conversation as emerging, trending, saturated, fading, or dormant so coverage can cool down instead of repeating forever.
- Prediction receipts turn old simulated desk takes into recurring media jokes as current records change.
- Fan-account relationships add mutuals, reply-guys, group chats, rivalry beef, mutes, and receipt culture.
- Franchise reputations evolve from titles, playoff history, current form, streaks, and league memory.
- Ballparks accumulate folklore, lucky/cursed rituals, and fan superstitions from tracked history.
- Team tradition files add chants, rituals, and post-win customs.
- Off-day mode keeps the baseball world active with radio, archive, collector, rivalry, and next-game conversation without inventing scores.
- Season-defining moments now receive memory tiers: Noteworthy, Memorable, Classic, Legendary.
- Dashboard gains a Main Character / story lifecycle / receipt / off-day life rail.
- News gains media personalities, topic fatigue, prediction receipts, a recurring broadcast booth, and Season Memory Watch.
- Fandom gains fan relationships, franchise reputation, ballpark folklore, traditions, media bias, and topic-fatigue boards.
- League Hub gains a Living Lore archive.
- Quick +W / +L entries now automatically advance or flip the team's current streak; negative corrections leave streak unchanged for safety.

### 4.18 Quick Results repair
- Reflowed the six Quick operator sections into a contained mini-console.
- Wide desktop: three division columns; medium: two; iPad/narrow: one.
- Prevents streak/RD controls from overflowing or clipping.

## Version 4.18 — Fandom Districts
- Reordered the primary navigation to Dashboard, Fandom, League Center, Standings, Bracket, News, League Hub, History, Records, League Office.
- Renamed the V4 Center navigation surface to League Center and unified navigation styling.
- Rebuilt Fandom as a subtab hub: Overview, Fan District, Social, Calendar, Rivalries & Grudges, Media, Merch & Collectibles, Culture & Lore.
- Fanbase grudges are now team-specific and can form from division familiarity, regular-season history, postseason history and accumulated meetings.
- Added a team-specific relationship map, community mood history and stronger district-local context.

## Version 4.20.1 — Living League / Ballpark Life

V4.20.1 supercharges the fictional baseball universe around the games themselves.

- Official team accounts now understand home vs road context and have much deeper event-specific copy for homers, extra-base hits, strikeouts, double plays, scoring bursts and finals.
- Extreme-game detection watches inning scoring, run margin, total scoring, walk-offs, extras and shutouts. Monster innings and historic-looking blowouts can become live SMBL alerts, News stories, Dashboard alerts and heavier scrapbook memories.
- Repeated blowouts now add humiliation heat to fanbase grudges and can create Revenge Game / Payback Watch storylines.
- Fanbase relationships can also become FRIENDLY or ALLIES, especially when fanbases share a common enemy.
- The Ballpark Life engine creates pregame, in-game, postgame and off-day experiences: fan festivals, autograph sessions, first-pitch ceremonies, mascot races, fan cams, giveaways, food debuts, postgame shows, movie nights, community events, alumni events and more.
- League Office includes a Ballpark Life Director with quick event-bank controls and manual event scheduling.
- Fandom includes a Ballpark Life subtab with crowd personality, city buzz, revenge watch, cultural awards and consequence chains.
- News includes live Developing / League Alert coverage, Ballpark Life, Revenge Watch, City Buzz and consequence-chain coverage.
- The living-world model now emphasizes cause → reaction → memory → future consequence.

## V4.20.1 — Ballpark Broadcast & Game Day Control
- Dashboard decluttered into SMB Network → World Pulse → Today in the League → live broadcast → Market, with redundant Top Stories / Playoff Picture / At a Glance removed.
- League Office Game Day Control can directly select any scheduled game without removing/re-adding calendar dates.
- Game timing supports DAY / AFTERNOON / TWILIGHT / NIGHT and is shown on calendar cards.
- Promotions show their full names/details in operator controls; theme-night bank expanded substantially.
- Ceremonies now attach to the selected game and include PREGAME / IN-GAME / POSTGAME timing plus additional ceremony types.
- Every club receives a persistent ballpark identity with a 30k–40k-scale capacity, crowd atmosphere, famous section, food, and tradition.
- Attendance forecasts use park capacity, team form, opponent interest, promotion and rivalry context.
- Live Watching audiences now start in the tens of thousands in Season 3 and scale aggressively with league age, rivalry, leverage and postseason stakes, allowing 1M+ major games in later seasons.


## V4.20.2 — Calendar & Ceremony Operator Polish
Fast First Pitch Paint mode now supports bulk calendar time-of-day assignment while preserving the per-game editor. Opening championship ceremonies seed only from the latest completed season, and commissioner-created custom ceremonies can be attached to any selected Game Day.


## V4.20.3 Championship Ceremony Fix
- Latest championship ceremony lookup now selects the highest/latest archived season rather than relying on array order.
- Latest league champions receive banner ceremony presets; the World Series champion receives a combined banner, trophy and rings ceremony.
- Ceremony presets auto-attach to the first scheduled matchup against each champion when available, otherwise remain unassigned for manual placement.


### V4.21 Rings & Rafters
Championship ceremonies are now presentation events rather than calendar-only tags. The newest archived championship hardware remains covered in the Trophy Room until its scheduled ceremony is completed, then becomes a permanent displayed banner/ring/trophy. Seasons before the current ceremony cycle remain visible as legacy hardware.

### V4.22 — Hall of Glory
- Championship ceremony presets are now generated **unassigned**. League Office lets the commissioner choose any Game Day and timing for each reveal, even when the champion is not that day's opponent.
- The Hall of Glory replaces the basic Trophy Room presentation with museum-style season displays, inspection, championship journeys, franchise prestige and a replayable ceremony archive.
- Championship rings, banners and the World Series trophy are custom visual hardware rather than emoji/placeholders. Team-color hardware uses darker secondary treatments for white-heavy identities.
- Ceremony presentations now include a Road to the Rafters stage, full banner/trophy/ring reveal sequence, confetti/spotlights, completion persistence and safe replay mode.
- Completing a ceremony creates a permanent Legacy World Moment and permanently unveils the matching hardware.

### V4.22.1 — Hall Cover Containment Fix
- Covered Hall of Glory hardware is now fully hidden until its ceremony reveal; ring glow, trophy edges, and banner silhouettes can no longer bleed through the `AWAITING CEREMONY` cover.


### V4.22.2 — World Series Banner Hierarchy
World Series champions now receive a dedicated WORLD SERIES CHAMPIONS banner with premium gold trim and a more formal presentation. League champions retain the simpler AL/NL pennant treatment.


### V4.23 — Milestones & Momentum
Player legacy, opt-in season awards, improved win probability, warmup/delay reactions, editable history/records, GameCast cleanup, and a postseason bracket makeover.


### V4.24 — Season Chronicle
Season Chronicle turns the growing living universe into an organized historical system. Weekly calendar closures create reviewable Chronicle drafts, locked snapshots become standings-movement baselines, League Center gains cleaner internal navigation and global search, Quick Results gains safe record-change undo, and League Office gains a Commissioner Inbox. Player legacy management now supports milestone ladders, retroactive/date-unknown backfill, career record watches, regular/postseason award races, History filters, and compact team-legacy summaries.

### V4.25 — Legacy & Culture
V4.25 turns accumulated history into visible culture. League Center gains a Baseball Museum with automatic championship, milestone, retired-number and classic-game artifacts plus commissioner-curated objects. Season-based anniversaries surface old championships and milestones as the universe ages. Existing drought calculations are promoted into living franchise stories, while consecutive success/failure is recognized as Golden Eras, Dynasty Eras, Contender Eras, Lean Years and Dark Ages. Fan accounts now keep stable voice archetypes and use recent-game / historical context as memory, producing more differentiated reactions in both Fandom and Game Day Social.

## Version 5 — The Living Broadcast
Version 5 turns the tracker from a living database into a more resilient, theatrical baseball universe.

- **Protected universe persistence:** League extras now keep a timestamped local safety copy plus a protected Firebase JSON snapshot so calendars, ceremonies, museum objects and commissioner-created world data cannot silently disappear when Firebase omits empty/missing tree fields. Older safety snapshots are prevented from rolling newer local data backward.
- **Broadcast theme engine:** Dashboard presentation now resolves by explicit priority: Ceremony → Special Night → Postseason/Championship → Interleague → Rivalry → Regular Season. Interleague games split the visual field by league, while special nights can own the presentation with event-specific effects such as fireworks.
- **Ballpark bunting:** traditional semicircle patriotic bunting is anchored at the top of the Dashboard for Opening Day, Game 20 and postseason games.
- **Win probability 2.0:** early leads and baserunners have much less authority, while leverage grows naturally toward the late innings. Early/midgame uncertainty bands prevent ordinary third-inning leads from looking decided.
- **Museum + Hall of Glory:** one permanent destination now combines championship hardware, ceremonies and journeys with Museum artifacts. Major player honors can appear as statue exhibits; records and memorable moments use plaque-style exhibits; championship hardware keeps its banner/ring/trophy presentation and unveiling history.
- **Social Variety 5.0:** automatic personality quips are removed. Every existing general chatter bank receives a large expansion while preserving commissioner-written phrases. Official team accounts and media personalities receive deeper independent pregame, live, event and postgame banks.
- **Storyline aging:** historic monster games remain in the archive but cool in newsroom prominence after newer games are played. New magnitude criteria include strikeout festivals, homer barrages, hit parades, defensive chaos, walk-heavy games and pitching duels.
- **Newsroom V5:** League News adds a Deep Dive, Top Story Board, Assignment Desk and interactive Story Dossiers while retaining the existing world pulse, media network, podcasts, memory, facts, fan pulse and full archive.


## V5.2 — Ballpark Geometry & Live-Game Resilience
- Dashboard and Live GameCast now render team-specific outfield geometry traced from the commissioner-provided SMB4 park reference images. Eighteen reusable field profiles are mapped across the league while each club keeps its own custom ballpark name, capacity, traditions, weather flavor and history.
- Park geometry is centralized in `ballparkGeometryUtils.js`, supports shared stadium shapes, aliases, commissioner overrides (`geometryId`) and stable fallbacks for future/custom clubs. Geometry is presentation-only and never changes SMB4 gameplay outcomes.
- The Live operator memoizes the active park profile so balls/strikes/score taps do not rebuild static stadium metadata, and Dashboard attendance dependencies are narrowed to avoid unnecessary recomputation during pitch-by-pitch updates.
- Live games now receive a dedicated timestamped local emergency snapshot. Firebase writes carry sync metadata, reconnects compare local/cloud versions for the same matchup, newer local in-progress state can recover stale cloud state, and finalized/new matchups are protected from accidental rollback.
