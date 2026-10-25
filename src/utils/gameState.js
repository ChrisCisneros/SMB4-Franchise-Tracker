import { DAILY_ROWS, LEGACY_STORAGE_KEYS, MAX_PLAY_LOG, STORAGE_KEY } from "../config/constants";
import { defaultPlayoffBracket, makeSafePlayoffBracket } from "./playoffUtils";

export const emptyDailyRow = () => ({
  id: crypto.randomUUID(),
  awayTeamId: "",
  homeTeamId: "",
  awayScore: "",
  homeScore: "",
  applied: false,
});

export const defaultFieldState = () => ({
  ball: {
    x: 50,
    y: 86,
    visible: false,
    result: "HIT",
    eventId: 0,
  },
  runnerEvent: null,
});

export const defaultCurrentGame = () => ({
  date: new Date().toISOString().slice(0, 10),
  awayTeamId: "",
  homeTeamId: "",
  awayScore: 0,
  homeScore: 0,
  awayHits: 0,
  homeHits: 0,
  awayErrors: 0,
  homeErrors: 0,
  inning: 1,
  half: "Top",
  outs: 0,
  balls: 0,
  strikes: 0,
  bases: { first: false, second: false, third: false },
  fieldState: defaultFieldState(),
  status: "Not Started",
  gameType: "regular",
playoffSeriesId: "",
  awayLook: { mode: "primary", index: 0 },
  homeLook: { mode: "primary", index: 0 },
  inningStatus: "",
  awayPitchCount: 0,
  homePitchCount: 0,
  awayChallenges: 2,
  homeChallenges: 2,
  awayLineup: Array(9).fill(""),
  homeLineup: Array(9).fill(""),
  awayPositions: ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
  homePositions: ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
  awayPitcherId: "",
  homePitcherId: "",
  awayPitcherHistory: [],
  homePitcherHistory: [],
  awayBatterIndex: 0,
  homeBatterIndex: 0,
  awayInnings: Array(15).fill(0),
  homeInnings: Array(15).fill(0),
  playLog: [],
  latestPlay: "No play recorded yet.",
  lastAnnouncement: "No scoring update yet.",
bigMomentText: "",
bigMomentSide: "neutral",
bigMomentId: 0,
history: [],
});

export const defaultData = {
  leagues: ["AL", "NL"],
  divisions: ["East", "Central", "West"],
  teams: [],
  players: [],
  games: [],
  lastFinalGame: null,
  dailyResultsDate: new Date().toISOString().slice(0, 10),
  dailyResultsRows: Array.from({ length: DAILY_ROWS }, emptyDailyRow),
  runsScored: 0,
  runsAllowed: 0,
  currentGame: defaultCurrentGame(),

  playoffBracket: defaultPlayoffBracket(),
  seasonHistory: [],
  activeSeasonName: "Season 4",
  leagueExtras: {
    awards: [], hallOfFame: [], transactions: [], injuries: [], managers: [],
    rebrands: [], retiredNumbers: [], prospects: [], milestones: [],
    openingDay: "", seasonTagline: "", powerRankSnapshots: []
  },
};



export function safeCloneSnapshot(game) {
  return {
    ...game,
    bases: { ...game.bases },
    fieldState: {
      ...defaultFieldState(),
      ...(game.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(game.fieldState?.ball || {}),
      },
      runnerEvent: game.fieldState?.runnerEvent ? { ...game.fieldState.runnerEvent } : null,
    },
    awayLineup: [...game.awayLineup],
    homeLineup: [...game.homeLineup],
    awayPositions: [...game.awayPositions],
    homePositions: [...game.homePositions],
    awayPitcherHistory: [...game.awayPitcherHistory],
    homePitcherHistory: [...game.homePitcherHistory],
    awayInnings: [...game.awayInnings],
    homeInnings: [...game.homeInnings],
    playLog: [...game.playLog].slice(0, MAX_PLAY_LOG),
    history: [],
  };
}

export function makeSafeGame(game) {
  const merged = {
    ...defaultCurrentGame(),
    ...game,
    bases: game?.bases || { first: false, second: false, third: false },
    fieldState: {
      ...defaultFieldState(),
      ...(game?.fieldState || {}),
      ball: {
        ...defaultFieldState().ball,
        ...(game?.fieldState?.ball || {}),
      },
      runnerEvent: game?.fieldState?.runnerEvent ? { ...game.fieldState.runnerEvent } : null,
    },
    awayLineup: game?.awayLineup || Array(9).fill(""),
    homeLineup: game?.homeLineup || Array(9).fill(""),
    awayPositions: game?.awayPositions || ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
    homePositions: game?.homePositions || ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
    awayPitcherHistory: game?.awayPitcherHistory || [],
    homePitcherHistory: game?.homePitcherHistory || [],
    awayInnings: game?.awayInnings || Array(15).fill(0),
    homeInnings: game?.homeInnings || Array(15).fill(0),
    playLog: game?.playLog || [],
    history: game?.history || [],
  };
  return merged;
}

export function addPitchToCurrentPitcher(game) {
  if (game.half === "Top") {
    game.homePitchCount = Number(game.homePitchCount || 0) + 1;
  } else {
    game.awayPitchCount = Number(game.awayPitchCount || 0) + 1;
  }
}
export function getInitialData() {
  try {
    const keysToTry = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keysToTry) {
      const saved = localStorage.getItem(key);
      if (!saved) continue;
      const parsed = JSON.parse(saved);
      return {
  ...defaultData,
  ...parsed,
  currentGame: makeSafeGame(parsed.currentGame),
  playoffBracket: makeSafePlayoffBracket(parsed.playoffBracket),
  dailyResultsRows: parsed.dailyResultsRows?.length ? parsed.dailyResultsRows : Array.from({ length: DAILY_ROWS }, emptyDailyRow),
  activeSeasonName: parsed.activeSeasonName || defaultData.activeSeasonName,
  leagueExtras: { ...defaultData.leagueExtras, ...(parsed.leagueExtras || {}) },
  games: Array.isArray(parsed.games) ? parsed.games : [],
};
    }
    return defaultData;
  } catch {
    return defaultData;
  }
}

