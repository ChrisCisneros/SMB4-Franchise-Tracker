
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import DashboardPage from "./pages/DashboardPage";
import LivePage from "./pages/LivePage";
import DailyPage from "./pages/DailyPage";
import BracketPage from "./pages/BracketPage";
import StandingsPage from "./pages/StandingsPage";
import QuickPage from "./pages/QuickPage";
import HistoryPage from "./pages/HistoryPage";
import LeagueRecordsPage from "./pages/LeagueRecordsPage";
import NewsPage from "./pages/NewsPage";
import V4CenterPage from "./pages/V4CenterPage";
import FandomPage from "./pages/FandomPage";
import ModeratorHubPage from "./pages/ModeratorHubPage";
import LeagueHubPage from "./pages/LeagueHubPage";
import BracketAdminPage from "./pages/BracketAdminPage";
import AdminPage from "./pages/AdminPage";
import {
  CONTROL_PASSWORD, DAILY_ROWS, MAX_HISTORY, MAX_PLAY_LOG, POSITION_OPTIONS,
  SEASON_LENGTH, WILD_CARD_TEAMS_PER_LEAGUE
} from "./config/constants";
import {
  getAvailableLooks, getPostseasonColorsByAbbr, getTeamColorsByAbbr
} from "./config/teamColors";
import {
  advancePlayoffWinner, defaultBracketSeries, defaultPlayoffBracket,
  getPlayoffSeries, getWinsNeededForSeries, makeSafePlayoffBracket, setPlayoffSeries
} from "./utils/playoffUtils";
import {
  addPitchToCurrentPitcher, defaultCurrentGame, defaultData, defaultFieldState, emptyDailyRow, getInitialData,
  makeSafeGame, safeCloneSnapshot
} from "./utils/gameState";
import {
  formatGamesBack, gamesBack, gamesBackRaw, gamesRemaining, getLastNameSortValue, getPlayoffMarker,
  getWildcardMarker, pct, sortStandingsTeams, sortTeams, teamLabel,
  teamOptionLabel, wildCardGamesBack, winningPctValue
} from "./utils/standingsUtils";
import { getDisplayGameState, getVisibleInnings, renderInningCell } from "./utils/gameDisplay";
import { BaseDiamond, ChallengeBars, CountControls } from "./components/GameWidgets";
import WorldPulseRibbon from './components/WorldPulseRibbon';
import usePersistence from "./hooks/usePersistence";
import createAdminActions from "./actions/createAdminActions";
import createSeasonActions from "./actions/createSeasonActions";
import createPlayoffController from "./controllers/createPlayoffController";
import createDailyResultsController from "./controllers/createDailyResultsController";
import createGameFinalizationController from "./controllers/createGameFinalizationController";
import { currentSeasonDay, isCalendarAnchorGame } from "./utils/seasonCalendarUtils";

export default function App() {
  const [data, setData] = useState(getInitialData);
  const [page, setPage] = useState("dashboard");
  const [newTeam, setNewTeam] = useState({ city: "", name: "", abbr: "", league: "AL", division: "East" });
  const [newPlayer, setNewPlayer] = useState({ teamId: "", name: "", number: "" });
  const [playInput, setPlayInput] = useState("");
  const [fielderName, setFielderName] = useState("");
  const [selectedAdminTeamId, setSelectedAdminTeamId] = useState("");
  const [selectedDeletePlayerId, setSelectedDeletePlayerId] = useState("");
  const [playMode, setPlayMode] = useState("hits");
  const [bulkResultsInput, setBulkResultsInput] = useState("");
  const [bulkWarnings, setBulkWarnings] = useState([]);
  const [inningBanner, setInningBanner] = useState("");
  const [controlPasswordInput, setControlPasswordInput] = useState("");
  const [controlsUnlocked, setControlsUnlocked] = useState(false);
  const playerNameInputRef = useRef(null);
const [prevScore, setPrevScore] = useState({ away: 0, home: 0 });
const [scoreFlashSide, setScoreFlashSide] = useState(null);
const [bigMomentBanner, setBigMomentBanner] = useState("");
const bigMomentTimerRef = useRef(null);
const scoreFlashTimerRef = useRef(null);
const lastSeenBigMomentIdRef = useRef(0);
const hasInitializedBigMomentRef = useRef(false);
const [winningPitcherId, setWinningPitcherId] = useState("");
const [losingPitcherId, setLosingPitcherId] = useState("");
const [selectedPlayoffSeriesId, setSelectedPlayoffSeriesId] = useState("al_wc1");
const [playoffAwayScore, setPlayoffAwayScore] = useState("");
const [playoffHomeScore, setPlayoffHomeScore] = useState("");
const [recentlyUpdatedTeamId, setRecentlyUpdatedTeamId] = useState("");
const recentlyUpdatedTimerRef = useRef(null);
const fieldBallResetTimerRef = useRef(null);
const fieldPlayLogTimerRef = useRef(null);
const [expandedHistorySeasonIds, setExpandedHistorySeasonIds] = useState([]);


  const {
    syncTeamsToFirebase,
    syncPlayersToFirebase,
    syncCurrentGameToFirebase,
    syncLastFinalGameToFirebase,
    syncAllDataToFirebase,
    syncPlayoffBracketToFirebase,
    syncSeasonHistoryToFirebase,
    syncDailyResultsRowsToFirebase,
    syncLeagueExtrasToFirebase,
    syncGamesToFirebase,
    syncActiveSeasonNameToFirebase,
  } = usePersistence({ data, setData });

  useEffect(() => {
    if (!inningBanner) return;
    const timeout = setTimeout(() => setInningBanner(""), 20000);
    return () => clearTimeout(timeout);
  }, [inningBanner]);

  useEffect(() => {
    if (!selectedAdminTeamId && data.teams.length) setSelectedAdminTeamId(data.teams[0].id);
    if (selectedAdminTeamId && !data.teams.find((t) => t.id === selectedAdminTeamId)) {
      setSelectedAdminTeamId(data.teams[0]?.id || "");
    }
  }, [data.teams, selectedAdminTeamId]);

  useEffect(() => {
  setSelectedDeletePlayerId((current) => (current ? "" : current));
}, [selectedAdminTeamId]);

  useEffect(() => {
    const saved = sessionStorage.getItem("franchise_controls_unlocked");
    if (saved === "true") setControlsUnlocked(true);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("franchise_controls_unlocked", controlsUnlocked ? "true" : "false");
  }, [controlsUnlocked]);

  useEffect(() => {
    if (!controlsUnlocked && protectedPages.includes(page)) {
      setPage("dashboard");
    }
  }, [controlsUnlocked, page]);

  const teams = (data.teams || []).filter(
  (team) => team && team.id && team.abbr
);

const players = (data.players || []).filter(Boolean);

const sortedTeams = [...teams].sort((a, b) => {
  const abbrCompare = String(a.abbr || "").localeCompare(String(b.abbr || ""));
  if (abbrCompare !== 0) return abbrCompare;

  return String(a.name || "").localeCompare(String(b.name || ""));
});

const numberedTeams = sortedTeams.map((team, index) => ({
  ...team,
  listNumber: index + 1,
}));

const teamNumberLookup = Object.fromEntries(
  numberedTeams.map((team) => [String(team.listNumber), team.id])
);

const teamAbbrLookup = Object.fromEntries(
  numberedTeams
    .filter((team) => team && team.abbr && team.id)
    .map((team) => [String(team.abbr).toUpperCase(), team.id])
);
  const currentGame = makeSafeGame(data.currentGame);
  const protectedPages = ["live", "daily", "quick", "admin", "bracketAdmin"];
const bestRunDiff = [...teams].sort((a, b) => (b.runDiff || 0) - (a.runDiff || 0))[0];

const topRunsScored = [...teams].sort((a, b) => (b.runsScored || 0) - (a.runsScored || 0))[0];

const bestRunsAllowed = [...teams]
  .filter((team) => Number(team.runsAllowed || 0) > 0)
  .sort((a, b) => (a.runsAllowed || 0) - (b.runsAllowed || 0))[0];

const longestWinStreak = [...teams]
  .filter((team) => String(team.streak || "").startsWith("W"))
  .sort((a, b) => Number(String(b.streak).slice(1)) - Number(String(a.streak).slice(1)))[0];

const longestLossStreak = [...teams]
  .filter((team) => String(team.streak || "").startsWith("L"))
  .sort((a, b) => Number(String(b.streak).slice(1)) - Number(String(a.streak).slice(1)))[0];



  const awayTeam = teams.find((t) => t.id === currentGame.awayTeamId);
  const homeTeam = teams.find((t) => t.id === currentGame.homeTeamId);
  const liveAwayLooks = getAvailableLooks(awayTeam?.abbr);
  const liveHomeLooks = getAvailableLooks(homeTeam?.abbr);
  const awayColors = getTeamColorsByAbbr(
    awayTeam?.abbr,
    currentGame.awayLook?.mode || "primary",
    currentGame.awayLook?.index || 0
  );
  const homeColors = getTeamColorsByAbbr(
    homeTeam?.abbr,
    currentGame.homeLook?.mode || "primary",
    currentGame.homeLook?.index || 0
  );
  const liveAwayLookLabel =
    liveAwayLooks.find(
      (look) =>
        look.mode === (currentGame.awayLook?.mode || "primary") &&
        look.index === (currentGame.awayLook?.index || 0)
    )?.label || "Primary";
  const liveHomeLookLabel =
    liveHomeLooks.find(
      (look) =>
        look.mode === (currentGame.homeLook?.mode || "primary") &&
        look.index === (currentGame.homeLook?.index || 0)
    )?.label || "Primary";
const awayRoster = [...players.filter((p) => p.teamId === currentGame.awayTeamId)].sort((a, b) => getLastNameSortValue(a.name).localeCompare(getLastNameSortValue(b.name)) || a.name.localeCompare(b.name)); 
 const homeRoster = [...players.filter((p) => p.teamId === currentGame.homeTeamId)].sort((a, b) => getLastNameSortValue(a.name).localeCompare(getLastNameSortValue(b.name)) || a.name.localeCompare(b.name));
  const selectedAdminTeam = teams.find((t) => t.id === selectedAdminTeamId);
  const selectedAdminRoster = [...players.filter((p) => p.teamId === selectedAdminTeamId)].sort((a, b) => getLastNameSortValue(a.name).localeCompare(getLastNameSortValue(b.name)) || a.name.localeCompare(b.name));

  const currentAwayBatter = awayRoster.find((p) => p.id === currentGame.awayLineup[currentGame.awayBatterIndex]);
  const currentHomeBatter = homeRoster.find((p) => p.id === currentGame.homeLineup[currentGame.homeBatterIndex]);
  const usedAwayPitchers = [...new Set([
  ...currentGame.awayPitcherHistory,
  currentGame.awayPitcherId,
])]
  .filter(Boolean)
  .map((id) => awayRoster.find((player) => player.id === id))
  .filter(Boolean);

const usedHomePitchers = [...new Set([
  ...currentGame.homePitcherHistory,
  currentGame.homePitcherId,
])]
  .filter(Boolean)
  .map((id) => homeRoster.find((player) => player.id === id))
  .filter(Boolean);

const usedGamePitchers = [
  ...usedAwayPitchers.map((player) => ({
    ...player,
    labelTeam: awayTeam?.abbr || "Away",
  })),
  ...usedHomePitchers.map((player) => ({
    ...player,
    labelTeam: homeTeam?.abbr || "Home",
  })),
];
  const currentAwayPitcher = awayRoster.find((p) => p.id === currentGame.awayPitcherId);
  const currentHomePitcher = homeRoster.find((p) => p.id === currentGame.homePitcherId);
  const currentBatter = currentGame.half === "Top" ? currentAwayBatter : currentHomeBatter;
  const onDeckBatter = currentGame.half === "Top"
  
    ? awayRoster.find((p) => p.id === currentGame.awayLineup[(currentGame.awayBatterIndex + 1) % 9])
    : homeRoster.find((p) => p.id === currentGame.homeLineup[(currentGame.homeBatterIndex + 1) % 9]);
    const battingSide = currentGame.half === "Top" ? "away" : "home";
const nextBattingSide = battingSide === "away" ? "home" : "away";


const battingTeam = battingSide === "away" ? awayTeam : homeTeam;
const battingRoster = battingSide === "away" ? awayRoster : homeRoster;
const battingLineup = battingSide === "away" ? currentGame.awayLineup : currentGame.homeLineup;
const battingIndex = battingSide === "away" ? currentGame.awayBatterIndex : currentGame.homeBatterIndex;
const battingBaseColors = getPostseasonColorsByAbbr(battingTeam?.abbr);
const nextBattingTeam = nextBattingSide === "away" ? awayTeam : homeTeam;
const nextBattingRoster = nextBattingSide === "away" ? awayRoster : homeRoster;
const nextBattingLineup = nextBattingSide === "away" ? currentGame.awayLineup : currentGame.homeLineup;
const nextBattingIndex = nextBattingSide === "away" ? currentGame.awayBatterIndex : currentGame.homeBatterIndex;

const battingLineupPlayers = battingLineup
  .map((playerId, index) => ({
    player: battingRoster.find((player) => player.id === playerId),
    index,
  }))
  .filter((item) => item.player);

const dueUpBatters = [0, 1, 2]
  .map((offset) => {
    const lineupIndex = (nextBattingIndex + offset) % 9;
    const playerId = nextBattingLineup[lineupIndex];
    const player = players.find((player) => player.id === playerId);

    return player
      ? {
          player,
          orderNumber: lineupIndex + 1,
        }
      : null;
  })
  .filter(Boolean);
  const fieldingPitcher = currentGame.half === "Top" ? currentHomePitcher : currentAwayPitcher;
  const displayGameState = getDisplayGameState(currentGame, inningBanner);
  const combinedCountText = `${currentGame.balls}-${currentGame.strikes}, ${currentGame.outs} outs`;

  const isPlayoffLiveGame = (currentGame.gameType || "regular") === "playoff";

const liveLeaderClass =
  Number(currentGame.awayScore || 0) === Number(currentGame.homeScore || 0)
    ? "scorebug-tied"
    : Number(currentGame.awayScore || 0) > Number(currentGame.homeScore || 0)
      ? "scorebug-away-leading"
      : "scorebug-home-leading";
const awayPostseasonColors = getPostseasonColorsByAbbr(awayTeam?.abbr);
const homePostseasonColors = getPostseasonColorsByAbbr(homeTeam?.abbr);

const playoffBroadcastVars = {
  "--away-main": awayPostseasonColors.main,
  "--away-alt": awayPostseasonColors.alt,
  "--away-border": awayPostseasonColors.border,
  "--home-main": homePostseasonColors.main,
  "--home-alt": homePostseasonColors.alt,
  "--home-border": homePostseasonColors.border,
};



  function cycleLiveLook(side) {
    if (side === "away") {
      const looks = getAvailableLooks(awayTeam?.abbr);
      const currentIndex = looks.findIndex(
        (look) =>
          look.mode === (currentGame.awayLook?.mode || "primary") &&
          look.index === (currentGame.awayLook?.index || 0)
      );
      const nextLook = looks[(currentIndex + 1 + looks.length) % looks.length] || looks[0];
      updateCurrentGame("awayLook", { mode: nextLook.mode, index: nextLook.index });
      return;
    }

    const looks = getAvailableLooks(homeTeam?.abbr);
    const currentIndex = looks.findIndex(
      (look) =>
        look.mode === (currentGame.homeLook?.mode || "primary") &&
        look.index === (currentGame.homeLook?.index || 0)
    );
    const nextLook = looks[(currentIndex + 1 + looks.length) % looks.length] || looks[0];
    updateCurrentGame("homeLook", { mode: nextLook.mode, index: nextLook.index });
  }
useEffect(() => {
  const incomingMomentId = Number(currentGame.bigMomentId || 0);

  if (!incomingMomentId) {
    hasInitializedBigMomentRef.current = true;
    return;
  }

  if (!hasInitializedBigMomentRef.current) {
    hasInitializedBigMomentRef.current = true;
    lastSeenBigMomentIdRef.current = incomingMomentId;
    return;
  }

  if (incomingMomentId === lastSeenBigMomentIdRef.current) {
    return;
  }

  lastSeenBigMomentIdRef.current = incomingMomentId;

  if (currentGame.bigMomentText) {
    triggerBigMoment(
      currentGame.bigMomentText,
      currentGame.bigMomentSide || "neutral",
      false
    );
  }
}, [currentGame.bigMomentId]);
useEffect(() => {
  if (currentGame.awayScore !== prevScore.away) {
    setScoreFlashSide("away");
    setTimeout(() => setScoreFlashSide(null), 400);
  }

  if (currentGame.homeScore !== prevScore.home) {
    setScoreFlashSide("home");
    setTimeout(() => setScoreFlashSide(null), 400);
  }

  setPrevScore({
    away: currentGame.awayScore,
    home: currentGame.homeScore,
  });
}, [currentGame.awayScore, currentGame.homeScore]);


  function goToPage(nextPage) {
    if (!controlsUnlocked && protectedPages.includes(nextPage)) {
      setPage("dashboard");
      return;
    }
    setPage(nextPage);
  }

  function unlockControls() {
    if (controlPasswordInput === CONTROL_PASSWORD) {
      setControlsUnlocked(true);
      setControlPasswordInput("");
      return;
    }
    window.alert("Incorrect password.");
  }

  function lockControls() {
    setControlsUnlocked(false);
    setPage("dashboard");
  }

  const standings = useMemo(() => {
    const grouped = {};
    for (const team of teams) {
      const key = `${team.league}-${team.division}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(team);
    }
    Object.keys(grouped).forEach((key) => {
      grouped[key] = sortTeams(grouped[key]);
    });
    return grouped;
  }, [teams]);

  

  const {
    playoffPicture, playoffBracket, playoffSeriesOptions, playoffRoundName,
    playoffGameNumber, playoffGameTitle, isPlayoffGame, selectedLivePlayoffSeries,
    selectedLivePlayoffSeriesOption, selectedLivePlayoffSeriesLabel,
    liveTeamRecordLabel, gameTeamRecordLabel, teamById, teamAbbr,
    playoffSeriesDropdownLabel, playoffSeedForTeam, seriesStatusText,
    initializeBracketFromCurrentSeeds, bumpPlayoffScore, resetSelectedPlayoffSeries,
    addPlayoffGameResult, renderBracketSeries,
  } = createPlayoffController({
    data, teams, currentGame, setData, selectedPlayoffSeriesId, playoffAwayScore,
    playoffHomeScore, setPlayoffAwayScore, setPlayoffHomeScore,
    syncPlayoffBracketToFirebase,
  });

  function commitGameUpdate(mutator) {
  setData((prev) => {
    const game = makeSafeGame(prev.currentGame);
    const next = safeCloneSnapshot(game);

    next.history = [
      ...(game.history || []).slice(-(MAX_HISTORY - 1)),
      safeCloneSnapshot(game),
    ];

    mutator(next);

    next.playLog = (next.playLog || []).slice(0, MAX_PLAY_LOG);

    syncCurrentGameToFirebase(next);

    return { ...prev, currentGame: next };
  });
}

  function setBanner(message) {
    setInningBanner(message);
  }

  function clearBanner() {
    if (inningBanner) setInningBanner("");
  }

  function clearCount(next) {
    next.balls = 0;
    next.strikes = 0;
  }

  function clearCountAndOuts(next) {
    next.balls = 0;
    next.strikes = 0;
    next.outs = 0;
  }

  function stepBatter(next) {
    if (next.half === "Top") next.awayBatterIndex = (next.awayBatterIndex + 1) % 9;
    else next.homeBatterIndex = (next.homeBatterIndex + 1) % 9;
  }

  function addRunsToLineScore(next, side, runs) {
    if (!runs) return;
    const inningIndex = Math.max(0, next.inning - 1);
    if (side === "away") next.awayInnings[inningIndex] = (next.awayInnings[inningIndex] || 0) + runs;
    else next.homeInnings[inningIndex] = (next.homeInnings[inningIndex] || 0) + runs;
  }

  function scoreRuns(next, runs) {
    if (!runs) return;
    const previousAwayScore = Number(next.awayScore || 0);
    const previousHomeScore = Number(next.homeScore || 0);

    if (next.half === "Top") {
      next.awayScore += runs;
      addRunsToLineScore(next, "away", runs);
      // Any away-team scoring means a previously armed walk-off candidate is no longer valid.
      next.walkoffCandidate = false;
    } else {
      next.homeScore += runs;
      addRunsToLineScore(next, "home", runs);

      // A real walk-off only happens when the home team actually TAKES the lead
      // in the bottom of the 9th or later. Merely finalizing a normal home win
      // while the UI still says Bottom 9 is not enough.
      if (
        Number(next.inning || 0) >= 9 &&
        previousHomeScore <= previousAwayScore &&
        Number(next.homeScore || 0) > Number(next.awayScore || 0)
      ) {
        next.walkoffCandidate = true;
      }
    }
  }

  function recordHit(next) {
    if (next.half === "Top") next.awayHits += 1;
    else next.homeHits += 1;
  }

  function recordError(next) {
    if (next.half === "Top") next.homeErrors += 1;
    else next.awayErrors += 1;
  }

  function finishHalfInning(next) {
    const wasTop = next.half === "Top";
    const statusText = wasTop ? `Mid ${next.inning}` : `End ${next.inning}`;
    clearCountAndOuts(next);
    next.bases = { first: false, second: false, third: false };
    next.inningStatus = statusText;
    setBanner(statusText);
    if (wasTop) {
      next.half = "Bottom";
    } else {
      next.half = "Top";
      next.inning += 1;
    }
  }

  function maybeAdvanceHalfInning(next) {
    if (next.outs >= 3) finishHalfInning(next);
  }

  function updateCurrentGame(field, value) {
  clearBanner();

  setData((prev) => {
    const nextGame = makeSafeGame({
      ...prev.currentGame,
      inningStatus: "",
      [field]: value,
    });

    if (field === "awayTeamId") {
      nextGame.awayLook = { mode: "primary", index: 0 };
    }

    if (field === "homeTeamId") {
      nextGame.homeLook = { mode: "primary", index: 0 };
    }

    syncCurrentGameToFirebase(nextGame);

    return { ...prev, currentGame: nextGame };
  });
}

  function setLiveGameField(field, value) {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";
    next[field] = value;
  });
}

function adjustLiveInning(amount) {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";
    next.inning = Math.max(1, Number(next.inning || 1) + amount);
  });
}

function setLiveHalf(half) {
  clearBanner();

  commitGameUpdate((next) => {
    next.half = half;
    next.inningStatus = "";
  });
}

function setMidEndInningStatus() {
  commitGameUpdate((next) => {
    const isTop = next.half === "Top";
    const statusText = isTop ? `Mid ${next.inning}` : `End ${next.inning}`;

    next.inningStatus = statusText;
    next.balls = 0;
    next.strikes = 0;
    next.outs = 0;
    next.bases = { first: false, second: false, third: false };

    setBanner(statusText);
  });
}

function toggleOutDot(targetOuts) {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";

    if (next.outs === targetOuts) {
      next.outs = Math.max(0, targetOuts - 1);
    } else {
      next.outs = targetOuts;
    }

    clearCount(next);
  });
}

function resetBallStrikeCount() {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";
    next.balls = 0;
    next.strikes = 0;
  });
}

function resetLiveCountAndBases() {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";
    next.balls = 0;
    next.strikes = 0;
    next.outs = 0;
    next.bases = { first: false, second: false, third: false };
  });
}

  function changePitcher(side, pitcherId) {
  clearBanner();
  setData((prev) => {
    const next = makeSafeGame(prev.currentGame);
    next.inningStatus = "";

    if (side === "away") {
      if (next.awayPitcherId && next.awayPitcherId !== pitcherId) {
        next.awayPitcherHistory = [...next.awayPitcherHistory, next.awayPitcherId];
      }

      next.awayPitcherId = pitcherId;
      next.awayPitchCount = 0;
    } else {
      if (next.homePitcherId && next.homePitcherId !== pitcherId) {
        next.homePitcherHistory = [...next.homePitcherHistory, next.homePitcherId];
      }

      next.homePitcherId = pitcherId;
      next.homePitchCount = 0;
    }

    return { ...prev, currentGame: next };
  });
}

  function updateBases(base) {
  clearBanner();

  commitGameUpdate((next) => {
    next.inningStatus = "";
    const isTurningOn = !next.bases?.[base];
    const fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
    };

    next.bases = {
      ...next.bases,
      [base]: isTurningOn,
    };

    fieldState.runnerEvent = isTurningOn
      ? {
          id: Date.now(),
          from: "home",
          to: base,
          side: next.half === "Top" ? "away" : "home",
          scored: false,
          source: "base-toggle",
        }
      : null;
    fieldState.manualRunnerOverride = true;
    next.fieldState = fieldState;
  });
}

function moveFieldRunner(origin, destination) {
  clearBanner();
  const battingSide = currentGame.half === "Top" ? "away" : "home";
  const shouldScore = destination === "home" && origin !== "batter" && Boolean(currentGame.bases?.[origin]);

  commitGameUpdate((next) => {
    const baseKeys = new Set(["first", "second", "third"]);
    const normalizedOrigin = origin === "batter" ? "home" : origin;
    const fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
    };

    if (baseKeys.has(origin) && !next.bases?.[origin]) return;
    if (baseKeys.has(destination) && destination !== origin && next.bases?.[destination]) return;

    if (baseKeys.has(origin)) {
      next.bases = { ...next.bases, [origin]: false };
    }

    if (baseKeys.has(destination)) {
      next.bases = { ...next.bases, [destination]: true };
    }

    if (destination === "home" && origin !== "batter") {
      scoreRuns(next, 1);
      next.lastAnnouncement = `Runner scores. ${next.awayScore}-${next.homeScore}.`;
    }

    fieldState.runnerEvent = {
      id: Date.now(),
      from: normalizedOrigin,
      to: destination,
      side: battingSide,
      inning: next.inning,
      half: next.half,
      scored: destination === "home" && origin !== "batter",
    };
    fieldState.manualRunnerOverride = true;
    next.fieldState = fieldState;
  });

  if (shouldScore) {
    const scoringTeam = battingSide === "away" ? awayTeam : homeTeam;
    triggerBigMoment(`${scoringTeam?.abbr || battingSide.toUpperCase()} SCORES`, battingSide, false);
  }
}

function removeFieldRunner(base) {
  if (!["first", "second", "third"].includes(base)) return;
  clearBanner();
  commitGameUpdate((next) => {
    if (!next.bases?.[base]) return;
    next.bases = { ...next.bases, [base]: false };
    const fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
      runnerEvent: null,
      manualRunnerOverride: true,
    };
    next.fieldState = fieldState;
  });
}

function stealFieldRunner(origin, destination) {
  const valid = { first: "second", second: "third", third: "home" };
  if (valid[origin] !== destination) return;
  if (!currentGame.bases?.[origin]) return;
  if (destination !== "home" && currentGame.bases?.[destination]) return;

  clearBanner();
  const battingSide = currentGame.half === "Top" ? "away" : "home";
  const fromLabel = origin === "first" ? "1B" : origin === "second" ? "2B" : "3B";
  const toLabel = destination === "second" ? "2B" : destination === "third" ? "3B" : "Home";
  const text = `Stolen base: runner advances ${fromLabel} → ${toLabel}.`;

  commitGameUpdate((next) => {
    if (!next.bases?.[origin]) return;
    if (destination !== "home" && next.bases?.[destination]) return;

    next.bases = { ...next.bases, [origin]: false };
    if (destination === "home") {
      scoreRuns(next, 1);
      next.lastAnnouncement = `Runner steals home. ${next.awayScore}-${next.homeScore}.`;
    } else {
      next.bases = { ...next.bases, [destination]: true };
    }

    const eventId = Date.now();
    next.latestPlay = text;
    next.playLog = [text, ...(next.playLog || [])];
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
      runnerEvent: {
        id: eventId,
        from: origin,
        to: destination,
        side: battingSide,
        inning: next.inning,
        half: next.half,
        scored: destination === "home",
        source: "stolen-base",
      },
      playEvent: null,
      manualRunnerOverride: false,
    };
  });

  if (destination === "home") {
    const scoringTeam = battingSide === "away" ? awayTeam : homeTeam;
    triggerBigMoment(`${scoringTeam?.abbr || battingSide.toUpperCase()} STEALS HOME`, battingSide, false);
  }
}


function fieldRunnerMovesForPlay(game, type) {
  const bases = game?.bases || {};
  const moves = [];
  const add = (from, to, extra = {}) => moves.push({ from, to, ...extra });

  if (type === "single") {
    if (bases.third) add("third", "home", { scored: true });
    if (bases.second) add("second", "third");
    if (bases.first) add("first", "second");
    add("home", "first", { batter: true });
  } else if (type === "double") {
    if (bases.third) add("third", "home", { scored: true });
    if (bases.second) add("second", "home", { scored: true });
    if (bases.first) add("first", "third");
    add("home", "second", { batter: true });
  } else if (type === "triple") {
    if (bases.third) add("third", "home", { scored: true });
    if (bases.second) add("second", "home", { scored: true });
    if (bases.first) add("first", "home", { scored: true });
    add("home", "third", { batter: true });
  } else if (type === "homerun") {
    if (bases.third) add("third", "home", { scored: true });
    if (bases.second) add("second", "home", { scored: true });
    if (bases.first) add("first", "home", { scored: true });
    add("home", "home", { batter: true, scored: true, fullCycle: true });
  } else if (["walk", "hitbypitch", "error"].includes(type)) {
    if (bases.first && bases.second && bases.third) add("third", "home", { scored: true });
    if (bases.first && bases.second) add("second", "third");
    if (bases.first) add("first", "second");
    add("home", "first", { batter: true });
  } else if (type === "sacfly") {
    if (bases.third) add("third", "home", { scored: true });
  } else if (type === "fielderschoice") {
    if (bases.third) add("third", "home", { out: true });
    else if (bases.second) add("second", "third", { out: true });
    else if (bases.first) add("first", "second", { out: true });
    add("home", "first", { batter: true });
  } else if (type === "caughtstealing") {
    if (bases.third) add("third", "home", { out: true });
    else if (bases.second) add("second", "third", { out: true });
    else if (bases.first) add("first", "second", { out: true });
  }

  return moves;
}

function fieldAnimationKindForPlay(type) {
  if (["single", "double", "triple", "homerun", "flyout", "groundout", "lineout", "popup", "fielderschoice", "doubleplay", "error", "sacfly"].includes(type)) return "batted";
  if (["walk", "hitbypitch", "strikeout", "calledstrikeout"].includes(type)) return "pitch";
  if (["pickoff1", "pickoff2", "pickoff3"].includes(type)) return "pickoff";
  if (type === "caughtstealing") return "runner";
  return "log-only";
}

function fieldBallResultForPlay(type) {
  const map = {
    single: "1B", double: "2B", triple: "3B", homerun: "HR",
    flyout: "OUT", groundout: "OUT", lineout: "OUT", popup: "OUT",
    fielderschoice: "OUT", doubleplay: "OUT", caughtstealing: "OUT",
    error: "ERROR", sacfly: "OUT", walk: "BB", hitbypitch: "HBP", strikeout: "K", calledstrikeout: "ꓘ",
  };
  return map[type] || String(type || "PLAY").toUpperCase();
}

function scheduleFieldBallReset(delay = 7000) {
  if (fieldBallResetTimerRef.current) window.clearTimeout(fieldBallResetTimerRef.current);
  fieldBallResetTimerRef.current = window.setTimeout(() => {
    clearFieldBall();
    fieldBallResetTimerRef.current = null;
  }, delay);
}

function fieldPlayLogDelay(type, kind) {
  if (kind !== "batted") return kind === "pitch" || kind === "pickoff" ? 650 : kind === "runner" ? 350 : 80;
  if (["groundout", "fielderschoice", "doubleplay", "error"].includes(type)) return 1580;
  if (["lineout"].includes(type)) return 1480;
  if (["single"].includes(type)) return 1620;
  if (["double"].includes(type)) return 1720;
  if (["triple"].includes(type)) return 1820;
  if (["flyout", "sacfly"].includes(type)) return 1920;
  if (["popup"].includes(type)) return 1880;
  if (["homerun"].includes(type)) return 2060;
  return 1620;
}

function startAnimatedFieldPlay(category, type) {
  clearBanner();
  if (fieldPlayLogTimerRef.current) window.clearTimeout(fieldPlayLogTimerRef.current);

  const kind = fieldAnimationKindForPlay(type);
  const baseField = currentGame.fieldState || defaultFieldState();
  const existingBall = baseField.ball || defaultFieldState().ball;
  const target = {
    x: Number(existingBall.x ?? 50),
    y: Number(existingBall.y ?? 34),
  };

  if (kind === "pickoff") {
    const pickoffTarget = type === "pickoff1" ? { x: 73, y: 63 } : type === "pickoff2" ? { x: 50, y: 40 } : { x: 27, y: 63 };
    target.x = pickoffTarget.x;
    target.y = pickoffTarget.y;
  }

  const manualRunnerOverride = Boolean(baseField.manualRunnerOverride);
  const event = {
    id: Date.now(),
    category,
    type,
    kind,
    label: fieldBallResultForPlay(type),
    targetX: target.x,
    targetY: target.y,
    runnerMoves: manualRunnerOverride
      ? fieldRunnerMovesForPlay(currentGame, type).filter((move) => move.batter)
      : fieldRunnerMovesForPlay(currentGame, type),
    manualRunnerOverride,
    side: currentGame.half === "Top" ? "away" : "home",
    battingSide: currentGame.half === "Top" ? "away" : "home",
    fieldingSide: currentGame.half === "Top" ? "home" : "away",
    beneficiarySide: ["flyout","groundout","lineout","popup","strikeout","calledstrikeout","doubleplay","caughtstealing","pickoff1","pickoff2","pickoff3"].includes(type) ? (currentGame.half === "Top" ? "home" : "away") : (currentGame.half === "Top" ? "away" : "home"),
    inning: currentGame.inning,
    half: currentGame.half,
    outsBefore: currentGame.outs,
    awayScoreBefore: currentGame.awayScore,
    homeScoreBefore: currentGame.homeScore,
  };

  setData((prev) => {
    const next = makeSafeGame(prev.currentGame);
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(next.fieldState?.ball || {}),
        x: target.x,
        y: target.y,
        visible: kind !== "log-only",
        result: event.label,
        eventId: event.id,
      },
      playEvent: event,
    };
    syncCurrentGameToFirebase(next);
    return { ...prev, currentGame: next };
  });

  const logDelay = fieldPlayLogDelay(type, kind);
  fieldPlayLogTimerRef.current = window.setTimeout(() => {
    applyQuickPlay(category, type, { preserveRunners: manualRunnerOverride, battingSide: event.battingSide, fieldingSide: event.fieldingSide, beneficiarySide: event.beneficiarySide, inning: event.inning, half: event.half });
    fieldPlayLogTimerRef.current = null;
  }, logDelay);

  if (kind !== "log-only") scheduleFieldBallReset(7000);
}

function advanceAllFieldRunners() {
  clearBanner();
  const bases = currentGame.bases || {};
  const runnerMoves = [];
  if (bases.third) runnerMoves.push({ from: "third", to: "home", scored: true });
  if (bases.second) runnerMoves.push({ from: "second", to: "third" });
  if (bases.first) runnerMoves.push({ from: "first", to: "second" });
  runnerMoves.push({ from: "home", to: "first", batter: true });
  const eventId = Date.now();
  const battingSide = currentGame.half === "Top" ? "away" : "home";

  commitGameUpdate((next) => {
    const before = { ...next.bases };
    if (before.third) scoreRuns(next, 1);
    next.bases = {
      first: true,
      second: Boolean(before.first),
      third: Boolean(before.second),
    };
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
      playEvent: {
        id: eventId,
        kind: "runner",
        type: "advanceall",
        label: "ADV +1",
        runnerMoves,
        side: battingSide,
        inning: next.inning,
        half: next.half,
      },
      manualRunnerOverride: true,
    };
    if (before.third) next.lastAnnouncement = `Runner scores. ${next.awayScore}-${next.homeScore}.`;
  });

  if (bases.third) {
    const scoringTeam = battingSide === "away" ? awayTeam : homeTeam;
    triggerBigMoment(`${scoringTeam?.abbr || battingSide.toUpperCase()} SCORES`, battingSide, false);
  }
}

function updateFieldBallResult(result) {
  setData((prev) => {
    const next = makeSafeGame(prev.currentGame);
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(next.fieldState?.ball || {}),
        result,
      },
    };
    syncCurrentGameToFirebase(next);
    return { ...prev, currentGame: next };
  });
}

function dropFieldBall(x, y) {
  setData((prev) => {
    const next = makeSafeGame(prev.currentGame);
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(next.fieldState?.ball || {}),
        x: Math.max(5, Math.min(95, Number(x) || 50)),
        y: Math.max(8, Math.min(94, Number(y) || 86)),
        visible: true,
        eventId: Date.now(),
      },
    };
    syncCurrentGameToFirebase(next);
    return { ...prev, currentGame: next };
  });
  scheduleFieldBallReset(7000);
}

function clearFieldBall() {
  if (fieldBallResetTimerRef.current) {
    window.clearTimeout(fieldBallResetTimerRef.current);
    fieldBallResetTimerRef.current = null;
  }
  setData((prev) => {
    const next = makeSafeGame(prev.currentGame);
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(next.fieldState?.ball || {}),
        x: 50,
        y: 86,
        visible: false,
        eventId: Date.now(),
      },
      playEvent: null,
    };
    syncCurrentGameToFirebase(next);
    return { ...prev, currentGame: next };
  });
}

  function undoLastPlay() {
    clearBanner();
    setData((prev) => {
      const history = prev.currentGame.history || [];
      if (!history.length) return prev;
      const restored = safeCloneSnapshot(history[history.length - 1]);
      restored.history = history.slice(0, -1);
      return { ...prev, currentGame: restored };
    });
  }

  function setFieldCue(next, text, kind = "pitch") {
    const battingSide = next.half === "Top" ? "away" : "home";
    const fieldingSide = battingSide === "away" ? "home" : "away";
    const id = Date.now();
    next.fieldState = {
      ...defaultFieldState(),
      ...(next.fieldState || {}),
      ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
      cueEvent: { id, text, kind, side: battingSide, battingSide, fieldingSide, beneficiarySide: ["strikeout", "calledstrikeout"].includes(kind) ? fieldingSide : battingSide, inning: next.inning, half: next.half, outsBefore: next.outs },
      ...(["strikeout", "calledstrikeout"].includes(kind) ? { socialEvent: { id, type: kind, category: "out", side: battingSide, battingSide, fieldingSide, beneficiarySide: fieldingSide, inning: next.inning, half: next.half, outsBefore: next.outs, awayScoreBefore: next.awayScore, homeScoreBefore: next.homeScore } } : {}),
    };
  }

  function updateCount(action, delta = 1) {
    clearBanner();
    commitGameUpdate((next) => {
      next.inningStatus = "";
      if (action === "balls") {
        next.balls = Math.max(0, Math.min(4, next.balls + delta));
        addPitchToCurrentPitcher(next);
        if (delta > 0) setFieldCue(next, "BALL", "ball");
        return;
      }

      if (action === "strikes") {
        next.strikes = Math.max(0, Math.min(3, next.strikes + delta));
        addPitchToCurrentPitcher(next);
        return;
      }

      if (action === "outs") {
        next.outs = Math.max(0, next.outs + delta);
        if (delta > 0) clearCount(next);
        maybeAdvanceHalfInning(next);
        return;
      }

      if (action === "foul") {
        if (next.strikes < 2) next.strikes += 1;
        addPitchToCurrentPitcher(next);
        setFieldCue(next, "FOUL", "foul");
        return;
      }

      if (action === "swinging" || action === "called") {
        addPitchToCurrentPitcher(next);
        setFieldCue(next, action === "swinging" ? "SWING" : "CALLED STRIKE", action);
        if (next.strikes >= 2) {
          setFieldCue(next, action === "swinging" ? "K" : "ꓘ", action === "swinging" ? "strikeout" : "calledstrikeout");
          next.latestPlay = action === "swinging" ? `${currentBatter ? currentBatter.name : "Batter"} struck out swinging.` : `${currentBatter ? currentBatter.name : "Batter"} struck out looking.`;
          next.playLog = [next.latestPlay, ...next.playLog];
          clearCount(next);
          next.outs += 1;
          if (currentBatter?.id) {
  setData((prev) => {
    const nextPlayers = prev.players.map((player) =>
      player.id === currentBatter.id
        ? {
            ...player,
            ab: (player.ab || 0) + 1,
            seasonAB: Number(player.seasonAB || 0) + 1,
            careerAB: Number(player.careerAB || 0) + 1,
            seasonStrikeouts: Number(player.seasonStrikeouts || 0) + 1,
            careerStrikeouts: Number(player.careerStrikeouts || 0) + 1,
            lastAB: "K",
          }
        : player
    );

    syncPlayersToFirebase(nextPlayers);

    return {
      ...prev,
      players: nextPlayers,
    };
  });
}
          stepBatter(next);
          maybeAdvanceHalfInning(next);
        } else {
          next.strikes += 1;
        }
      }
    });
  }


  function incrementPitchCount(delta) {
    clearBanner();
    commitGameUpdate((next) => {
 
      next.inningStatus = "";
      if (next.half === "Top") next.homePitchCount = Math.max(0, next.homePitchCount + delta);
      else next.awayPitchCount = Math.max(0, next.awayPitchCount + delta);
    });
  }

  function addPitchToCurrentPitcher(next) {
  if (next.half === "Top") {
    next.homePitchCount = Number(next.homePitchCount || 0) + 1;
  } else {
    next.awayPitchCount = Number(next.awayPitchCount || 0) + 1;
  }
}
  function updateChallenges(side, delta) {
    setData((prev) => {
      const next = makeSafeGame(prev.currentGame);

      if (side === "away") {
        next.awayChallenges = Math.max(0, Math.min(2, (next.awayChallenges || 0) + delta));
      } else {
        next.homeChallenges = Math.max(0, Math.min(2, (next.homeChallenges || 0) + delta));
      }

      return {
        ...prev,
        currentGame: next,
      };
    });
  }

function triggerScoreFlash(side) {
  setScoreFlashSide(side);

  if (scoreFlashTimerRef.current) {
    clearTimeout(scoreFlashTimerRef.current);
  }

  scoreFlashTimerRef.current = setTimeout(() => {
    setScoreFlashSide(null);
  }, 1200);
}

function triggerBigMoment(message, side = "neutral", shouldSync = true) {
  setBigMomentBanner(message);

  if (side === "away" || side === "home") {
    triggerScoreFlash(side);
  }

  if (bigMomentTimerRef.current) {
    clearTimeout(bigMomentTimerRef.current);
  }

  bigMomentTimerRef.current = setTimeout(() => {
    setBigMomentBanner("");
  }, 4500);

  if (!shouldSync) return;

  const nextMomentId = Date.now();

  lastSeenBigMomentIdRef.current = nextMomentId;

  commitGameUpdate((next) => {
    next.bigMomentText = message;
    next.bigMomentSide = side;
    next.bigMomentId = nextMomentId;
  });
}

function triggerLiveMoment(type) {
  const battingSide = currentGame.half === "Top" ? "away" : "home";
  const fieldingSide = currentGame.half === "Top" ? "home" : "away";
  const battingTeam = currentGame.half === "Top" ? awayTeam : homeTeam;
  const fieldingTeam = currentGame.half === "Top" ? homeTeam : awayTeam;

  const battingAbbr = battingTeam?.abbr || "BAT";
  const fieldingAbbr = fieldingTeam?.abbr || "DEF";

  if (type === "homeRun") {
    triggerBigMoment(`💥 ${battingAbbr} HOME RUN 💥`, battingSide);
    return;
  }

  if (type === "clutchHit") {
    triggerBigMoment(`🔥 ${battingAbbr} CLUTCH HIT 🔥`, battingSide);
    return;
  }

  if (type === "walkOff") {
    triggerBigMoment(`🚨 ${battingAbbr} WALK-OFF 🚨`, battingSide);
    return;
  }

  if (type === "strikeout") {
    triggerBigMoment(`⚡ ${fieldingAbbr} BIG STRIKEOUT ⚡`, fieldingSide);
    return;
  }

  if (type === "doublePlay") {
    triggerBigMoment(`🧤 ${fieldingAbbr} DOUBLE PLAY 🧤`, fieldingSide);
  }
}

function isWorldSeriesGame(game) {
  return (
    game?.gameType === "playoff" &&
    (game?.playoffSeriesId === "finals" ||
      game?.playoffSeriesId === "worldSeries")
  );
}

  function changeScore(side, amount) {
    clearBanner();
    commitGameUpdate((next) => {
      next.inningStatus = "";
      const previousAwayScore = Number(next.awayScore || 0);
      const previousHomeScore = Number(next.homeScore || 0);

      if (side === "away") {
        next.awayScore = Math.max(0, next.awayScore + amount);
        if (amount > 0) addRunsToLineScore(next, "away", amount);
        if (amount !== 0) next.walkoffCandidate = false;
      } else {
        next.homeScore = Math.max(0, next.homeScore + amount);
        if (amount > 0) addRunsToLineScore(next, "home", amount);

        if (
          amount > 0 &&
          next.half === "Bottom" &&
          Number(next.inning || 0) >= 9 &&
          previousHomeScore <= previousAwayScore &&
          Number(next.homeScore || 0) > Number(next.awayScore || 0)
        ) {
          next.walkoffCandidate = true;
        }
      }

      if (Number(next.homeScore || 0) <= Number(next.awayScore || 0)) {
        next.walkoffCandidate = false;
      }
      if (amount !== 0) next.lastAnnouncement = `Score update: ${next.awayScore}-${next.homeScore}.`;
    });
    if (amount > 0) {
  const scoringTeam = side === "away" ? awayTeam : homeTeam;
  triggerBigMoment(`${scoringTeam?.abbr || side.toUpperCase()} SCORES`, side);
}
  }

  function changeBoxStat(side, stat, amount) {
  clearBanner();

  commitGameUpdate((next) => {
    const key = `${side}${stat}`;
    next.inningStatus = "";
    next[key] = Math.max(0, Number(next[key] || 0) + amount);
  });
}

  function markLive() {
    clearBanner();
    const scheduled = currentSeasonDay(data, teams);
    setData((prev) => {
      const nextGame = { ...prev.currentGame, inningStatus: "", status: "Live" };
      if ((nextGame.gameType || "regular") !== "playoff") {
        const anchorGame = isCalendarAnchorGame(nextGame, prev, prev.teams || teams);
        if (anchorGame && !Number(nextGame.seasonGameNumber || 0) && scheduled?.gameNumber) nextGame.seasonGameNumber = scheduled.gameNumber;
        if (!anchorGame) nextGame.seasonGameNumber = 0;
      }
      syncCurrentGameToFirebase(nextGame);
      return { ...prev, currentGame: nextGame };
    });
  }

  function applyQuickPlay(category, type, options = {}) {
    clearBanner();
    const preserveRunners = Boolean(options.preserveRunners);
    const batterId = currentBatter?.id;
    commitGameUpdate((next) => {
      const socialBattingSide = options.battingSide || (next.half === "Top" ? "away" : "home");
      const socialFieldingSide = options.fieldingSide || (socialBattingSide === "away" ? "home" : "away");
      const offensiveTypes = new Set(["single","double","triple","homerun","walk","hitbypitch","error","sacfly"]);
      const defensiveTypes = new Set(["flyout","groundout","lineout","popup","strikeout","calledstrikeout","doubleplay","caughtstealing","pickoff1","pickoff2","pickoff3"]);
      const beneficiarySide = options.beneficiarySide || (offensiveTypes.has(type) ? socialBattingSide : defensiveTypes.has(type) ? socialFieldingSide : socialBattingSide);
      const socialEventId = Date.now();
      next.fieldState = {
        ...defaultFieldState(),
        ...(next.fieldState || {}),
        socialEvent: { id: socialEventId, type, category, side: socialBattingSide, battingSide: socialBattingSide, fieldingSide: socialFieldingSide, beneficiarySide, inning: options.inning || next.inning, half: options.half || next.half, outsBefore: next.outs, awayScoreBefore: next.awayScore, homeScoreBefore: next.homeScore },
      };
      const pitchCountTypes = new Set([
  "single",
  "double",
  "triple",
  "homerun",
  "flyout",
  "groundout",
  "lineout",
  "popup",
  "fielderschoice",
  "doubleplay",
  "sacfly",
]);

if (pitchCountTypes.has(type)) {
  addPitchToCurrentPitcher(next);
}
      next.inningStatus = "";
      const custom = playInput.trim();
      const batterName = currentBatter ? currentBatter.name : "Batter";
      let text = custom || type;

      if (category === "hit") {
        setData((prev) => {
  const nextPlayers = prev.players.map((p) => {
    if (p.id !== batterId) return p;

    return {
      ...p,
      ab: (p.ab || 0) + 1,
      hits: (p.hits || 0) + 1,
      seasonAB: Number(p.seasonAB || 0) + 1,
      seasonHits: Number(p.seasonHits || 0) + 1,
      careerAB: Number(p.careerAB || 0) + 1,
      careerHits: Number(p.careerHits || 0) + 1,
      seasonDoubles: Number(p.seasonDoubles || 0) + (type === "double" ? 1 : 0),
      careerDoubles: Number(p.careerDoubles || 0) + (type === "double" ? 1 : 0),
      seasonTriples: Number(p.seasonTriples || 0) + (type === "triple" ? 1 : 0),
      careerTriples: Number(p.careerTriples || 0) + (type === "triple" ? 1 : 0),
      seasonHR: Number(p.seasonHR || 0) + (type === "homerun" ? 1 : 0),
      careerHR: Number(p.careerHR || 0) + (type === "homerun" ? 1 : 0),
      lastAB:
        type === "single" ? "1B" :
        type === "double" ? "2B" :
        type === "triple" ? "3B" :
        type === "homerun" ? "HR" :
        ""
    };
  });

  syncPlayersToFirebase(nextPlayers);

  return { ...prev, players: nextPlayers };
});
        const hadFirst = next.bases.first;
        const hadSecond = next.bases.second;
        const hadThird = next.bases.third;
        let runs = 0;

        const map = {
          single: `${batterName} hit a single${fielderName ? ` to ${fielderName}` : ""}.`,
          double: `${batterName} hit a double${fielderName ? ` to ${fielderName}` : ""}.`,
          triple: `${batterName} hit a triple${fielderName ? ` to ${fielderName}` : ""}.`,
          homerun: `${batterName} hit a home run${fielderName ? ` to ${fielderName}` : ""}.`,
        };
        text = custom || map[type] || text;

        const infoOnlyTypes = new Set([
          "pickoff1",
          "pickoff2",
          "pickoff3",
          "awayballupheld",
          "awayballoverturned",
          "awaystrikeupheld",
          "awaystrikeoverturned",
          "homeballupheld",
          "homeballoverturned",
          "homestrikeupheld",
          "homestrikeoverturned",
        ]);
        recordHit(next);

        if (!preserveRunners) {
          if (type === "single") {
            if (hadThird) runs += 1;
            next.bases = { first: true, second: hadFirst, third: hadSecond };
          }
          if (type === "double") {
            if (hadThird) runs += 1;
            if (hadSecond) runs += 1;
            next.bases = { first: false, second: true, third: hadFirst };
          }
          if (type === "triple") {
            if (hadThird) runs += 1;
            if (hadSecond) runs += 1;
            if (hadFirst) runs += 1;
            next.bases = { first: false, second: false, third: true };
          }
          if (type === "homerun") {
            if (hadThird) runs += 1;
            if (hadSecond) runs += 1;
            if (hadFirst) runs += 1;
            runs += 1;
            next.bases = { first: false, second: false, third: false };
          }
          scoreRuns(next, runs);
        } else {
          // The operator already handled existing runners. Only apply the batter's result.
          if (type === "single") next.bases = { ...next.bases, first: true };
          if (type === "double") next.bases = { ...next.bases, second: true };
          if (type === "triple") next.bases = { ...next.bases, third: true };
          if (type === "homerun") scoreRuns(next, 1);
        }
        if (!infoOnlyTypes.has(type)) {
          clearCount(next);
        }
        stepBatter(next);
      }

      if (category === "out") {

        setData((prev) => {
  const nextPlayers = prev.players.map((p) => {
    if (p.id !== batterId || type === "caughtstealing") return p;
    return {
      ...p,
      ab: (p.ab || 0) + 1,
      seasonAB: Number(p.seasonAB || 0) + 1,
      careerAB: Number(p.careerAB || 0) + 1,
      seasonStrikeouts: Number(p.seasonStrikeouts || 0) + ((type === "strikeout" || type === "calledstrikeout") ? 1 : 0),
      careerStrikeouts: Number(p.careerStrikeouts || 0) + ((type === "strikeout" || type === "calledstrikeout") ? 1 : 0),
      lastAB:
        type === "flyout" ? "FO" :
        type === "groundout" ? "GO" :
        type === "lineout" ? "LO" :
        type === "popup" ? "POP" :
        type === "strikeout" ? "K" :
        type === "calledstrikeout" ? "ꓘ" :
        "OUT"
    };
  });

  syncPlayersToFirebase(nextPlayers);

  return { ...prev, players: nextPlayers };
});
        const map = {
          flyout: `${batterName} flied out${fielderName ? ` to ${fielderName}` : ""}.`,
          groundout: `${batterName} grounded out${fielderName ? ` to ${fielderName}` : ""}.`,
          lineout: `${batterName} lined out${fielderName ? ` to ${fielderName}` : ""}.`,
          popup: `${batterName} popped out${fielderName ? ` to ${fielderName}` : ""}.`,
          fielderschoice: `${batterName} reached on a fielder's choice${fielderName ? ` by ${fielderName}` : ""}.`,
          strikeout: `${batterName} struck out swinging.`,
          calledstrikeout: `${batterName} struck out looking.`,
          doubleplay: `${batterName} grounded into a double play${fielderName ? ` to ${fielderName}` : ""}.`,
          caughtstealing: `Runner was caught stealing${fielderName ? ` by ${fielderName}` : ""}.`,
        };
        text = custom || map[type] || text;
        if (type === "fielderschoice") {
          next.outs += 1;
          clearCount(next);
          if (!preserveRunners) {
            if (next.bases.third) next.bases.third = false;
            else if (next.bases.second) next.bases.second = false;
            else if (next.bases.first) next.bases.first = false;
          }
          next.bases = { ...next.bases, first: true };
          stepBatter(next);
          maybeAdvanceHalfInning(next);
        } else {
          next.outs += type === "doubleplay" ? 2 : 1;
          clearCount(next);
          if (type === "caughtstealing") {
          if (!preserveRunners) {
            if (next.bases.third) next.bases.third = false;
            else if (next.bases.second) next.bases.second = false;
            else if (next.bases.first) next.bases.first = false;
          }
        } else {
          stepBatter(next);
          }
          maybeAdvanceHalfInning(next);
        }
      }

      if (category === "other") {
  if (batterId && ["walk", "hitbypitch", "error"].includes(type)) {
    setData((prev) => {
      const nextPlayers = prev.players.map((p) => {
        if (p.id !== batterId) return p;
        const isWalk = type === "walk";
        const isHbp = type === "hitbypitch";
        const isError = type === "error";
        return {
          ...p,
          ab: Number(p.ab || 0) + (isError ? 1 : 0),
          seasonAB: Number(p.seasonAB || 0) + (isError ? 1 : 0),
          careerAB: Number(p.careerAB || 0) + (isError ? 1 : 0),
          seasonWalks: Number(p.seasonWalks || 0) + (isWalk ? 1 : 0),
          careerWalks: Number(p.careerWalks || 0) + (isWalk ? 1 : 0),
          seasonHBP: Number(p.seasonHBP || 0) + (isHbp ? 1 : 0),
          careerHBP: Number(p.careerHBP || 0) + (isHbp ? 1 : 0),
          lastAB: isWalk ? "BB" : isHbp ? "HBP" : "E",
        };
      });
      syncPlayersToFirebase(nextPlayers);
      return { ...prev, players: nextPlayers };
    });
  }
  const map = {
    walk: `${batterName} walked.`,
    hitbypitch: `${batterName} was hit by pitch.`,
    error: `${batterName} reached on an error${fielderName ? ` by ${fielderName}` : ""}.`,
    sacfly: `${batterName} hit a sacrifice fly${fielderName ? ` to ${fielderName}` : ""}.`,
    pickoff1: "Pickoff attempt at 1B.",
    pickoff2: "Pickoff attempt at 2B.",
    pickoff3: "Pickoff attempt at 3B.",
    awayballupheld: `${awayTeam?.abbr || "Away"} challenged ball call - upheld.`,
    awayballoverturned: `${awayTeam?.abbr || "Away"} challenged ball call - overturned.`,
    awaystrikeupheld: `${awayTeam?.abbr || "Away"} challenged strike call - upheld.`,
    awaystrikeoverturned: `${awayTeam?.abbr || "Away"} challenged strike call - overturned.`,
    homeballupheld: `${homeTeam?.abbr || "Home"} challenged ball call - upheld.`,
    homeballoverturned: `${homeTeam?.abbr || "Home"} challenged ball call - overturned.`,
    homestrikeupheld: `${homeTeam?.abbr || "Home"} challenged strike call - upheld.`,
    homestrikeoverturned: `${homeTeam?.abbr || "Home"} challenged strike call - overturned.`,
  };
  text = custom || map[type] || text;

  const infoOnlyTypes = new Set([
    "pickoff1",
    "pickoff2",
    "pickoff3",
    "awayballupheld",
    "awayballoverturned",
    "awaystrikeupheld",
    "awaystrikeoverturned",
    "homeballupheld",
    "homeballoverturned",
    "homestrikeupheld",
    "homestrikeoverturned",
  ]);

  if (!infoOnlyTypes.has(type)) {
    clearCount(next);
  }

        if (type === "walk" || type === "hitbypitch" || type === "error") {
          if (type === "error") recordError(next);
          if (!preserveRunners) {
            if (next.bases.first && next.bases.second && next.bases.third) scoreRuns(next, 1);
            if (next.bases.first && next.bases.second) next.bases.third = true;
            if (next.bases.first) next.bases.second = true;
          }
          next.bases = { ...next.bases, first: true };
          stepBatter(next);
        }

        if (type === "sacfly") {
          if (!preserveRunners && next.bases.third) {
            next.bases.third = false;
            scoreRuns(next, 1);
          }
          next.outs += 1;
          stepBatter(next);
          maybeAdvanceHalfInning(next);
        }
      }

      const noLatestPlayTypes = new Set([
        "swinging",
        "called",
        "foul",
      ]);
      if (!noLatestPlayTypes.has(type)) {
        next.latestPlay = text;
        next.playLog = [text, ...next.playLog];
      }
      if (category !== "out" || !text.includes("Score update")) {
        next.lastAnnouncement = next.lastAnnouncement || "No scoring update yet.";
      }
      if (next.fieldState?.socialEvent?.id === socialEventId) {
        next.fieldState.socialEvent = {
          ...next.fieldState.socialEvent,
          outsAfter: next.outs,
          awayScoreAfter: next.awayScore,
          homeScoreAfter: next.homeScore,
        };
      }
      next.fieldState = {
        ...defaultFieldState(),
        ...(next.fieldState || {}),
        ball: { ...defaultFieldState().ball, ...(next.fieldState?.ball || {}) },
        manualRunnerOverride: false,
      };
    });

    setPlayInput("");
    setFielderName("");
  }

  const {
    addTeam, deleteTeam, editTeam, addPlayer, deletePlayer, updateRecord,
    adjustTeamNumber, adjustTeamStreak, resetTeamStreak,
  } = createAdminActions({
    newTeam, newPlayer, playerNameInputRef, recentlyUpdatedTimerRef,
    setData, setNewPlayer, setNewTeam, setRecentlyUpdatedTeamId,
    setSelectedAdminTeamId, syncPlayersToFirebase, syncTeamsToFirebase,
  });

  function setLineup(side, index, playerId) {
    const key = side === "away" ? "awayLineup" : "homeLineup";
    const lineup = [...currentGame[key]];
    lineup[index] = playerId;
    updateCurrentGame(key, lineup);
  }

  function setLineupPosition(side, index, position) {
    const key = side === "away" ? "awayPositions" : "homePositions";
    const positions = [...currentGame[key]];
    positions[index] = position;
    updateCurrentGame(key, positions);
  }

  function addPlayLog() {
    if (!playInput.trim()) return;
    clearBanner();
    setData((prev) => ({
      ...prev,
      currentGame: { ...makeSafeGame(prev.currentGame), inningStatus: "", latestPlay: playInput, playLog: [playInput, ...prev.currentGame.playLog] },
    }));
    setPlayInput("");
  }

  const {
    updateDailyRow, clearDailyRow, addDailyRows, applyBulkResultsInput,
    getDailyRowIssue, isValidDailyRow, nextStreak, applyDailyResults,
  } = createDailyResultsController({
    data, setData, bulkResultsInput, setBulkResultsInput, setBulkWarnings,
    teamNumberLookup, teamAbbrLookup, teams, syncTeamsToFirebase, syncGamesToFirebase,
  });

  const {
    applyPlayoffGameResult, finalizeGame, resetCurrentMatch, resetCurrentGamePlayerStats,
  } = createGameFinalizationController({
    data, setData, currentGame, winningPitcherId, losingPitcherId,
    setWinningPitcherId, setLosingPitcherId, setPage, nextStreak, clearBanner,
    syncPlayersToFirebase, syncLastFinalGameToFirebase, syncPlayoffBracketToFirebase,
    syncCurrentGameToFirebase, syncTeamsToFirebase, syncGamesToFirebase,
  });

  const {
    resetLeague, archiveCurrentSeason, deleteSeasonSnapshot,
    toggleHistorySeason, resetRegularSeasonStats,
  } = createSeasonActions({
    data, setData, setExpandedHistorySeasonIds, setPage, teamById, teams,
    syncCurrentGameToFirebase, syncDailyResultsRowsToFirebase,
    syncLastFinalGameToFirebase, syncPlayoffBracketToFirebase,
    syncSeasonHistoryToFirebase, syncTeamsToFirebase, syncPlayersToFirebase,
  });

  const activeButtons = playMode === "hits"
    ? [
        { label: "Single", category: "hit", type: "single" },
        { label: "Double", category: "hit", type: "double" },
        { label: "Triple", category: "hit", type: "triple" },
        { label: "Home Run", category: "hit", type: "homerun" },
      ]
    : playMode === "outs"
      ? [
          { label: "Fly Out", category: "out", type: "flyout" },
          { label: "Ground Out", category: "out", type: "groundout" },
          { label: "Line Out", category: "out", type: "lineout" },
          { label: "Pop Up", category: "out", type: "popup" },
          { label: "Fielder's Choice", category: "out", type: "fielderschoice" },
          { label: "Double Play", category: "out", type: "doubleplay" },
          { label: "Caught Stealing", category: "out", type: "caughtstealing" },
        ]
      : [
          { label: "Walk", category: "other", type: "walk" },
          { label: "HBP", category: "other", type: "hitbypitch" },
          { label: "Error", category: "other", type: "error" },
          { label: "Sac Fly", category: "other", type: "sacfly" },
          { label: "Pickoff 1B", category: "other", type: "pickoff1" },
          { label: "Pickoff 2B", category: "other", type: "pickoff2" },
          { label: "Pickoff 3B", category: "other", type: "pickoff3" },
          { label: "Away Ball Upheld", category: "other", type: "awayballupheld" },
          { label: "Away Ball Overturned", category: "other", type: "awayballoverturned" },
          { label: "Away Strike Upheld", category: "other", type: "awaystrikeupheld" },
          { label: "Away Strike Overturned", category: "other", type: "awaystrikeoverturned" },
          { label: "Home Ball Upheld", category: "other", type: "homeballupheld" },
          { label: "Home Ball Overturned", category: "other", type: "homeballoverturned" },
          { label: "Home Strike Upheld", category: "other", type: "homestrikeupheld" },
          { label: "Home Strike Overturned", category: "other", type: "homestrikeoverturned" },
        ];

        const currentPitchCount =
  currentGame.half === "Top"
    ? Number(currentGame.homePitchCount || 0)
    : Number(currentGame.awayPitchCount || 0);
    const lastFinalGame = data.lastFinalGame ? makeSafeGame(data.lastFinalGame) : null;
const lastFinalAwayTeam = lastFinalGame ? teams.find((team) => team.id === lastFinalGame.awayTeamId) : null;
const lastFinalHomeTeam = lastFinalGame ? teams.find((team) => team.id === lastFinalGame.homeTeamId) : null;
const dashboardScoreboardGame =
  homeTeam && awayTeam ? currentGame : lastFinalGame;

const dashboardScoreboardAwayTeam =
  homeTeam && awayTeam ? awayTeam : lastFinalAwayTeam;

const dashboardScoreboardHomeTeam =
  homeTeam && awayTeam ? homeTeam : lastFinalHomeTeam;
const lastFinalWinningPitcher = lastFinalGame?.winningPitcherId
  ? players.find((player) => player.id === lastFinalGame.winningPitcherId)
  : null;
const lastFinalLosingPitcher = lastFinalGame?.losingPitcherId
  ? players.find((player) => player.id === lastFinalGame.losingPitcherId)
  : null;
const favoriteTeam =
  teams.find((team) => team.abbr === "SF") || sortTeams(teams)[0] || null;

const favoritePicture = favoriteTeam
  ? playoffPicture.find((picture) => picture.league === favoriteTeam.league)
  : null;

const favoriteDivisionTeams = favoriteTeam
  ? sortStandingsTeams(
      teams.filter(
        (team) =>
          team.league === favoriteTeam.league &&
          team.division === favoriteTeam.division
      )
    )
  : [];

const favoriteDivisionLeader = favoriteDivisionTeams[0] || null;
const favoriteDivisionRank = favoriteTeam
  ? favoriteDivisionTeams.findIndex((team) => team.id === favoriteTeam.id) + 1
  : 0;

const favoriteMarker =
  favoriteTeam && favoritePicture
    ? getPlayoffMarker(favoriteTeam, favoritePicture, favoriteDivisionLeader)
    : "";

const favoriteGamesPlayed = favoriteTeam
  ? Number(favoriteTeam.wins || 0) + Number(favoriteTeam.losses || 0)
  : 0;

const favoriteGamesLeft = favoriteTeam
  ? Math.max(0, SEASON_LENGTH - favoriteGamesPlayed)
  : 0;

const bestRecordTeam = sortTeams(teams)[0] || null;

const worstRecordTeam =
  [...teams].sort((a, b) => {
    const pctDiff = winningPctValue(a) - winningPctValue(b);
    if (pctDiff !== 0) return pctDiff;
    return Number(a.runDiff || 0) - Number(b.runDiff || 0);
  })[0] || null;

const divisionRaceCards = data.leagues.flatMap((league) =>
  data.divisions
    .map((division) => {
      const divisionTeams = sortStandingsTeams(
        teams.filter((team) => team.league === league && team.division === division)
      );

      const leader = divisionTeams[0];
      const second = divisionTeams[1];

      if (!leader || !second) return null;

      return {
        league,
        division,
        leader,
        second,
        gap: gamesBack(second, leader),
        rawGap: gamesBackRaw(second, leader),
      };
    })
    .filter(Boolean)
);

const tightestDivisionRace =
  divisionRaceCards
    .filter((race) => race.rawGap >= 0)
    .sort((a, b) => a.rawGap - b.rawGap)[0] || null;

const favoriteDivisionChaser =
  favoriteDivisionTeams.find((team) => team.id !== favoriteTeam?.id) || null;

const dashboardStories = [
  favoriteTeam && {
    title: "Franchise Focus",
    value: `${favoriteTeam.abbr} ${favoriteTeam.wins}-${favoriteTeam.losses}`,
    detail:
      favoriteDivisionRank === 1
        ? `Leading the ${favoriteTeam.league} ${favoriteTeam.division} by ${
            favoriteDivisionChaser ? gamesBack(favoriteDivisionChaser, favoriteTeam) : "—"
          }.`
        : `${gamesBack(favoriteTeam, favoriteDivisionLeader)} GB in the ${favoriteTeam.league} ${favoriteTeam.division}.`,
  },
  bestRecordTeam && {
    title: "Best Record",
    value: `${bestRecordTeam.abbr} ${bestRecordTeam.wins}-${bestRecordTeam.losses}`,
    detail: `${pct(bestRecordTeam.wins, bestRecordTeam.losses)} winning percentage.`,
  },
  bestRunDiff && {
    title: "Run Differential King",
    value: `${bestRunDiff.abbr} ${bestRunDiff.runDiff > 0 ? "+" : ""}${bestRunDiff.runDiff}`,
    detail: "Biggest RD in the league right now.",
  },
  tightestDivisionRace && {
    title: "Tightest Division",
    value: `${tightestDivisionRace.league} ${tightestDivisionRace.division}`,
    detail: `${tightestDivisionRace.leader.abbr} leads ${tightestDivisionRace.second.abbr} by ${tightestDivisionRace.gap}.`,
  },
  lastFinalGame &&
    lastFinalAwayTeam &&
    lastFinalHomeTeam && {
      title: "Last Final",
      value: `${lastFinalAwayTeam.abbr} ${lastFinalGame.awayScore}, ${lastFinalHomeTeam.abbr} ${lastFinalGame.homeScore}`,
      detail: `Margin: ${Math.abs(Number(lastFinalGame.awayScore || 0) - Number(lastFinalGame.homeScore || 0))}.`,
    },
].filter(Boolean);
  const pageContext = { setPage, syncLeagueExtrasToFirebase, syncGamesToFirebase, syncActiveSeasonNameToFirebase, addDailyRows, addPlayer, addPlayoffGameResult, addTeam, adjustLiveInning, adjustTeamNumber, applyBulkResultsInput, applyDailyResults, archiveCurrentSeason, awayColors, awayTeam, battingBaseColors, bestRecordTeam, bestRunDiff, bigMomentBanner, bulkResultsInput, bulkWarnings, bumpPlayoffScore, changeBoxStat, changeScore, clearDailyRow, clearFieldBall, controlsUnlocked, currentGame, cycleLiveLook, dashboardScoreboardAwayTeam, dashboardScoreboardGame, dashboardScoreboardHomeTeam, dashboardStories, data, deletePlayer, deleteSeasonSnapshot, editTeam, expandedHistorySeasonIds, favoriteDivisionChaser, favoriteDivisionLeader, favoriteDivisionRank, favoriteGamesLeft, favoriteMarker, favoriteTeam, finalizeGame, gameTeamRecordLabel, getDailyRowIssue, homeColors, homeTeam, initializeBracketFromCurrentSeeds, isPlayoffLiveGame, isWorldSeriesGame, lastFinalAwayTeam, lastFinalGame, lastFinalHomeTeam, liveAwayLookLabel, liveHomeLookLabel, liveLeaderClass, liveTeamRecordLabel, newPlayer, newTeam, numberedTeams, playerNameInputRef, playoffAwayScore, playoffBracket, playoffBroadcastVars, playoffGameTitle, playoffHomeScore, playoffPicture, playoffSeedForTeam, playoffSeriesDropdownLabel, playoffSeriesOptions, recentlyUpdatedTeamId, renderBracketSeries, resetBallStrikeCount, resetCurrentMatch, resetLiveCountAndBases, resetLeague, resetRegularSeasonStats, resetSelectedPlayoffSeries, scoreFlashSide, selectedAdminRoster, selectedAdminTeam, selectedAdminTeamId, selectedDeletePlayerId, selectedPlayoffSeriesId, seriesStatusText, setBulkResultsInput, setData, setLiveHalf, setMidEndInningStatus, setNewPlayer, setNewTeam, setPlayoffAwayScore, setPlayoffHomeScore, setSelectedAdminTeamId, setSelectedDeletePlayerId, setSelectedPlayoffSeriesId, standings, teamAbbr, teamById, teams, tightestDivisionRace, toggleHistorySeason, toggleOutDot, triggerLiveMoment, undoLastPlay, updateBases, updateCount, updateCurrentGame, updateDailyRow, updateFieldBallResult, dropFieldBall, moveFieldRunner, removeFieldRunner, stealFieldRunner, startAnimatedFieldPlay, advanceAllFieldRunners, worstRecordTeam };

  return (
    <div className="app-shell wide-shell">
      <div className="topbar">
       <div>
  <div className="title-row">
    <h1>SMB4 Franchise Central</h1>
    <span className="version-pill version-pill-v3">v4.13.1</span>
  </div>
  <p>SMB4 Franchise Central · Version 4.13.3 · Living Season · 40-game regular season</p>
</div>
        <div className="topbar-actions">
  {controlsUnlocked && (
    <button className="danger" onClick={resetLeague} title="Resets only this browser copy. Firebase is left untouched.">
      Emergency Local Reset
    </button>
  )}
</div>
</div>

<div className="nav">
  <button onClick={() => setPage("dashboard")}>Dashboard</button>
  <button onClick={() => setPage("standings")}>Standings</button>
  <button onClick={() => setPage("bracket")}>Bracket</button>
  <button onClick={() => setPage("history")}>History</button>
  <button onClick={() => setPage("records")}>Records</button>
  <button onClick={() => setPage("news")}>News</button>
  <button onClick={() => setPage("league")}>League Hub</button>
  <button className="v4-nav-button" onClick={() => setPage("v4")}>V4 Center</button>
  <button className="fandom-nav-button" onClick={() => setPage("fandom")}>Fandom</button>

  {controlsUnlocked && <button className="league-office-nav-button" onClick={() => setPage("office")}>League Office</button>}
  
</div>
<WorldPulseRibbon data={data} teams={teams} playoffPicture={playoffPicture} page={page} />


      {!controlsUnlocked && (
        <div className="control-warning-wrap">
          <div className="control-warning">DONT TOUCH ME! AUTHORIZED PERSONNEL ONLY</div>
          <div className="control-unlock-row">
            <input
              type="password"
              placeholder="Enter control password"
              value={controlPasswordInput}
              onChange={(e) => setControlPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") unlockControls();
              }}
            />
            <button onClick={unlockControls}>Unlock Controls</button>
          </div>
        </div>
      )}




     {page === "dashboard" && <DashboardPage ctx={pageContext} />}

      {page === "live" && controlsUnlocked && <LivePage ctx={pageContext} />}

      {page === "daily" && controlsUnlocked && <DailyPage ctx={pageContext} />}

      {page === "bracket" && <BracketPage ctx={pageContext} />}

      {page === "standings" && <StandingsPage ctx={pageContext} />}

      {page === "quick" && controlsUnlocked && <QuickPage ctx={pageContext} />}

      {page === "history" && <HistoryPage ctx={pageContext} />}
      {page === "records" && <LeagueRecordsPage ctx={pageContext} />}
      {page === "news" && <NewsPage ctx={pageContext} />}
      {page === "v4" && <V4CenterPage ctx={pageContext} />}
      {page === "fandom" && <FandomPage ctx={pageContext} />}
      {page === "league" && <LeagueHubPage ctx={pageContext} />}
      {page === "office" && controlsUnlocked && <ModeratorHubPage ctx={pageContext} />}
      {page === "bracketAdmin" && controlsUnlocked && <BracketAdminPage ctx={pageContext} />}

      {page === "admin" && controlsUnlocked && <AdminPage ctx={pageContext} />}
    </div>
  );
}
