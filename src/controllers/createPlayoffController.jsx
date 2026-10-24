import React from "react";
import { WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";
import { getPostseasonColorsByAbbr } from "../config/teamColors";
import {
  advancePlayoffWinner, defaultBracketSeries, defaultPlayoffBracket,
  getPlayoffSeries, getWinsNeededForSeries, makeSafePlayoffBracket, setPlayoffSeries
} from "../utils/playoffUtils";
import { sortStandingsTeams } from "../utils/standingsUtils";

export default function createPlayoffController({
  data, teams, currentGame, setData,
  selectedPlayoffSeriesId, playoffAwayScore, playoffHomeScore,
  setPlayoffAwayScore, setPlayoffHomeScore,
  syncPlayoffBracketToFirebase,
}) {
  const playoffPicture = data.leagues.map((league) => {
  const leagueTeams = teams.filter((team) => team.league === league);

  

  const divisionLeaders = data.divisions
    .map((division) => {
      const divisionTeams = sortStandingsTeams(
        leagueTeams.filter((team) => team.division === division)
      );

      return divisionTeams[0]
        ? {
            ...divisionTeams[0],
            division,
          }
        : null;
    })
    .filter(Boolean);

  const seededDivisionLeaders = sortStandingsTeams(divisionLeaders);

const divisionLeaderIds = new Set(seededDivisionLeaders.map((team) => team.id));

const wildcardTeams = sortStandingsTeams(
  leagueTeams.filter((team) => !divisionLeaderIds.has(team.id))
);

const cutoffTeam = wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE - 1] || null;

return {
  league,
  leagueTeams,
  divisionLeaders: seededDivisionLeaders,
  wildcardTeams,
  cutoffTeam,
};
});

const playoffBracket = makeSafePlayoffBracket(data.playoffBracket);

const playoffSeriesOptions = [
  { id: "al_qf1", label: "AL Quarterfinal A — #1 vs #8" },
  { id: "al_qf2", label: "AL Quarterfinal B — #4 vs #5" },
  { id: "al_qf3", label: "AL Quarterfinal C — #3 vs #6" },
  { id: "al_qf4", label: "AL Quarterfinal D — #2 vs #7" },
  { id: "al_sf1", label: "ALDS A — Quarterfinal A winner vs Quarterfinal B winner" },
  { id: "al_sf2", label: "ALDS B — Quarterfinal C winner vs Quarterfinal D winner" },
  { id: "al_lc", label: "ALCS" },

  { id: "nl_qf1", label: "NL Quarterfinal A — #1 vs #8" },
  { id: "nl_qf2", label: "NL Quarterfinal B — #4 vs #5" },
  { id: "nl_qf3", label: "NL Quarterfinal C — #3 vs #6" },
  { id: "nl_qf4", label: "NL Quarterfinal D — #2 vs #7" },
  { id: "nl_sf1", label: "NLDS A — Quarterfinal A winner vs Quarterfinal B winner" },
  { id: "nl_sf2", label: "NLDS B — Quarterfinal C winner vs Quarterfinal D winner" },
  { id: "nl_lc", label: "NLCS" },

  { id: "finals", label: "World Series" },
];
function playoffRoundName(seriesId) {
  if (!seriesId) return "";

  if (seriesId === "finals" || seriesId === "worldSeries") {
    return "World Series";
  }

  const league = seriesId.startsWith("al_") ? "AL" : "NL";

  if (seriesId.includes("_qf")) {
    return `${league} Quarterfinals`;
  }

  if (seriesId.includes("_sf")) {
    return `${league}DS`;
  }

  if (seriesId.includes("_lc")) {
    return `${league}CS`;
  }

  return "Postseason";
}

function playoffGameNumber(game) {
  if (
    !game ||
    game.gameType !== "playoff" ||
    !game.playoffSeriesId
  ) {
    return null;
  }

  const series = getPlayoffSeries(
    playoffBracket,
    game.playoffSeriesId
  );

  const completedGames = Array.isArray(series.games)
    ? series.games.length
    : 0;

  if (game.status === "Final") {
    return Math.max(1, completedGames);
  }

  return completedGames + 1;
}

function playoffGameTitle(game) {
  if (
    !game ||
    game.gameType !== "playoff" ||
    !game.playoffSeriesId
  ) {
    return "";
  }

  const round = playoffRoundName(game.playoffSeriesId);
  const gameNumber = playoffGameNumber(game);

  return `${round} · Game ${gameNumber}`;
}

const isPlayoffGame = currentGame.gameType === "playoff";

const selectedLivePlayoffSeries =
  currentGame.playoffSeriesId
    ? getPlayoffSeries(playoffBracket, currentGame.playoffSeriesId)
    : null;

const selectedLivePlayoffSeriesOption =
  playoffSeriesOptions.find((series) => series.id === currentGame.playoffSeriesId);

const selectedLivePlayoffSeriesLabel =
  selectedLivePlayoffSeriesOption
    ? playoffSeriesDropdownLabel(selectedLivePlayoffSeriesOption)
    : "Select playoff series";

function liveTeamRecordLabel(side, team) {
  if (!team) return "";

  if (
    currentGame.gameType === "playoff" &&
    selectedLivePlayoffSeries &&
    currentGame.playoffSeriesId
  ) {
    const teamIsAwaySlot = selectedLivePlayoffSeries.awayTeamId === team.id;
    const teamIsHomeSlot = selectedLivePlayoffSeries.homeTeamId === team.id;

    if (teamIsAwaySlot) {
      return `${Number(selectedLivePlayoffSeries.awayWins || 0)}-${Number(
        selectedLivePlayoffSeries.homeWins || 0
      )}`;
    }

    if (teamIsHomeSlot) {
      return `${Number(selectedLivePlayoffSeries.homeWins || 0)}-${Number(
        selectedLivePlayoffSeries.awayWins || 0
      )}`;
    }
  }

  return `${team.wins}-${team.losses}`;
}

function gameTeamRecordLabel(game, team) {
  if (!game || !team) return "";

  if (
    game.gameType === "playoff" &&
    game.playoffSeriesId
  ) {
    const series = getPlayoffSeries(
      playoffBracket,
      game.playoffSeriesId
    );

    if (series.awayTeamId === team.id) {
      return `${Number(series.awayWins || 0)}-${Number(
        series.homeWins || 0
      )}`;
    }

    if (series.homeTeamId === team.id) {
      return `${Number(series.homeWins || 0)}-${Number(
        series.awayWins || 0
      )}`;
    }
  }

  return `${team.wins}-${team.losses}`;
}

function teamById(teamId) {
  return teams.find((team) => team.id === teamId) || null;
}

function teamAbbr(teamId) {
  return teamById(teamId)?.abbr || "TBD";
}

function playoffSeriesDropdownLabel(seriesOption) {
  const series = getPlayoffSeries(playoffBracket, seriesOption.id);
  const away = teamAbbr(series.awayTeamId);
  const home = teamAbbr(series.homeTeamId);

  if (away !== "TBD" || home !== "TBD") {
    return `${seriesOption.label.split(" — ")[0]} — ${away} vs ${home}`;
  }

  return seriesOption.label;
}
function playoffSeedForTeam(teamId) {
  if (!teamId) return null;

  const seedSlots = [
    ["qf1", "awayTeamId", 1],
    ["qf1", "homeTeamId", 8],
    ["qf2", "awayTeamId", 4],
    ["qf2", "homeTeamId", 5],
    ["qf3", "awayTeamId", 3],
    ["qf3", "homeTeamId", 6],
    ["qf4", "awayTeamId", 2],
    ["qf4", "homeTeamId", 7],
  ];

  for (const league of ["al", "nl"]) {
    for (const [seriesKey, sideKey, seed] of seedSlots) {
      if (playoffBracket?.[league]?.[seriesKey]?.[sideKey] === teamId) {
        return seed;
      }
    }
  }

  return null;
}

function seriesStatusText(series, seriesId) {
  const awayTeam = teamById(series.awayTeamId);
  const homeTeam = teamById(series.homeTeamId);

  if (!awayTeam || !homeTeam) return "Waiting for matchup";

  const winsNeeded = getWinsNeededForSeries();

  if (series.winnerTeamId) {
    return `${teamAbbr(series.winnerTeamId)} wins ${series.awayWins}-${series.homeWins}`;
  }

  if (!series.awayWins && !series.homeWins) {
    return `Best of ${winsNeeded * 2 - 1}`;
  }

  if (series.awayWins === series.homeWins) {
    return `Series tied ${series.awayWins}-${series.homeWins}`;
  }

  const leaderTeamId = series.awayWins > series.homeWins ? series.awayTeamId : series.homeTeamId;
  return `${teamAbbr(leaderTeamId)} leads ${series.awayWins}-${series.homeWins}`;
}

function initializeBracketFromCurrentSeeds() {
  if (
    !window.confirm(
      "Initialize the playoff bracket from current seeds? This will clear existing playoff series scores."
    )
  ) {
    return;
  }

  const nextBracket = defaultPlayoffBracket();

  data.leagues.forEach((league) => {
    const leagueKey = league.toLowerCase();
    const picture = playoffPicture.find((item) => item.league === league);

    const seeds = [
      ...(picture?.divisionLeaders || []),
      ...(picture?.wildcardTeams || []),
    ].slice(0, 8);

    nextBracket[leagueKey].qf1 = {
      ...defaultBracketSeries(),
      awayTeamId: seeds[0]?.id || "",
      homeTeamId: seeds[7]?.id || "",
    };

    nextBracket[leagueKey].qf2 = {
      ...defaultBracketSeries(),
      awayTeamId: seeds[3]?.id || "",
      homeTeamId: seeds[4]?.id || "",
    };

    nextBracket[leagueKey].qf3 = {
      ...defaultBracketSeries(),
      awayTeamId: seeds[2]?.id || "",
      homeTeamId: seeds[5]?.id || "",
    };

    nextBracket[leagueKey].qf4 = {
      ...defaultBracketSeries(),
      awayTeamId: seeds[1]?.id || "",
      homeTeamId: seeds[6]?.id || "",
    };
  });

  syncPlayoffBracketToFirebase(nextBracket);

  setData((prev) => ({
    ...prev,
    playoffBracket: nextBracket,
  }));
}

function bumpPlayoffScore(side, amount) {
  if (side === "away") {
    setPlayoffAwayScore((prev) =>
      String(Math.max(0, Number(prev || 0) + amount))
    );
  }

  if (side === "home") {
    setPlayoffHomeScore((prev) =>
      String(Math.max(0, Number(prev || 0) + amount))
    );
  }
}

function resetSelectedPlayoffSeries() {
  if (!selectedPlayoffSeriesId) {
    window.alert("Select a playoff series to reset.");
    return;
  }

  const currentBracket = makeSafePlayoffBracket(data.playoffBracket);
  const series = getPlayoffSeries(currentBracket, selectedPlayoffSeriesId);

  if (!series.awayTeamId || !series.homeTeamId) {
    window.alert("This series does not have both teams yet.");
    return;
  }

  if (
    !window.confirm(
      `Reset only ${teamAbbr(series.awayTeamId)} vs ${teamAbbr(
        series.homeTeamId
      )}? This will clear this series score and game history only.`
    )
  ) {
    return;
  }

  const resetSeries = {
    ...defaultBracketSeries(),
    awayTeamId: series.awayTeamId,
    homeTeamId: series.homeTeamId,
  };

  const nextBracket = setPlayoffSeries(
    currentBracket,
    selectedPlayoffSeriesId,
    resetSeries
  );

  syncPlayoffBracketToFirebase(nextBracket);

  setData((prev) => ({
    ...prev,
    playoffBracket: nextBracket,
  }));

  setPlayoffAwayScore("");
  setPlayoffHomeScore("");
}

function addPlayoffGameResult() {
  const awayScore = Number(playoffAwayScore);
  const homeScore = Number(playoffHomeScore);

  if (!selectedPlayoffSeriesId) return;
  if (!Number.isFinite(awayScore) || !Number.isFinite(homeScore)) {
    window.alert("Enter both playoff scores.");
    return;
  }

  if (awayScore === homeScore) {
    window.alert("Playoff games cannot end in a tie.");
    return;
  }

  const currentBracket = makeSafePlayoffBracket(data.playoffBracket);
  const series = getPlayoffSeries(currentBracket, selectedPlayoffSeriesId);

  if (!series.awayTeamId || !series.homeTeamId) {
    window.alert("This series needs both teams before you can add a result.");
    return;
  }

  if (series.winnerTeamId) {
    window.alert("This series already has a winner.");
    return;
  }

  const winnerTeamId = awayScore > homeScore ? series.awayTeamId : series.homeTeamId;

  const nextSeries = {
    ...series,
    awayWins: series.awayWins + (winnerTeamId === series.awayTeamId ? 1 : 0),
    homeWins: series.homeWins + (winnerTeamId === series.homeTeamId ? 1 : 0),
    games: [
      ...(series.games || []),
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        awayTeamId: series.awayTeamId,
        homeTeamId: series.homeTeamId,
        awayScore,
        homeScore,
        winnerTeamId,
      },
    ],
  };

  const winsNeeded = getWinsNeededForSeries(selectedPlayoffSeriesId);

  if (nextSeries.awayWins >= winsNeeded || nextSeries.homeWins >= winsNeeded) {
    nextSeries.winnerTeamId = winnerTeamId;
  }

  let nextBracket = setPlayoffSeries(currentBracket, selectedPlayoffSeriesId, nextSeries);

  if (nextSeries.winnerTeamId) {
    nextBracket = advancePlayoffWinner(nextBracket, selectedPlayoffSeriesId, nextSeries.winnerTeamId);
  }

  syncPlayoffBracketToFirebase(nextBracket);

  setData((prev) => ({
    ...prev,
    playoffBracket: nextBracket,
  }));

  setPlayoffAwayScore("");
  setPlayoffHomeScore("");
}

function renderBracketSeries(seriesId, label, fallbackAwayTeam, fallbackHomeTeam, extraClass = "") {
  const series = getPlayoffSeries(playoffBracket, seriesId);
  const awayTeam = teamById(series.awayTeamId) || fallbackAwayTeam || null;
  const homeTeam = teamById(series.homeTeamId) || fallbackHomeTeam || null;
  const winnerTeam = teamById(series.winnerTeamId) || null;

  const awayColors = getPostseasonColorsByAbbr(awayTeam?.abbr);
const homeColors = getPostseasonColorsByAbbr(homeTeam?.abbr);
const winnerColors = getPostseasonColorsByAbbr(winnerTeam?.abbr);

  const displaySeries = {
    ...series,
    awayTeamId: awayTeam?.id || series.awayTeamId,
    homeTeamId: homeTeam?.id || series.homeTeamId,
  };

  const bracketColorVars = {
    "--series-away-main": awayColors.main,
    "--series-away-alt": awayColors.alt,
    "--series-away-border": awayColors.border,
    "--series-away-text": awayColors.text,
    "--series-home-main": homeColors.main,
    "--series-home-alt": homeColors.alt,
    "--series-home-border": homeColors.border,
    "--series-home-text": homeColors.text,
    "--series-winner-main": winnerColors.main,
    "--series-winner-alt": winnerColors.alt,
    "--series-winner-border": winnerColors.border,
    "--series-winner-text": winnerColors.text,
  };

  return (
    <div
      className={`bracket-series-card bracket-slot ${extraClass} ${
  series.winnerTeamId ? "bracket-series-winner" : ""
} ${!awayTeam || !homeTeam ? "bracket-series-empty" : ""} ${
  awayTeam && homeTeam && !series.winnerTeamId ? "bracket-series-active" : ""
}`}
      style={bracketColorVars}
    >
      <div className="bracket-series-label">{label}</div>

      <div
        className={`bracket-team-row bracket-away-row ${
  series.winnerTeamId === awayTeam?.id ? "series-team-winner" : ""
} ${
  !series.winnerTeamId &&
  awayTeam &&
  series.awayWins > series.homeWins
    ? "series-team-leading"
    : ""
}`}
      >
        <span>
  {awayTeam ? `#${playoffSeedForTeam(awayTeam.id)}` : "—"}
</span>
        <strong>{awayTeam?.abbr || "TBD"}</strong>
        <small>{series.awayWins || 0}</small>
      </div>

      <div
        className={`bracket-team-row bracket-home-row ${
  series.winnerTeamId === homeTeam?.id ? "series-team-winner" : ""
} ${
  !series.winnerTeamId &&
  homeTeam &&
  series.homeWins > series.awayWins
    ? "series-team-leading"
    : ""
}`}
      >
        <span>
  {homeTeam ? `#${playoffSeedForTeam(homeTeam.id)}` : "—"}
</span>
        <strong>{homeTeam?.abbr || "TBD"}</strong>
        <small>{series.homeWins || 0}</small>
      </div>

      <div className="bracket-series-status">
        {seriesStatusText(displaySeries, seriesId)}
      </div>
    </div>
  );
}


  return {
    playoffPicture, playoffBracket, playoffSeriesOptions, playoffRoundName,
    playoffGameNumber, playoffGameTitle, isPlayoffGame, selectedLivePlayoffSeries,
    selectedLivePlayoffSeriesOption, selectedLivePlayoffSeriesLabel,
    liveTeamRecordLabel, gameTeamRecordLabel, teamById, teamAbbr,
    playoffSeriesDropdownLabel, playoffSeedForTeam, seriesStatusText,
    initializeBracketFromCurrentSeeds, bumpPlayoffScore, resetSelectedPlayoffSeries,
    addPlayoffGameResult, renderBracketSeries,
  };
}
