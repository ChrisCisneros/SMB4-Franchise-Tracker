const n = (v) => Number(v || 0);
const hash = (value = '') => [...String(value)].reduce((h, c) => ((h * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
const pick = (items, key = '') => items?.length ? items[hash(key) % items.length] : null;
const pct = (team) => {
  const games = n(team?.wins) + n(team?.losses);
  return games ? n(team.wins) / games : 0;
};

export function isNmlbPostseason(data = {}) {
  return data.leagueExtras?.seasonPhase === 'postseason'
    || data.currentGame?.gameType === 'playoff'
    || (data.games || []).some((game) => game?.gameType === 'playoff' && game?.seasonName === data.activeSeasonName);
}

export function buildPostseasonChatter(data = {}, teams = [], playoffPicture = [], tick = Date.now()) {
  const finals = (data.games || []).filter((g) => g?.gameType === 'playoff' && g?.status === 'Final' && (!data.activeSeasonName || g.seasonName === data.activeSeasonName));
  const map = new Map(teams.map((team) => [team.id, team]));
  const wins = new Map();
  finals.forEach((game) => {
    const winner = n(game.awayScore) > n(game.homeScore) ? game.awayTeamId : game.homeTeamId;
    wins.set(winner, (wins.get(winner) || 0) + 1);
  });
  const sorted = [...teams].sort((a, b) => pct(b) - pct(a) || n(b.runDiff) - n(a.runDiff));
  const top = sorted[0];
  const rows = [];
  const bracket = data.playoffBracket || {};
  Object.entries(bracket).forEach(([id, series]) => {
    if (!series || !series.winnerTeamId) return;
    const team = map.get(series.winnerTeamId);
    if (team) rows.push({ id: `advance-${id}`, kind: 'advance', team, headline: `${team.abbr} MOVES ON`, detail: `${team.city || team.abbr} is through to the next postseason round.`, icon: '➡️' });
  });
  finals.slice(-8).forEach((game) => {
    const away = map.get(game.awayTeamId), home = map.get(game.homeTeamId);
    const winner = n(game.awayScore) > n(game.homeScore) ? away : home;
    const loser = winner?.id === away?.id ? home : away;
    if (!winner || !loser) return;
    const extra = n(game.inning || game.innings) > 9 ? ' after extra innings' : '';
    rows.push({ id: `final-${game.id}`, kind: 'game', team: winner, headline: `${winner.abbr} WIN${extra ? 'S IN EXTRAS' : ''}`, detail: `${winner.abbr} ${game.awayScore > game.homeScore ? game.awayScore : game.homeScore}, ${loser.abbr} ${game.awayScore > game.homeScore ? game.homeScore : game.awayScore} · postseason pressure is now part of the record.`, icon: extra ? '🌙' : '⚾' });
  });
  if (top) rows.push({ id: 'best-record', kind: 'record', team: top, headline: `${top.abbr} OWNS THE LEAGUE'S BEST RECORD`, detail: `${top.wins}-${top.losses} · the best regular-season résumé is now carrying into October.`, icon: '📈' });
  [...wins.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([teamId, total]) => {
    const team = map.get(teamId);
    if (team) rows.push({ id: `wins-${teamId}`, kind: 'wins', team, headline: `${team.abbr} POSTSEASON WINS: ${total}`, detail: `${team.city || team.abbr} is building the October résumé one final at a time.`, icon: '🏆' });
  });
  if (!rows.length) rows.push({ id: 'opening-night', kind: 'preview', team: top, headline: 'THE NMLB POSTSEASON IS OPEN', detail: 'Every series is live, every score matters and the road to the NMLB Classic has begun.', icon: '✨' });
  const bank = [
    ['The fan districts are comparing every pitch.','The postseason has turned the whole league into one giant group chat.'],
    ['Nobody is leaving the scoreboard tab.','The national desk has run out of calm adjectives.'],
    ['October does not care what the projections said.','Every city has a new favorite number: the series score.'],
    ['The road to the trophy is now a city-by-city argument.','History is being written in real time, one final at a time.'],
  ];
  const mood = pick(bank, `${data.activeSeasonName}-${Math.floor(tick / 14000)}`) || bank[0];
  return [...rows, { id: 'league-mood', kind: 'mood', headline: 'POSTSEASON FAN PULSE', detail: `${mood[0]} ${mood[1]}`, icon: '📣' }].slice(0, 12);
}

export const NMLB_SPONSOR_BANK = [
  ['NMLB Network+', 'media', 'Every Series. Every Angle.', 'Live games, studio desks, replays and the fan wire that never sleeps.', 'WATCH NOW', '📺'],
  ['NMLB Radio Network', 'media', 'Hear the Moment.', 'National calls, local voices and postseason baseball in your headphones.', 'LISTEN LIVE', '🎙️'],
  ['The Night Cap', 'media', 'Receipts After Dark.', 'Late-night reactions, bad predictions and the final word from every city.', 'JOIN THE SHOW', '🌙'],
  ['Numbers Desk', 'media', 'The Data Has Receipts.', 'Win probability, leverage and record-book pressure without the shouting.', 'OPEN THE BOARD', '📊'],
  ['Extra Innings AM', 'media', 'Wake Up To Baseball.', 'Callers, coffee and the morning-after postseason argument.', 'TUNE IN', '☕'],
  ['Northstar Wireless', 'electronics', 'Stay Connected Every Inning.', 'Live alerts, bullpen updates and the group-chat meltdown in one place.', 'GET CONNECTED', '📱'],
  ['Orbit Console', 'gaming', 'Play The Whole Season.', 'Build a franchise, chase a title and make your own October history.', 'PLAY NOW', '🎮'],
  ['DiamondStream', 'streaming', 'Your Replay Room.', 'Every classic, every ceremony and every postseason memory on demand.', 'START WATCHING', '▶️'],
  ['Crownline Motors', 'auto', 'Drive The Road To The Trophy.', 'Road-trip comfort for fans following their club across the bracket.', 'SEE THE LINEUP', '🚙'],
  ['Summit Air', 'airlines', 'Fly With The Fanbase.', 'Flexible routes for the fans who refuse to watch October from home.', 'PLAN THE TRIP', '✈️'],
  ['Skybridge Airlines', 'airlines', 'Next Stop: The NMLB Classic.', 'Postseason fares and fan-friendly travel windows.', 'BOOK A FLIGHT', '🛫'],
  ['Grandstand Air Club', 'travel', 'The Lounge Before First Pitch.', 'Airport lounges with live scores and a view of the road ahead.', 'JOIN THE CLUB', '🛋️'],
  ['Parkside Hotels', 'hotels', 'Stay Near The Story.', 'Ballpark hotels for road series, rivalry weekends and trophy chases.', 'FIND A ROOM', '🏨'],
  ['Diamond Mile Rentals', 'travel', 'Own The Road Trip.', 'Pick up the keys and make the next series a memory.', 'RESERVE NOW', '🚗'],
  ['Grandstand Grill', 'food', 'Official Flavor Of October.', 'Loaded fries, smoked dogs and unreasonable baseball opinions.', 'SEE THE MENU', '🍔'],
  ['Seventh-Inning Kitchen', 'food', 'The Rally Plate Has Arrived.', 'Extra-inning pretzels, rally nachos and a menu built for late nights.', 'ORDER NOW', '🌭'],
  ['Bullpen Coffee Co.', 'food', 'Wake Up Before The First Pitch.', 'Small-batch coffee for early starts and elimination-game nerves.', 'BREW A CUP', '☕'],
  ['Home Plate Pizza', 'food', 'Slice The Pressure.', 'The official pizza of scoreboard watching and series sweeps.', 'GET A SLICE', '🍕'],
  ['Foul Pole Soda', 'food', 'Fizz For The Fifth Inning.', 'Cold cans, loud rallies and no unnecessary superstitions.', 'GRAB ONE', '🥤'],
  ['Diamond State Bank', 'finance', 'Your Money Has A Matchup.', 'Secure banking for fans building a season around the next series.', 'OPEN THE DESK', '🏦'],
  ['Pennant Insurance', 'insurance', 'Protect The Good Luck.', 'Coverage for the car, the trip and the expensive rally towel.', 'GET A QUOTE', '🛡️'],
  ['Catcher’s Mitt Credit Union', 'finance', 'Community Banking, Ballpark Spirit.', 'Local service for every NMLB neighborhood.', 'LEARN MORE', '💳'],
  ['Closer Financial', 'finance', 'Finish Strong.', 'Planning tools for fans, families and ambitious franchise dreams.', 'SEE THE PLAN', '📈'],
  ['Grandstand Pass', 'tickets', 'Your Seat Is Part Of The Story.', 'Flexible ticket bundles for rivalry nights and postseason baseball.', 'FIND YOUR SEAT', '🎟️'],
  ['NMLB Ticket Exchange', 'tickets', 'Find The Next Big Night.', 'A safe, simple way to get into the building when the stakes rise.', 'BROWSE TICKETS', '🎫'],
  ['The 12th Inning Club', 'fans', 'Membership For The Diehards.', 'Perks, watch parties and a seat at the loudest table in town.', 'JOIN TODAY', '🗣️'],
  ['NMLB Outfitters', 'merch', 'Wear The Moment.', 'City editions, limited postseason drops and championship-ready gear.', 'SHOP THE DROP', '🧢'],
  ['One-One Card Co.', 'collectibles', 'Pull Something Impossible.', 'Hunt for the 1/1, rookie chrome and the card nobody else has.', 'RIP A PACK', '🃏'],
  ['Rally Thread', 'merch', 'Built For The Comeback.', 'Streetwear for fans who have never accepted an elimination.', 'SHOP NOW', '👕'],
  ['Commissioner’s Collectibles', 'collectibles', 'Own A Piece Of League History.', 'Numbered balls, pennants and ceremony-night keepsakes.', 'VIEW THE VAULT', '⚾'],
  ['Batter’s Box Electronics', 'electronics', 'Make Every Replay Bigger.', 'Screens, soundbars and a living room built for October.', 'UPGRADE NOW', '🖥️'],
  ['Signal Light Audio', 'electronics', 'Hear The Crowd.', 'Wireless audio tuned for late-inning drama.', 'LISTEN BETTER', '🎧'],
  ['Ballpark Vision', 'electronics', 'See Every Break.', 'Cameras and displays for fans who study every pitch.', 'SEE THE TECH', '📹'],
  ['FanCam Mobile', 'electronics', 'Your City In Your Pocket.', 'Share the rally, the heartbreak and the parade route.', 'DOWNLOAD APP', '📲'],
  ['Rivalry Roast', 'food', 'Dark Roast. Bright Lights.', 'The coffee for the series your friends told you would be easy.', 'ROAST THE DAY', '🔥'],
  ['Outfield Lemonade', 'food', 'A Little Sweetness In The Stretch.', 'Cold pitchers for hot afternoons and hotter pennant races.', 'POUR ONE', '🍋'],
  ['Park District Market', 'local', 'The Neighborhood Around The Park.', 'Local food, local art and a full city behind the club.', 'VISIT THE DISTRICT', '🏙️'],
  ['Rally Row BBQ', 'local', 'Smoke Before The Smoke Show.', 'Game-day plates made for a city that believes.', 'GET SAUCED', '🍖'],
  ['The Dugout Diner', 'local', 'Open Before First Pitch.', 'Breakfast, pie and the morning-after series debate.', 'SEE HOURS', '🥞'],
  ['Ballpark Books', 'local', 'Every Season Has A Story.', 'History, biographies and the book your rival hopes you do not read.', 'BROWSE THE SHELF', '📚'],
  ['NMLB Travel Desk', 'travel', 'Turn The Bracket Into A Trip.', 'Routes, rooms, tickets and city guides for every round.', 'BUILD YOUR TRIP', '🗺️'],
  ['Home Run Hotels', 'hotels', 'Check In To The Chase.', 'Late checkout for late innings and a lobby full of baseball people.', 'BOOK THE ROOM', '🛎️'],
  ['FanFare Rewards', 'loyalty', 'Your Loyalty Has Perks.', 'Earn points for games, gear, predictions and unforgettable nights.', 'JOIN FREE', '⭐'],
  ['The Bullpen Hotline', 'media', 'Call The Game.', 'Leave your take, defend your team and hear it back on air.', 'CALL NOW', '☎️'],
  ['NMLB Kids Club', 'family', 'The Next Generation Is Watching.', 'Crafts, cards, clinics and baseball stories for young fans.', 'JOIN THE CLUB', '🧸'],
  ['Replay Arcade', 'gaming', 'Relive The Impossible.', 'Play classic moments and try to rewrite the final inning.', 'ENTER THE ARCADE', '🕹️'],
  ['Stadium Soundworks', 'electronics', 'Bring The Park Home.', 'Crowd sound, commentary and a little extra bass for the ninth.', 'TURN IT UP', '🔊'],
  ['Your Ad Here', 'open', 'Put Your Brand On The Bracket.', 'Local businesses, creators and future NMLB partners can claim this space.', 'CONTACT NMLB', '✨'],
  ['NMLB Classic Fund', 'nmlb', 'One Trophy. One Club.', 'Supporting the events, fields and fans that make the league feel alive.', 'LEARN ABOUT NMLB', '🏆'],
];

export function buildNmlbSponsorRotation(data = {}, teams = [], tick = Date.now(), count = 8) {
  const season = data.activeSeasonName || 'season';
  const offset = Math.floor(tick / 12000);
  return Array.from({ length: Math.min(count, NMLB_SPONSOR_BANK.length) }, (_, index) => {
    const entry = NMLB_SPONSOR_BANK[(hash(`${season}-${offset}-${index}`) + index * 7) % NMLB_SPONSOR_BANK.length];
    const [name, category, title, copy, cta, icon] = entry;
    return { id: `sponsor-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, category, kicker: `${icon} ${name}`, title, copy, cta, icon, phase: data.leagueExtras?.seasonPhase === 'postseason' ? 'POSTSEASON PARTNER' : 'NMLB PARTNER' };
  });
}

