
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { db } from "./firebase";
import { onValue, ref, set } from "firebase/database";
const STORAGE_KEY = "smb4-franchise-tracker-v1";
const CONTROL_PASSWORD = "changeme";
const LEGACY_STORAGE_KEYS = [];
const SEASON_LENGTH = 40;
const WILD_CARD_TEAMS_PER_LEAGUE = 5;
const PLAYOFF_TEAMS_PER_LEAGUE = 8;
const PLAYOFF_WINS_NEEDED = 3;




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
  cityConnect: { main: "#4583d3", alt: "#01105c", border: "#8c1204", text: "#ffffff", gradient:false},
};
TEAM_COLORS.AZ = {
  primary: {main: "#ffffff", alt: "#a70808", border: "#02ebeb", text: "#ffffff", gradient:false},
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
  cityConnect: { main: "#9b0303", alt: "#ba4404", border: "#000000", text: "#9b0303", gradient:false},
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
  cityConnect: { main: "#023353", alt: "#fffb1d", border: "#fff5d3", text: "#fff5d3", gradient:false},
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
  cityConnect: { main: "#000000", alt: "#77602f", border: "#77602f", text: "#77602f", gradient:false},
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
  cityConnect: { main: "#460000", alt: "#29097a", border: "#9c8031", text: "#9c8031", gradient:false },
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
  history: [],
});

function defaultBracketSeries() {
  return {
    awayTeamId: "",
    homeTeamId: "",
    awayWins: 0,
    homeWins: 0,
    winnerTeamId: "",
    games: [],
  };
}

function defaultPlayoffBracket() {
  return {
    al: {
      wc1: defaultBracketSeries(),
      wc2: defaultBracketSeries(),
      ds1: defaultBracketSeries(),
      ds2: defaultBracketSeries(),
      cs: defaultBracketSeries(),
    },
    nl: {
      wc1: defaultBracketSeries(),
      wc2: defaultBracketSeries(),
      ds1: defaultBracketSeries(),
      ds2: defaultBracketSeries(),
      cs: defaultBracketSeries(),
    },
    worldSeries: defaultBracketSeries(),
  };
}

function makeSafePlayoffBracket(bracket) {
  const defaults = defaultPlayoffBracket();

  const mergeSeries = (series) => ({
    ...defaultBracketSeries(),
    ...(series || {}),
    games: Array.isArray(series?.games) ? series.games : [],
  });

  return {
    al: {
      wc1: mergeSeries(bracket?.al?.wc1 || defaults.al.wc1),
      wc2: mergeSeries(bracket?.al?.wc2 || defaults.al.wc2),
      ds1: mergeSeries(bracket?.al?.ds1 || defaults.al.ds1),
      ds2: mergeSeries(bracket?.al?.ds2 || defaults.al.ds2),
      cs: mergeSeries(bracket?.al?.cs || defaults.al.cs),
    },
    nl: {
      wc1: mergeSeries(bracket?.nl?.wc1 || defaults.nl.wc1),
      wc2: mergeSeries(bracket?.nl?.wc2 || defaults.nl.wc2),
      ds1: mergeSeries(bracket?.nl?.ds1 || defaults.nl.ds1),
      ds2: mergeSeries(bracket?.nl?.ds2 || defaults.nl.ds2),
      cs: mergeSeries(bracket?.nl?.cs || defaults.nl.cs),
    },
    worldSeries: mergeSeries(bracket?.worldSeries || defaults.worldSeries),
  };
}

function getWinsNeededForSeries() {
  return PLAYOFF_WINS_NEEDED;
}

function getPlayoffSeries(bracket, seriesId) {
  if (seriesId === "worldSeries") return bracket.worldSeries;

  const [league, key] = seriesId.split("_");
  return bracket?.[league]?.[key] || defaultBracketSeries();
}

function setPlayoffSeries(bracket, seriesId, nextSeries) {
  if (seriesId === "worldSeries") {
    return {
      ...bracket,
      worldSeries: nextSeries,
    };
  }

  const [league, key] = seriesId.split("_");

  return {
    ...bracket,
    [league]: {
      ...bracket[league],
      [key]: nextSeries,
    },
  };
}

function advancePlayoffWinner(bracket, seriesId, winnerTeamId) {
  if (!winnerTeamId) return bracket;

  const next = makeSafePlayoffBracket(bracket);

  const advanceMap = {
    al_wc1: ["al", "ds1", "homeTeamId"],
    al_wc2: ["al", "ds2", "homeTeamId"],
    al_ds1: ["al", "cs", "awayTeamId"],
    al_ds2: ["al", "cs", "homeTeamId"],
    al_cs: ["worldSeries", null, "awayTeamId"],

    nl_wc1: ["nl", "ds1", "homeTeamId"],
    nl_wc2: ["nl", "ds2", "homeTeamId"],
    nl_ds1: ["nl", "cs", "awayTeamId"],
    nl_ds2: ["nl", "cs", "homeTeamId"],
    nl_cs: ["worldSeries", null, "homeTeamId"],
  };

  const target = advanceMap[seriesId];
  if (!target) return next;

  const [league, key, field] = target;

  if (league === "worldSeries") {
    next.worldSeries = {
      ...next.worldSeries,
      [field]: winnerTeamId,
    };
    return next;
  }

  next[league][key] = {
    ...next[league][key],
    [field]: winnerTeamId,
  };

  return next;
}

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

  playoffBracket: defaultPlayoffBracket(),
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
  playoffBracket: makeSafePlayoffBracket(parsed.playoffBracket),
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

  if (gb <= 0) return "—";

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

  const raw =
    ((Number(cutoffTeam.wins || 0) - Number(team.wins || 0)) +
      (Number(team.losses || 0) - Number(cutoffTeam.losses || 0))) /
    2;

  const isCutoffOrTiedWithCutoff = raw === 0;

  if (isCutoffOrTiedWithCutoff) return "—";

  if (raw < 0) {
    return `+${formatHalfGame(raw)}`;
  }

  return formatHalfGame(raw);
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

function eliminationNumber(team, target, gamesPerSeason = SEASON_LENGTH) {
  if (!team || !target || team.id === target.id) return "—";

  const targetWins = Number(target.wins || 0);
  const teamLosses = Number(team.losses || 0);

  const number = gamesPerSeason + 1 - targetWins - teamLosses;

  return number <= 0 ? "E" : number;
}

function gamesPlayed(team) {
  return Number(team.wins || 0) + Number(team.losses || 0);
}

function gamesRemaining(team) {
  return Math.max(0, SEASON_LENGTH - gamesPlayed(team));
}

function isEliminatedFromTarget(team, target) {
  if (!team || !target || team.id === target.id) return false;
  return eliminationNumber(team, target) === "E";
}

function maxPossibleWins(team) {
  return Number(team.wins || 0) + gamesRemaining(team);
}

function hasClinchedDivision(team, picture) {
  if (!team || !picture) return false;

  const divisionTeams = picture.leagueTeams?.filter(
    (otherTeam) =>
      otherTeam.division === team.division && otherTeam.id !== team.id
  ) || [];

  return divisionTeams.every(
    (otherTeam) => Number(team.wins || 0) > maxPossibleWins(otherTeam)
  );
}

function hasClinchedTopLeagueSeed(team, picture) {
  if (!team || !picture) return false;

  const leagueTeams = picture.leagueTeams || [];

  return leagueTeams.every(
    (otherTeam) =>
      otherTeam.id === team.id ||
      Number(team.wins || 0) > maxPossibleWins(otherTeam)
  );
}

function getPlayoffMarker(team, picture, divisionLeader) {
  if (!team || !picture) return "";

  const divisionLeaderIds = new Set(
    picture.divisionLeaders.map((leaderTeam) => leaderTeam.id)
  );

  const firstTeamOut = picture.wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE];

  const allLeagueGamesFinished = (picture.leagueTeams || []).every(
    (leagueTeam) => gamesRemaining(leagueTeam) === 0
  );

  if (allLeagueGamesFinished && hasClinchedTopLeagueSeed(team, picture)) {
    return "z";
  }

  if (hasClinchedDivision(team, picture)) {
    return "y";
  }

  if (firstTeamOut) {
    const firstTeamOutMaxWins =
      Number(firstTeamOut.wins || 0) + gamesRemaining(firstTeamOut);

    const hasClinchedPlayoffSpot =
      Number(team.wins || 0) > firstTeamOutMaxWins;

    if (hasClinchedPlayoffSpot) {
      if (!divisionLeaderIds.has(team.id)) {
        return "w";
      }

      return "x";
    }
  }

  if (divisionLeader && isEliminatedFromTarget(team, divisionLeader)) {
    return "e";
  }

  return "";
}

function getWildcardMarker(team, picture, index) {
  if (!team || !picture) return "";

  const isWildCardTeam = index < WILD_CARD_TEAMS_PER_LEAGUE;
  const cutoffTeam = picture.cutoffTeam;

  if (isWildCardTeam) {
    const firstTeamOut = picture.wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE];

    if (!firstTeamOut) return "";

    const firstTeamOutMaxWins =
      Number(firstTeamOut.wins || 0) + gamesRemaining(firstTeamOut);

    if (Number(team.wins || 0) > firstTeamOutMaxWins) {
      return "w";
    }

    return "";
  }

  if (cutoffTeam && isEliminatedFromTarget(team, cutoffTeam)) {
    return "e";
  }

  return "";
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
const [selectedPlayoffSeriesId, setSelectedPlayoffSeriesId] = useState("al_wc1");
const [playoffAwayScore, setPlayoffAwayScore] = useState("");
const [playoffHomeScore, setPlayoffHomeScore] = useState("");
const [recentlyUpdatedTeamId, setRecentlyUpdatedTeamId] = useState("");
const recentlyUpdatedTimerRef = useRef(null);


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

function syncLastFinalGameToFirebase(nextLastFinalGame) {
  set(ref(db, "lastFinalGame"), nextLastFinalGame).catch((error) => {
    console.error("[Firebase Debug] WRITE lastFinalGame failed", error);
  });
}

function syncAllDataToFirebase() {
  syncTeamsToFirebase(data.teams);
  syncPlayersToFirebase(data.players);
  set(ref(db, "currentGame"), makeSafeGame(data.currentGame)).catch((error) => {
    console.error("[Firebase Debug] WRITE currentGame failed", error);
  });
  syncLastFinalGameToFirebase(data.lastFinalGame || null);
  alert("Synced local data to Firebase.");
}
  function syncPlayoffBracketToFirebase(nextBracket) {
  set(ref(db, "playoffBracket"), nextBracket).catch((error) => {
    console.error("[Firebase Debug] WRITE playoffBracket failed", error);
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

    // Firebase handles cross-device sync.
// Do not broadcast local snapshots, because stale tabs can overwrite fresh Firebase data.
  }, [data]);


  useEffect(() => {
  // Cross-device sync is handled by Firebase listeners below.
  channelRef.current = null;
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
  const lastFinalGameRef = ref(db, "lastFinalGame");

  const unsubscribe = onValue(lastFinalGameRef, (snapshot) => {
    const value = snapshot.val();

    if (!value) return;

    setData((prev) => ({
      ...prev,
      lastFinalGame: value,
    }));
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const playoffBracketRef = ref(db, "playoffBracket");

  const unsubscribe = onValue(playoffBracketRef, (snapshot) => {
    const value = snapshot.val();

    if (!value) return;

    setData((prev) => ({
      ...prev,
      playoffBracket: makeSafePlayoffBracket(value),
    }));
  });

  return () => unsubscribe();
}, []);
  


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
  { id: "al_wc1", label: "AL Wild Card A — #3 seed vs WC3" },
  { id: "al_wc2", label: "AL Wild Card B — WC1 vs WC2" },
  { id: "al_ds1", label: "ALDS A — #1 seed vs WC A winner" },
  { id: "al_ds2", label: "ALDS B — #2 seed vs WC B winner" },
  { id: "al_cs", label: "ALCS" },

  { id: "nl_wc1", label: "NL Wild Card A — #3 seed vs WC3" },
  { id: "nl_wc2", label: "NL Wild Card B — WC1 vs WC2" },
  { id: "nl_ds1", label: "NLDS A — #1 seed vs WC A winner" },
  { id: "nl_ds2", label: "NLDS B — #2 seed vs WC B winner" },
  { id: "nl_cs", label: "NLCS" },

  { id: "worldSeries", label: "World Series" },
];

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

function seriesStatusText(series, seriesId) {
  const awayTeam = teamById(series.awayTeamId);
  const homeTeam = teamById(series.homeTeamId);

  if (!awayTeam || !homeTeam) return "Waiting for matchup";

  const winsNeeded = getWinsNeededForSeries(seriesId);

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
  if (!window.confirm("Initialize the playoff bracket from the current standings? This will clear existing playoff series scores.")) return;

  const nextBracket = defaultPlayoffBracket();

  data.leagues.forEach((league) => {
    const leagueKey = league.toLowerCase();
    const picture = playoffPicture.find((item) => item.league === league);
    const leaders = picture?.divisionLeaders || [];
    const wildcards = picture?.wildcardTeams || [];

    nextBracket[leagueKey].wc1 = {
      ...defaultBracketSeries(),
      awayTeamId: leaders[2]?.id || "",
      homeTeamId: wildcards[2]?.id || "",
    };

    nextBracket[leagueKey].wc2 = {
      ...defaultBracketSeries(),
      awayTeamId: wildcards[0]?.id || "",
      homeTeamId: wildcards[1]?.id || "",
    };

    nextBracket[leagueKey].ds1 = {
      ...defaultBracketSeries(),
      awayTeamId: leaders[0]?.id || "",
      homeTeamId: "",
    };

    nextBracket[leagueKey].ds2 = {
      ...defaultBracketSeries(),
      awayTeamId: leaders[1]?.id || "",
      homeTeamId: "",
    };
  });

  syncPlayoffBracketToFirebase(nextBracket);

  setData((prev) => ({
    ...prev,
    playoffBracket: nextBracket,
  }));
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

  const displaySeries = {
    ...series,
    awayTeamId: awayTeam?.id || series.awayTeamId,
    homeTeamId: homeTeam?.id || series.homeTeamId,
  };

  return (
    <div className={`bracket-series-card bracket-slot ${extraClass}`}>
      <div className="bracket-series-label">{label}</div>

      <div className="bracket-team-row">
        <span>{awayTeam?.abbr || "TBD"}</span>
        <strong>{awayTeam?.abbr || "TBD"}</strong>
        <small>{series.awayWins || 0}</small>
      </div>

      <div className="bracket-team-row">
        <span>{homeTeam?.abbr || "TBD"}</span>
        <strong>{homeTeam?.abbr || "TBD"}</strong>
        <small>{series.homeWins || 0}</small>
      </div>

      <div className="bracket-series-status">
        {seriesStatusText(displaySeries, seriesId)}
      </div>
    </div>
  );
}

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
  setData((prev) => {
    const nextPlayers = prev.players.map((player) =>
      player.id === currentBatter.id
        ? {
            ...player,
            ab: (player.ab || 0) + 1,
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

        setData((prev) => {
  const nextPlayers = prev.players.map((p) => {
    if (p.id !== batterId || type === "caughtstealing") return p;
    return {
      ...p,
      ab: (p.ab || 0) + 1,
      lastAB:
        type === "flyout" ? "FO" :
        type === "groundout" ? "GO" :
        type === "lineout" ? "LO" :
        type === "popup" ? "POP" :
        type === "strikeout" || type === "calledstrikeout" ? "K" :
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
  function applyPlayoffGameResult({ seriesId, awayScore, homeScore }) {
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

  if (awayScore === homeScore) {
    window.alert("Playoff games cannot end in a tie.");
    return null;
  }

  const winnerTeamId = awayScore > homeScore ? series.awayTeamId : series.homeTeamId;

  const nextSeries = {
    ...series,
    awayWins: Number(series.awayWins || 0) + (winnerTeamId === series.awayTeamId ? 1 : 0),
    homeWins: Number(series.homeWins || 0) + (winnerTeamId === series.homeTeamId ? 1 : 0),
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

  const winsNeeded = getWinsNeededForSeries(seriesId);

  if (nextSeries.awayWins >= winsNeeded || nextSeries.homeWins >= winsNeeded) {
    nextSeries.winnerTeamId = winnerTeamId;
  }

  let nextBracket = setPlayoffSeries(currentBracket, seriesId, nextSeries);

  if (nextSeries.winnerTeamId) {
    nextBracket = advancePlayoffWinner(nextBracket, seriesId, nextSeries.winnerTeamId);
  }

  return nextBracket;
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
if (currentGame.gameType === "playoff") {
  if (!currentGame.playoffSeriesId) {
    window.alert("Select the playoff series before finalizing this playoff game.");
    return;
  }

  const nextBracket = applyPlayoffGameResult({
    seriesId: currentGame.playoffSeriesId,
    awayScore: Number(currentGame.awayScore || 0),
    homeScore: Number(currentGame.homeScore || 0),
  });

  if (!nextBracket) return;

  setData((prev) => {
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
    syncLastFinalGameToFirebase(finishedGame);
    syncPlayoffBracketToFirebase(nextBracket);

    return {
      ...prev,
      games: [finishedGame, ...prev.games],
      players: resetPlayers,
      lastFinalGame: finishedGame,
      playoffBracket: nextBracket,
      currentGame: {
        ...defaultCurrentGame(),
        date: new Date().toISOString().slice(0, 10),
      },
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
      syncLastFinalGameToFirebase(finishedGame);

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
  return (
    <div className="app-shell wide-shell">
      <div className="topbar">
       <div>
  <div className="title-row">
    <h1>SMB4 Franchise Central</h1>
    <span className="version-pill">v0.5</span>
  </div>
  <p>SMB4 League Hub · 40-game regular season · Seeds lock after Game 40</p>
</div>
        <div className="topbar-actions">
  {controlsUnlocked && (
    <button className="danger" onClick={resetLeague}>
      Reset All Data
    </button>
  )}
</div>
</div>

<div className="nav">
  <button onClick={() => setPage("dashboard")}>Dashboard</button>
  <button onClick={() => setPage("standings")}>Standings</button>
  <button onClick={() => setPage("bracket")}>Bracket</button>

  {controlsUnlocked && <button onClick={() => setPage("live")}>Live</button>}
  {controlsUnlocked && <button onClick={() => setPage("admin")}>Admin</button>}
  {controlsUnlocked && <button onClick={() => setPage("daily")}>Daily</button>}
  {controlsUnlocked && <button onClick={() => setPage("quick")}>Quick</button>}
  {controlsUnlocked && <button onClick={() => setPage("bracketAdmin")}>Bracket Admin</button>}
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
  <div className="dashboard-v3">
    <div className="dashboard-hero-grid">
      <div className="card dashboard-broadcast-card">
        <div className="dashboard-card-kicker">
          {homeTeam && awayTeam ? "Live Game" : "Latest Result"}
        </div>

        {homeTeam && awayTeam ? (
          <>
            <div className="dashboard-matchup-row">
              <div className="dashboard-team-tile">
                <div
                  className="dashboard-team-logo"
                  style={{
                    background: awayColors.gradient
                      ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})`
                      : awayColors.main,
                    borderColor: awayColors.border,
                    color: awayColors.text,
                  }}
                >
                  {awayTeam.abbr}
                </div>
                <strong>{awayTeam.wins}-{awayTeam.losses}</strong>
              </div>

              <div className="dashboard-score-core">
                <div className="dashboard-scoreline">
                  <span>{currentGame.awayScore}</span>
                  <span className="dashboard-score-dash">-</span>
                  <span>{currentGame.homeScore}</span>
                </div>
                <div className="dashboard-game-state">
                  {["Live", "Warmup", "Delay", "Final"].includes(currentGame.status)
                    ? `${currentGame.status} · ${currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}`
                    : currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}
                </div>
                <div className="dashboard-count-pill">
                  {currentGame.balls}-{currentGame.strikes} · {currentGame.outs} outs
                </div>
              </div>

              <div className="dashboard-team-tile">
                <div
                  className="dashboard-team-logo"
                  style={{
                    background: homeColors.gradient
                      ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})`
                      : homeColors.main,
                    borderColor: homeColors.border,
                    color: homeColors.text,
                  }}
                >
                  {homeTeam.abbr}
                </div>
                <strong>{homeTeam.wins}-{homeTeam.losses}</strong>
              </div>
            </div>

            <div className="dashboard-mini-linescore">
              <div className="dashboard-mini-line dashboard-mini-head">
                <span>Team</span>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={`dash-head-${i}`}>{i + 1}</span>
                ))}
                <span>R</span>
              </div>

              <div className="dashboard-mini-line">
                <span>{awayTeam.abbr}</span>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={`dash-away-${i}`}>
                    {renderInningCell("away", i + 1, currentGame)}
                  </span>
                ))}
                <span>{currentGame.awayScore}</span>
              </div>

              <div className="dashboard-mini-line">
                <span>{homeTeam.abbr}</span>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={`dash-home-${i}`}>
                    {renderInningCell("home", i + 1, currentGame)}
                  </span>
                ))}
                <span>{currentGame.homeScore}</span>
              </div>
            </div>
          </>
        ) : lastFinalGame && lastFinalAwayTeam && lastFinalHomeTeam ? (
          <>
            <div className="dashboard-matchup-row">
              <div className="dashboard-team-tile">
                <div className="dashboard-team-logo">{lastFinalAwayTeam.abbr}</div>
                <strong>{lastFinalAwayTeam.wins}-{lastFinalAwayTeam.losses}</strong>
              </div>

              <div className="dashboard-score-core">
                <div className="dashboard-scoreline">
                  <span>{lastFinalGame.awayScore}</span>
                  <span className="dashboard-score-dash">-</span>
                  <span>{lastFinalGame.homeScore}</span>
                </div>
                <div className="dashboard-game-state">Final</div>
                <div className="dashboard-count-pill">
                  {lastFinalAwayTeam.abbr} @ {lastFinalHomeTeam.abbr}
                </div>
              </div>

              <div className="dashboard-team-tile">
                <div className="dashboard-team-logo">{lastFinalHomeTeam.abbr}</div>
                <strong>{lastFinalHomeTeam.wins}-{lastFinalHomeTeam.losses}</strong>
              </div>
            </div>
          </>
        ) : (
          <p className="muted">No live game or final result yet.</p>
        )}
      </div>

      <div className="card dashboard-franchise-card">
        <div className="dashboard-card-kicker">Franchise Focus</div>

        {favoriteTeam ? (
          <>
            <div className="franchise-top-row">
              <div className="franchise-logo">{favoriteTeam.abbr}</div>
              <div>
                <h2>{favoriteTeam.city} {favoriteTeam.name}</h2>
                <p className="muted">{favoriteTeam.league} {favoriteTeam.division}</p>
              </div>
            </div>

            <div className="franchise-record">{favoriteTeam.wins}-{favoriteTeam.losses}</div>

            <div className="franchise-stat-grid">
              <div>
                <span>PCT</span>
                <strong>{pct(favoriteTeam.wins, favoriteTeam.losses)}</strong>
              </div>
              <div>
                <span>RD</span>
                <strong>{favoriteTeam.runDiff > 0 ? `+${favoriteTeam.runDiff}` : favoriteTeam.runDiff}</strong>
              </div>
              <div>
                <span>Left</span>
                <strong>{favoriteGamesLeft}</strong>
              </div>
              <div>
                <span>Mark</span>
                <strong>{favoriteMarker || "—"}</strong>
              </div>
            </div>

            <div className="dashboard-note">
              {favoriteDivisionRank === 1
                ? `Leading the division${favoriteDivisionChaser ? ` over ${favoriteDivisionChaser.abbr}` : ""}.`
                : `${gamesBack(favoriteTeam, favoriteDivisionLeader)} GB in the division.`}
            </div>
          </>
        ) : (
          <p className="muted">No favorite team found yet.</p>
        )}
      </div>
    </div>

    <div className="dashboard-story-grid">
      {dashboardStories.slice(0, 5).map((story) => (
        <div className="card dashboard-story-card" key={`${story.title}-${story.value}`}>
          <div className="dashboard-card-kicker">{story.title}</div>
          <strong>{story.value}</strong>
          <p>{story.detail}</p>
        </div>
      ))}
    </div>

    <div className="dashboard-lower-grid">
      <div className="card">
        <h2>Playoff Push</h2>

        <div className="dashboard-playoff-grid">
          {playoffPicture.map((picture) => (
            <div className="dashboard-playoff-card" key={`${picture.league}-dash-playoff`}>
              <h3>{picture.league}</h3>

              <div className="playoff-section-label">Division Leaders</div>
              {picture.divisionLeaders.map((team, index) => (
                <div className="dashboard-race-row" key={`${picture.league}-leader-${team.id}`}>
                  <strong>{index + 1}</strong>
                  <span>{team.abbr}</span>
                  <span>{team.wins}-{team.losses}</span>
                  <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
                </div>
              ))}

              <div className="playoff-section-label">Wild Card Cut</div>
              {picture.wildcardTeams
                .slice(Math.max(0, WILD_CARD_TEAMS_PER_LEAGUE - 2), WILD_CARD_TEAMS_PER_LEAGUE + 3)
                .map((team, index) => {
                  const actualIndex = Math.max(0, WILD_CARD_TEAMS_PER_LEAGUE - 2) + index;
                  const isCutoff = actualIndex === WILD_CARD_TEAMS_PER_LEAGUE - 1;

                  return (
                    <div
                      className={`dashboard-race-row ${isCutoff ? "dashboard-cutoff-row" : ""}`}
                      key={`${picture.league}-bubble-${team.id}`}
                    >
                      <strong>{actualIndex < WILD_CARD_TEAMS_PER_LEAGUE ? `WC${actualIndex + 1}` : "OUT"}</strong>
                      <span>{team.abbr}</span>
                      <span>{team.wins}-{team.losses}</span>
                      <span>{wildCardGamesBack(team, picture.cutoffTeam, actualIndex)}</span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>League Board</h2>

        <div className="list-row">
          <strong>Best Record</strong>
          <span>{bestRecordTeam ? `${bestRecordTeam.abbr} ${bestRecordTeam.wins}-${bestRecordTeam.losses}` : "—"}</span>
        </div>

        <div className="list-row">
          <strong>Best RD</strong>
          <span>{bestRunDiff ? `${bestRunDiff.abbr} ${bestRunDiff.runDiff > 0 ? "+" : ""}${bestRunDiff.runDiff}` : "—"}</span>
        </div>

        <div className="list-row">
          <strong>Worst Record</strong>
          <span>{worstRecordTeam ? `${worstRecordTeam.abbr} ${worstRecordTeam.wins}-${worstRecordTeam.losses}` : "—"}</span>
        </div>

        <div className="list-row">
          <strong>Tightest Race</strong>
          <span>
            {tightestDivisionRace
              ? `${tightestDivisionRace.league} ${tightestDivisionRace.division}: ${tightestDivisionRace.gap}`
              : "—"}
          </span>
        </div>

        <h3 style={{ marginTop: "18px" }}>Top 5 Records</h3>
        {sortTeams(teams).slice(0, 5).map((team) => (
          <div className="dashboard-race-row" key={`dash-top-${team.id}`}>
            <strong>{team.abbr}</strong>
            <span>{team.wins}-{team.losses}</span>
            <span>{pct(team.wins, team.losses)}</span>
            <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      {page === "live" && controlsUnlocked && (
  <div className="live-ipad-page">
    <div className="card live-ipad-card">
      <div className="live-ipad-header-row">
        <div>
          <h2>Live Scoring</h2>
          <p className="muted">Big-button SMB controller for live games and postseason.</p>
        </div>

        <div className="inline-buttons">
          <button className="danger-lite" onClick={resetCurrentMatch}>Reset Full Game</button>
          <button onClick={resetLiveCountAndBases}>Reset Count/Bases</button>
        </div>
      </div>

      <div className="live-top-setup">
        <div>
          <label>Away Team</label>
          <select
            value={currentGame.awayTeamId}
            onChange={(e) => updateCurrentGame("awayTeamId", e.target.value)}
          >
            <option value="">Select away team</option>
            {numberedTeams.map((team) => (
              <option value={team.id} key={team.id}>
                {`${team.listNumber}. ${teamOptionLabel(team)}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Home Team</label>
          <select
            value={currentGame.homeTeamId}
            onChange={(e) => updateCurrentGame("homeTeamId", e.target.value)}
          >
            <option value="">Select home team</option>
            {numberedTeams.map((team) => (
              <option value={team.id} key={team.id}>
                {`${team.listNumber}. ${teamOptionLabel(team)}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={currentGame.date}
            onChange={(e) => updateCurrentGame("date", e.target.value)}
          />
        </div>

        <div>
          <label>Status</label>
          <select
            value={currentGame.status}
            onChange={(e) => updateCurrentGame("status", e.target.value)}
          >
            <option>Not Started</option>
            <option>Live</option>
            <option>Mid-Inning</option>
            <option>Final</option>
            <option>Warmup</option>
            <option>Delay</option>
          </select>
        </div>

        <div>
          <label>Game Type</label>
          <select
            value={currentGame.gameType || "regular"}
            onChange={(e) => {
              updateCurrentGame("gameType", e.target.value);
              if (e.target.value === "regular") updateCurrentGame("playoffSeriesId", "");
            }}
          >
            <option value="regular">Regular Season</option>
            <option value="playoff">Playoff</option>
          </select>
        </div>

        <div>
          <label>Playoff Series</label>
          <select
            value={currentGame.playoffSeriesId || ""}
            disabled={(currentGame.gameType || "regular") !== "playoff"}
            onChange={(e) => updateCurrentGame("playoffSeriesId", e.target.value)}
          >
            <option value="">Select series</option>
            {playoffSeriesOptions.map((series) => (
              <option key={series.id} value={series.id}>
                {playoffSeriesDropdownLabel(series)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ipad-live-scorebug">
        <div className="ipad-score-team">
          <div
            className="ipad-team-abbr"
            style={{
              background: awayColors.gradient
                ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})`
                : awayColors.main,
              borderColor: awayColors.border,
              color: awayColors.text,
            }}
          >
            {awayTeam ? awayTeam.abbr : "AWY"}
          </div>
          <button className="ipad-look-switch-button" onClick={() => cycleLiveLook("away")}>
  {liveAwayLookLabel}
</button>
          <div className="ipad-score-buttons">
            <button onClick={() => changeScore("away", -1)}>-</button>
            <span>{currentGame.awayScore}</span>
            <button onClick={() => changeScore("away", 1)}>+</button>
          </div>
        </div>

        <div className="ipad-center-status">
          <div className="ipad-big-score">
            <span>{currentGame.awayScore}</span>
            <span className="ipad-score-dash">-</span>
            <span>{currentGame.homeScore}</span>
          </div>

          <div className="ipad-inning-display">
  {["Live", "Warmup", "Delay", "Final"].includes(currentGame.status)
    ? `${currentGame.status} · ${currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}`
    : currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}
</div>

          <div className="ipad-count-line">
            <strong>{currentGame.balls}</strong>
            <span>B</span>
            <span className="ipad-count-separator">-</span>
            <strong>{currentGame.strikes}</strong>
            <span>S</span>
          </div>

          <div className="ipad-out-dots">
            {[1, 2].map((outNumber) => (
              <button
                key={outNumber}
                type="button"
                className={currentGame.outs >= outNumber ? "out-dot active" : "out-dot"}
                onClick={() => toggleOutDot(outNumber)}
                aria-label={`${outNumber} out`}
              />
            ))}
          </div>

          <button className="ipad-third-out-button" onClick={() => updateCount("outs", 1)}>
            + Out / Next Half
          </button>
        </div>

        <div className="ipad-score-team">
          <div
            className="ipad-team-abbr"
            style={{
              background: homeColors.gradient
                ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})`
                : homeColors.main,
              borderColor: homeColors.border,
              color: homeColors.text,
            }}
          >
            {homeTeam ? homeTeam.abbr : "HME"}
          </div>
          <button className="ipad-look-switch-button" onClick={() => cycleLiveLook("home")}>
  {liveHomeLookLabel}
</button>
          <div className="ipad-score-buttons">
            <button onClick={() => changeScore("home", -1)}>-</button>
            <span>{currentGame.homeScore}</span>
            <button onClick={() => changeScore("home", 1)}>+</button>
          </div>
        </div>
      </div>

      <div className="ipad-linescore-card">
        <div className="ipad-linescore-row ipad-linescore-head">
          <span>Team</span>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={`head-${i}`}>{i + 1}</span>
          ))}
          <span>R</span>
          <span>H</span>
          <span>E</span>
        </div>

        <div className="ipad-linescore-row">
          <span>{awayTeam ? awayTeam.abbr : "AWY"}</span>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={`away-${i}`}>{renderInningCell("away", i + 1, currentGame)}</span>
          ))}
          <span>{currentGame.awayScore}</span>
          <span>{currentGame.awayHits}</span>
          <span>{currentGame.awayErrors}</span>
        </div>

        <div className="ipad-linescore-row">
          <span>{homeTeam ? homeTeam.abbr : "HME"}</span>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={`home-${i}`}>{renderInningCell("home", i + 1, currentGame)}</span>
          ))}
          <span>{currentGame.homeScore}</span>
          <span>{currentGame.homeHits}</span>
          <span>{currentGame.homeErrors}</span>
        </div>
      </div>

      <div className="ipad-control-grid">
        <div className="ipad-control-card">
          <h3>Balls</h3>
          <div className="ipad-stepper">
            <button onClick={() => updateCount("balls", -1)}>-</button>
            <strong>{currentGame.balls}</strong>
            <button onClick={() => updateCount("balls", 1)}>+</button>
          </div>
        </div>

        <div className="ipad-control-card">
          <h3>Strikes</h3>
          <div className="ipad-stepper">
            <button onClick={() => updateCount("strikes", -1)}>-</button>
            <strong>{currentGame.strikes}</strong>
            <button onClick={() => updateCount("strikes", 1)}>+</button>
          </div>
        </div>

        <div className="ipad-control-card">
          <h3>Inning</h3>
          <div className="ipad-stepper">
            <button onClick={() => adjustLiveInning(-1)}>-</button>
            <strong>{currentGame.inning}</strong>
            <button onClick={() => adjustLiveInning(1)}>+</button>
          </div>

          <div className="ipad-half-buttons">
            <button
              className={currentGame.half === "Top" && !currentGame.inningStatus ? "active-ipad-button" : ""}
              onClick={() => setLiveHalf("Top")}
            >
              ▲ Top
            </button>
            <button onClick={setMidEndInningStatus}>— Mid/End</button>
            <button
              className={currentGame.half === "Bottom" && !currentGame.inningStatus ? "active-ipad-button" : ""}
              onClick={() => setLiveHalf("Bottom")}
            >
              ▼ Bottom
            </button>
          </div>
        </div>

        <div className="ipad-control-card ipad-bases-card">
          <h3>Bases</h3>
          <div className="ipad-base-diamond">
            <button
              className={`ipad-base ipad-base-second ${currentGame.bases.second ? "occupied" : ""}`}
              onClick={() => updateBases("second")}
            >
              2B
            </button>
            <button
              className={`ipad-base ipad-base-third ${currentGame.bases.third ? "occupied" : ""}`}
              onClick={() => updateBases("third")}
            >
              3B
            </button>
            <button
              className={`ipad-base ipad-base-first ${currentGame.bases.first ? "occupied" : ""}`}
              onClick={() => updateBases("first")}
            >
              1B
            </button>
          </div>
        </div>
      </div>

      <div className="ipad-extra-actions">
        <button onClick={() => updateCurrentGame("status", "Live")}>Live</button>
        <button onClick={() => updateCurrentGame("status", "Warmup")}>Warmup</button>
        <button onClick={() => updateCurrentGame("status", "Delay")}>Delay</button>
        <button onClick={() => updateCurrentGame("status", "Final")}>Mark Final</button>
        <button onClick={undoLastPlay}>Undo Last Change</button>
        <button onClick={finalizeGame}>Finalize Game</button>
      </div>
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

      {page === "bracket" && (
  <div className="bracket-page">
    <div className="card season-format-card">
      <h2>Playoff Bracket</h2>
      <p className="muted">
        40-game regular season. Seeds lock after Game 40. Playoff series update from Bracket Admin results.
      </p>
    </div>

    <div className="true-bracket-shell">
      {["AL", "NL"].map((league) => {
        const picture = playoffPicture.find((item) => item.league === league);
        const leaders = picture?.divisionLeaders || [];
        const wildcards = picture?.wildcardTeams || [];

        const seed1 = leaders[0];
        const seed2 = leaders[1];
        const seed3 = leaders[2];
        const wc1 = wildcards[0];
        const wc2 = wildcards[1];
        const wc3 = wildcards[2];

        const isAL = league === "AL";
        const leagueKey = league.toLowerCase();

        return (
          <div
            className={`true-bracket-league ${isAL ? "true-bracket-left" : "true-bracket-right"}`}
            key={`${league}-true-bracket`}
          >
            <h3>{league}</h3>

            <div className="true-bracket-grid">
              <div className="true-bracket-column wildcard-column">
                <div className="bracket-round-title">Wild Card</div>

                {renderBracketSeries(
                  `${leagueKey}_wc1`,
                  "WC A — #3 vs WC3",
                  seed3,
                  wc3,
                  "wc-slot-top"
                )}

                {renderBracketSeries(
                  `${leagueKey}_wc2`,
                  "WC B — WC1 vs WC2",
                  wc1,
                  wc2,
                  "wc-slot-bottom"
                )}
              </div>

              <div className="true-bracket-column lds-column">
                <div className="bracket-round-title">Division Series</div>

                {renderBracketSeries(
                  `${leagueKey}_ds1`,
                  "LDS A — #1 vs WC A Winner",
                  seed1,
                  null,
                  "lds-slot-top"
                )}

                {renderBracketSeries(
                  `${leagueKey}_ds2`,
                  "LDS B — #2 vs WC B Winner",
                  seed2,
                  null,
                  "lds-slot-bottom"
                )}
              </div>

              <div className="true-bracket-column cs-column">
                <div className="bracket-round-title">{league}CS</div>

                {renderBracketSeries(
                  `${leagueKey}_cs`,
                  `${league} Championship`,
                  null,
                  null,
                  "cs-slot"
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="true-world-series-center">
        {renderBracketSeries(
          "worldSeries",
          "World Series",
          null,
          null,
          "world-series-card"
        )}
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
  style={{ gridTemplateColumns: "50px 90px 70px 58px 58px 50px 55px" }}
>
  <span>#</span>
  <span>Team</span>
  <span>W-L</span>
  <span>PCT</span>
  <span>GB</span>
  <span>E#</span>
  <span>RD</span>
</div>

{divisionTeams.map((team, index) => {
  const picture = playoffPicture.find((item) => item.league === league);
  const marker = getPlayoffMarker(team, picture, leader);

  return (
    <div
  className="standings-row"
  key={team.id}
  style={{ gridTemplateColumns: "50px 90px 70px 58px 58px 50px 55px" }}
>
  <span>{index + 1}</span>

  <span className="team-name-cell">
    {marker && <strong className={`playoff-marker marker-${marker}`}>{marker}</strong>}
    <span>{team.abbr}</span>
  </span>

  <span>{team.wins}-{team.losses}</span>
  <span>{pct(team.wins, team.losses)}</span>
  <span>{gamesBack(team, leader)}</span>
  <span>{index === 0 ? "—" : eliminationNumber(team, leader)}</span>
  <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
</div>
  );
})}
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
  style={{ gridTemplateColumns: "50px 90px 70px 58px 58px 50px 55px" }}
>
  <span>Seed</span>
  <span>Div</span>
  <span>Team</span>
  <span>W-L</span>
  <span>PCT</span>
  <span>E#</span>
  <span>RD</span>
</div>

{picture.divisionLeaders.map((team, index) => {
  const marker = getPlayoffMarker(team, picture, team);

  return (
   <div
  className="standings-row wildcard-row division-leader-row"
  key={`${picture.league}-leader-${team.id}`}
  style={{ gridTemplateColumns: "50px 70px 90px 70px 58px 50px 55px" }}
>
      <span>{index + 1}</span>
      <span>{team.division}</span>

      <span className="team-name-cell">
        {marker && <strong className={`playoff-marker marker-${marker}`}>{marker}</strong>}
        <span>{team.abbr}</span>
      </span>

      <span>{team.wins}-{team.losses}</span>
      <span>{pct(team.wins, team.losses)}</span>
      <span>—</span>
      <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
    </div>
  );
})}

      <h4 style={{ marginTop: "22px" }}>Wild Card</h4>

<div
  className="standings-header standings-row wildcard-row"
  style={{ gridTemplateColumns: "50px 90px 70px 58px 58px 50px 55px" }}
>
  <span>Seed</span>
  <span>Team</span>
  <span>W-L</span>
  <span>PCT</span>
  <span>WCGB</span>
  <span>E#</span>
  <span>RD</span>
</div>

{picture.wildcardTeams.map((team, index) => {
  const isWildCardTeam = index < WILD_CARD_TEAMS_PER_LEAGUE;
  const isCutoff = index === WILD_CARD_TEAMS_PER_LEAGUE - 1;
  const marker = getWildcardMarker(team, picture, index);
  return (
    <div
  className={`standings-row wildcard-row ${
    isWildCardTeam ? "wildcard-in" : "wildcard-out"
  } ${isCutoff ? "wildcard-cutoff" : ""}`}
  key={`${picture.league}-wc-${team.id}`}
  style={{ gridTemplateColumns: "50px 90px 70px 58px 58px 50px 55px" }}
>
      <span>{isWildCardTeam ? `WC${index + 1}` : "—"}</span>

      <span className="team-name-cell">
        {marker && <strong className={`playoff-marker marker-${marker}`}>{marker}</strong>}
        <span>{team.abbr}</span>
      </span>

      <span>{team.wins}-{team.losses}</span>
      <span>{pct(team.wins, team.losses)}</span>
      <span>{wildCardGamesBack(team, picture.cutoffTeam, index)}</span>
      <span>{isWildCardTeam ? "—" : eliminationNumber(team, picture.cutoffTeam)}</span>
      <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>

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

                     {groupTeams.map((team) => {
  const gamesPlayed = Number(team.wins || 0) + Number(team.losses || 0);
  const gamesLeft = Math.max(0, SEASON_LENGTH - gamesPlayed);
  const isDone = gamesLeft === 0;
  const rd = Number(team.runDiff || 0);
  const leader = groupTeams[0];

  return (
    <div
  className={`quick-row smb-quick-row ${
    recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""
  }`}
  key={team.id}
>
      <div className="quick-team-name">
        <strong>{team.city} {team.name}</strong>
        <span>{team.abbr}</span>
      </div>

      <div>
        <span className={`quick-game-count ${isDone ? "complete" : "needs-games"}`}>
          Game {gamesPlayed}/{SEASON_LENGTH} · {isDone ? "Done" : `Needs ${gamesLeft}`}
        </span>
      </div>

      <div className="quick-mini-stats">
        <div>
          <label>PCT</label>
          <strong>{pct(Number(team.wins || 0), Number(team.losses || 0))}</strong>
        </div>
        <div>
          <label>GB</label>
          <strong>{gamesBack(team, leader)}</strong>
        </div>
        <div>
          <label>E#</label>
          <strong>{team.id === leader?.id ? "—" : eliminationNumber(team, leader)}</strong>
        </div>
      </div>

      <div className="quick-record-stack">
        <div className="quick-compact-stepper">
          <label>W</label>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "wins", -1)}>-</button>
          <strong>{team.wins || 0}</strong>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "wins", 1)}>+</button>
        </div>

        <div className="quick-compact-stepper">
          <label>L</label>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "losses", -1)}>-</button>
          <strong>{team.losses || 0}</strong>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "losses", 1)}>+</button>
        </div>
      </div>

      <div className="quick-rd-compact">
        <label>RD</label>
        <div className="quick-rd-buttons">
          <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", -5)}>-5</button>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", -1)}>-1</button>
          <strong>{rd > 0 ? `+${rd}` : rd}</strong>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", 1)}>+1</button>
          <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", 5)}>+5</button>
        </div>
      </div>
    </div>
  );
})}

                      {!groupTeams.length && <p className="muted">No teams in this division yet.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {page === "bracketAdmin" && controlsUnlocked && (
  <div className="bracket-admin-page">
    <div className="card">
      <h2>Bracket Admin</h2>
      <p className="muted">
        Initialize the bracket from current seeds, then enter playoff game scores. Series winners automatically advance.
      </p>

      <div className="inline-buttons">
        <button onClick={initializeBracketFromCurrentSeeds}>
          Initialize Bracket From Current Seeds
        </button>
      </div>
    </div>

    <div className="card">
      <h3>Add Playoff Game Result</h3>

      <div className="form-grid">
        <div>
          <label>Series</label>
          <select
            value={selectedPlayoffSeriesId}
            onChange={(e) => setSelectedPlayoffSeriesId(e.target.value)}
          >
            {playoffSeriesOptions.map((series) => (
  <option key={series.id} value={series.id}>
    {playoffSeriesDropdownLabel(series)}
  </option>
))}
          </select>
        </div>

        <div>
          <label>Away / Top Score</label>
          <input
            type="number"
            value={playoffAwayScore}
            onChange={(e) => setPlayoffAwayScore(e.target.value)}
          />
        </div>

        <div>
          <label>Home / Bottom Score</label>
          <input
            type="number"
            value={playoffHomeScore}
            onChange={(e) => setPlayoffHomeScore(e.target.value)}
          />
        </div>
      </div>

      <div className="inline-buttons">
        <button onClick={addPlayoffGameResult}>Add Playoff Result</button>
      </div>
    </div>

    <div className="card">
      <h3>Current Series</h3>

      <div className="bracket-admin-series-list">
        {playoffSeriesOptions.map((option) => {
          const series = getPlayoffSeries(playoffBracket, option.id);

          return (
            <div className="bracket-admin-series-row" key={`admin-${option.id}`}>
              <div>
                <strong>{playoffSeriesDropdownLabel(option)}</strong>
                <div className="muted">
                  {teamAbbr(series.awayTeamId)} vs {teamAbbr(series.homeTeamId)}
                </div>
              </div>

              <div>
                <strong>{series.awayWins || 0}-{series.homeWins || 0}</strong>
                <div className="muted">{seriesStatusText(series, option.id)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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

                <div className="topbar-actions">
  {controlsUnlocked && (
    <button className="danger" onClick={resetLeague}>
      Reset All Data
    </button>
  )}
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
