import { makeSafePlayoffBracket } from "./playoffUtils";
import { buildLeagueRecords, formatPct } from "./recordsUtils";
import { buildGameRecords } from "./historyUtils";

function gamePct(team) {
  const wins = Number(team?.wins || 0);
  const losses = Number(team?.losses || 0);
  const total = wins + losses;
  return total ? wins / total : 0;
}

function teamName(team) {
  return team ? `${team.city ? `${team.city} ` : ""}${team.name || team.abbr}`.trim() : "Unknown team";
}

function seasonTeamName(team) {
  return team ? team.name || team.abbr || "Unknown team" : "Unknown team";
}

function formatArchiveDate(value) {
  if (!value) return "Archived season";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Archived season";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function currentDivisionRace(teams) {
  const races = [];
  ["AL", "NL"].forEach((league) => {
    ["East", "Central", "West"].forEach((division) => {
      const group = teams
        .filter((team) => team.league === league && team.division === division)
        .sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0));
      if (group.length < 2) return;
      const [leader, second] = group;
      const gamesPlayed = Number(leader.wins || 0) + Number(leader.losses || 0) + Number(second.wins || 0) + Number(second.losses || 0);
      if (!gamesPlayed) return;
      const gap = ((Number(leader.wins || 0) - Number(second.wins || 0)) + (Number(second.losses || 0) - Number(leader.losses || 0))) / 2;
      races.push({ league, division, leader, second, gap: Math.max(0, gap) });
    });
  });
  return races.sort((a, b) => a.gap - b.gap)[0] || null;
}

function getSeasonPlayoffStats(season) {
  const bracket = makeSafePlayoffBracket(season.playoffBracket);
  const series = [
    ...Object.values(bracket.al || {}),
    ...Object.values(bracket.nl || {}),
    bracket.finals,
  ].filter(Boolean);
  const wins = new Map();
  series.forEach((item) => {
    if (item.awayTeamId) wins.set(item.awayTeamId, (wins.get(item.awayTeamId) || 0) + Number(item.awayWins || 0));
    if (item.homeTeamId) wins.set(item.homeTeamId, (wins.get(item.homeTeamId) || 0) + Number(item.homeWins || 0));
  });
  return [...wins.entries()].sort((a, b) => b[1] - a[1])[0] || null;
}

export function buildNewsFeed(data, teams) {
  const stories = [];
  const activeTeams = Array.isArray(teams) ? teams : [];
  const seasonHistory = Array.isArray(data?.seasonHistory) ? data.seasonHistory : [];
  const teamById = (id) => activeTeams.find((team) => team.id === id);



  const lastFinal = data?.lastFinalGame;
  if (lastFinal?.awayTeamId && lastFinal?.homeTeamId) {
    const away = teamById(lastFinal.awayTeamId);
    const home = teamById(lastFinal.homeTeamId);
    const awayScore = Number(lastFinal.awayScore || 0);
    const homeScore = Number(lastFinal.homeScore || 0);
    const winner = awayScore > homeScore ? away : home;
    const loser = awayScore > homeScore ? home : away;
    if (away && home && winner && loser) {
      stories.push({
        id: `latest-final-${lastFinal.id || `${lastFinal.awayTeamId}-${lastFinal.homeTeamId}-${lastFinal.date || "game"}`}`,
        category: "Game Final",
        tone: lastFinal.gameType === "playoff" ? "postseason" : "game",
        dateLabel: lastFinal.date || "Latest final",
        headline: lastFinal.walkoff
          ? `${home.abbr} walks it off against ${away.abbr}`
          : `${winner.abbr} takes the latest final over ${loser.abbr}`,
        dek: `${away.abbr} ${awayScore}, ${home.abbr} ${homeScore}. ${lastFinal.walkoff ? `${teamName(home)} ended it in walk-off fashion.` : `${teamName(winner)} won by ${Math.abs(awayScore - homeScore)} run${Math.abs(awayScore - homeScore) === 1 ? "" : "s"}.`}`,
        teams: [away.abbr, home.abbr],
      });
    }
  }

  const teamsWithGames = activeTeams.filter((team) => Number(team.wins || 0) + Number(team.losses || 0) > 0);
  if (teamsWithGames.length) {
    const best = [...teamsWithGames].sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const rdKing = [...teamsWithGames].sort((a, b) => Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const race = currentDivisionRace(activeTeams);

    stories.push({
      id: "current-best-record",
      category: "League Watch",
      tone: "current",
      dateLabel: "Current season",
      headline: `${best.abbr} owns the league's best record`,
      dek: `${teamName(best)} sits at ${best.wins}-${best.losses} (${formatPct(gamePct(best))}) with a ${Number(best.runDiff || 0) >= 0 ? "+" : ""}${Number(best.runDiff || 0)} run differential.`,
      teams: [best.abbr],
    });

    if (rdKing && rdKing.id !== best.id) {
      stories.push({
        id: "current-run-diff",
        category: "League Watch",
        tone: "current",
        dateLabel: "Current season",
        headline: `${rdKing.abbr} is setting the pace in run differential`,
        dek: `${teamName(rdKing)} leads the league at ${Number(rdKing.runDiff || 0) >= 0 ? "+" : ""}${Number(rdKing.runDiff || 0)}.`,
        teams: [rdKing.abbr],
      });
    }

    if (race) {
      const gapText = Number.isInteger(race.gap) ? String(race.gap) : race.gap.toFixed(1);
      stories.push({
        id: "current-tightest-division",
        category: "Pennant Race",
        tone: "current",
        dateLabel: "Current season",
        headline: `${race.league} ${race.division} is the league's tightest race`,
        dek: `${race.leader.abbr} leads ${race.second.abbr} by ${gapText} game${race.gap === 1 ? "" : "s"}.`,
        teams: [race.leader.abbr, race.second.abbr],
      });
    }
  }

  const extras = data?.leagueExtras || {};
  (extras.transactions || []).slice(0, 4).forEach((item, index) => stories.push({
    id:`transaction-${item.id || index}`, category:'Transactions', tone:'transaction', dateLabel:item.date || 'League wire',
    headline:item.title || `${item.teamAbbr || 'League'} transaction`,
    dek:item.note || `${item.teamAbbr || 'A club'} made a roster move.`,
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));
  (extras.injuries || []).slice(0, 3).forEach((item, index) => stories.push({
    id:`injury-${item.id || index}`, category:'Injury Report', tone:'injury', dateLabel:item.date || 'Medical update',
    headline:`${item.name || 'Player'} injury update${item.teamAbbr ? ` for ${item.teamAbbr}` : ''}`,
    dek:item.note || 'Status has been added to the league injury log.',
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));
  (extras.awards || []).slice(0, 3).forEach((item, index) => stories.push({
    id:`award-${item.id || index}`, category:'Awards', tone:'archive', dateLabel:item.season || 'League honors',
    headline:`${item.winner || 'Winner'} named ${item.award || 'award winner'}`,
    dek:`${item.teamAbbr ? `${item.teamAbbr} · ` : ''}${item.season || 'League award'}.`,
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));

  seasonHistory.forEach((season, index) => {
    const bracket = makeSafePlayoffBracket(season.playoffBracket);
    const championId = season.championTeamId || bracket.finals?.winnerTeamId;
    const champion = (season.teams || []).find((team) => team.id === championId);
    const finalsAway = (season.teams || []).find((team) => team.id === bracket.finals?.awayTeamId);
    const finalsHome = (season.teams || []).find((team) => team.id === bracket.finals?.homeTeamId);
    const runnerUp = finalsAway?.id === championId ? finalsHome : finalsAway;
    const bestSeasonTeam = [...(season.teams || [])].sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const playoffLeader = getSeasonPlayoffStats(season);
    const playoffLeaderTeam = playoffLeader ? (season.teams || []).find((team) => team.id === playoffLeader[0]) : null;

    if (champion) {
      stories.push({
        id: `archive-title-${season.id || index}`,
        category: "Championship",
        tone: "championship",
        dateLabel: formatArchiveDate(season.archivedAt),
        headline: `${champion.abbr} crowned ${season.name || "season"} World Series champion`,
        dek: runnerUp
          ? `${seasonTeamName(champion)} finished the run by defeating ${runnerUp.abbr} in the World Series.`
          : `${seasonTeamName(champion)} sits at the top of the archived record book for ${season.name || "this season"}.`,
        teams: runnerUp ? [champion.abbr, runnerUp.abbr] : [champion.abbr],
        seasonName: season.name,
      });
    }

    if (bestSeasonTeam) {
      stories.push({
        id: `archive-best-${season.id || index}`,
        category: "Season Recap",
        tone: "archive",
        dateLabel: season.name || formatArchiveDate(season.archivedAt),
        headline: `${bestSeasonTeam.abbr} posted ${season.name || "the season"}'s best regular-season record`,
        dek: `${bestSeasonTeam.wins}-${bestSeasonTeam.losses} (${formatPct(gamePct(bestSeasonTeam))}) with a ${Number(bestSeasonTeam.runDiff || 0) >= 0 ? "+" : ""}${Number(bestSeasonTeam.runDiff || 0)} run differential.`,
        teams: [bestSeasonTeam.abbr],
        seasonName: season.name,
      });
    }

    if (playoffLeaderTeam && playoffLeader?.[1] > 0) {
      stories.push({
        id: `archive-playoff-wins-${season.id || index}`,
        category: "Postseason",
        tone: "postseason",
        dateLabel: season.name || formatArchiveDate(season.archivedAt),
        headline: `${playoffLeaderTeam.abbr} led ${season.name || "the season"} in playoff game wins`,
        dek: `${playoffLeaderTeam.abbr} collected ${playoffLeader[1]} postseason win${playoffLeader[1] === 1 ? "" : "s"} across the archived bracket.`,
        teams: [playoffLeaderTeam.abbr],
        seasonName: season.name,
      });
    }
  });

  if (seasonHistory.length) {
    const records = buildLeagueRecords(seasonHistory, activeTeams);
    const titleLeader = records.leaders.championships || [];
    const playoffWinsLeader = records.leaders.playoffGameWins || [];
    const playoffAppearanceLeader = records.leaders.playoffAppearances || [];

    if (titleLeader.length && Number(titleLeader[0].championships || 0) > 0) {
      stories.push({
        id: "record-title-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${titleLeader.map((row) => row.abbr).join(" / ")} ${titleLeader.length > 1 ? "share" : "owns"} the championship lead`,
        dek: `${titleLeader[0].championships} World Series title${titleLeader[0].championships === 1 ? "" : "s"} in the archived league history.`,
        teams: titleLeader.map((row) => row.abbr),
      });
    }

    if (playoffWinsLeader.length && Number(playoffWinsLeader[0].playoffGameWins || 0) > 0) {
      stories.push({
        id: "record-playoff-wins-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${playoffWinsLeader.map((row) => row.abbr).join(" / ")} ${playoffWinsLeader.length > 1 ? "share" : "holds"} the playoff wins record`,
        dek: `${playoffWinsLeader[0].playoffGameWins} postseason game win${playoffWinsLeader[0].playoffGameWins === 1 ? "" : "s"} across archived brackets.`,
        teams: playoffWinsLeader.map((row) => row.abbr),
      });
    }

    if (playoffAppearanceLeader.length && Number(playoffAppearanceLeader[0].playoffAppearances || 0) > 0) {
      stories.push({
        id: "record-playoff-appearances-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${playoffAppearanceLeader.map((row) => row.abbr).join(" / ")} ${playoffAppearanceLeader.length > 1 ? "share" : "leads"} in playoff appearances`,
        dek: `${playoffAppearanceLeader[0].playoffAppearances} postseason appearance${playoffAppearanceLeader[0].playoffAppearances === 1 ? "" : "s"} in the archived record book.`,
        teams: playoffAppearanceLeader.map((row) => row.abbr),
      });
    }
  }

  const v3GameRecords = buildGameRecords(data?.games || [], activeTeams, seasonHistory);
  if (v3GameRecords.games.length) {
    const blowout = v3GameRecords.biggestBlowout;
    const high = v3GameRecords.highestScoring;
    const long = v3GameRecords.longestGame;
    if (blowout) stories.push({
      id: "v3-record-biggest-blowout", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${blowout.away?.abbr || "AWY"}-${blowout.home?.abbr || "HME"} game owns the largest V3 margin`,
      dek: `${blowout.away?.abbr || "AWY"} ${blowout.awayScore}, ${blowout.home?.abbr || "HME"} ${blowout.homeScore} — a ${blowout.margin}-run margin on ${blowout.date || "the recorded date"}.`,
      teams: [blowout.away?.abbr, blowout.home?.abbr].filter(Boolean)
    });
    if (high && high.id !== blowout?.id) stories.push({
      id: "v3-record-highest-total", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${high.totalRuns} combined runs sets the V3 scoring mark`,
      dek: `${high.away?.abbr || "AWY"} ${high.awayScore}, ${high.home?.abbr || "HME"} ${high.homeScore}.`,
      teams: [high.away?.abbr, high.home?.abbr].filter(Boolean)
    });
    if (long && long.innings > 9) stories.push({
      id: "v3-record-longest-game", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${long.innings}-inning marathon stands as the longest V3 game`,
      dek: `${long.away?.abbr || "AWY"} ${long.awayScore}, ${long.home?.abbr || "HME"} ${long.homeScore}.`,
      teams: [long.away?.abbr, long.home?.abbr].filter(Boolean)
    });
  }

  return stories;
}
