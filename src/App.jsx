
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { db } from "./firebase";
import { onValue, ref, set } from "firebase/database";
const STORAGE_KEY = "franchise-tracker-bugfix-v1";
const CONTROL_PASSWORD = "changeme";
const LEGACY_STORAGE_KEYS = [];




const TEAM_COLOR_BASE_MAP = {
  ARI: { primary: "#A71930", accent: "#E3D4AD" },
  ATL: { primary: "#CE1141", accent: "#13274F" },
  BAL: { primary: "#DF4601", accent: "#000000" },
  BOS: { primary: "#BD3039", accent: "#0C2340" },
  CHC: { primary: "#0E3386", accent: "#CC3433" },
  CWS: { primary: "#111111", accent: "#C4CED4" },
  CIN: { primary: "#C6011F", accent: "#000000" },
  CLE: { primary: "#0C2340", accent: "#E31937" },
  COL: { primary: "#333366", accent: "#C4CED4" },
  DET: { primary: "#0C2340", accent: "#FA4616" },
  HOU: { primary: "#002D62", accent: "#EB6E1F" },
  KC: { primary: "#004687", accent: "#BD9B60" },
  LAA: { primary: "#BA0021", accent: "#003263" },
  LAD: { primary: "#005A9C", accent: "#FFFFFF" },
  MIA: { primary: "#00A3E0", accent: "#EF3340" },
  MIL: { primary: "#12284B", accent: "#FFC52F" },
  MIN: { primary: "#002B5C", accent: "#D31145" },
  NYM: { primary: "#002D72", accent: "#FF5910" },
  NYY: { primary: "#132448", accent: "#C4CED3" },
  OAK: { primary: "#003831", accent: "#EFB21E" },
  PHI: { primary: "#E81828", accent: "#002D72" },
  PIT: { primary: "#27251F", accent: "#FDB827" },
  SD: { primary: "#2F241D", accent: "#FFC425" },
  SEA: { primary: "#0C2C56", accent: "#005C5C" },
  SF: { primary: "#FD5A1E", accent: "#27251F" },
  STL: { primary: "#C41E3A", accent: "#0C2340" },
  TB: { primary: "#092C5C", accent: "#8FBCE6" },
  TEX: { primary: "#003278", accent: "#C0111F" },
  TOR: { primary: "#134A8E", accent: "#E8291C" },
  WSH: { primary: "#AB0003", accent: "#14225A" },
};

const TEAM_COLORS = Object.fromEntries(
  Object.entries(TEAM_COLOR_BASE_MAP).map(([abbr, colors]) => [
    abbr,
    {
      primary: {
        main: colors.primary,
        alt: colors.accent,
        text: "#FFFFFF",
      },
      alternates: [],
      cityConnect: null,
      extras: [],
    },
  ])
);

// Put your team-specific overrides directly below, like this:
// Put your team-specific overrides directly below, like this:








TEAM_COLORS.ATH = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#f5d01b", text: "#2e700f", gradient:false},
  alternates: [
    { name: "Yellow Alt", main: "#f5d01b", alt: "#ffffff", text: "#2e700f" },{ name: "Away", main: "#adadad", alt: "#f5d01b", text: "#2e700f" }
  ]
};
TEAM_COLORS.ATL = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#8c1204", text: "#01105c", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#01105c", alt: "#8c1204", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#8c1204", text: "#01105c" }
  ],
  cityConnect: { main: "#0349a3", alt: "#01105c", border: "#8c1204", text: "#ffffff", gradient:false},
};
TEAM_COLORS.AZ = {
  primary: {main: "#ffffff", alt: "#730606", border: "#02ebeb", text: "#730606", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#02ebeb", text: "#730606" },{ name: "Red Alt", main: "#730606", alt: "#02ebeb", text: "#02ebeb" },{ name: "Away", main: "#adadad", alt: "#02ebeb", text: "#730606" }
  ],
  cityConnect: { main: "#25026b", alt: "#000000", border: "#02ebeb", text: "#02ebeb", gradient:true},
};
TEAM_COLORS.BAL = {
  primary: {main: "#d94804", alt: "#e3ac17", border: "#000000", text: "#ffffff", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#d94804", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#000000", text: "#d94804" }
  ],
  cityConnect: { main: "#fcf4e3", alt: "#021059", border: "#294d2d", text: "#d94804", gradient:false},
};
TEAM_COLORS.BOS = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#b0110e", text: "#010238", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#b0110e", alt: "#010238", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#b0110e", text: "#ffffff" }
  ],
  cityConnect: { main: "#2c5443", alt: "#021059", border: "#dbc70d", text: "#ffffff", gradient:false},
};
TEAM_COLORS.CHC = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#0442b5", text: "#c40404", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#0442b5", alt: "#c40404", text: "#ffffff" },{ name: "Powder Alt", main: "#6dc1f2", alt: "#c40404", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#0442b5", text: "#c40404" }
  ],
  cityConnect: { main: "#000324", alt: "#021059", border: "#6dc1f2", text: "#ffffff", gradient:false},
};
TEAM_COLORS.CIN = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#c40404", text: "#c40404", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#c40404", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#c40404", text: "#c40404" }
  ],
  cityConnect: { main: "#262626", alt: "#ba4404", border: "#c40404", text: "#590101", gradient:false},
};
TEAM_COLORS.CLE = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#b0110e", text: "#000324", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#000324", alt: "#ffffff", text: "#b0110e" }, { name: "Red Alt", main: "#b0110e", alt: "#ffffff", text: "#000324" },{ name: "Away", main: "#adadad", alt: "#b0110e", text: "#000324" }
  ],
  cityConnect: { main: "#1a1c36", alt: "#021059", border: "#b0110e", text: "#c2b8ab", gradient:false},
};
TEAM_COLORS.COL = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#220154", text: "#000000", gradient:false},
  alternates: [
    { name: "Purple Alt", main: "#220154", alt: "#000000", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#220154", text: "#ffffff" }
  ],
  cityConnect: { main: "#387bba", alt: "#021059", border: "#ed1cb2", text: "#cf9a0a", gradient:false},
};
TEAM_COLORS.CWS = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#000000", text: "#000000", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#ffffff", text: "#000000" }
  ],
  cityConnect: { main: "#8a0601", alt: "#021059", border: "#000000", text: "#ffffff", gradient:false},
};
TEAM_COLORS.DET = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#010017", text: "#cf5804", gradient:false},
  alternates:[
    { name: "Away", main: "#adadad", alt: "#010017", text: "#cf5804" }
  ],
  cityConnect: { main: "#020133", alt: "#082aa3", border: "#FFFFFF", text: "#ffffff", gradient:true},
};
TEAM_COLORS.HOU = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#010440", text: "#cf6802", gradient:false},
  alternates: [
    { name: "Orange Alt", main: "#cf6802", alt: "#ffffff", text: "#010440" }, { name: "Blue Alt", main: "#010440", alt: "#ffffff", text: "#cf6802" },{ name: "Away", main: "#adadad", alt: "#010440", text: "#cf6802" }
  ],
  cityConnect: { main: "#cf6802", alt: "#eba967", border: "#ffffff", text: "#ffffff", gradient:true},
};
TEAM_COLORS.KC = {
  primary: {main: "#ffffff", alt: "#001b85", border: "#001b85", text: "#001b85", gradient:false},
  alternates: [
    { name: "Powder Alt", main: "#59b3eb", alt: "#ffffff", text: "#ffffff" }, { name: "Blue Alt", main: "#001b85", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#001b85", text: "#001b85" }
  ],
  cityConnect: { main: "#a904c9", alt: "#023eb5", border: "#ffffff", text: "#ffffff", gradient:true},
};TEAM_COLORS.LAA = {
  primary: {main: "#ffffff", alt: "#a30303", border: "#000679", text: "#a30303", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#a30303", alt: "#000679", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#a30303", text: "#000679" }
  ],
  cityConnect: { main: "#fdfaf2", alt: "#a30303", border: "#a30303", text: "#a30303", gradient:false},
};
TEAM_COLORS.LAD = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#001994", text: "#001994", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#001994", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#001994", text: "#001994" }
  ],
  cityConnect: { main: "#3952cc", alt: "#021059", border: "#6b83fa", text: "#ffffff", gradient:true},
};
TEAM_COLORS.MIA = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#0e80cc", text: "#000000", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#0e80cc", alt: "#c201c2", text: "#ffffff" }, { name: "Black Alt", main: "#000000", alt: "#0e80cc", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#0e80cc", text: "#0e80cc" }
  ],
  cityConnect: { main: "#0e80cc", alt: "#c201c2", border: "#7429bb", text: "#ffffff", gradient:true},
};
TEAM_COLORS.MIL = {
  primary: {main: "#fcf0e3", alt: "#e3ac17", border: "#fffb1d", text: "#010041", gradient:false},
  alternates: [
    { name: "White Alt", main: "#ffffff", alt: "#fffb1d", text: "#010041" }, { name: "Blue  Alt", main: "#010041", alt: "#fffb1d", text: "#fffb1d" },{ name: "Away", main: "#adadad", alt: "#fffb1d", text: "#010041" }
  ],
  cityConnect: { main: "#268bce", alt: "#fffb1d", border: "#fffb1d", text: "#fffb1d", gradient:false},
};
TEAM_COLORS.MIN = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#00063b", text: "#d30000", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#00063b", alt: "#d30000", text: "##ffffff" }, { name: "Cream Alt", main: "#fff9f3", alt: "#00063b", text: "#00063b" },{ name: "Away", main: "#adadad", alt: "#d30000", text: "#00063b" }
  ],
  cityConnect: { main: "#0044d8", alt: "#00012e", border: "#f0d800", text: "#ffffff", gradient:true},
};
TEAM_COLORS.NYM = {
  primary: {main: "#0d0d6e", alt: "#ed5f07", border: "#ed5f07", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#ffffff", alt: "#ed5f07", text: "#0d0d6e" },{ name: "Away", main: "#adadad", alt: "#0d0d6e", text: "#ed5f07" }
  ],
  cityConnect: { main: "#454545", alt: "#ba4404", border: "#000000", text: "#ffffff", gradient:false},
};
TEAM_COLORS.NYY = {
  primary: {main: "#ffffff", alt: "#00093a", border: "#00093a", text: "#00093a", gradient:false},
  alternates: [
    { name: "Away", main: "#adadad", alt: "#00093a", text: "#00093a" }
  ],
  
};
TEAM_COLORS.PHI = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#a60000", text: "#a60000", gradient:false},
  alternates: [
    { name: "Powder Blue", main: "#388dc2", alt: "#a60000", text: "#ffffff" },
    {name: "Red", main: "#a60000", alt: "#110982", text: "#ffffff"},{ name: "Away", main: "#adadad", alt: "#a60000", text: "#a60000" }
  ],
  cityConnect: { main: "#0782ab", alt: "#020a4d", border: "#e6d437", text: "#ffffff", gradient:true},
};
TEAM_COLORS.PIT = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#e3ac17", text: "#000000", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#e3ac17", text: "#e3ac17" },{ name: "Away", main: "#adadad", alt: "#e3ac17", text: "#000000" }
  ],
  cityConnect: { main: "#e3ac17", alt: "#000000", border: "#000000", text: "#000000", gradient:false},
};
TEAM_COLORS.SD = {
  primary: {main: "#302505", alt: "#e3ac17", border: "#e3ac17", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#9e8259", alt: "#e3ac17", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#302505", text: "#e3ac17" }
  ],
  cityConnect: { main: "#06113d", alt: "#ba4404", border: "#ba4404", text: "#ffffff", gradient:false},
};
TEAM_COLORS.SEA = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#106b4a", text: "#010046", gradient:false},
  alternates: [
    { name: "Cream  Alt", main: "#fffdfa", alt: "#e6e200", text: "#010046" }, { name: "Teal  Alt", main: "#106b4a", alt: "#010046", text: "#fffdfa" },{ name: "Away", main: "#adadad", alt: "#106b4a", text: "#010046" }
  ],
  cityConnect: { main: "#001c8b", alt: "#ba4404", border: "#e6e200", text: "#e6e200", gradient:false},
};
TEAM_COLORS.SF = {
  primary: { main: "#fcf5eb", alt: "#000000", border:"#FD5a1e", text: "#000000" , gradient: false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#FD5A1E", text: "#FFFFFF" }, { name: "Orange Alt", main: "#FD5A1E", alt: "#000000", border:"#27251F", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#FD5A1E", text: "#000000" }
  ],
  cityConnect: { main: "#FD5A1E", alt: "#29097a", border: "#1a0354", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.STL = {
  primary: { main: "#ffffff", alt: "#000000", border:"#d60000", text: "#d60000" , gradient: false},
  alternates: [
    { name: "Cream Alt", main: "#fffbf5", alt: "#d60000", text: "#d60000" }, { name: "Powder Alt", main: "#38a1d1", alt: "#d60000", border:"#d60000", text: "#d60000" , gradient: false },{ name: "Away", main: "#adadad", alt: "#d60000", text: "#d60000" }
  ],
  cityConnect: { main: "#d60000", alt: "#29097a", border: "#740101", text: "#FFFFFF", gradient:false },
  extras: [],
};
TEAM_COLORS.TB = {
  primary: { main: "#ffffff", alt: "#000000", border:"#0077d8", text: "#040041" , gradient: false},
  alternates: [
    { name: "Powder Alt", main: "#0077d8", alt: "#f1da09", text: "#FFFFFF" }, { name: "Devil Alt", main: "#0077d8", alt: "#f1da09", border:"#040041", text: "#FFFFFF" , gradient: true },{ name: "Away", main: "#adadad", alt: "#0077d8", text: "#0077d8" }
  ],
  cityConnect: { main: "#52f36d", alt: "#0077d8", border: "#040041", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.TEX = {
  primary: { main: "#ffffff", alt: "#000c42", border:"#db0000", text: "#000c42" , gradient: false},
  alternates: [
    { name: "Powder Alt", main: "#55bcec", alt: "#000c42", text: "#FFFFFF" }, { name: "Blue Alt", main: "#000c42", alt: "#000000", border:"#db0000", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#db0000", text: "#000c42" }
  ],
  cityConnect: { main: "#fff5d8", alt: "#29097a", border: "#000c42", text: "#db0000", gradient:false },
  extras: [],
};
TEAM_COLORS.TOR = {
  primary: { main: "#ffffff", alt: "#000000", border:"#0026ff", text: "#0026ff" , gradient: false},
  alternates: [
    { name: "Blue Alt", main: "#0026ff", alt: "#ffffff", text: "#FFFFFF" }, { name: "Powder Alt", main: "#4bace4", alt: "#000000", border:"#0026ff", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#0026ff", text: "#0026ff" }
  ],
  cityConnect: { main: "#f50303", alt: "#0026ff", border: "#f50303", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.WSH = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#cf0c0c", text: "#04003b", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#04003b", alt: "#cf0c0c", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#8c1204", text: "#8c1204" }
  ],
  cityConnect: { main: "#44679e", alt: "#ba04b1", border: "#162133", text: "#ffffff", gradient:false},
};


function getAvailableLooks(abbr) {
  const team = TEAM_COLORS[abbr];
  if (!team) return [{ mode: "primary", index: 0, label: "Primary" }];

  const looks = [{ mode: "primary", index: 0, label: "Primary" }];

  if (team.cityConnect) {
    looks.push({ mode: "cityConnect", index: 0, label: "City Connect" });
  }

  (team.alternates || []).forEach((alt, index) => {
    looks.push({
      mode: "alternate",
      index,
      label: alt?.name || `Alt ${index + 1}`,
    });
  });

  (team.extras || []).forEach((extra, index) => {
    looks.push({
      mode: "extra",
      index,
      label: extra?.name || `Extra ${index + 1}`,
    });
  });

  return looks;
}

function getTeamColorsByAbbr(abbr, themeMode = "primary", variantIndex = 0) {
  const fallback = {
    main: "#071739",
    alt: "#2f66ff",
    border: "#2f66ff",
    text: "#FFFFFF",
    gradient: false,
    name: "Primary",
  };
  if (!abbr || !TEAM_COLORS[abbr]) return fallback;
  const team = TEAM_COLORS[abbr];

  const normalize = (colors) => ({
    main: colors?.main || fallback.main,
    alt: colors?.alt || colors?.main || fallback.alt,
    border: colors?.border || colors?.alt || colors?.main || fallback.border,
    text: colors?.text || fallback.text,
    gradient: Boolean(colors?.gradient),
    name: colors?.name || "Primary",
  });

  if (themeMode === "cityConnect") return normalize(team.cityConnect || team.primary || fallback);
  if (themeMode === "alternate") return normalize(team.alternates?.[variantIndex] || team.primary || fallback);
  if (themeMode === "extra") return normalize(team.extras?.[variantIndex] || team.primary || fallback);
  return normalize(team.primary || fallback);
}
const DAILY_ROWS = 15;
const MAX_HISTORY = 40;
const MAX_PLAY_LOG = 120;
const POSITION_OPTIONS = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];

const emptyDailyRow = () => ({
  id: crypto.randomUUID(),
  awayTeamId: "",
  homeTeamId: "",
  awayScore: "",
  homeScore: "",
  applied: false,
});

const defaultCurrentGame = () => ({
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
  status: "Not Started",
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
  history: [],
});

const defaultData = {
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
};

function safeCloneSnapshot(game) {
  return {
    ...game,
    bases: { ...game.bases },
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

function makeSafeGame(game) {
  const merged = {
    ...defaultCurrentGame(),
    ...game,
    bases: game?.bases || { first: false, second: false, third: false },
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

function addPitchToCurrentPitcher(game) {
  if (game.half === "Top") {
    game.homePitchCount = Number(game.homePitchCount || 0) + 1;
  } else {
    game.awayPitchCount = Number(game.awayPitchCount || 0) + 1;
  }
}
function getInitialData() {
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
        dailyResultsRows: parsed.dailyResultsRows?.length ? parsed.dailyResultsRows : Array.from({ length: DAILY_ROWS }, emptyDailyRow),
      };
    }
    return defaultData;
  } catch {
    return defaultData;
  }
}



function pct(wins, losses) {
  const total = wins + losses;
  if (!total) return ".000";
  return (wins / total).toFixed(3).replace("0.", ".");
}

function gamesBack(team, leader) {
  if (!leader || team.id === leader.id) return "—";
  const gb = ((leader.wins - team.wins) + (team.losses - leader.losses)) / 2;
  return gb.toFixed(1).replace(".0", "");
}

function sortTeams(teams) {
  return [...teams].sort((a, b) => {
    const aPct = a.wins + a.losses ? a.wins / (a.wins + a.losses) : 0;
    const bPct = b.wins + b.losses ? b.wins / (b.wins + b.losses) : 0;
    if (bPct !== aPct) return bPct - aPct;
    return (b.runDiff || 0) - (a.runDiff || 0);
  });
}

function teamLabel(team) {
  return team ? `${team.city} ${team.name}` : "";
}

function teamOptionLabel(team) {
  return team ? `${team.abbr} — ${team.name}` : "";
}

function winningPctValue(team) {
  const wins = Number(team.wins || 0);
  const losses = Number(team.losses || 0);
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

function sortStandingsTeams(list) {
  return [...list].sort((a, b) => {
    const pctDiff = winningPctValue(b) - winningPctValue(a);
    if (pctDiff !== 0) return pctDiff;

    const winDiff = Number(b.wins || 0) - Number(a.wins || 0);
    if (winDiff !== 0) return winDiff;

    const rdDiff = Number(b.runDiff || 0) - Number(a.runDiff || 0);
    if (rdDiff !== 0) return rdDiff;

    return String(a.abbr || "").localeCompare(String(b.abbr || ""));
  });
}

function formatHalfGame(value) {
  const abs = Math.abs(value);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

function wildCardGamesBack(team, cutoffTeam, index) {
  if (!team || !cutoffTeam) return "—";

  // 3rd wild card is the cutoff line
  if (index === 2) return "—";

  const raw =
    ((Number(cutoffTeam.wins || 0) - Number(team.wins || 0)) +
      (Number(team.losses || 0) - Number(cutoffTeam.losses || 0))) /
    2;

  // Top 2 WC teams are ahead of the cutoff, so show +0.5 / +1 / etc.
  if (index < 2) {
    return raw < 0 ? `+${formatHalfGame(raw)}` : "—";
  }

  // Teams below cutoff show how far back they are
  return raw > 0 ? formatHalfGame(raw) : "—";
}

function gamesBackRaw(team, leader) {
  if (!team || !leader) return 0;

  const leaderWins = Number(leader.wins || 0);
  const leaderLosses = Number(leader.losses || 0);
  const teamWins = Number(team.wins || 0);
  const teamLosses = Number(team.losses || 0);

  return ((leaderWins - teamWins) + (teamLosses - leaderLosses)) / 2;
}

function formatGamesBack(team, leader) {
  const gb = gamesBackRaw(team, leader);

  if (gb <= 0) return "—";
  return Number.isInteger(gb) ? String(gb) : gb.toFixed(1);
}

function eliminationNumber(team, target, gamesPerSeason = 162) {
  if (!team || !target) return "—";

  const teamWins = Number(team.wins || 0);
  const targetLosses = Number(target.losses || 0);

  const number = gamesPerSeason + 1 - teamWins - targetLosses;

  return number <= 0 ? "E" : number;
}

function getTeamColors(team) {
  const defaults = { primary: "#071739", accent: "#2f66ff" };
  if (!team?.abbr) return defaults;
  const map = {
    ARI: { primary: "#A71930", accent: "#E3D4AD" },
    ATL: { primary: "#CE1141", accent: "#13274F" },
    BAL: { primary: "#DF4601", accent: "#000000" },
    BOS: { primary: "#BD3039", accent: "#0C2340" },
    CHC: { primary: "#0E3386", accent: "#CC3433" },
    CWS: { primary: "#111111", accent: "#C4CED4" },
    CIN: { primary: "#C6011F", accent: "#000000" },
    CLE: { primary: "#0C2340", accent: "#E31937" },
    COL: { primary: "#333366", accent: "#C4CED4" },
    DET: { primary: "#0C2340", accent: "#FA4616" },
    HOU: { primary: "#002D62", accent: "#EB6E1F" },
    KC: { primary: "#004687", accent: "#BD9B60" },
    LAA: { primary: "#BA0021", accent: "#003263" },
    LAD: { primary: "#005A9C", accent: "#FFFFFF" },
    MIA: { primary: "#00A3E0", accent: "#EF3340" },
    MIL: { primary: "#12284B", accent: "#FFC52F" },
    MIN: { primary: "#002B5C", accent: "#D31145" },
    NYM: { primary: "#002D72", accent: "#FF5910" },
    NYY: { primary: "#132448", accent: "#C4CED3" },
    OAK: { primary: "#003831", accent: "#EFB21E" },
    PHI: { primary: "#E81828", accent: "#002D72" },
    PIT: { primary: "#27251F", accent: "#FDB827" },
    SD: { primary: "#2F241D", accent: "#FFC425" },
    SEA: { primary: "#0C2C56", accent: "#005C5C" },
    SF: { primary: "#FD5A1E", accent: "#27251F" },
    STL: { primary: "#C41E3A", accent: "#0C2340" },
    TB: { primary: "#092C5C", accent: "#8FBCE6" },
    TEX: { primary: "#003278", accent: "#C0111F" },
    TOR: { primary: "#134A8E", accent: "#E8291C" },
    WSH: { primary: "#AB0003", accent: "#14225A" },
  };
  return map[team.abbr] || defaults;
}

function getLastNameSortValue(name) {
  return String(name || "").trim().split(/\s+/).slice(-1)[0]?.toLowerCase() || "";
}

function getDisplayGameState(currentGame, inningBanner) {
  if (currentGame.status === "Final") {
    return `F/${currentGame.inning}`;
  }
  if (currentGame.status === "Not Started") {
    return "Warmup";
  }
  if (currentGame.inningStatus) {
    return currentGame.inningStatus;
  }
  if (inningBanner) {
    return inningBanner;
  }
  return `${currentGame.half} ${currentGame.inning}`;
}

function renderInningCell(side, inningNumber, currentGame) {
  const value = side === "away" ? currentGame.awayInnings[inningNumber - 1] : currentGame.homeInnings[inningNumber - 1];
  if (currentGame.status === "Final") return value === 0 ? "0" : String(value);
  if (inningNumber < currentGame.inning) return value === 0 ? "0" : String(value);
  if (inningNumber > currentGame.inning) return "";
  if (side === "away") return value === 0 ? "0" : String(value);
  if (currentGame.half === "Bottom") return value === 0 ? "0" : String(value);
  return "";
}

function BaseDiamond({ bases }) {
  return (
    <div className="diamond-wrap">
      <div className={`base second ${bases.second ? "occupied" : ""}`}></div>
      <div className={`base first ${bases.first ? "occupied" : ""}`}></div>
      <div className={`base third ${bases.third ? "occupied" : ""}`}></div>
      <div className="base home occupied home-plate"></div>
    </div>
  );
}

function ChallengeBars({ count }) {
  const safe = Math.max(0, Math.min(2, Number(count) || 0));

  return (
    <div className="challenge-bars">
      <span className={`challenge-bar ${safe >= 1 ? "is-on" : "is-off"}`}></span>
      <span className={`challenge-bar ${safe >= 2 ? "is-on" : "is-off"}`}></span>
    </div>
  );
}



function CountControls({ currentGame, updateCount, incrementPitchCount }) {
  const activePitchCount = currentGame.half === "Top" ? currentGame.homePitchCount : currentGame.awayPitchCount;

  return (
    <div className="single-line-counts">
      <div className="compact-count-card">
        <div className="count-card-title">Balls</div>
        <div className="stacked-counter">
          <button onClick={() => updateCount("balls", 1)}>+</button>
          <div className="counter-value">{currentGame.balls}</div>
          <button onClick={() => updateCount("balls", -1)}>-</button>
        </div>
      </div>

      

      <div className="compact-count-card strike-card">
        <div className="count-card-title">Strikes</div>
        <div className="strike-action-grid">
          <button onClick={() => updateCount("swinging", 1)}>Swinging</button>
          <button onClick={() => updateCount("called", 1)}>Called</button>
          <button onClick={() => updateCount("foul", 1)}>Foul</button>
          <button onClick={() => updateCount("strikes", -1)} className="danger-lite">- Strike</button>
        </div>
        <div className="counter-value big-counter">{currentGame.strikes}</div>
        <div className="count-card-subtitle">Pitch Count</div>
        <div className="pitch-count-row">
          <button onClick={() => incrementPitchCount(-1)}>-</button>
          <div className="counter-value pitch-counter">{activePitchCount}</div>
          <button onClick={() => incrementPitchCount(1)}>+</button>
          <button onClick={() => incrementPitchCount(5)}>+5</button>
        </div>
      </div>

      <div className="compact-count-card">
        <div className="count-card-title">Outs</div>
        <div className="stacked-counter">
          <button onClick={() => updateCount("outs", 1)}>+</button>
          <div className="counter-value">{currentGame.outs}</div>
          <button onClick={() => updateCount("outs", -1)}>-</button>
        </div>
      </div>
    </div>
  );
}

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
  const channelRef = useRef(null);
  const hasLoadedFirebaseGame = useRef(false);
  const hasLoadedFirebaseTeams = useRef(false);
  const hasLoadedFirebasePlayers = useRef(false);
const [prevScore, setPrevScore] = useState({ away: 0, home: 0 });
const [scoreFlashSide, setScoreFlashSide] = useState(null);
const [winningPitcherId, setWinningPitcherId] = useState("");
const [losingPitcherId, setLosingPitcherId] = useState("");

  function syncTeamsToFirebase(nextTeams) {
    set(ref(db, "teams"), nextTeams).catch((error) => {
      console.error("[Firebase Debug] WRITE teams failed", error);
    });
  }

  function syncPlayersToFirebase(nextPlayers) {
    set(ref(db, "players"), nextPlayers).catch((error) => {
      console.error("[Firebase Debug] WRITE players failed", error);
    });
  }


  

  useEffect(() => {
    const safeData = {
      ...data,
      currentGame: {
        ...data.currentGame,
        history: (data.currentGame.history || []).slice(-MAX_HISTORY),
        playLog: (data.currentGame.playLog || []).slice(0, MAX_PLAY_LOG),
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch (error) {
      try {
        const smallerData = {
          ...safeData,
          currentGame: {
            ...safeData.currentGame,
            history: [],
            playLog: (safeData.currentGame.playLog || []).slice(0, 40),
          },
          games: (safeData.games || []).slice(0, 200),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(smallerData));
      } catch {}
    }

    if (channelRef.current) {
      channelRef.current.postMessage(safeData);
    }
  }, [data]);


  useEffect(() => {
    let channel = null;

    const handleStorageSync = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setData((prev) => {
  const resetPlayers = prev.players.map((player) => ({
    ...player,
    ab: 0,
    hits: 0,
    lastAB: "",
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
        } catch {}
      }
    };

    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("franchise_tracker_live_sync");
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (!event.data) return;
        setData((prev) => {
          const prevStr = JSON.stringify(prev);
          const nextStr = JSON.stringify(event.data);
          return prevStr === nextStr
            ? prev
            : {
                ...prev,
                ...event.data,
                currentGame: makeSafeGame(event.data.currentGame),
              };
        });
      };
    }

    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
      if (channel) channel.close();
      channelRef.current = null;
    };
  }, []);

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
    const teamsRef = ref(db, "teams");
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const value = snapshot.val();

      if (!Array.isArray(value)) {
        hasLoadedFirebaseTeams.current = true;
        return;
      }

      setData((prev) => ({
        ...prev,
        teams: value,
      }));
      hasLoadedFirebaseTeams.current = true;
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const playersRef = ref(db, "players");
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const value = snapshot.val();

      if (!Array.isArray(value)) {
        hasLoadedFirebasePlayers.current = true;
        return;
      }

      setData((prev) => ({
        ...prev,
        players: value,
      }));
      hasLoadedFirebasePlayers.current = true;
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const gameRef = ref(db, "currentGame");
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const value = snapshot.val();

      if (!value) {
        hasLoadedFirebaseGame.current = true;
        return;
      }

      setData((prev) => ({
        ...prev,
        currentGame: makeSafeGame(value),
      }));
      hasLoadedFirebaseGame.current = true;
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasLoadedFirebaseGame.current) return;
    const gameRef = ref(db, "currentGame");
    set(gameRef, makeSafeGame(data.currentGame)).catch((error) => {
      console.error("[Firebase Debug] WRITE currentGame failed", error);
    });
  }, [data.currentGame]);


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

  const teams = data.teams;
  const players = data.players;
  const sortedTeams = [...teams].sort((a, b) => a.abbr.localeCompare(b.abbr) || a.name.localeCompare(b.name));
  const numberedTeams = sortedTeams.map((team, index) => ({ ...team, listNumber: index + 1 }));
  const teamNumberLookup = Object.fromEntries(numberedTeams.map((team) => [String(team.listNumber), team.id]));
  const teamAbbrLookup = Object.fromEntries(numberedTeams.map((team) => [team.abbr.toUpperCase(), team.id]));
  const currentGame = makeSafeGame(data.currentGame);
  const protectedPages = ["live", "daily", "quick", "admin"];
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
const battingLineup = battingSide === "away" ? currentGame.awayLineup : currentGame.homeLineup;
const battingIndex = battingSide === "away" ? currentGame.awayBatterIndex : currentGame.homeBatterIndex;

const nextBattingTeam = nextBattingSide === "away" ? awayTeam : homeTeam;
const nextBattingLineup = nextBattingSide === "away" ? currentGame.awayLineup : currentGame.homeLineup;
const nextBattingIndex = nextBattingSide === "away" ? currentGame.awayBatterIndex : currentGame.homeBatterIndex;

const battingLineupPlayers = battingLineup
  .map((playerId, index) => ({
player: players.find((player) => player.id === playerId),
    index,
  }))
  .filter((item) => item.player);

const dueUpBatters = [0, 1, 2]
  .map((offset) => {
    const playerId = nextBattingLineup[(nextBattingIndex + offset) % 9];
    return players.find((player) => player.id === playerId);
  })
  .filter(Boolean);


  const fieldingPitcher = currentGame.half === "Top" ? currentHomePitcher : currentAwayPitcher;
  const displayGameState = getDisplayGameState(currentGame, inningBanner);
  const combinedCountText = `${currentGame.balls}-${currentGame.strikes}, ${currentGame.outs} outs`;


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

  const divisionLeaderIds = new Set(divisionLeaders.map((team) => team.id));

  const wildcardTeams = sortStandingsTeams(
    leagueTeams.filter((team) => !divisionLeaderIds.has(team.id))
  );

  const cutoffTeam = wildcardTeams[2] || null;

  return {
    league,
    divisionLeaders,
    wildcardTeams,
    cutoffTeam,
  };
});

  function commitGameUpdate(mutator) {
    setData((prev) => {
      const game = makeSafeGame(prev.currentGame);
      const next = safeCloneSnapshot(game);
      next.history = [...(game.history || []).slice(-(MAX_HISTORY - 1)), safeCloneSnapshot(game)];
      mutator(next);
      next.playLog = (next.playLog || []).slice(0, MAX_PLAY_LOG);
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
    if (next.half === "Top") {
      next.awayScore += runs;
      addRunsToLineScore(next, "away", runs);
    } else {
      next.homeScore += runs;
      addRunsToLineScore(next, "home", runs);
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
      const nextGame = { ...prev.currentGame, inningStatus: "", [field]: value };
      if (field === "awayTeamId") {
        nextGame.awayLook = { mode: "primary", index: 0 };
      }
      if (field === "homeTeamId") {
        nextGame.homeLook = { mode: "primary", index: 0 };
      }
      return { ...prev, currentGame: nextGame };
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
    setData((prev) => ({
      ...prev,
      currentGame: {
        ...prev.currentGame,
        inningStatus: "",
        bases: { ...prev.currentGame.bases, [base]: !prev.currentGame.bases[base] },
      },
    }));
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

  function updateCount(action, delta = 1) {
    clearBanner();
    commitGameUpdate((next) => {
      next.inningStatus = "";
      if (action === "balls") {
        next.balls = Math.max(0, Math.min(3, next.balls + delta));
        addPitchToCurrentPitcher(next);
        return;
      }

      if (action === "strikes") {
        next.strikes = Math.max(0, Math.min(2, next.strikes + delta));
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
        return;
      }

      if (action === "swinging" || action === "called") {
        addPitchToCurrentPitcher(next);
        if (next.strikes >= 2) {
          next.latestPlay = action === "swinging" ? `${currentBatter ? currentBatter.name : "Batter"} struck out swinging.` : `${currentBatter ? currentBatter.name : "Batter"} struck out looking.`;
          next.playLog = [next.latestPlay, ...next.playLog];
          clearCount(next);
          next.outs += 1;
          if (currentBatter?.id) {
  setData((prev) => ({
    ...prev,
    players: prev.players.map((player) =>
      player.id === currentBatter.id
        ? {
            ...player,
            ab: (player.ab || 0) + 1,
            lastAB: "K",
          }
        : player
    ),
  }));
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

  function changeScore(side, amount) {
    clearBanner();
    commitGameUpdate((next) => {
      next.inningStatus = "";
      if (side === "away") {
        next.awayScore = Math.max(0, next.awayScore + amount);
        if (amount > 0) addRunsToLineScore(next, "away", amount);
      } else {
        next.homeScore = Math.max(0, next.homeScore + amount);
        if (amount > 0) addRunsToLineScore(next, "home", amount);
      }
      if (amount !== 0) next.lastAnnouncement = `Score update: ${next.awayScore}-${next.homeScore}.`;
    });
  }

  function markLive() {
    clearBanner();
    setData((prev) => ({
      ...prev,
      currentGame: { ...prev.currentGame, inningStatus: "", status: "Live" },
    }));
  }

function updateBatterGameStats(batterId, category, type) {
  if (!batterId) return;

  const hitLabels = {
    single: "1B",
    double: "2B",
    triple: "3B",
    homerun: "HR",
  };

  const outLabels = {
    flyout: "FO",
    groundout: "GO",
    lineout: "LO",
    popup: "POP",
    fielderschoice: "FC",
    doubleplay: "DP",
    strikeout: "K",
    calledstrikeout: "K",
  };

  const isHit = category === "hit";
  const isOutAB =
    category === "out" &&
    type !== "caughtstealing";

  if (!isHit && !isOutAB) return;

  setData((prev) => ({
    ...prev,
    players: prev.players.map((player) =>
      player.id === batterId
        ? {
            ...player,
            ab: (player.ab || 0) + 1,
            hits: isHit ? (player.hits || 0) + 1 : (player.hits || 0),
            lastAB: isHit ? hitLabels[type] || "" : outLabels[type] || "OUT",
          }
        : player
    ),
  }));
}
  
  function applyQuickPlay(category, type) {
    clearBanner();
    const batterId = currentBatter?.id;
    commitGameUpdate((next) => {
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

    updateBatterGameStats(batterId, category, type);

    setPlayInput("");
    setFielderName("");

if (pitchCountTypes.has(type)) {
  addPitchToCurrentPitcher(next);
}
      next.inningStatus = "";
      const custom = playInput.trim();
      const batterName = currentBatter ? currentBatter.name : "Batter";
      let text = custom || type;

      if (category === "hit") {
        
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
        if (!infoOnlyTypes.has(type)) {
          clearCount(next);
        }
        stepBatter(next);
      }

      if (category === "out") {

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
          if (next.bases.third) next.bases.third = false;
          else if (next.bases.second) next.bases.second = false;
          else if (next.bases.first) next.bases.first = false;
          next.bases.first = true;
          stepBatter(next);
          maybeAdvanceHalfInning(next);
        } else {
          next.outs += type === "doubleplay" ? 2 : 1;
          clearCount(next);
          if (type === "caughtstealing") {
          if (next.bases.third) next.bases.third = false;
          else if (next.bases.second) next.bases.second = false;
          else if (next.bases.first) next.bases.first = false;
        } else {
          stepBatter(next);
          }
          maybeAdvanceHalfInning(next);
        }
      }

      if (category === "other") {
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
          if (next.bases.first && next.bases.second && next.bases.third) scoreRuns(next, 1);
          if (next.bases.first && next.bases.second) next.bases.third = true;
          if (next.bases.first) next.bases.second = true;
          next.bases.first = true;
          stepBatter(next);
        }

        if (type === "sacfly") {
          if (next.bases.third) {
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
    });

    setPlayInput("");
    setFielderName("");
  }

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
  lastAB: ""
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
    ((updatedTeams[awayIndex].runsScored || 0) + awayScore) -
    ((updatedTeams[awayIndex].runsAllowed || 0) + homeScore),

  streak: nextStreak(awayWon ? "W" : "L", updatedTeams[awayIndex].streak),
};
        if (homeIndex >= 0) updatedTeams[homeIndex] = {
  ...updatedTeams[homeIndex],

  wins: updatedTeams[homeIndex].wins + (homeWon ? 1 : 0),
  losses: updatedTeams[homeIndex].losses + (awayWon ? 1 : 0),

  runsScored: (updatedTeams[homeIndex].runsScored || 0) + homeScore,
  runsAllowed: (updatedTeams[homeIndex].runsAllowed || 0) + awayScore,

  runDiff:
    ((updatedTeams[homeIndex].runsScored || 0) + homeScore) -
    ((updatedTeams[homeIndex].runsAllowed || 0) + awayScore),

  streak: nextStreak(homeWon ? "W" : "L", updatedTeams[homeIndex].streak),
};

        newGames.unshift({ id: crypto.randomUUID(), date: prev.dailyResultsDate, awayTeamId: row.awayTeamId, homeTeamId: row.homeTeamId, awayScore, homeScore, status: "Final", quickEntry: true });
      });

      syncTeamsToFirebase(updatedTeams);

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

  function finalizeGame() {
    if (!currentGame.homeTeamId || !currentGame.awayTeamId) return;
    const homeWon = currentGame.homeScore > currentGame.awayScore;
    const awayWon = currentGame.awayScore > currentGame.homeScore;
    const margin = currentGame.homeScore - currentGame.awayScore;
    const finishedGame = {
  ...currentGame,
  id: crypto.randomUUID(),
  status: "Final",
  winningPitcherId,
  losingPitcherId,
};
    setData((prev) => {
      const nextTeams = prev.teams.map((team) => {
        if (team.id === currentGame.homeTeamId) return {
  ...team,
  wins: team.wins + (homeWon ? 1 : 0),
  losses: team.losses + (awayWon ? 1 : 0),

  runsScored: (team.runsScored || 0) + currentGame.homeScore,
  runsAllowed: (team.runsAllowed || 0) + currentGame.awayScore,

  runDiff:
    ((team.runsScored || 0) + currentGame.homeScore) -
    ((team.runsAllowed || 0) + currentGame.awayScore),

  streak: nextStreak(homeWon ? "W" : "L", team.streak),
};
        if (team.id === currentGame.awayTeamId) return {
  ...team,
  wins: team.wins + (awayWon ? 1 : 0),
  losses: team.losses + (homeWon ? 1 : 0),

  runsScored: (team.runsScored || 0) + currentGame.awayScore,
  runsAllowed: (team.runsAllowed || 0) + currentGame.homeScore,

  runDiff:
    ((team.runsScored || 0) + currentGame.awayScore) -
    ((team.runsAllowed || 0) + currentGame.homeScore),

  streak: nextStreak(awayWon ? "W" : "L", team.streak),
};
        return team;
      });

      syncTeamsToFirebase(nextTeams);

const gameTeamIds = new Set([
  currentGame.awayTeamId,
  currentGame.homeTeamId,
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
  games: [finishedGame, ...prev.games],
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

  function resetLeague() {
    if (!window.confirm("Clear all franchise data?")) return;
    setData({ ...defaultData, currentGame: defaultCurrentGame(), dailyResultsRows: Array.from({ length: DAILY_ROWS }, emptyDailyRow) });
    setPage("dashboard");
  }

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
const lastFinalWinningPitcher = lastFinalGame?.winningPitcherId
  ? players.find((player) => player.id === lastFinalGame.winningPitcherId)
  : null;
const lastFinalLosingPitcher = lastFinalGame?.losingPitcherId
  ? players.find((player) => player.id === lastFinalGame.losingPitcherId)
  : null;

  return (
    <div className="app-shell wide-shell">
      <div className="topbar">
       <div>
  <div className="title-row">
    <h1>The Show League Central</h1>
    <span className="version-pill">v1.5</span>
  </div>
  <p>MLB The Show 26 League Hub</p>
</div>
        <div className="topbar-actions">
          <button className="danger" onClick={resetLeague}>Reset All Data</button>
        </div>
      </div>

      <div className="nav">
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("standings")}>Standings</button>
        {controlsUnlocked && <button onClick={() => setPage("live")}>Live</button>}
        {controlsUnlocked && <button onClick={() => setPage("admin")}>Admin</button>}
        {controlsUnlocked && <button onClick={() => setPage("daily")}>Daily</button>}
        {controlsUnlocked && <button onClick={() => setPage("quick")}>Quick</button>}
      </div>


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




      {page === "dashboard" && (
        <div className="grid two">
          <div className="card hero-card">
            <h2>Featured Live Game</h2>
            {homeTeam && awayTeam ? (
              <>
                <div className="mlb-live-layout dashboard-live-layout">
                  <div className="score-panel">
                    <div className="unified-scoreboard-card dashboard-scoreboard-card">
                      <div className="unified-scoreboard-header">
                        <div className="team-look-column">
                          <div className="team-pill" style={{
  background: awayColors.gradient
    ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})`
    : awayColors.main,
  borderColor: awayColors.border,
  color: awayColors.text
}}>
                            {awayTeam ? awayTeam.abbr : "AWY"}
                          </div>
                           <div className="small-text muted">
    {awayTeam ? `${awayTeam.wins}-${awayTeam.losses}` : ""}
  </div>
                          <ChallengeBars count={currentGame.awayChallenges} />
                        </div>

                        <div className="score-center">
                          <span className={`score-number ${scoreFlashSide === "away" ? "score-flash" : ""}`}>
  {currentGame.awayScore}
</span>
  <span className="score-dash">-</span>
<span className={`score-number ${scoreFlashSide === "home" ? "score-flash" : ""}`}>
  {currentGame.homeScore}
</span>
                        </div>

                        <div className="team-look-column">
                          <div className="team-pill" style={{
  background: homeColors.gradient
    ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})`
    : homeColors.main,
  borderColor: homeColors.border,
  color: homeColors.text
}}>
                            {homeTeam ? homeTeam.abbr : "HME"}
                          </div>
                          <div className="small-text muted">
    {homeTeam ? `${homeTeam.wins}-${homeTeam.losses}` : ""}
  </div>
                          <ChallengeBars count={currentGame.homeChallenges} />
                        </div>
                      </div>

                      <div className="inning-text unified-inning-text">{displayGameState}</div>

                      <div className="count-bubble unified-count-bubble">
                        {combinedCountText}
                      </div>

                      <div className="active-batter-banner"><div>
  At Bat: #{currentBatter?.number || "--"} {currentBatter?.name}

  <div className="small-text muted">
    {currentBatter ? `${currentBatter.hits || 0}-${currentBatter.ab || 0}` : ""}
  </div>

  <div className="small-text muted">
    Last AB: {currentBatter?.lastAB || "-"}
  </div>
  
</div></div>
                  <div className="muted">On Deck: {onDeckBatter ? `#${onDeckBatter.number || "--"} ${onDeckBatter.name}` : "—"}</div>

                      <div className="muted">
  Pitching: {fieldingPitcher ? `#${fieldingPitcher.number || "--"} ${fieldingPitcher.name}` : "Set pitcher"}
  {" "}
  ({currentPitchCount} pitches)
</div>

                      <BaseDiamond bases={currentGame.bases} />
                      <div className="game-status-strip">
  <span>Batter: {currentBatter ? `#${currentBatter.number || "--"} ${currentBatter.name}` : "Set lineup"}</span>
  <span>On Deck: {onDeckBatter ? `#${onDeckBatter.number || "--"} ${onDeckBatter.name}` : "—"}</span>
  <span>Pitching: {fieldingPitcher ? `#${fieldingPitcher.number || "--"} ${fieldingPitcher.name}` : "Set pitcher"}</span>
  <span>Count: {combinedCountText}</span>
</div>
                    </div>
                    
                  </div>
                  <div className="linescore-side-panel">
                    <div className="linescore-box">
                      <div className="linescore-row linescore-head">
                        <span>Team</span>
                        {Array.from({ length: 9 }, (_, i) => <span key={i}>{i + 1}</span>)}
                        <span>R</span><span>H</span><span>E</span>
                      </div>
                      <div className="linescore-row">
                        <span>{awayTeam.abbr}</span>
                        {Array.from({ length: 9 }, (_, i) => <span key={i}>{renderInningCell("away", i + 1, currentGame)}</span>)}
                        <span>{currentGame.awayScore}</span><span>{currentGame.awayHits}</span><span>{currentGame.awayErrors}</span>
                      </div>
                      <div className="linescore-row">
                        <span>{homeTeam.abbr}</span>
                        {Array.from({ length: 9 }, (_, i) => <span key={i}>{renderInningCell("home", i + 1, currentGame)}</span>)}
                        <span>{currentGame.homeScore}</span><span>{currentGame.homeHits}</span><span>{currentGame.homeErrors}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="event-banner">Last Play: {currentGame.latestPlay}</div>
                
<div className="card playoff-race-card" style={{ marginTop: "20px", gridColumn: "1 / -1" }}>
  <h2>Playoff Race</h2>

  
</div>

{(inningBanner || currentGame.status === "Final") && <div className="event-banner">Inning Status: {displayGameState}</div>}           
              </>
              
            ) : lastFinalGame && lastFinalAwayTeam && lastFinalHomeTeam ? (
  <div className="final-recap-card">
    <h2>Last Final</h2>

    <div className="unified-scoreboard-card dashboard-scoreboard-card">
      <div className="unified-scoreboard-header">
        <div className="team-look-column">
          <div className="team-pill">
            {lastFinalAwayTeam.abbr}
          </div>
          <div className="small-text muted">
            {lastFinalAwayTeam.wins}-{lastFinalAwayTeam.losses}
          </div>
        </div>

        <div className="score-center">
          <span className="score-number">{lastFinalGame.awayScore}</span>
          <span className="score-dash">-</span>
          <span className="score-number">{lastFinalGame.homeScore}</span>
        </div>

        <div className="team-look-column">
          <div className="team-pill">
            {lastFinalHomeTeam.abbr}
          </div>
          <div className="small-text muted">
            {lastFinalHomeTeam.wins}-{lastFinalHomeTeam.losses}
          </div>
        </div>
      </div>

      <div className="inning-text unified-inning-text">Final</div>

      <div className="game-status-strip">
        <span>WP: {lastFinalWinningPitcher ? `#${lastFinalWinningPitcher.number || "--"} ${lastFinalWinningPitcher.name}` : "—"}</span>
        <span>LP: {lastFinalLosingPitcher ? `#${lastFinalLosingPitcher.number || "--"} ${lastFinalLosingPitcher.name}` : "—"}</span>
      </div>
    </div>
  </div>
) : (
  <p>No live game set up yet.</p>
)}
</div>
<div className="card batting-card">
  <h2>{battingTeam ? `${battingTeam.abbr} Batting` : "Batting Team"}</h2>

  {battingLineupPlayers.map(({ player, index }) => {
    const isCurrent = player.id === currentBatter?.id;

    return (
      <div
        className={`batting-lineup-row ${isCurrent ? "is-current-batter" : ""}`}
        key={`dashboard-batting-${player.id}`}
      >
        <span className="batting-order-number">{index + 1}</span>

        <div>
          <strong>#{player.number || "--"} {player.name}</strong>
          <div className="muted small-text">
  {player.hits || 0}-{player.ab || 0}
  {player.lastAB ? ` · Last AB: ${player.lastAB}` : ""}
</div>
        </div>
      </div>
    );
  })}

  {!battingLineupPlayers.length && (
    <p className="muted">Set a lineup to show batting order.</p>
  )}

  <div className="due-up-box">
<h3>{nextBattingTeam ? `${nextBattingTeam.abbr} Due Up Next` : "Due Up Next"}</h3>
    {dueUpBatters.map((player, index) => (
      <div className="due-up-row" key={`dashboard-due-${player.id}`}>
        <span>{index + 1}</span>
        <strong>#{player.number || "--"} {player.name}</strong>
<span className="muted">{player.hits || 0}-{player.ab || 0}</span>      </div>
    ))}

    {!dueUpBatters.length && (
      <p className="muted">No due-up hitters yet.</p>
    )}
  </div>
</div>
<div className="grid three" style={{ marginTop: "20px" }}>
  <div className="card">
    <h2>League Leaders</h2>

    <div className="list-row">
      <strong>Best Run Diff</strong>
      <span>{bestRunDiff ? `${bestRunDiff.abbr} ${bestRunDiff.runDiff > 0 ? "+" : ""}${bestRunDiff.runDiff}` : "—"}</span>
    </div>

    <div className="list-row">
      <strong>Most Runs Scored</strong>
      <span>{topRunsScored ? `${topRunsScored.abbr} ${topRunsScored.runsScored || 0}` : "—"}</span>
    </div>

    <div className="list-row">
      <strong>Fewest Runs Allowed</strong>
      <span>{bestRunsAllowed ? `${bestRunsAllowed.abbr} ${bestRunsAllowed.runsAllowed || 0}` : "—"}</span>
    </div>
  </div>

  <div className="card">
    <h2>Hot / Cold</h2>

    <div className="list-row">
      <strong>Hottest</strong>
      <span>{longestWinStreak ? `${longestWinStreak.abbr} ${longestWinStreak.streak}` : "—"}</span>
    </div>

    <div className="list-row">
      <strong>Cold Spell</strong>
      <span>{longestLossStreak ? `${longestLossStreak.abbr} ${longestLossStreak.streak}` : "—"}</span>
    </div>
  </div>
  <div className="card">
            <h2>Best Records</h2>
            {sortTeams(teams).slice(0, 5).map((team) => (
              <div className="list-row" key={team.id}>
                <div>
                  <strong>{team.city} {team.name}</strong>
                  <div className="muted">{team.league} {team.division}</div>
                </div>
                <div>{team.wins}-{team.losses} ({pct(team.wins, team.losses)})</div>
              </div>
            ))}
            {!teams.length && <p className="muted">No teams yet.</p>}
          </div>
            <div className="grid two">
    {playoffPicture.map((picture) => (
      <div className="playoff-league-card" key={`${picture.league}-dashboard-race`}>
        <h3>{picture.league} Wild Card</h3>

        <div className="playoff-section-label">Current Wild Cards</div>

        {picture.wildcardTeams.slice(0, 3).map((team, index) => (
          <div className="playoff-race-row" key={`${picture.league}-dash-wc-${team.id}`}>
            <strong>{`WC${index + 1}`}</strong>
            <span>{team.abbr}</span>
            <span>{team.wins}-{team.losses}</span>
            <span>{wildCardGamesBack(team, picture.cutoffTeam, index)}</span>
          </div>
        ))}

        <div className="playoff-section-label">Almost In</div>

        {picture.wildcardTeams.slice(3, 6).map((team, index) => (
          <div className="playoff-race-row playoff-race-chaser" key={`${picture.league}-dash-chase-${team.id}`}>
            <strong>{index + 1}</strong>
            <span>{team.abbr}</span>
            <span>{team.wins}-{team.losses}</span>
            <span>{wildCardGamesBack(team, picture.cutoffTeam, index + 3)} GB</span>
          </div>
        ))}

        {picture.wildcardTeams.length <= 3 && (
          <p className="muted">No teams chasing yet.</p>
        )}
      </div>
    ))}
  </div>
          </div>

          
        </div>
      )}

      {page === "live" && controlsUnlocked && (
        <div className="live-layout">
          <div className="card live-main-card">
            <h2>Live Scoring</h2>
            {homeTeam && awayTeam && <div className="matchup-line">{awayTeam.abbr} {currentGame.awayScore} - {currentGame.homeScore} {homeTeam.abbr}</div>}

  

            <div className="inline-buttons" style={{ marginBottom: "12px" }}>
  <button className="danger-lite" onClick={resetCurrentMatch}>Reset Full Game</button>
  <button onClick={resetCurrentGamePlayerStats}>Reset ABs</button>
</div>

            <div className="live-top-setup">
              <div><label>Away Team</label><select value={currentGame.awayTeamId} onChange={(e) => updateCurrentGame("awayTeamId", e.target.value)}><option value="">Select away team</option>{numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}</select></div>
              <div><label>Home Team</label><select value={currentGame.homeTeamId} onChange={(e) => updateCurrentGame("homeTeamId", e.target.value)}><option value="">Select home team</option>{numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}</select></div>
              <div><label>Date</label><input type="date" value={currentGame.date} onChange={(e) => updateCurrentGame("date", e.target.value)} /></div>
              <div><label>Status</label><select value={currentGame.status} onChange={(e) => updateCurrentGame("status", e.target.value)}><option>Not Started</option><option>Live</option><option>Mid-Inning</option><option>Final</option></select></div>
            </div>

            <div className="mlb-live-layout">
              <div className="score-panel">
                <div className="unified-scoreboard-card">
                  <div className="unified-scoreboard-header">
                    <div className="team-look-column">
                      <div className="team-pill" style={{ background: awayColors.gradient ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})` : awayColors.main, borderColor: awayColors.border, color: awayColors.text }}>
                        {awayTeam ? awayTeam.abbr : "AWY"}
                      </div>
                      <div className="small-text muted">
    {awayTeam ? `${awayTeam.wins}-${awayTeam.losses}` : ""}
  </div>
                      <button className="look-switch-button" onClick={() => cycleLiveLook("away")}>{liveAwayLookLabel}</button>
                      <ChallengeBars count={currentGame.awayChallenges} />
                    </div>

                    <div className="score-center">
                      <span className={`score-number ${scoreFlashSide === "away" ? "score-flash" : ""}`}>
  {currentGame.awayScore}
</span>
  <span className="score-dash">-</span>
<span className={`score-number ${scoreFlashSide === "home" ? "score-flash" : ""}`}>
  {currentGame.homeScore}
</span>
                    </div>

                    <div className="team-look-column">
                      <div className="team-pill" style={{ background: homeColors.gradient ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})` : homeColors.main, borderColor: homeColors.border, color: homeColors.text }}>
                        {homeTeam ? homeTeam.abbr : "HME"}
                      </div>
                       <div className="small-text muted">
    {homeTeam ? `${homeTeam.wins}-${homeTeam.losses}` : ""}
  </div>
                      <button className="look-switch-button" onClick={() => cycleLiveLook("home")}>{liveHomeLookLabel}</button>
                      <ChallengeBars count={currentGame.homeChallenges} />
                    </div>
                  </div>

                  <div className="score-adjust-row">
                    <div className="inline-buttons score-adjust-buttons">
                      <button onClick={() => changeScore("away", -1)}>-1</button>
                      <button onClick={() => changeScore("away", 1)}>+1</button>
                    </div>
                    <div className="inline-buttons score-adjust-buttons">
                      <button onClick={() => changeScore("home", -1)}>-1</button>
                      <button onClick={() => changeScore("home", 1)}>+1</button>
                    </div>
                  </div>

                  <div className="score-adjust-row challenge-adjust-row">
                    <div className="inline-buttons score-adjust-buttons">
                      <button onClick={() => updateChallenges("away", -1)}>- Challenge</button>
                      <button onClick={() => updateChallenges("away", 1)}>+ Challenge</button>
                    </div>
                    <div className="inline-buttons score-adjust-buttons">
                      <button onClick={() => updateChallenges("home", -1)}>- Challenge</button>
                      <button onClick={() => updateChallenges("home", 1)}>+ Challenge</button>
                    </div>
                  </div>

                  <div className="inning-text unified-inning-text">{displayGameState}</div>

                  <div className="count-bubble unified-count-bubble">
                    {combinedCountText}
                  </div>

                  <div className="active-batter-banner"><div>
  At Bat: #{currentBatter?.number || "--"} {currentBatter?.name}

  <div className="small-text muted">
    {currentBatter ? `${currentBatter.hits || 0}-${currentBatter.ab || 0}` : ""}
  </div>

  <div className="small-text muted">
    Last AB: {currentBatter?.lastAB || "-"}
  </div>
</div></div>
                  <div className="muted">On Deck: {onDeckBatter ? `#${onDeckBatter.number || "--"} ${onDeckBatter.name}` : "—"}</div>
                  <div className="muted">
  Pitching: {fieldingPitcher ? `#${fieldingPitcher.number || "--"} ${fieldingPitcher.name}` : "Set pitcher"}
  {" "}
  ({currentPitchCount} pitches)
</div>

                  <BaseDiamond bases={currentGame.bases} />
                </div>
                
              </div>

              <div className="linescore-side-panel">
                <div className="linescore-box">
                  <div className="linescore-row linescore-head">
                    <span>Team</span>
                    {Array.from({ length: 9 }, (_, i) => <span key={i}>{i + 1}</span>)}
                    <span>R</span><span>H</span><span>E</span>
                  </div>
                  <div className="linescore-row">
                    <span>{awayTeam ? awayTeam.abbr : "AWY"}</span>
                    {Array.from({ length: 9 }, (_, i) => <span key={i}>{renderInningCell("away", i + 1, currentGame)}</span>)}
                    <span>{currentGame.awayScore}</span><span>{currentGame.awayHits}</span><span>{currentGame.awayErrors}</span>
                  </div>
                  <div className="linescore-row">
                    <span>{homeTeam ? homeTeam.abbr : "HME"}</span>
                    {Array.from({ length: 9 }, (_, i) => <span key={i}>{renderInningCell("home", i + 1, currentGame)}</span>)}
                    <span>{currentGame.homeScore}</span><span>{currentGame.homeHits}</span><span>{currentGame.homeErrors}</span>
                  </div>
                </div>
              </div>
            </div>

            <CountControls currentGame={currentGame} updateCount={updateCount} incrementPitchCount={incrementPitchCount} />

            <div className="play-mode-tabs">
              <button className={playMode === "hits" ? "active-tab" : ""} onClick={() => setPlayMode("hits")}>Hits</button>
              <button className={playMode === "outs" ? "active-tab" : ""} onClick={() => setPlayMode("outs")}>Outs</button>
              <button className={playMode === "other" ? "active-tab" : ""} onClick={() => setPlayMode("other")}>Other</button>
            </div>

            <div className="quick-play-wrap compact-play-wrap">
              {activeButtons.map((item) => (
                <button key={item.label} className={`quick-play-button ${item.category === "hit" ? "hit-button" : item.category === "out" ? "out-button" : "other-button"}`} onClick={() => applyQuickPlay(item.category, item.type)}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="bases-row">
              <button onClick={() => updateBases("first")} className={currentGame.bases.first ? "active-base" : ""}>1st: {currentGame.bases.first ? "On" : "Empty"}</button>
              <button onClick={() => updateBases("second")} className={currentGame.bases.second ? "active-base" : ""}>2nd: {currentGame.bases.second ? "On" : "Empty"}</button>
              <button onClick={() => updateBases("third")} className={currentGame.bases.third ? "active-base" : ""}>3rd: {currentGame.bases.third ? "On" : "Empty"}</button>
            </div>

            <div className="event-banner">Last Play: {currentGame.latestPlay}</div>
            
            <div className="play-log-box">
              <label>Play Details / Manual Override</label>
              <div className="play-detail-row">
                <input value={fielderName} onChange={(e) => setFielderName(e.target.value)} placeholder="Fielder / location" />
                <input value={playInput} onChange={(e) => setPlayInput(e.target.value)} placeholder="Optional custom play text" />
                <button onClick={addPlayLog}>Add Note</button>
                <button onClick={markLive}>Mark Live</button>
                <button onClick={undoLastPlay}>Undo Last Play</button>
              </div>
              <div className="scroll-box">
                {currentGame.playLog.map((play, index) => <div className="play-item" key={`${play}-${index}`}>{play}</div>)}
                {!currentGame.playLog.length && <p className="muted">No plays logged yet.</p>}
              </div>
            </div>

            <div className="inline-buttons">
              <button onClick={finalizeGame}>Finalize Game</button>
              <div className="form-grid" style={{ marginTop: "14px", marginBottom: "14px" }}>
  <div>
    <label>Winning Pitcher</label>
    <select value={winningPitcherId} onChange={(e) => setWinningPitcherId(e.target.value)}>
      <option value="">Select winning pitcher</option>
      {usedGamePitchers.map((player) => (
        <option value={player.id} key={`wp-${player.id}`}>
          {player.labelTeam} - #{player.number || "--"} {player.name}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label>Losing Pitcher</label>
    <select value={losingPitcherId} onChange={(e) => setLosingPitcherId(e.target.value)}>
      <option value="">Select losing pitcher</option>
      {usedGamePitchers.map((player) => (
        <option value={player.id} key={`lp-${player.id}`}>
          {player.labelTeam} - #{player.number || "--"} {player.name}
        </option>
      ))}
    </select>
  </div>
</div>
              <button onClick={() => commitGameUpdate((next) => { clearCountAndOuts(next); })}>Reset Count</button>
            </div>
          </div>

          <div className="card live-side-card">
            <h2>Lineups</h2>

            <h3>Away Starter Info</h3>
            <div className="pitcher-row">
              <span>P</span>
              <select value={currentGame.awayPitcherId || ""} onChange={(e) => changePitcher("away", e.target.value)}>
                <option value="">Select pitcher</option>
                {awayRoster.map((player) => <option value={player.id} key={player.id}>#{player.number || "--"} {player.name}</option>)}
              </select>
            </div>
            {currentGame.awayPitcherHistory.length > 0 && <div className="muted pitcher-history-text">Used: {currentGame.awayPitcherHistory.map((id) => awayRoster.find((p) => p.id === id)?.name).filter(Boolean).join(", ")}</div>}
            <h3>Away Lineup</h3>
            {currentGame.awayLineup.map((playerId, index) => (
              <div className="lineup-row lineup-row-wide" key={`away-${index}`}>
                <span>{index + 1}</span>
                <select value={playerId} onChange={(e) => setLineup("away", index, e.target.value)}>
                  <option value="">Select player</option>
                  {awayRoster.map((player) => <option value={player.id} key={player.id}>#{player.number || "--"} {player.name}</option>)}
                </select>
                <select value={currentGame.awayPositions[index] || ""} onChange={(e) => setLineupPosition("away", index, e.target.value)}>
                  {POSITION_OPTIONS.map((pos) => <option value={pos} key={pos}>{pos}</option>)}
                </select>
              </div>
            ))}

            <h3>Home Starter Info</h3>
            <div className="pitcher-row">
              <span>P</span>
              <select value={currentGame.homePitcherId || ""} onChange={(e) => changePitcher("home", e.target.value)}>
                <option value="">Select pitcher</option>
                {homeRoster.map((player) => <option value={player.id} key={player.id}>#{player.number || "--"} {player.name}</option>)}
              </select>
            </div>
            {currentGame.homePitcherHistory.length > 0 && <div className="muted pitcher-history-text">Used: {currentGame.homePitcherHistory.map((id) => homeRoster.find((p) => p.id === id)?.name).filter(Boolean).join(", ")}</div>}
            <h3>Home Lineup</h3>
            {currentGame.homeLineup.map((playerId, index) => (
              <div className="lineup-row lineup-row-wide" key={`home-${index}`}>
                <span>{index + 1}</span>
                <select value={playerId} onChange={(e) => setLineup("home", index, e.target.value)}>
                  <option value="">Select player</option>
                  {homeRoster.map((player) => <option value={player.id} key={player.id}>#{player.number || "--"} {player.name}</option>)}
                </select>
                <select value={currentGame.homePositions[index] || ""} onChange={(e) => setLineupPosition("home", index, e.target.value)}>
                  {POSITION_OPTIONS.map((pos) => <option value={pos} key={pos}>{pos}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "daily" && controlsUnlocked && (
        <div className="daily-page-wrap">
          <div className="card">
            <div className="daily-header-row">
              <div>
                <h2>Daily Results</h2>
                <p className="muted">Use this for the other games on the schedule. Blank rows are ignored.</p>
              </div>
              <div className="daily-controls">
                <input type="date" value={data.dailyResultsDate} onChange={(e) => setData((prev) => ({ ...prev, dailyResultsDate: e.target.value }))} />
                <button onClick={() => addDailyRows(5)}>Add 5 Rows</button>
                <button onClick={applyDailyResults}>Apply All Valid Results</button>
              </div>
            </div>

            <div className="daily-results-table">
              <div className="daily-results-head">
                <div>Away</div><div>Away Score</div><div>Home</div><div>Home Score</div><div>Status</div><div>Clear</div>
              </div>
              {data.dailyResultsRows.map((row) => {
                const away = teams.find((t) => t.id === row.awayTeamId);
                const home = teams.find((t) => t.id === row.homeTeamId);
                const issue = getDailyRowIssue(row, data.dailyResultsRows);
                return (
                  <div className="daily-results-row" key={row.id}>
                    <div>
                      <select value={row.awayTeamId} onChange={(e) => updateDailyRow(row.id, "awayTeamId", e.target.value)}>
                        <option value="">Away team</option>
                        {numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
                      </select>
                    </div>
                    <div><input type="number" value={row.awayScore} onChange={(e) => updateDailyRow(row.id, "awayScore", e.target.value)} placeholder="0" /></div>
                    <div>
                      <select value={row.homeTeamId} onChange={(e) => updateDailyRow(row.id, "homeTeamId", e.target.value)}>
                        <option value="">Home team</option>
                        {numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
                      </select>
                    </div>
                    <div><input type="number" value={row.homeScore} onChange={(e) => updateDailyRow(row.id, "homeScore", e.target.value)} placeholder="0" /></div>
                    <div className="daily-status-cell">
                      {issue === "applied" && <span className="status-pill applied">Applied</span>}
                      {issue === "same-team" && <span className="status-pill invalid">Same Team</span>}
                      {issue === "duplicate-team" && <span className="status-pill invalid">Duplicate Team</span>}
                      {issue === "tie" && <span className="status-pill invalid">No Ties</span>}
                      {issue === "ready" && <span className="status-pill ready">Ready</span>}
                      {(issue === "empty" || issue === "incomplete") && <span className="status-pill empty">Waiting</span>}
                      {away && home && row.awayScore !== "" && row.homeScore !== "" && issue !== "tie" && <div className="muted small-text">{Number(row.awayScore) > Number(row.homeScore) ? away.abbr : home.abbr}</div>}
                    </div>
                    <div><button className="danger" onClick={() => clearDailyRow(row.id)}>Clear</button></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card daily-bulk-card">
          <div className="card daily-helper-card">
            <h3>Teams Added In These Rows</h3>
            <p className="muted">Filled rows light up the teams currently included in Daily Results so you can spot duplicates fast.</p>
            <div className="team-status-grid">
              {numberedTeams.map((team) => {
                const relatedRows = data.dailyResultsRows.filter((row) => row.awayTeamId === team.id || row.homeTeamId === team.id);
                const isAdded = relatedRows.some((row) => row.awayTeamId && row.homeTeamId && row.awayScore !== "" && row.homeScore !== "");
                const isOpen = relatedRows.length > 0;

                return (
                  <div
                    key={`daily-status-${team.id}`}
                    className={`team-status-chip ${isAdded ? "is-added" : isOpen ? "is-open" : ""}`}
                  >
                    <span className="team-status-abbr">{team.abbr}</span>
                    <span className="team-status-name">{team.city} {team.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

            <h3>Bulk Results Entry</h3>
            <p className="muted">One game per line. Examples: <strong>1 3 2 4</strong> or <strong>sf 5 sd 2</strong>. First valid line wins if a team is duplicated.</p>
            {bulkWarnings.length > 0 && (
              <div className="bulk-warning-box">
                <strong>Skipped lines</strong>
                {bulkWarnings.map((warning, index) => <div key={`${warning}-${index}`}>{warning}</div>)}
              </div>
            )}
            <textarea
              className="bulk-results-input"
              value={bulkResultsInput}
              onChange={(e) => setBulkResultsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  applyBulkResultsInput();
                }
              }}
              placeholder={"1 3 2 4\nsf 5 sd 2\n7 1 12 6"}
              rows={8}
            />
            <div className="inline-buttons">
              <button onClick={applyBulkResultsInput}>Fill Rows From Bulk Entry</button>
            </div>
          </div>
        </div>
      )}

      {page === "standings" && (
        <div className="standings-wrap">
          {data.leagues.map((league) => (
            <div key={league} className="league-block">
              <h2>{league}</h2>
              <div className="grid three">
                {data.divisions.map((division) => {
                  const key = `${league}-${division}`;
                  const divisionTeams = standings[key] || [];
                  const leader = divisionTeams[0];
                  return (
                    <div className="card" key={key}>
                      <h3>{division}</h3>
                      <div
                        className="standings-header standings-row"
                        style={{gridTemplateColumns: "30px 1fr 70px 70px 60px 55px 55px 55px 60px" }}
                      >
                        <span>#</span>
                        <span>Team</span>
                        <span>W-L</span>
                        <span>PCT</span>
                        <span>GB</span>
                        <span>RS</span>
                        <span>RA</span>
                        <span>RD</span>
                        <span>STRK</span>
                      </div>
                      {divisionTeams.map((team, index) => (
                        <div
                          className="standings-row"
                          key={team.id}
                          style={{ gridTemplateColumns: "30px 1fr 70px 70px 60px 55px 55px 55px 60px" }}
                        >
                          <span>{index + 1}</span>
                          <span>{team.abbr}</span>
                          <span>{team.wins}-{team.losses}</span>
                          <span>{pct(team.wins, team.losses)}</span>
                          <span>{gamesBack(team, leader)}</span>
                          <span>{team.runsScored || 0}</span>
<span>{team.runsAllowed || 0}</span>
                          <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
                          <span>{team.streak || "-"}</span>
                        </div>
                      ))}
                      {!divisionTeams.length && (
                        <p className="muted">No teams in this division yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="wildcard-wrap">
  <h2>Playoff Picture</h2>

  <div className="grid two even-playoff-grid">

  {playoffPicture.map((picture) => (
    <div className="card" key={`${picture.league}-playoff-picture`}>
      <h3>{picture.league}</h3>

      <h4>Division Leaders</h4>

      <div
        className="standings-header standings-row wildcard-row"
        style={{ gridTemplateColumns: "70px 1fr 90px 70px 70px 70px" }}
      >
        <span>Div</span>
        <span>Team</span>
        <span>W-L</span>
        <span>PCT</span>
        <span>RD</span>
        <span>STRK</span>
      </div>

      {picture.divisionLeaders.map((team) => (
        <div
          className="standings-row wildcard-row division-leader-row"
          key={`${picture.league}-leader-${team.id}`}
          style={{ gridTemplateColumns: "70px 1fr 90px 70px 70px 70px" }}
        >
          <span>{team.division}</span>
          <span>{team.abbr}</span>
          <span>{team.wins}-{team.losses}</span>
          <span>{pct(team.wins, team.losses)}</span>
          <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
          <span>{team.streak || "-"}</span>
        </div>
      ))}

      <h4 style={{ marginTop: "22px" }}>Wild Card</h4>

      <div
        className="standings-header standings-row wildcard-row"
        style={{ gridTemplateColumns: "60px 1fr 90px 70px 70px 70px 70px" }}
      >
        <span>Seed</span>
        <span>Team</span>
        <span>W-L</span>
        <span>PCT</span>
        <span>WCGB</span>
        <span>RD</span>
        <span>STRK</span>
      </div>

      {picture.wildcardTeams.map((team, index) => {
        const isWildCardTeam = index < 3;
        const isCutoff = index === 2;

        return (
          <div
            className={`standings-row wildcard-row ${
              isWildCardTeam ? "wildcard-in" : "wildcard-out"
            } ${isCutoff ? "wildcard-cutoff" : ""}`}
            key={`${picture.league}-wc-${team.id}`}
            style={{ gridTemplateColumns: "60px 1fr 90px 70px 70px 70px 70px" }}
          >
            <span>{isWildCardTeam ? `WC${index + 1}` : "—"}</span>
            <span>{team.abbr}</span>
            <span>{team.wins}-{team.losses}</span>
            <span>{pct(team.wins, team.losses)}</span>
            <span>{wildCardGamesBack(team, picture.cutoffTeam, index)}</span>
            <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
            <span>{team.streak || "-"}</span>
          </div>
        );
      })}

      {!picture.wildcardTeams.length && (
        <p className="muted">No wild card teams yet.</p>
      )}
    </div>
  ))}
</div>
</div>
        </div>
        
      )}

      {page === "quick" && (
        <div className="quick-groups-wrap">
          <div className="card">
            <h2>Quick Daily Record Editor</h2>
            <p className="muted">This is your emergency correction screen if a record needs to be fixed manually.</p>
          </div>

          {data.leagues.map((league) => (
            <div key={league} className="league-block">
              <h2>{league}</h2>
              <div className="grid three">
                {data.divisions.map((division) => {
                  const groupTeams = [...teams]
  .filter((team) => team.league === league && team.division === division)
  .sort((a, b) => {
    const pctA = (a.wins || 0) + (a.losses || 0) > 0 ? (a.wins || 0) / ((a.wins || 0) + (a.losses || 0)) : 0;
    const pctB = (b.wins || 0) + (b.losses || 0) > 0 ? (b.wins || 0) / ((b.wins || 0) + (b.losses || 0)) : 0;

    if (pctB !== pctA) return pctB - pctA;
    if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
    if ((b.runDiff || 0) !== (a.runDiff || 0)) return (b.runDiff || 0) - (a.runDiff || 0);

    return a.abbr.localeCompare(b.abbr);
  });

                  return (
                    <div className="card" key={`${league}-${division}-quick`}>
                      <h3>{division}</h3>

                      {groupTeams.map((team) => (
                        <div className="quick-row" key={team.id}>
                          <div>
                            <strong>{team.city} {team.name}</strong>
                            <div className="muted">{team.abbr}</div>
                          </div>

                          <div>
                            <label>Wins</label>
                            <input
                              type="number"
                              value={team.wins}
                              onChange={(e) => updateRecord(team.id, "wins", e.target.value)}
                            />
                          </div>

                          <div>
                            <label>Losses</label>
                            <input
                              type="number"
                              value={team.losses}
                              onChange={(e) => updateRecord(team.id, "losses", e.target.value)}
                            />
                          </div>
<div className="muted">{pct(team.wins, team.losses)}</div>
                          <div>
                            
                            <div>
  <label>RS</label>
  <input
    type="number"
    value={team.runsScored || 0}
    onChange={(e) => updateRecord(team.id, "runsScored", e.target.value)}
  />
</div>

<div>
  <label>RA</label>
  <input
    type="number"
    value={team.runsAllowed || 0}
    onChange={(e) => updateRecord(team.id, "runsAllowed", e.target.value)}
  />
</div>

<div className="muted">
  {team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}
</div>
                          </div>

                          
                          <div>
  <label>Streak</label>
  <input
    type="text"
    value={team.streak || ""}
    onChange={(e) => updateRecord(team.id, "streak", e.target.value)}
  />
</div>

                        </div>
                      ))}

                      {!groupTeams.length && <p className="muted">No teams in this division yet.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {page === "admin" && controlsUnlocked && (
        <div className="grid two admin-picker-layout">
          <div className="card">
            <h2>Create Team</h2>
            <div className="form-grid">
              <div><label>City</label><input value={newTeam.city} onChange={(e) => setNewTeam((prev) => ({ ...prev, city: e.target.value }))} /></div>
              <div><label>Name</label><input value={newTeam.name} onChange={(e) => setNewTeam((prev) => ({ ...prev, name: e.target.value }))} /></div>
              <div><label>Abbreviation</label><input value={newTeam.abbr} onChange={(e) => setNewTeam((prev) => ({ ...prev, abbr: e.target.value.toUpperCase() }))} maxLength="4" /></div>
              <div><label>League</label><select value={newTeam.league} onChange={(e) => setNewTeam((prev) => ({ ...prev, league: e.target.value }))}>{data.leagues.map((league) => <option key={league}>{league}</option>)}</select></div>
              <div><label>Division</label><select value={newTeam.division} onChange={(e) => setNewTeam((prev) => ({ ...prev, division: e.target.value }))}>{data.divisions.map((division) => <option key={division}>{division}</option>)}</select></div>
            </div>
            <button onClick={addTeam}>Add Team</button>

            <div className="admin-picker-box">
              <label>Edit Existing Team</label>
              <select value={selectedAdminTeamId} onChange={(e) => setSelectedAdminTeamId(e.target.value)}>
                <option value="">Select team</option>
                {numberedTeams.map((team) => <option key={team.id} value={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
              </select>
            </div>
          </div>

          <div className="card">
            <h2>Team Editor</h2>
            {selectedAdminTeam ? (
              <>
                <div className="team-edit-grid">
                  <input value={selectedAdminTeam.city} onChange={(e) => editTeam(selectedAdminTeam.id, "city", e.target.value)} placeholder="City" />
                  <input value={selectedAdminTeam.name} onChange={(e) => editTeam(selectedAdminTeam.id, "name", e.target.value)} placeholder="Name" />
                  <input value={selectedAdminTeam.abbr} onChange={(e) => editTeam(selectedAdminTeam.id, "abbr", e.target.value.toUpperCase())} placeholder="Abbr" maxLength="4" />
                </div>
                <div className="form-grid compact-admin-grid">
                  <div>
                    <label>League</label>
                    <select value={selectedAdminTeam.league} onChange={(e) => editTeam(selectedAdminTeam.id, "league", e.target.value)}>{data.leagues.map((league) => <option key={league}>{league}</option>)}</select>
                  </div>
                  <div>
                    <label>Division</label>
                    <select value={selectedAdminTeam.division} onChange={(e) => editTeam(selectedAdminTeam.id, "division", e.target.value)}>{data.divisions.map((division) => <option key={division}>{division}</option>)}</select>
                  </div>
                </div>

                <div className="danger-zone">
                  <button className="danger" onClick={() => deleteTeam(selectedAdminTeam.id)}>Delete Team</button>
                </div>

                <h3>Players</h3>
                <div className="player-add-row">
                  <div className="player-add-name">
                    <label>Player Name</label>
                    <input
                      ref={playerNameInputRef}
                      value={newPlayer.teamId === selectedAdminTeam.id ? newPlayer.name : ""}
                      onChange={(e) => setNewPlayer({ teamId: selectedAdminTeam.id, name: e.target.value, number: newPlayer.teamId === selectedAdminTeam.id ? newPlayer.number : "" })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPlayer();
                        }
                      }}
                    />
                  </div>
                  <div className="player-add-number">
                    <label>Number</label>
                    <input
                      value={newPlayer.teamId === selectedAdminTeam.id ? newPlayer.number : ""}
                      onChange={(e) => setNewPlayer({ teamId: selectedAdminTeam.id, name: newPlayer.teamId === selectedAdminTeam.id ? newPlayer.name : "", number: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPlayer();
                        }
                      }}
                    />
                  </div>
                  <div className="player-add-button-wrap">
                    <button onClick={addPlayer}>Add Player</button>
                  </div>
                </div>

                <div className="player-delete-row">
                  <div>
                    <label>Delete Player</label>
                    <select value={selectedDeletePlayerId} onChange={(e) => setSelectedDeletePlayerId(e.target.value)}>
                      <option value="">Select player</option>
                      {selectedAdminRoster.map((player) => <option key={player.id} value={player.id}>#{player.number || "--"} {player.name}</option>)}
                    </select>
                  </div>
                  <div className="player-add-button-wrap">
                    <button className="danger" onClick={() => { if (!selectedDeletePlayerId) return; deletePlayer(selectedDeletePlayerId); setSelectedDeletePlayerId(""); }}>Delete Player</button>
                  </div>
                </div>

                <div className="stack-list">
                  {selectedAdminRoster.map((player) => (
                    <div className="player-display-row" key={player.id}>
                      <div className="player-number-pill">#{player.number || "--"}</div>
                      <div className="player-name-text">{player.name}</div>
                    </div>
                  ))}
                  {!selectedAdminRoster.length && <p className="muted">No players on this team yet.</p>}
                </div>
              </>
            ) : (
              <p className="muted">Select a team to edit its info, roster, or delete it.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
