import { defaultCurrentGame } from "../utils/gameState";
import {
  advancePlayoffWinner, getPlayoffSeries, getWinsNeededForSeries,
  makeSafePlayoffBracket, setPlayoffSeries
} from "../utils/playoffUtils";

export default function createGameFinalizationController({
  data, setData, currentGame, winningPitcherId, losingPitcherId,
  setWinningPitcherId, setLosingPitcherId, setPage, nextStreak, clearBanner,
  syncPlayersToFirebase, syncLastFinalGameToFirebase,
  syncPlayoffBracketToFirebase, syncCurrentGameToFirebase, syncTeamsToFirebase, syncGamesToFirebase,
}) {
  function applyPlayoffGameResult({
  seriesId,
  awayScore,
  homeScore,
  gameAwayTeamId = "",
  gameHomeTeamId = "",
}) {
  const currentBracket = makeSafePlayoffBracket(data.playoffBracket);
  const series = getPlayoffSeries(currentBracket, seriesId);

  if (!seriesId) {
    window.alert("Select a playoff series.");
    return null;
  }

  if (!series.awayTeamId || !series.homeTeamId) {
    window.alert("This series needs both teams before you can add a result.");
    return null;
  }

  if (series.winnerTeamId) {
    window.alert("This series already has a winner.");
    return null;
  }

  function scoreForTeam(teamId) {
    if (gameAwayTeamId && teamId === gameAwayTeamId) return awayScore;
    if (gameHomeTeamId && teamId === gameHomeTeamId) return homeScore;
    return null;
  }

  const bracketAwayScore =
    gameAwayTeamId && gameHomeTeamId
      ? scoreForTeam(series.awayTeamId)
      : awayScore;

  const bracketHomeScore =
    gameAwayTeamId && gameHomeTeamId
      ? scoreForTeam(series.homeTeamId)
      : homeScore;

  if (bracketAwayScore === null || bracketHomeScore === null) {
    window.alert("This game's teams do not match the selected playoff series.");
    return null;
  }

  if (bracketAwayScore === bracketHomeScore) {
    window.alert("Playoff games cannot end in a tie.");
    return null;
  }

  const winnerTeamId =
    bracketAwayScore > bracketHomeScore ? series.awayTeamId : series.homeTeamId;

  const nextSeries = {
    ...series,
    awayWins:
      Number(series.awayWins || 0) +
      (winnerTeamId === series.awayTeamId ? 1 : 0),
    homeWins:
      Number(series.homeWins || 0) +
      (winnerTeamId === series.homeTeamId ? 1 : 0),
    games: [
      ...(series.games || []),
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        awayTeamId: series.awayTeamId,
        homeTeamId: series.homeTeamId,
        awayScore: bracketAwayScore,
        homeScore: bracketHomeScore,
        winnerTeamId,
      },
    ],
  };

  const winsNeeded = getWinsNeededForSeries();

  if (nextSeries.awayWins >= winsNeeded || nextSeries.homeWins >= winsNeeded) {
    nextSeries.winnerTeamId = winnerTeamId;
  }

  let nextBracket = setPlayoffSeries(currentBracket, seriesId, nextSeries);

  if (nextSeries.winnerTeamId) {
    nextBracket = advancePlayoffWinner(
      nextBracket,
      seriesId,
      nextSeries.winnerTeamId
    );
  }

  return nextBracket;
}

  function finalizeGame() {
    if (!currentGame.homeTeamId || !currentGame.awayTeamId) return;

    function resetPlayersAndApplyDecision(players) {
      const gameTeamIds = new Set([currentGame.awayTeamId, currentGame.homeTeamId]);
      return (players || []).map((player) => {
        let next = { ...player };
        if (player.id === winningPitcherId) {
          next.seasonPitchingWins = Number(next.seasonPitchingWins || 0) + 1;
          next.careerPitchingWins = Number(next.careerPitchingWins || 0) + 1;
        }
        if (player.id === losingPitcherId) {
          next.seasonPitchingLosses = Number(next.seasonPitchingLosses || 0) + 1;
          next.careerPitchingLosses = Number(next.careerPitchingLosses || 0) + 1;
        }
        if (gameTeamIds.has(player.teamId)) {
          next.ab = 0;
          next.hits = 0;
          next.lastAB = "";
        }
        return next;
      });
    }
    const homeWon = currentGame.homeScore > currentGame.awayScore;
    const awayWon = currentGame.awayScore > currentGame.homeScore;
    const margin = currentGame.homeScore - currentGame.awayScore;
    const finishedGame = {
  ...currentGame,
  id: crypto.randomUUID(),
  status: "Final",
  winningPitcherId,
  losingPitcherId,
  seasonName: data.activeSeasonName || "Season 4",
  finalizedAt: new Date().toISOString(),
  winnerTeamId: awayWon ? currentGame.awayTeamId : homeWon ? currentGame.homeTeamId : "",
  loserTeamId: awayWon ? currentGame.homeTeamId : homeWon ? currentGame.awayTeamId : "",
  margin: Math.abs(Number(currentGame.awayScore || 0) - Number(currentGame.homeScore || 0)),
  totalRuns: Number(currentGame.awayScore || 0) + Number(currentGame.homeScore || 0),
  walkoff: Boolean(homeWon && Number(currentGame.inning || 0) >= 9 && currentGame.half === "Bottom"),
  history: [],
  playLog: (currentGame.playLog || []).slice(0, 60),
};
if (currentGame.gameType === "playoff") {
  if (!currentGame.playoffSeriesId) {
    window.alert("Select the playoff series before finalizing this playoff game.");
    return;
  }

  const nextBracket = applyPlayoffGameResult({
  seriesId: currentGame.playoffSeriesId,
  awayScore: Number(currentGame.awayScore || 0),
  homeScore: Number(currentGame.homeScore || 0),
  gameAwayTeamId: currentGame.awayTeamId,
  gameHomeTeamId: currentGame.homeTeamId,
});

if (!nextBracket) return;

const resetGame = {
  ...defaultCurrentGame(),
  date: new Date().toISOString().slice(0, 10),
};

setData((prev) => {
    const resetPlayers = resetPlayersAndApplyDecision(prev.players);

    syncPlayersToFirebase(resetPlayers);
const nextGames = [finishedGame, ...(prev.games || [])];
syncGamesToFirebase(nextGames);
syncLastFinalGameToFirebase(finishedGame);
syncPlayoffBracketToFirebase(nextBracket);
syncCurrentGameToFirebase(resetGame);

    return {
      ...prev,
      games: nextGames,
      players: resetPlayers,
      lastFinalGame: finishedGame,
      playoffBracket: nextBracket,
      currentGame: resetGame,
    };
  });

  setPage("dashboard");
  setWinningPitcherId("");
  setLosingPitcherId("");
  return;
}
    setData((prev) => {
      const nextTeams = prev.teams.map((team) => {
        if (team.id === currentGame.homeTeamId) return {
  ...team,
  wins: team.wins + (homeWon ? 1 : 0),
  losses: team.losses + (awayWon ? 1 : 0),

  runsScored: (team.runsScored || 0) + currentGame.homeScore,
  runsAllowed: (team.runsAllowed || 0) + currentGame.awayScore,

  runDiff:
  Number(team.runDiff || 0) +
  (Number(currentGame.homeScore || 0) - Number(currentGame.awayScore || 0)),

  streak: nextStreak(homeWon ? "W" : "L", team.streak),
};
        if (team.id === currentGame.awayTeamId) return {
  ...team,
  wins: team.wins + (awayWon ? 1 : 0),
  losses: team.losses + (homeWon ? 1 : 0),

  runsScored: (team.runsScored || 0) + currentGame.awayScore,
  runsAllowed: (team.runsAllowed || 0) + currentGame.homeScore,

runDiff:
  Number(team.runDiff || 0) +
  (Number(currentGame.awayScore || 0) - Number(currentGame.homeScore || 0)),

  streak: nextStreak(awayWon ? "W" : "L", team.streak),
};
        return team;
      });

      syncTeamsToFirebase(nextTeams);
      syncLastFinalGameToFirebase(finishedGame);
      syncCurrentGameToFirebase({
  ...defaultCurrentGame(),
  date: new Date().toISOString().slice(0, 10),
});

const resetPlayers = resetPlayersAndApplyDecision(prev.players);

syncPlayersToFirebase(resetPlayers);
const nextGames = [finishedGame, ...(prev.games || [])];
syncGamesToFirebase(nextGames);

return {
  ...prev,
  games: nextGames,
  teams: nextTeams,
  players: resetPlayers,
  lastFinalGame: finishedGame,
  currentGame: { ...defaultCurrentGame(), date: new Date().toISOString().slice(0, 10) },
};
    });
    setPage("dashboard");
    setWinningPitcherId("");
setLosingPitcherId("");
  }

  function resetCurrentMatch() {
    clearBanner();
    if (!window.confirm("Reset the current live game back to a fresh matchup?")) return;

    setData((prev) => {
  const resetPlayers = prev.players.map((p) => ({
    ...p,
    ab: 0,
    hits: 0,
    lastAB: ""
  }));

  return {
    ...prev,
    players: resetPlayers,
    currentGame: {
      ...defaultCurrentGame(),
      date: prev.currentGame?.date || new Date().toISOString().slice(0, 10),
      awayTeamId: prev.currentGame?.awayTeamId || "",
      homeTeamId: prev.currentGame?.homeTeamId || "",
      status: "Not Started",
    },
  };
});
  }

  function resetCurrentGamePlayerStats() {
  if (!currentGame.awayTeamId || !currentGame.homeTeamId) return;

  if (!window.confirm("Reset ABs, hits, and Last AB for players in this game?")) return;

  setData((prev) => {
    const gameTeamIds = new Set([
      prev.currentGame?.awayTeamId,
      prev.currentGame?.homeTeamId,
    ]);

    const resetPlayers = prev.players.map((player) =>
      gameTeamIds.has(player.teamId)
        ? {
            ...player,
            ab: 0,
            hits: 0,
            lastAB: "",
          }
        : player
    );

    syncPlayersToFirebase(resetPlayers);

    return {
      ...prev,
      players: resetPlayers,
    };
  });
}


  return {
    applyPlayoffGameResult, finalizeGame, resetCurrentMatch, resetCurrentGamePlayerStats,
  };
}
