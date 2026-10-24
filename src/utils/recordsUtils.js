import { getPlayoffSeries, makeSafePlayoffBracket } from "./playoffUtils";

const SERIES_IDS = [
  "al_qf1", "al_qf2", "al_qf3", "al_qf4",
  "al_sf1", "al_sf2", "al_lc",
  "nl_qf1", "nl_qf2", "nl_qf3", "nl_qf4",
  "nl_sf1", "nl_sf2", "nl_lc",
  "finals",
];

const QF_IDS = [
  "al_qf1", "al_qf2", "al_qf3", "al_qf4",
  "nl_qf1", "nl_qf2", "nl_qf3", "nl_qf4",
];

function pctValue(wins, losses) {
  const total = Number(wins || 0) + Number(losses || 0);
  return total ? Number(wins || 0) / total : 0;
}

export function formatPct(value) {
  return Number(value || 0).toFixed(3).replace(/^0/, "");
}

function getChronologicalSeasons(seasonHistory = []) {
  return [...seasonHistory].sort((a, b) => {
    const aTime = Date.parse(a?.archivedAt || "") || 0;
    const bTime = Date.parse(b?.archivedAt || "") || 0;
    if (aTime !== bTime) return aTime - bTime;
    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function teamIdsInPlayoffs(snapshot) {
  const bracket = makeSafePlayoffBracket(snapshot?.playoffBracket);
  const ids = new Set();
  QF_IDS.forEach((seriesId) => {
    const series = getPlayoffSeries(bracket, seriesId);
    if (series.awayTeamId) ids.add(series.awayTeamId);
    if (series.homeTeamId) ids.add(series.homeTeamId);
  });
  return ids;
}

function winnerIdsBySeries(snapshot) {
  const bracket = makeSafePlayoffBracket(snapshot?.playoffBracket);
  const ids = [];
  SERIES_IDS.forEach((seriesId) => {
    const series = getPlayoffSeries(bracket, seriesId);
    if (series.winnerTeamId) ids.push(series.winnerTeamId);
  });
  return ids;
}

function getTeamLookup(currentTeams = [], history = []) {
  const map = new Map();
  currentTeams.forEach((team) => {
    if (team?.id) map.set(team.id, team);
  });
  history.forEach((season) => {
    (season?.teams || []).forEach((team) => {
      if (team?.id && !map.has(team.id)) map.set(team.id, team);
    });
  });
  return map;
}

function makeTeamStat(team) {
  return {
    teamId: team.id,
    abbr: team.abbr || "TBD",
    name: team.name || team.abbr || "Unknown Team",
    city: team.city || "",
    seasons: 0,
    wins: 0,
    losses: 0,
    championships: 0,
    wsAppearances: 0,
    playoffAppearances: 0,
    playoffGameWins: 0,
    playoffGameLosses: 0,
    playoffSeriesWins: 0,
    divisionTitles: 0,
    topSeeds: 0,
    above500Seasons: 0,
  };
}

function maxStreak(seasons, predicate) {
  let best = 0;
  let current = 0;
  seasons.forEach((season, index) => {
    if (predicate(season, index)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });
  return best;
}

function activeDrought(seasons, predicate) {
  let count = 0;
  for (let i = seasons.length - 1; i >= 0; i -= 1) {
    if (predicate(seasons[i], i)) break;
    count += 1;
  }
  return count;
}

function allTimeLeaderRows(stats, key, { min = null, descending = true } = {}) {
  const rows = stats.filter((row) => (min == null ? true : Number(row[key] || 0) >= min));
  rows.sort((a, b) => {
    const diff = Number(a[key] || 0) - Number(b[key] || 0);
    if (diff !== 0) return descending ? -diff : diff;
    return String(a.abbr).localeCompare(String(b.abbr));
  });
  return rows;
}

function topTied(rows, key, { allowZero = false, descending = true } = {}) {
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => {
    const diff = Number(a[key] || 0) - Number(b[key] || 0);
    return descending ? -diff : diff;
  });
  const target = Number(sorted[0]?.[key] || 0);
  if (!allowZero && target === 0) return [];
  return sorted.filter((row) => Number(row[key] || 0) === target);
}

export function buildLeagueRecords(seasonHistory = [], currentTeams = []) {
  const seasons = getChronologicalSeasons(seasonHistory).filter((season) => Array.isArray(season?.teams));
  const teamLookup = getTeamLookup(currentTeams, seasons);
  const statMap = new Map();

  teamLookup.forEach((team) => statMap.set(team.id, makeTeamStat(team)));

  const seasonEntries = [];

  seasons.forEach((season, seasonIndex) => {
    const bracket = makeSafePlayoffBracket(season.playoffBracket);
    const playoffIds = teamIdsInPlayoffs(season);
    const championId = season.championTeamId || bracket.finals?.winnerTeamId || "";
    const wsIds = new Set([bracket.finals?.awayTeamId, bracket.finals?.homeTeamId].filter(Boolean));

    (season.teams || []).forEach((team) => {
      if (!team?.id) return;
      if (!statMap.has(team.id)) statMap.set(team.id, makeTeamStat(team));
      const stat = statMap.get(team.id);
      stat.seasons += 1;
      stat.wins += Number(team.wins || 0);
      stat.losses += Number(team.losses || 0);
      if (pctValue(team.wins, team.losses) > 0.5) stat.above500Seasons += 1;

      seasonEntries.push({
        seasonId: season.id,
        seasonName: season.name || `Season ${seasonIndex + 1}`,
        archivedAt: season.archivedAt || "",
        teamId: team.id,
        abbr: team.abbr || stat.abbr,
        name: team.name || stat.name,
        wins: Number(team.wins || 0),
        losses: Number(team.losses || 0),
        pct: pctValue(team.wins, team.losses),
        runDiff: Number(team.runDiff || 0),
        runsScored: Number(team.runsScored || 0),
        runsAllowed: Number(team.runsAllowed || 0),
      });
    });

    playoffIds.forEach((teamId) => {
      if (statMap.has(teamId)) statMap.get(teamId).playoffAppearances += 1;
    });
    wsIds.forEach((teamId) => {
      if (statMap.has(teamId)) statMap.get(teamId).wsAppearances += 1;
    });
    if (championId && statMap.has(championId)) statMap.get(championId).championships += 1;

    SERIES_IDS.forEach((seriesId) => {
      const series = getPlayoffSeries(bracket, seriesId);
      const awayWins = Number(series.awayWins || 0);
      const homeWins = Number(series.homeWins || 0);
      if (series.awayTeamId && statMap.has(series.awayTeamId)) {
        const stat = statMap.get(series.awayTeamId);
        stat.playoffGameWins += awayWins;
        stat.playoffGameLosses += homeWins;
      }
      if (series.homeTeamId && statMap.has(series.homeTeamId)) {
        const stat = statMap.get(series.homeTeamId);
        stat.playoffGameWins += homeWins;
        stat.playoffGameLosses += awayWins;
      }
      if (series.winnerTeamId && statMap.has(series.winnerTeamId)) {
        statMap.get(series.winnerTeamId).playoffSeriesWins += 1;
      }
    });

    ["AL", "NL"].forEach((league) => {
      const leagueTeams = (season.teams || []).filter((team) => team.league === league);
      ["East", "Central", "West"].forEach((division) => {
        const divisionTeams = leagueTeams
          .filter((team) => team.division === division)
          .sort((a, b) => {
            const pctDiff = pctValue(b.wins, b.losses) - pctValue(a.wins, a.losses);
            if (pctDiff !== 0) return pctDiff;
            const winDiff = Number(b.wins || 0) - Number(a.wins || 0);
            if (winDiff !== 0) return winDiff;
            return Number(b.runDiff || 0) - Number(a.runDiff || 0);
          });
        if (divisionTeams[0]?.id && statMap.has(divisionTeams[0].id)) {
          statMap.get(divisionTeams[0].id).divisionTitles += 1;
        }
      });
    });

    const alTopSeed = bracket.al?.qf1?.awayTeamId;
    const nlTopSeed = bracket.nl?.qf1?.awayTeamId;
    [alTopSeed, nlTopSeed].filter(Boolean).forEach((teamId) => {
      if (statMap.has(teamId)) statMap.get(teamId).topSeeds += 1;
    });
  });

  const teamStats = [...statMap.values()].map((stat) => ({
    ...stat,
    regularSeasonPct: pctValue(stat.wins, stat.losses),
    playoffPct: pctValue(stat.playoffGameWins, stat.playoffGameLosses),
  }));

  teamStats.forEach((stat) => {
    stat.longestPlayoffStreak = maxStreak(seasons, (season) => teamIdsInPlayoffs(season).has(stat.teamId));
    stat.longestWsStreak = maxStreak(seasons, (season) => {
      const finals = makeSafePlayoffBracket(season.playoffBracket).finals;
      return finals.awayTeamId === stat.teamId || finals.homeTeamId === stat.teamId;
    });
    stat.longestChampionshipStreak = maxStreak(seasons, (season) => {
      const bracket = makeSafePlayoffBracket(season.playoffBracket);
      return (season.championTeamId || bracket.finals?.winnerTeamId) === stat.teamId;
    });
    stat.activePlayoffDrought = activeDrought(seasons, (season) => teamIdsInPlayoffs(season).has(stat.teamId));
    stat.activeTitleDrought = activeDrought(seasons, (season) => {
      const bracket = makeSafePlayoffBracket(season.playoffBracket);
      return (season.championTeamId || bracket.finals?.winnerTeamId) === stat.teamId;
    });
  });

  const bestSeason = [...seasonEntries].sort((a, b) => b.pct - a.pct || b.wins - a.wins || b.runDiff - a.runDiff)[0] || null;
  const worstSeason = [...seasonEntries].sort((a, b) => a.pct - b.pct || a.wins - b.wins || a.runDiff - b.runDiff)[0] || null;
  const bestRunDiffSeason = [...seasonEntries].sort((a, b) => b.runDiff - a.runDiff)[0] || null;
  const worstRunDiffSeason = [...seasonEntries].sort((a, b) => a.runDiff - b.runDiff)[0] || null;
  const mostRunsSeason = [...seasonEntries].sort((a, b) => b.runsScored - a.runsScored)[0] || null;
  const fewestRunsSeason = [...seasonEntries].sort((a, b) => a.runsScored - b.runsScored)[0] || null;
  const fewestRunsAllowedSeason = [...seasonEntries].sort((a, b) => a.runsAllowed - b.runsAllowed)[0] || null;
  const mostRunsAllowedSeason = [...seasonEntries].sort((a, b) => b.runsAllowed - a.runsAllowed)[0] || null;

  return {
    seasons,
    teamStats,
    seasonEntries,
    summary: {
      seasonsArchived: seasons.length,
      championsCrowned: seasons.filter((season) => season.championTeamId || makeSafePlayoffBracket(season.playoffBracket).finals?.winnerTeamId).length,
      teamsTracked: teamStats.length,
    },
    leaders: {
      championships: topTied(teamStats, "championships"),
      wsAppearances: topTied(teamStats, "wsAppearances"),
      playoffAppearances: topTied(teamStats, "playoffAppearances"),
      playoffGameWins: topTied(teamStats, "playoffGameWins"),
      playoffSeriesWins: topTied(teamStats, "playoffSeriesWins"),
      longestWsStreak: topTied(teamStats, "longestWsStreak"),
      longestPlayoffStreak: topTied(teamStats, "longestPlayoffStreak"),
      longestChampionshipStreak: topTied(teamStats, "longestChampionshipStreak"),
      divisionTitles: topTied(teamStats, "divisionTitles"),
      topSeeds: topTied(teamStats, "topSeeds"),
      allTimeWins: topTied(teamStats, "wins"),
      above500Seasons: topTied(teamStats, "above500Seasons"),
    },
    rankings: {
      championships: allTimeLeaderRows(teamStats, "championships", { min: 1 }),
      wsAppearances: allTimeLeaderRows(teamStats, "wsAppearances", { min: 1 }),
      playoffAppearances: allTimeLeaderRows(teamStats, "playoffAppearances", { min: 1 }),
      playoffGameWins: allTimeLeaderRows(teamStats, "playoffGameWins", { min: 1 }),
      playoffSeriesWins: allTimeLeaderRows(teamStats, "playoffSeriesWins", { min: 1 }),
      divisionTitles: allTimeLeaderRows(teamStats, "divisionTitles", { min: 1 }),
      topSeeds: allTimeLeaderRows(teamStats, "topSeeds", { min: 1 }),
      allTimeWins: allTimeLeaderRows(teamStats, "wins", { min: 1 }),
      allTimePct: [...teamStats].filter((row) => row.seasons > 0).sort((a, b) => b.regularSeasonPct - a.regularSeasonPct || b.wins - a.wins),
      playoffPct: [...teamStats].filter((row) => row.playoffGameWins + row.playoffGameLosses > 0).sort((a, b) => b.playoffPct - a.playoffPct || b.playoffGameWins - a.playoffGameWins),
    },
    lists: {
      noPlayoffs: teamStats.filter((row) => row.playoffAppearances === 0).sort((a, b) => a.abbr.localeCompare(b.abbr)),
      noTrophy: teamStats.filter((row) => row.championships === 0).sort((a, b) => a.abbr.localeCompare(b.abbr)),
      neverWorldSeries: teamStats.filter((row) => row.wsAppearances === 0).sort((a, b) => a.abbr.localeCompare(b.abbr)),
      perfectPlayoffAttendance: seasons.length
        ? teamStats.filter((row) => row.playoffAppearances === seasons.length).sort((a, b) => a.abbr.localeCompare(b.abbr))
        : [],
      activePlayoffDroughts: [...teamStats].filter((row) => row.activePlayoffDrought > 0).sort((a, b) => b.activePlayoffDrought - a.activePlayoffDrought || a.abbr.localeCompare(b.abbr)),
      activeTitleDroughts: [...teamStats].filter((row) => row.activeTitleDrought > 0).sort((a, b) => b.activeTitleDrought - a.activeTitleDrought || a.abbr.localeCompare(b.abbr)),
    },
    singleSeason: {
      bestSeason,
      worstSeason,
      bestRunDiffSeason,
      worstRunDiffSeason,
      mostRunsSeason,
      fewestRunsSeason,
      fewestRunsAllowedSeason,
      mostRunsAllowedSeason,
    },
  };
}
