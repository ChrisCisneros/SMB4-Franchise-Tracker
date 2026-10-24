export default function createAdminActions({
  newTeam, newPlayer, playerNameInputRef, recentlyUpdatedTimerRef,
  setData, setNewPlayer, setNewTeam, setRecentlyUpdatedTeamId,
  setSelectedAdminTeamId, syncPlayersToFirebase, syncTeamsToFirebase,
}) {
  function addTeam() {
    if (!newTeam.city || !newTeam.name || !newTeam.abbr) return;

    const nextAbbr = newTeam.abbr.trim().toUpperCase();

    setData((prev) => {
      if (prev.teams.some((team) => team.id === nextAbbr || (team.abbr || "").toUpperCase() === nextAbbr)) {
        window.alert(`Team ${nextAbbr} already exists.`);
        return prev;
      }

      const nextTeam = {
        id: nextAbbr,
        city: newTeam.city.trim(),
        name: newTeam.name.trim(),
        abbr: nextAbbr,
        league: newTeam.league,
        division: newTeam.division,
        wins: Number(newTeam.wins) || 0,
        losses: Number(newTeam.losses) || 0,
        runDiff: Number(newTeam.runDiff) || 0,
      };

      const nextTeams = [...prev.teams, nextTeam];
      syncTeamsToFirebase(nextTeams);

      return {
        ...prev,
        teams: nextTeams,
      };
    });

    setSelectedAdminTeamId(nextAbbr);
    setNewTeam({ city: "", name: "", abbr: "", league: "AL", division: "East", wins: 0, losses: 0, runDiff: 0 });
  }

  function deleteTeam(teamId) {
    setData((prev) => {
      const nextTeams = prev.teams.filter((team) => team.id !== teamId);
      const nextPlayers = prev.players.filter((player) => player.teamId !== teamId);
      const nextDailyResultsRows = prev.dailyResultsRows.map((row) => ({
        ...row,
        awayTeamId: row.awayTeamId === teamId ? "" : row.awayTeamId,
        homeTeamId: row.homeTeamId === teamId ? "" : row.homeTeamId,
      }));

      syncTeamsToFirebase(nextTeams);
      syncPlayersToFirebase(nextPlayers);

      return {
        ...prev,
        teams: nextTeams,
        players: nextPlayers,
        dailyResultsRows: nextDailyResultsRows,
      };
    });
  }

  function editTeam(teamId, field, value) {
    setData((prev) => {
      const nextTeams = prev.teams.map((team) =>
        team.id === teamId ? { ...team, [field]: value } : team
      );

      syncTeamsToFirebase(nextTeams);
      return { ...prev, teams: nextTeams };
    });
  }

  function addPlayer() {
    if (!newPlayer.teamId || !newPlayer.name) return;

    setData((prev) => {
      const nextPlayers = [
        ...prev.players,
        {
          id: crypto.randomUUID(),
          teamId: newPlayer.teamId,
          name: newPlayer.name,
          number: newPlayer.number,

           // 👇 add these
  ab: 0,
  hits: 0,
  lastAB: "",
  seasonAB: 0,
  seasonHits: 0,
  careerAB: 0,
  careerHits: 0,
  seasonDoubles: 0,
  careerDoubles: 0,
  seasonTriples: 0,
  careerTriples: 0,
  seasonHR: 0,
  careerHR: 0,
  seasonWalks: 0,
  careerWalks: 0,
  seasonStrikeouts: 0,
  careerStrikeouts: 0,
  seasonHBP: 0,
  careerHBP: 0,
  seasonPitchingWins: 0,
  careerPitchingWins: 0,
  seasonPitchingLosses: 0,
  careerPitchingLosses: 0
        },
      ];

      syncPlayersToFirebase(nextPlayers);
      return { ...prev, players: nextPlayers };
    });

    setNewPlayer({ teamId: newPlayer.teamId, name: "", number: "" });
    setTimeout(() => playerNameInputRef.current?.focus(), 0);
  }

  function deletePlayer(playerId) {
    setData((prev) => {
      const nextPlayers = prev.players.filter((player) => player.id !== playerId);
      syncPlayersToFirebase(nextPlayers);
      return { ...prev, players: nextPlayers };
    });
  }

function updateRecord(teamId, field, value) {
  setData((prev) => {
    const nextTeams = prev.teams.map((team) => {
      if (team.id !== teamId) return team;

      const nextValue =
        field === "streak"
          ? value.toUpperCase()
          : value === "" || value === "-"
            ? value
            : Number(value);

      const updated = {
        ...team,
        [field]: nextValue,
      };

      if (field === "runsScored" || field === "runsAllowed") {
        const rs = Number(field === "runsScored" ? nextValue : updated.runsScored) || 0;
        const ra = Number(field === "runsAllowed" ? nextValue : updated.runsAllowed) || 0;
        updated.runDiff = rs - ra;
      }

      return updated;
    });

    syncTeamsToFirebase(nextTeams);

    return {
      ...prev,
      teams: nextTeams,
    };
  });
}

function adjustTeamNumber(teamId, field, amount) {
  setRecentlyUpdatedTeamId(teamId);

  if (recentlyUpdatedTimerRef.current) {
    clearTimeout(recentlyUpdatedTimerRef.current);
  }

  recentlyUpdatedTimerRef.current = setTimeout(() => {
    setRecentlyUpdatedTeamId("");
  }, 1000);

  setData((prev) => {
    const nextTeams = prev.teams.map((team) => {
      if (team.id !== teamId) return team;

      const current = Number(team[field] || 0);
      const nextValue =
        field === "wins" || field === "losses"
          ? Math.max(0, current + amount)
          : current + amount;

      return {
        ...team,
        [field]: nextValue,
      };
    });

    syncTeamsToFirebase(nextTeams);

    return {
      ...prev,
      teams: nextTeams,
    };
  });
}

function adjustTeamStreak(teamId, resultType) {
  setData((prev) => {
    const nextTeams = prev.teams.map((team) => {
      if (team.id !== teamId) return team;

      const currentStreak = String(team.streak || "").toUpperCase();
      const currentType = currentStreak.startsWith(resultType) ? resultType : "";
      const currentNumber = currentType
        ? Number(currentStreak.replace(resultType, "")) || 0
        : 0;

      return {
        ...team,
        streak: `${resultType}${currentNumber + 1}`,
      };
    });

    syncTeamsToFirebase(nextTeams);

    return {
      ...prev,
      teams: nextTeams,
    };
  });
}

function resetTeamStreak(teamId) {
  updateRecord(teamId, "streak", "");
}


  return {
    addTeam, deleteTeam, editTeam, addPlayer, deletePlayer, updateRecord,
    adjustTeamNumber, adjustTeamStreak, resetTeamStreak,
  };
}
