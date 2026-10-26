# SMB4 Franchise Central

## Setup & Upgrade

This package is a cumulative source update for the existing React/Firebase Franchise Central project.

1. Back up the current project.
2. Replace the matching `src/` files with the files in this package.
3. Keep your existing `src/firebase.js` — it is intentionally not included.
4. Run the app normally with your existing Vite/npm setup.
5. Moderator password: `SF`.

### V4.13 navigation
Public visitors see the immersive league pages. After moderator unlock, one **League Office** tab appears and nests Game Operations, Quick Results, Daily Results, Bracket Control, League Admin, Season & Calendar, History & Records, and Media & World.

### V4.13 Living Season
The 40-game season can now be laid onto a real eight-week Monday–Sunday calendar. League Office chooses the Game Days, imports the matchup order, attaches promotions and ceremonies, and the public calendar becomes a printable season schedule that turns completed games into final-score cards.

Opening Week can seed the prior season's league-champion banner unveilings and the World Series champion's banner/trophy/ring ceremony. Those events feed Dashboard, Game Day Social, official team posts and SMBL coverage.

### Data safety
V4.13 continues to use the existing Firebase/local persistence architecture. Public culture features derive from the baseball data you already track. Simulated fan/media life can create opinions, jokes, promotion demand and atmosphere, but it does not invent standings or game results.
