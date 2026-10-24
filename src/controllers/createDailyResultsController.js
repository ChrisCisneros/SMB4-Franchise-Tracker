import { emptyDailyRow } from "../utils/gameState";

export default function createDailyResultsController({
  data, setData, bulkResultsInput, setBulkResultsInput, setBulkWarnings,
  teamNumberLookup, teamAbbrLookup, teams, syncTeamsToFirebase, syncGamesToFirebase,
}) {
  function updateDailyRow(rowId, field, value) {
    setData((prev) => ({ ...prev, dailyResultsRows: prev.dailyResultsRows.map((row) => row.id === rowId ? { ...row, [field]: value, applied: false } : row) }));
  }

  function clearDailyRow(rowId) {
    setData((prev) => ({ ...prev, dailyResultsRows: prev.dailyResultsRows.map((row) => row.id === rowId ? { ...emptyDailyRow(), id: row.id } : row) }));
  }

  function addDailyRows(count = 5) {
    setData((prev) => ({ ...prev, dailyResultsRows: [...prev.dailyResultsRows, ...Array.from({ length: count }, emptyDailyRow)] }));
  }

  function applyBulkResultsInput() {
    const lines = bulkResultsInput.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return;

    const warnings = [];
    const parsedRows = [];
    const usedTeamIds = new Set(
      data.dailyResultsRows.flatMap((row) => [row.awayTeamId, row.homeTeamId]).filter(Boolean)
    );

    lines.forEach((line, index) => {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length !== 4) {
        warnings.push(`Line ${index + 1} skipped: use format "away score home score".`);
        return;
      }

      const [awayToken, awayScoreRaw, homeToken, homeScoreRaw] = parts;
      const awayKey = awayToken.toUpperCase();
      const homeKey = homeToken.toUpperCase();
      const awayTeamId = teamNumberLookup[awayToken] || teamAbbrLookup[awayKey];
      const homeTeamId = teamNumberLookup[homeToken] || teamAbbrLookup[homeKey];
      const awayScore = Number(awayScoreRaw);
      const homeScore = Number(homeScoreRaw);

      if (!awayTeamId || !homeTeamId) {
        warnings.push(`Line ${index + 1} skipped: team not recognized.`);
        return;
      }
      if (awayTeamId === homeTeamId) {
        warnings.push(`Line ${index + 1} skipped: same team used twice.`);
        return;
      }
      if (Number.isNaN(awayScore) || Number.isNaN(homeScore)) {
        warnings.push(`Line ${index + 1} skipped: scores must be numbers.`);
        return;
      }
      if (awayScore === homeScore) {
        warnings.push(`Line ${index + 1} skipped: ties are not allowed.`);
        return;
      }
      if (usedTeamIds.has(awayTeamId)) {
        const team = teams.find((t) => t.id === awayTeamId);
        warnings.push(`Line ${index + 1} skipped: ${team?.abbr || awayToken} already used earlier.`);
        return;
      }
      if (usedTeamIds.has(homeTeamId)) {
        const team = teams.find((t) => t.id === homeTeamId);
        warnings.push(`Line ${index + 1} skipped: ${team?.abbr || homeToken} already used earlier.`);
        return;
      }

      usedTeamIds.add(awayTeamId);
      usedTeamIds.add(homeTeamId);
      parsedRows.push({
        id: crypto.randomUUID(),
        awayTeamId,
        homeTeamId,
        awayScore: String(awayScore),
        homeScore: String(homeScore),
        applied: false,
      });
    });

    setBulkWarnings(warnings);
    if (!parsedRows.length) {
      setBulkResultsInput("");
      return;
    }

    setData((prev) => {
      const updatedRows = [...prev.dailyResultsRows];
      let parsedIndex = 0;

      for (let i = 0; i < updatedRows.length && parsedIndex < parsedRows.length; i += 1) {
        const row = updatedRows[i];
        const isEmpty = !row.awayTeamId && !row.homeTeamId && row.awayScore === "" && row.homeScore === "";
        if (isEmpty) {
          updatedRows[i] = { ...parsedRows[parsedIndex], id: row.id };
          parsedIndex += 1;
        }
      }

      while (parsedIndex < parsedRows.length) {
        updatedRows.push(parsedRows[parsedIndex]);
        parsedIndex += 1;
      }

      return { ...prev, dailyResultsRows: updatedRows };
    });

    setBulkResultsInput("");
  }

  function getDailyRowIssue(row, allRows) {
    if (!row.awayTeamId && !row.homeTeamId && row.awayScore === "" && row.homeScore === "") return "empty";
    if (row.awayTeamId && row.awayTeamId === row.homeTeamId) return "same-team";
    const usedTeams = allRows.filter((r) => r.id !== row.id).flatMap((r) => [r.awayTeamId, r.homeTeamId]).filter(Boolean);
    if ((row.awayTeamId && usedTeams.includes(row.awayTeamId)) || (row.homeTeamId && usedTeams.includes(row.homeTeamId))) return "duplicate-team";
    if (row.awayScore !== "" && row.homeScore !== "" && Number(row.awayScore) === Number(row.homeScore)) return "tie";
    if (!row.awayTeamId || !row.homeTeamId || row.awayScore === "" || row.homeScore === "") return row.applied ? "applied" : "incomplete";
    if (row.applied) return "applied";
    return "ready";
  }

  function isValidDailyRow(row, allRows) {
    return getDailyRowIssue(row, allRows) === "ready";
  }

function nextStreak(result, current = "") {
  const letter = String(current || "").slice(0, 1);
  const count = Number(String(current || "").slice(1)) || 0;

  if (letter === result) {
    return `${result}${count + 1}`;
  }

  return `${result}1`;
}

  function applyDailyResults() {
    setData((prev) => {
      const rowsToApply = prev.dailyResultsRows.filter((row) => isValidDailyRow(row, prev.dailyResultsRows));
      if (!rowsToApply.length) return prev;
      const updatedTeams = [...prev.teams];
      const newGames = [...prev.games];

      rowsToApply.forEach((row) => {
        const awayScore = Number(row.awayScore);
        const homeScore = Number(row.homeScore);
        const awayWon = awayScore > homeScore;
        const homeWon = homeScore > awayScore;
        const margin = homeScore - awayScore;

        const awayIndex = updatedTeams.findIndex((team) => team.id === row.awayTeamId);
        const homeIndex = updatedTeams.findIndex((team) => team.id === row.homeTeamId);

        if (awayIndex >= 0) updatedTeams[awayIndex] = {
  ...updatedTeams[awayIndex],

  wins: updatedTeams[awayIndex].wins + (awayWon ? 1 : 0),
  losses: updatedTeams[awayIndex].losses + (homeWon ? 1 : 0),

  runsScored: (updatedTeams[awayIndex].runsScored || 0) + awayScore,
  runsAllowed: (updatedTeams[awayIndex].runsAllowed || 0) + homeScore,

  runDiff:
  Number(updatedTeams[awayIndex].runDiff || 0) + (awayScore - homeScore),

  streak: nextStreak(awayWon ? "W" : "L", updatedTeams[awayIndex].streak),
};
        if (homeIndex >= 0) updatedTeams[homeIndex] = {
  ...updatedTeams[homeIndex],

  wins: updatedTeams[homeIndex].wins + (homeWon ? 1 : 0),
  losses: updatedTeams[homeIndex].losses + (awayWon ? 1 : 0),

  runsScored: (updatedTeams[homeIndex].runsScored || 0) + homeScore,
  runsAllowed: (updatedTeams[homeIndex].runsAllowed || 0) + awayScore,

  runDiff:
  Number(updatedTeams[homeIndex].runDiff || 0) + (homeScore - awayScore),

  streak: nextStreak(homeWon ? "W" : "L", updatedTeams[homeIndex].streak),
};

        newGames.unshift({
          id: crypto.randomUUID(), date: prev.dailyResultsDate,
          awayTeamId: row.awayTeamId, homeTeamId: row.homeTeamId,
          awayScore, homeScore, status: "Final", quickEntry: true,
          gameType: "regular", inning: 9, seasonName: prev.activeSeasonName || "Season 4",
          finalizedAt: new Date().toISOString()
        });
      });

      syncTeamsToFirebase(updatedTeams);
      syncGamesToFirebase?.(newGames);

      return {
        ...prev,
        teams: updatedTeams,
        games: newGames,
        dailyResultsRows: prev.dailyResultsRows.map((row) =>
          isValidDailyRow(row, prev.dailyResultsRows)
            ? { ...emptyDailyRow(), id: row.id }
            : row
        ),
      };
    });
  }

  return {
    updateDailyRow, clearDailyRow, addDailyRows, applyBulkResultsInput,
    getDailyRowIssue, isValidDailyRow, nextStreak, applyDailyResults,
  };
}
