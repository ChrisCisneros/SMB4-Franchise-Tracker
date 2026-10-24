import { buildLeagueRecords } from './recordsUtils';
import { getPlayoffSeries, makeSafePlayoffBracket } from './playoffUtils';

const SERIES_IDS = [
  'al_qf1','al_qf2','al_qf3','al_qf4','al_sf1','al_sf2','al_lc',
  'nl_qf1','nl_qf2','nl_qf3','nl_qf4','nl_sf1','nl_sf2','nl_lc','finals'
];

function pct(team) {
  const w = Number(team?.wins || 0); const l = Number(team?.losses || 0); const g = w + l;
  return g ? w / g : 0;
}

export function buildPowerRankings(teams = []) {
  return [...teams].map((team) => {
    const streak = String(team.streak || '');
    const streakBonus = streak.startsWith('W') ? Math.min(8, Number(streak.slice(1) || 0) * 0.8) : streak.startsWith('L') ? -Math.min(8, Number(streak.slice(1) || 0) * 0.8) : 0;
    const score = pct(team) * 100 + Number(team.runDiff || 0) * 0.18 + streakBonus;
    return { ...team, powerScore: score };
  }).sort((a,b) => b.powerScore - a.powerScore || pct(b)-pct(a) || Number(b.runDiff||0)-Number(a.runDiff||0));
}

export function buildTeamProfile(teamId, teams = [], seasonHistory = []) {
  const records = buildLeagueRecords(seasonHistory, teams);
  const stat = records.teamStats.find((x) => x.teamId === teamId);
  const current = teams.find((x) => x.id === teamId) || {};
  const seasonMap = new Map((seasonHistory || []).map((season) => [season.id, season]));
  const seasons = records.seasonEntries
    .filter((x) => x.teamId === teamId)
    .map((entry) => {
      const season = seasonMap.get(entry.seasonId);
      const bracket = makeSafePlayoffBracket(season?.playoffBracket);
      const championId = season?.championTeamId || bracket.finals?.winnerTeamId || "";
      const alChampionId = bracket.al?.lc?.winnerTeamId || "";
      const nlChampionId = bracket.nl?.lc?.winnerTeamId || "";
      const leagueChampionLeague = alChampionId === teamId ? "AL" : nlChampionId === teamId ? "NL" : "";
      return {
        ...entry,
        champion: championId === teamId,
        leagueChampion: Boolean(leagueChampionLeague),
        leagueChampionLeague,
      };
    })
    .sort((a,b) => (Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0));
  const leagueChampionships = seasons.filter((season) => season.leagueChampion).length;
  const alChampionships = seasons.filter((season) => season.leagueChampionLeague === "AL").length;
  const nlChampionships = seasons.filter((season) => season.leagueChampionLeague === "NL").length;
  return { ...current, ...stat, seasons, leagueChampionships, alChampionships, nlChampionships };
}

export function buildTimeline(seasonHistory = []) {
  return [...seasonHistory].sort((a,b) => (Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0)).flatMap((season) => {
    const bracket = makeSafePlayoffBracket(season.playoffBracket);
    const finals = bracket.finals || {};
    const championId = season.championTeamId || finals.winnerTeamId;
    const champion = (season.teams || []).find((t) => t.id === championId);
    const best = [...(season.teams || [])].sort((a,b) => pct(b)-pct(a) || Number(b.runDiff||0)-Number(a.runDiff||0))[0];
    return [
      { type:'champion', seasonName:season.name, date:season.archivedAt, title:`${champion?.abbr || 'TBD'} crowned champion`, detail:`${finals.awayWins || 0}-${finals.homeWins || 0} World Series result`, teamId:championId },
      best && { type:'season', seasonName:season.name, date:season.archivedAt, title:`${best.abbr} posts league's best record`, detail:`${best.wins}-${best.losses} · RD ${Number(best.runDiff||0) >= 0 ? '+' : ''}${best.runDiff || 0}`, teamId:best.id }
    ].filter(Boolean);
  });
}

export function buildDynasties(seasonHistory = [], teams = []) {
  const records = buildLeagueRecords(seasonHistory, teams);
  return [...records.teamStats].map((row) => ({
    ...row,
    dynastyScore: row.championships * 12 + row.wsAppearances * 5 + row.playoffAppearances * 2 + row.playoffSeriesWins
  })).filter((row) => row.dynastyScore > 0).sort((a,b) => b.dynastyScore - a.dynastyScore || b.championships - a.championships);
}

export function buildRivalries(seasonHistory = [], teams = []) {
  const teamMap = new Map(teams.map((t) => [t.id,t]));
  seasonHistory.forEach((s) => (s.teams || []).forEach((t) => { if (!teamMap.has(t.id)) teamMap.set(t.id,t); }));
  const map = new Map();
  seasonHistory.forEach((season) => {
    const bracket = makeSafePlayoffBracket(season.playoffBracket);
    SERIES_IDS.forEach((seriesId) => {
      const s = getPlayoffSeries(bracket, seriesId);
      if (!s.awayTeamId || !s.homeTeamId) return;
      const ids = [s.awayTeamId, s.homeTeamId].sort();
      const key = ids.join('|');
      const row = map.get(key) || { teamAId:ids[0], teamBId:ids[1], meetings:0, games:0, aWins:0, bWins:0, seriesA:0, seriesB:0, seasons:[] };
      row.meetings += 1; row.games += Number(s.awayWins||0)+Number(s.homeWins||0); row.seasons.push(season.name);
      const awayIsA = s.awayTeamId === row.teamAId;
      row.aWins += awayIsA ? Number(s.awayWins||0) : Number(s.homeWins||0);
      row.bWins += awayIsA ? Number(s.homeWins||0) : Number(s.awayWins||0);
      if (s.winnerTeamId === row.teamAId) row.seriesA += 1;
      if (s.winnerTeamId === row.teamBId) row.seriesB += 1;
      map.set(key,row);
    });
  });
  return [...map.values()].map((r) => ({
    ...r,
    teamA:teamMap.get(r.teamAId), teamB:teamMap.get(r.teamBId),
    heat:r.meetings*5 + r.games + Math.abs(r.seriesA-r.seriesB) * -1
  })).sort((a,b) => b.meetings-a.meetings || b.games-a.games);
}

export function buildSeasonPreview(seasonHistory = [], teams = []) {
  const latest = [...seasonHistory].sort((a,b)=>(Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0))[0];
  const records = buildLeagueRecords(seasonHistory, teams);
  const championId = latest?.championTeamId || makeSafePlayoffBracket(latest?.playoffBracket).finals?.winnerTeamId;
  const champion = (latest?.teams || teams).find((t) => t.id === championId);
  const titleLeader = records.rankings.championships[0];
  const droughtLeader = records.lists.activeTitleDroughts[0];
  return { latest, champion, titleLeader, droughtLeader };
}

export function buildOnThisDay(seasonHistory = [], lastFinalGame = null, teams = []) {
  const now = new Date(); const mmdd = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const items = [];
  seasonHistory.forEach((season) => {
    if (!season.archivedAt) return;
    const d = new Date(season.archivedAt); const key = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (key === mmdd) {
      const bracket = makeSafePlayoffBracket(season.playoffBracket);
      const cid = season.championTeamId || bracket.finals?.winnerTeamId;
      const champ = (season.teams || []).find((t) => t.id === cid);
      items.push({ title:`${season.name} archived`, detail:`${champ?.abbr || 'TBD'} finished as champion.` });
    }
  });
  if (lastFinalGame?.date?.slice(5) === mmdd) {
    const a = teams.find((t)=>t.id===lastFinalGame.awayTeamId); const h=teams.find((t)=>t.id===lastFinalGame.homeTeamId);
    items.unshift({ title:'Latest final on this date', detail:`${a?.abbr || 'AWY'} ${lastFinalGame.awayScore} – ${h?.abbr || 'HME'} ${lastFinalGame.homeScore}` });
  }
  return items;
}
