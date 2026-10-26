# SMB4 Franchise Central

## Setup & Upgrade

This package is a source update for the existing React/Firebase Franchise Central project.

1. Back up the current project.
2. Replace the matching `src/` files with the files in this package.
3. Keep your existing `src/firebase.js` — it is intentionally not included.
4. Run the app normally with your existing Vite/npm setup.
5. Moderator password: `SF`.

### V4.12 navigation
Public visitors see the immersive league pages. After moderator unlock, one **League Office** tab appears and nests Game Operations, Quick Results, Daily Results, Bracket Control, League Admin, Season & Calendar, History & Records, and Media & World.

### Data safety
V4.12 continues to use the existing Firebase/local persistence architecture. Public culture features derive from the baseball data you already track. Simulated fan/media life does not invent standings or game results.
