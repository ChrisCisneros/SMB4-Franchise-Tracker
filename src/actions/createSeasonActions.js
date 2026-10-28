import { DAILY_ROWS } from "../config/constants";
import { defaultCurrentGame, defaultData, emptyDailyRow } from "../utils/gameState";
import { defaultPlayoffBracket, makeSafePlayoffBracket } from "../utils/playoffUtils";

export default function createSeasonActions({
  data, setData, setExpandedHistorySeasonIds, setPage, teamById, teams,
  syncCurrentGameToFirebase, syncDailyResultsRowsToFirebase,
  syncLastFinalGameToFirebase, syncPlayoffBracketToFirebase,
  syncSeasonHistoryToFirebase, syncTeamsToFirebase, syncPlayersToFirebase,
}) {
  function resetLeague() {
    const typed = window.prompt(
      'Emergency local reset only. Firebase is NOT erased and may restore synced data. Type RESET LOCAL to continue:'
    );
    if (typed !== 'RESET LOCAL') return;
    if (!window.confirm('Reset this browser copy to defaults? Synced Firebase data is intentionally left untouched.')) return;
    setData({ ...defaultData, currentGame: defaultCurrentGame(), dailyResultsRows: Array.from({ length: DAILY_ROWS }, emptyDailyRow) });
    setPage("dashboard");
  }

  function archiveCurrentSeason() {
  const seasonName = window.prompt(
    "Name this season snapshot:",
    `Season ${new Date().getFullYear()}`
  );

  if (seasonName === null) return;

  const safeBracket = makeSafePlayoffBracket(data.playoffBracket);
  const championTeam = teamById(safeBracket.finals?.winnerTeamId);

  const snapshot = {
    id: crypto.randomUUID(),
    name: seasonName.trim() || `Season ${new Date().getFullYear()}`,
    archivedAt: new Date().toISOString(),
    championTeamId: championTeam?.id || "",
    championAbbr: championTeam?.abbr || "TBD",
    teams: teams.map((team) => ({
      id: team.id,
      abbr: team.abbr,
      name: team.name,
      league: team.league,
      division: team.division,
      wins: Number(team.wins || 0),
      losses: Number(team.losses || 0),
      runDiff: Number(team.runDiff || 0),
      runsScored: Number(team.runsScored || 0),
      runsAllowed: Number(team.runsAllowed || 0),
    })),
    playoffBracket: safeBracket,
    games: (data.games || []).filter((game) => game.seasonName === (data.activeSeasonName || "Season 4")),
    players: (data.players || []).map((player) => ({
      id: player.id, teamId: player.teamId, name: player.name, number: player.number,
      seasonAB: Number(player.seasonAB || 0), seasonHits: Number(player.seasonHits || 0),
      seasonDoubles: Number(player.seasonDoubles || 0), seasonTriples: Number(player.seasonTriples || 0),
      seasonHR: Number(player.seasonHR || 0), seasonWalks: Number(player.seasonWalks || 0),
      seasonStrikeouts: Number(player.seasonStrikeouts || 0), seasonHBP: Number(player.seasonHBP || 0),
      seasonPitchingWins: Number(player.seasonPitchingWins || 0), seasonPitchingLosses: Number(player.seasonPitchingLosses || 0),
      careerAB: Number(player.careerAB || 0), careerHits: Number(player.careerHits || 0),
      careerDoubles: Number(player.careerDoubles || 0), careerTriples: Number(player.careerTriples || 0),
      careerHR: Number(player.careerHR || 0), careerWalks: Number(player.careerWalks || 0),
      careerStrikeouts: Number(player.careerStrikeouts || 0), careerHBP: Number(player.careerHBP || 0),
      careerPitchingWins: Number(player.careerPitchingWins || 0), careerPitchingLosses: Number(player.careerPitchingLosses || 0),
    })),
    awards: (data.leagueExtras?.awards || []).filter((a) => a?.winner && (!a.season || a.season === (data.activeSeasonName || "Season 4"))).map((a)=>({...a})),
    achievements: (data.leagueExtras?.achievements || []).filter((a) => !a.season || a.season === (data.activeSeasonName || "Season 4")).map((a)=>({...a})),
  };

  const nextHistory = [snapshot, ...(data.seasonHistory || [])].slice(0, 25);

  syncSeasonHistoryToFirebase(nextHistory);

  setData((prev) => ({
    ...prev,
    seasonHistory: nextHistory,
  }));

  setPage("history");
}

function deleteSeasonSnapshot(snapshotId) {
  const snapshot = (data.seasonHistory || []).find((item) => item.id === snapshotId);

  if (!snapshot) return;

  if (
    !window.confirm(
      `Delete "${snapshot.name}" from season history? This cannot be undone.`
    )
  ) {
    return;
  }

  const nextHistory = (data.seasonHistory || []).filter(
    (item) => item.id !== snapshotId
  );

  syncSeasonHistoryToFirebase(nextHistory);

  setData((prev) => ({
    ...prev,
    seasonHistory: nextHistory,
  }));
}

function toggleHistorySeason(snapshotId) {
  setExpandedHistorySeasonIds((prev) =>
    prev.includes(snapshotId)
      ? prev.filter((id) => id !== snapshotId)
      : [...prev, snapshotId]
  );
}

  function resetRegularSeasonStats() {
  if (
    !window.confirm(
      "Reset all team records, run differential, live game, daily results, and playoff bracket for a new season? Teams and players will stay."
    )
  ) {
    return;
  }

  const resetTeams = teams.map((team) => ({
    ...team,
    wins: 0,
    losses: 0,
    runDiff: 0,
    runsScored: 0,
    runsAllowed: 0,
    streak: "",
  }));

  const resetGame = defaultCurrentGame();
  const resetDailyRows = Array.from({ length: DAILY_ROWS }, emptyDailyRow);
  const resetBracket = defaultPlayoffBracket();
  const resetPlayers = (data.players || []).map((player) => ({
    ...player,
    seasonAB: 0, seasonHits: 0, seasonDoubles: 0, seasonTriples: 0, seasonHR: 0,
    seasonWalks: 0, seasonStrikeouts: 0, seasonHBP: 0,
    seasonPitchingWins: 0, seasonPitchingLosses: 0,
    ab: 0, hits: 0, lastAB: ""
  }));

  syncTeamsToFirebase(resetTeams);
  syncPlayersToFirebase?.(resetPlayers);
  syncCurrentGameToFirebase(resetGame);
  syncLastFinalGameToFirebase(null);
  syncPlayoffBracketToFirebase(resetBracket);

  syncDailyResultsRowsToFirebase(resetDailyRows);

  setData((prev) => ({
    ...prev,
    teams: resetTeams,
    currentGame: resetGame,
    lastFinalGame: null,
    dailyResultsRows: resetDailyRows,
    playoffBracket: resetBracket,
    players: resetPlayers,
  }));

  setPage("dashboard");
}


  return {
    resetLeague, archiveCurrentSeason, deleteSeasonSnapshot,
    toggleHistorySeason, resetRegularSeasonStats,
  };
}
