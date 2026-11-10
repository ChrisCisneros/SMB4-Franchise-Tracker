// V6.6 — The Postseason Push
// Record-watch and October command calculations shared by News, Dashboard,
// Hall of Records and Bracket. This intentionally keeps editorial watches
// separate from ordinary player milestones.

const n = (value) => Number(value || 0);
const gp = (team) => n(team?.wins) + n(team?.losses);
const pct = (team) => gp(team) ? n(team.wins) / gp(team) : 0;
const clean = (value) => String(value || '').trim();
const teamLabel = (team) => team ? `${team.city ? `${team.city} ` : ''}${team.name || team.abbr}`.trim() : 'Unknown team';

const PLAYER_STAT_KEYS = {
  hits: 'careerHits',
  hr: 'careerHR',
  rbi: 'careerRBI',
  stolenBases: 'careerStolenBases',
  wins: 'careerPitchingWins',
  saves: 'careerSaves',
  strikeouts: 'careerStrikeouts',
};

function allTimeWins(data = {}, team) {
  const prior = (data.seasonHistory || []).reduce((sum, season) => {
    const row = (season.teams || []).find((x) => x.id === team?.id || x.abbr === team?.abbr);
    return sum + n(row?.wins);
  }, 0);
  return prior + n(team?.wins);
}

function priorTeamTotals(data = {}, teamId) {
  return (data.seasonHistory || []).map((season) =>
    (season.teams || []).find((x) => x.id === teamId)
  ).filter(Boolean);
}

function urgency(remaining) {
  if (remaining <= 0) return 'RECORD BROKEN';
  if (remaining === 1) return 'ONE AWAY';
  if (remaining <= 3) return 'HISTORY TONIGHT';
  if (remaining <= 5) return 'FIVE FROM HISTORY';
  if (remaining <= 10) return 'WITHIN REACH';
  return 'RECORD WATCH';
}

function playerCurrent(player, watch) {
  const key = PLAYER_STAT_KEYS[watch.stat] || watch.playerKey;
  const live = key ? n(player?.[key]) : 0;
  return live || n(watch.current);
}

export function buildPostseasonPush(data = {}, teams = []) {
  const activeTeams = Array.isArray(teams) ? teams : [];
  const currentSeason = data.activeSeasonName || 'Current season';
  const teamRows = activeTeams.map((team) => {
    const prior = priorTeamTotals(data, team.id);
    const bestSeason = Math.max(0, ...prior.map((x) => n(x.wins)));
    const worstSeason = prior.length ? Math.min(...prior.map((x) => n(x.wins))) : null;
    const currentWins = n(team.wins);
    const priorCareerWins = prior.reduce((sum, row) => sum + n(row.wins), 0);
    const careerWins = priorCareerWins + currentWins;
    return { team, currentWins, careerWins, priorCareerWins, bestSeason, worstSeason, prior };
  });

  const historicalCareerLeaders = [...teamRows].sort((a, b) => b.priorCareerWins - a.priorCareerWins);
  const historicalLeader = historicalCareerLeaders[0];
  const historicalRecord = historicalLeader?.priorCareerWins || 0;

  const teamChases = teamRows.map((row) => {
    const target = historicalRecord;
    const remaining = Math.max(0, target - row.careerWins);
    const seasonRemaining = row.bestSeason ? Math.max(0, row.bestSeason - row.currentWins) : null;
    const seasonRecordThreat = row.bestSeason > 0 && seasonRemaining <= 2;
    const seasonLowThreat = row.worstSeason !== null && row.currentWins <= row.worstSeason + 2 && row.currentWins + Math.max(0, 40 - gp(row.team)) <= row.worstSeason + 2;
    const isAllTimeThreat = historicalRecord > 0 && row.careerWins >= historicalRecord - 10 && row.team.id !== historicalLeader?.team.id;
    return {
      id: `team-wins-${row.team.id}`,
      team: row.team,
      stat: 'wins',
      label: 'ALL-TIME REGULAR-SEASON WINS',
      current: row.careerWins,
      target,
      remaining,
      holder: historicalLeader?.team?.abbr || 'NMLB RECORD BOOK',
      urgency: urgency(remaining),
      seasonWins: row.currentWins,
      seasonTarget: row.bestSeason,
      worstSeason: row.worstSeason,
      seasonRemaining,
      seasonRecordThreat,
      isAllTimeThreat,
      recordBroken: historicalRecord > 0 && row.careerWins > target,
      recordTied: historicalRecord > 0 && row.careerWins === target,
      seasonLowThreat,
      season: currentSeason,
    };
  }).filter((row) => row.isAllTimeThreat || row.seasonRecordThreat || row.seasonLowThreat || row.recordBroken)
    .sort((a, b) => a.remaining - b.remaining || (a.seasonRemaining ?? 999) - (b.seasonRemaining ?? 999));

  const playerWatches = (data.leagueExtras?.careerRecordWatches || []).slice(0, 5).map((watch, index) => {
    const player = (data.players || []).find((p) => p.id === watch.playerId || clean(p.name).toLowerCase() === clean(watch.playerName).toLowerCase());
    const current = playerCurrent(player, watch);
    const target = n(watch.target);
    const remaining = Math.max(0, target - current);
    const team = activeTeams.find((t) => t.id === player?.teamId || t.abbr === watch.teamAbbr);
    return {
      ...watch,
      id: watch.id || `player-watch-${index}`,
      player,
      team,
      current,
      target,
      remaining,
      urgency: urgency(remaining),
      progress: target ? Math.min(100, Math.round((current / target) * 100)) : 0,
      title: watch.title || `${String(watch.stat || 'record').toUpperCase()} RECORD`,
    };
  }).filter((watch) => watch.target > 0);

  const alerts = [];
  teamChases.slice(0, 8).forEach((chase) => {
    const { team } = chase;
    if (chase.recordBroken) alerts.push({
      id: `${chase.id}-broken`, category: 'Record Watch', tone: 'record', priority: 120,
      badge: 'NEW ALL-TIME RECORD', teams: [team.abbr],
      headline: `${team.abbr} sets a new all-time wins record`,
      detail: `${teamLabel(team)} has reached ${chase.current} regular-season wins across its franchise history, moving past the old mark of ${chase.target}.`,
    });
    else if (chase.recordTied) alerts.push({
      id: `${chase.id}-tied`, category: 'Record Watch', tone: 'record', priority: 116,
      badge: 'RECORD TIED', teams: [team.abbr],
      headline: `${team.abbr} ties the all-time wins record`,
      detail: `${teamLabel(team)} has matched the franchise all-time regular-season wins mark at ${chase.target}. The next win makes history outright.`,
    });
    else if (chase.isAllTimeThreat && chase.remaining <= 10) alerts.push({
      id: `${chase.id}-career`, category: 'Record Watch', tone: 'record', priority: 108 - chase.remaining,
      badge: chase.urgency, teams: [team.abbr],
      headline: chase.remaining === 1 ? `${team.abbr} is one win from the all-time wins record` : `${team.abbr} is ${chase.remaining} wins from history`,
      detail: `${teamLabel(team)} is chasing the franchise all-time regular-season wins mark currently held by ${chase.holder}.`,
    });
    if (chase.seasonRecordThreat) alerts.push({
      id: `${chase.id}-season`, category: 'Franchise History', tone: 'record', priority: 94 - (chase.seasonRemaining || 0),
      badge: chase.seasonRemaining === 0 ? 'NEW FRANCHISE HIGH' : 'FRANCHISE RECORD WATCH', teams: [team.abbr],
      headline: chase.seasonRemaining === 0 ? `${team.abbr} posts a new single-season wins high` : `${team.abbr} is chasing its best season ever`,
      detail: `${teamLabel(team)} is ${chase.seasonRemaining || 0} win${chase.seasonRemaining === 1 ? '' : 's'} from its previous single-season high of ${chase.seasonTarget}.`,
    });
    if (chase.seasonLowThreat) alerts.push({
      id: `${chase.id}-low`, category: 'Franchise History', tone: 'archive', priority: 90,
      badge: 'FRANCHISE LOW WATCH', teams: [team.abbr],
      headline: `${chase.team.abbr} is approaching an unwanted franchise low`,
      detail: `${teamLabel(team)} is on pace to finish below its previous worst single-season win total of ${chase.worstSeason || 'the record-book line'}.`,
    });
  });
  playerWatches.slice(0, 5).forEach((watch) => {
    const playerName = watch.player?.name || watch.playerName || 'The active chaser';
    if (watch.remaining <= 10 || watch.current >= watch.target) alerts.push({
      id: `player-${watch.id}-${watch.current}`,
      category: 'Player Record Watch', tone: 'record', priority: watch.current > watch.target ? 119 : watch.current === watch.target ? 116 : 100 - watch.remaining,
      badge: watch.current > watch.target ? 'RECORD BROKEN' : watch.current === watch.target ? 'RECORD TIED' : watch.urgency,
      teams: [watch.team?.abbr || watch.teamAbbr].filter(Boolean),
      headline: watch.current > watch.target ? `${playerName} breaks the ${watch.title.toLowerCase()}` : watch.current === watch.target ? `${playerName} ties the ${watch.title.toLowerCase()}` : `${playerName} is ${watch.remaining} from ${watch.title.toLowerCase()}`,
      detail: `${playerName} has ${watch.current.toLocaleString()} of the ${watch.target.toLocaleString()} needed to pass ${watch.holder || 'the current record holder'}.`,
    });
  });

  return {
    currentSeason,
    historicalLeader,
    historicalRecord,
    teamChases,
    playerWatches,
    alerts: alerts.sort((a, b) => b.priority - a.priority).slice(0, 12),
    topAlert: alerts.sort((a, b) => b.priority - a.priority)[0] || null,
  };
}

export function recordWatchFields() {
  return [
    { id: 'hits', label: 'Hits', key: 'careerHits' },
    { id: 'hr', label: 'Home Runs', key: 'careerHR' },
    { id: 'rbi', label: 'RBI', key: 'careerRBI' },
    { id: 'stolenBases', label: 'Stolen Bases', key: 'careerStolenBases' },
    { id: 'wins', label: 'Pitching Wins', key: 'careerPitchingWins' },
    { id: 'saves', label: 'Saves', key: 'careerSaves' },
    { id: 'strikeouts', label: 'Strikeouts', key: 'careerStrikeouts' },
  ];
}
