function teamLookup(teams = [], history = []) {
  const map = new Map((teams || []).map((t) => [t.id, t]));
  (history || []).forEach((season) => (season.teams || []).forEach((t) => {
    if (!map.has(t.id)) map.set(t.id, t);
  }));
  return map;
}

export function normalizeGameHistory(games = []) {
  return [...(games || [])]
    .filter((g) => g && g.status === 'Final' && g.awayTeamId && g.homeTeamId)
    .sort((a, b) => {
      const bd = Date.parse(b.date || b.finalizedAt || '') || 0;
      const ad = Date.parse(a.date || a.finalizedAt || '') || 0;
      return bd - ad;
    });
}

export function buildGameRecords(games = [], teams = [], history = []) {
  const list = normalizeGameHistory(games);
  const map = teamLookup(teams, history);
  const enriched = list.map((g) => {
    const away = map.get(g.awayTeamId);
    const home = map.get(g.homeTeamId);
    const awayScore = Number(g.awayScore || 0);
    const homeScore = Number(g.homeScore || 0);
    const totalRuns = awayScore + homeScore;
    const margin = Math.abs(awayScore - homeScore);
    const innings = Math.max(9, Number(g.inning || 9));
    const winnerTeamId = awayScore > homeScore ? g.awayTeamId : g.homeTeamId;
    return { ...g, away, home, awayScore, homeScore, totalRuns, margin, innings, winnerTeamId };
  });
  const by = (fn) => [...enriched].sort(fn)[0] || null;
  const singleTeamScoring = enriched.flatMap((g) => [
    { game:g, team:g.away, teamId:g.awayTeamId, runs:g.awayScore, opponent:g.home },
    { game:g, team:g.home, teamId:g.homeTeamId, runs:g.homeScore, opponent:g.away },
  ]).sort((a,b)=>b.runs-a.runs);
  return {
    games: enriched,
    biggestBlowout: by((a,b) => b.margin - a.margin || b.totalRuns - a.totalRuns),
    highestScoring: by((a,b) => b.totalRuns - a.totalRuns || b.margin - a.margin),
    longestGame: by((a,b) => b.innings - a.innings || b.totalRuns - a.totalRuns),
    mostHits: by((a,b) => (Number(b.awayHits||0)+Number(b.homeHits||0))-(Number(a.awayHits||0)+Number(a.homeHits||0))),
    highestTeamScore: singleTeamScoring[0] || null,
    postseasonGames: enriched.filter((g) => g.gameType === 'playoff'),
    walkoffs: enriched.filter((g) => g.walkoffVerified === true),
    shutouts: enriched.filter((g) => g.awayScore === 0 || g.homeScore === 0),
    oneRunGames: enriched.filter((g) => g.margin === 1),
    extraInningGames: enriched.filter((g) => g.innings > 9),
  };
}

export function buildHeadToHead(games = [], teams = [], history = []) {
  const map = teamLookup(teams, history);
  const rivalries = new Map();
  normalizeGameHistory(games).forEach((g) => {
    const ids = [g.awayTeamId, g.homeTeamId].sort();
    const key = ids.join('|');
    const row = rivalries.get(key) || { teamAId: ids[0], teamBId: ids[1], aWins:0, bWins:0, games:0, runsA:0, runsB:0, postseasonGames:0, latestDate:'', meetings:[] };
    const aAway = g.awayTeamId === row.teamAId;
    const aScore = aAway ? Number(g.awayScore||0) : Number(g.homeScore||0);
    const bScore = aAway ? Number(g.homeScore||0) : Number(g.awayScore||0);
    row.games += 1; row.runsA += aScore; row.runsB += bScore;
    if (aScore > bScore) row.aWins += 1; else if (bScore > aScore) row.bWins += 1;
    if (g.gameType === 'playoff') row.postseasonGames += 1;
    if (!row.latestDate || String(g.date||'') > row.latestDate) row.latestDate = g.date || '';
    row.meetings.push(g);
    rivalries.set(key,row);
  });
  return [...rivalries.values()].map((r) => ({
    ...r,
    teamA: map.get(r.teamAId), teamB: map.get(r.teamBId),
    heat: r.games * 2 + r.postseasonGames * 5 + Math.min(r.aWins,r.bWins)
  })).sort((a,b) => b.heat-a.heat || b.games-a.games);
}

export function buildTeamGameProfile(teamId, games = []) {
  const list = normalizeGameHistory(games).filter((g) => g.awayTeamId === teamId || g.homeTeamId === teamId);
  const chronological = [...list].sort((a,b) => {
    const at = Date.parse(a.finalizedAt || a.date || '') || 0;
    const bt = Date.parse(b.finalizedAt || b.date || '') || 0;
    return at - bt;
  });
  let wins=0, losses=0, runsFor=0, runsAgainst=0, playoffWins=0, playoffLosses=0;
  let homeWins=0, homeLosses=0, awayWins=0, awayLosses=0;
  let longestWinStreak=0, longestLossStreak=0, winStreak=0, lossStreak=0;
  let biggestWin=null, biggestLoss=null;
  chronological.forEach((g) => {
    const away = g.awayTeamId === teamId;
    const rf = Number(away ? g.awayScore : g.homeScore) || 0;
    const ra = Number(away ? g.homeScore : g.awayScore) || 0;
    runsFor += rf; runsAgainst += ra;
    const won = rf > ra;
    if (won) {
      wins += 1; winStreak += 1; lossStreak = 0; longestWinStreak = Math.max(longestWinStreak,winStreak);
      if (away) awayWins += 1; else homeWins += 1;
      if (g.gameType === 'playoff') playoffWins += 1;
      if (!biggestWin || (rf-ra) > biggestWin.margin) biggestWin = { ...g, margin:rf-ra, teamScore:rf, opponentScore:ra };
    } else if (ra > rf) {
      losses += 1; lossStreak += 1; winStreak = 0; longestLossStreak = Math.max(longestLossStreak,lossStreak);
      if (away) awayLosses += 1; else homeLosses += 1;
      if (g.gameType === 'playoff') playoffLosses += 1;
      if (!biggestLoss || (ra-rf) > biggestLoss.margin) biggestLoss = { ...g, margin:ra-rf, teamScore:rf, opponentScore:ra };
    }
  });
  return {
    games:list, wins, losses, runsFor, runsAgainst, playoffWins, playoffLosses,
    homeWins, homeLosses, awayWins, awayLosses, longestWinStreak, longestLossStreak,
    biggestWin, biggestLoss
  };
}

export function buildTeamHistoryLeaders(games = [], teams = []) {
  const rows = (teams || []).map((team) => ({ team, ...buildTeamGameProfile(team.id,games) }));
  const sortDesc = (field) => [...rows].sort((a,b)=>Number(b[field]||0)-Number(a[field]||0));
  return {
    wins: sortDesc('wins'),
    runDiff: [...rows].sort((a,b)=>(b.runsFor-b.runsAgainst)-(a.runsFor-a.runsAgainst)),
    winStreak: sortDesc('longestWinStreak'),
    playoffWins: sortDesc('playoffWins'),
    homeWins: sortDesc('homeWins'),
    awayWins: sortDesc('awayWins'),
  };
}

export function buildPlayerCareerBoard(players = [], seasonHistory = []) {
  const rows = (players || []).map((p) => ({
    id:p.id, name:p.name, teamId:p.teamId, number:p.number,
    careerAB:Number(p.careerAB||0), careerHits:Number(p.careerHits||0),
    careerDoubles:Number(p.careerDoubles||0), careerTriples:Number(p.careerTriples||0),
    careerHR:Number(p.careerHR||0), careerWalks:Number(p.careerWalks||0),
    careerStrikeouts:Number(p.careerStrikeouts||0), careerHBP:Number(p.careerHBP||0),
    careerPitchingWins:Number(p.careerPitchingWins||0), careerPitchingLosses:Number(p.careerPitchingLosses||0),
    seasonAB:Number(p.seasonAB||0), seasonHits:Number(p.seasonHits||0),
    seasonDoubles:Number(p.seasonDoubles||0), seasonTriples:Number(p.seasonTriples||0),
    seasonHR:Number(p.seasonHR||0), seasonWalks:Number(p.seasonWalks||0),
    seasonStrikeouts:Number(p.seasonStrikeouts||0), seasonHBP:Number(p.seasonHBP||0),
    seasonPitchingWins:Number(p.seasonPitchingWins||0), seasonPitchingLosses:Number(p.seasonPitchingLosses||0),
    careerAvg:Number(p.careerAB||0) ? Number(p.careerHits||0)/Number(p.careerAB||0) : 0,
    seasonAvg:Number(p.seasonAB||0) ? Number(p.seasonHits||0)/Number(p.seasonAB||0) : 0,
  }));
  return rows.sort((a,b)=>b.careerHits-a.careerHits || b.careerHR-a.careerHR || b.careerAB-a.careerAB);
}

export function buildSeasonComparisons(seasonHistory = []) {
  return [...seasonHistory].sort((a,b)=>(Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0)).map((s) => {
    const teams = s.teams || [];
    const best = [...teams].sort((a,b)=> {
      const ap=(Number(a.wins||0)+Number(a.losses||0)) ? Number(a.wins||0)/(Number(a.wins||0)+Number(a.losses||0)) : 0;
      const bp=(Number(b.wins||0)+Number(b.losses||0)) ? Number(b.wins||0)/(Number(b.wins||0)+Number(b.losses||0)) : 0;
      return bp-ap || Number(b.runDiff||0)-Number(a.runDiff||0);
    })[0];
    const runs = teams.reduce((n,t)=>n+Number(t.runsScored||0),0);
    return { id:s.id, name:s.name, archivedAt:s.archivedAt, championAbbr:s.championAbbr||'TBD', bestTeam:best, totalRuns:runs, teamCount:teams.length };
  });
}

export function buildDashboardAlerts(data, teams = []) {
  const alerts = [];
  const games = buildGameRecords(data?.games || [], teams, data?.seasonHistory || []);
  if (games.biggestBlowout) alerts.push({label:'Largest V3 Margin',value:`${games.biggestBlowout.margin} runs`,detail:`${games.biggestBlowout.away?.abbr||'AWY'} ${games.biggestBlowout.awayScore} – ${games.biggestBlowout.home?.abbr||'HME'} ${games.biggestBlowout.homeScore}`});
  if (games.highestScoring) alerts.push({label:'Highest V3 Total',value:`${games.highestScoring.totalRuns} runs`,detail:`${games.highestScoring.away?.abbr||'AWY'} ${games.highestScoring.awayScore} – ${games.highestScoring.home?.abbr||'HME'} ${games.highestScoring.homeScore}`});
  if (games.longestGame && games.longestGame.innings > 9) alerts.push({label:'Longest V3 Game',value:`${games.longestGame.innings} innings`,detail:`${games.longestGame.away?.abbr||'AWY'} at ${games.longestGame.home?.abbr||'HME'}`});
  return alerts;
}
