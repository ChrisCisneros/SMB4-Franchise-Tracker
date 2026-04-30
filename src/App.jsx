
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { db } from "./firebase";
import { onValue, ref, set } from "firebase/database";

const STORAGE_KEY = "franchise-tracker-bugfix-v1";
const CONTROL_PASSWORD = "changeme";
const LEGACY_STORAGE_KEYS = [
  "franchise-tracker-fixed7",
  "franchise-tracker-stable-v1",
  "franchise-tracker-full-v1",
  "franchise-tracker-safe-v4",
  "franchise-tracker-safe-v3",
  "franchise-tracker-safe-v2",
  "franchise-tracker-safe-v1",
  "franchise-tracker-simple-v6",
  "franchise-tracker-simple-v5",
  "franchise-tracker-simple-v4",
  "franchise-tracker-simple-v3",
  "franchise-tracker-simple-v2",
  "franchiseData"
];


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
TEAM_COLORS.SF = {
  primary: { main: "#FD5A1E", alt: "#000000", border:"#27251F", text: "#FFFFFF" , gradient: false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#FD5A1E", text: "#FFFFFF" }
  ],
  cityConnect: { main: "#FD5A1E", alt: "#29097a", border: "#1a0354", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.SD = {
  primary: {main: "#302505", alt: "#e3ac17", border: "#e3ac17", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#9e8259", alt: "#e3ac17", text: "#ffffff" }
  ],
  cityConnect: { main: "#06113d", alt: "#ba4404", border: "#ba4404", text: "#ffffff", gradient:false},
};
TEAM_COLORS.NYM = {
  primary: {main: "#0d0d6e", alt: "#ed5f07", border: "#ed5f07", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#ffffff", alt: "#ed5f07", text: "#0d0d6e" }
  ],
  cityConnect: { main: "#454545", alt: "#ba4404", border: "#000000", text: "#ffffff", gradient:false},
};
TEAM_COLORS.PHI = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#a60000", text: "#a60000", gradient:false},
  alternates: [
    { name: "Powder Blue", main: "#388dc2", alt: "#a60000", text: "#ffffff" },
    {name: "Red", main: "#a60000", alt: "#110982", text: "#ffffff"}
  ],
  cityConnect: { main: "#0782ab", alt: "#020a4d", border: "#e6d437", text: "#ffffff", gradient:true},
};
TEAM_COLORS.CIN = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#c40404", text: "#c40404", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#c40404", alt: "#ffffff", text: "#ffffff" }
  ],
  cityConnect: { main: "#262626", alt: "#ba4404", border: "#c40404", text: "#590101", gradient:false},
};
TEAM_COLORS.WSH = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#cf0c0c", text: "#04003b", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#04003b", alt: "#cf0c0c", text: "#ffffff" }
  ],
  cityConnect: { main: "#44679e", alt: "#ba4404", border: "#162133", text: "#ffffff", gradient:false},
};
TEAM_COLORS.LAD = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#001994", text: "#001994", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#001994", alt: "#ffffff", text: "#ffffff" }
  ],
  cityConnect: { main: "#3952cc", alt: "#021059", border: "#6b83fa", text: "#ffffff", gradient:true},
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
  dailyResultsDate: new Date().toISOString().slice(0, 10),
  dailyResultsRows: Array.from({ length: DAILY_ROWS }, emptyDailyRow),
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

function getDisplayGameState(currentGame, inningBanner) {
  if (currentGame.status === "Final") {
    return `F/${currentGame.inning}`;
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


function ChallengeBars({ count = 0, max = 2 }) {
  return (
    <div className="challenge-bars">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`challenge-bar ${i < count ? "is-active" : ""}`} />
      ))}
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
  const [quickEntryInput, setQuickEntryInput] = useState("");
  const [bulkWarnings, setBulkWarnings] = useState([]);
  const [inningBanner, setInningBanner] = useState("");
  const importFileRef = useRef(null);
  const hasLoadedFirebaseGame = useRef(false);
  const [controlPasswordInput, setControlPasswordInput] = useState("");
  const [controlsUnlocked, setControlsUnlocked] = useState(false);
  const playerNameInputRef = useRef(null);
  const channelRef = useRef(null);

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
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(parsed);
            return prevStr === nextStr
              ? prev
              : {
                  ...prev,
                  ...parsed,
                  currentGame: makeSafeGame(parsed.currentGame),
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
    setSelectedDeletePlayerId("");
  }, [selectedAdminTeamId]);

  useEffect(() => {
    const firebaseGameRef = ref(db, "currentGame");
    const unsubscribe = onValue(firebaseGameRef, (snapshot) => {
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
    const firebaseTeamsRef = ref(db, "teams");
    const unsubscribe = onValue(firebaseTeamsRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) return;

      setData((prev) => ({
        ...prev,
        teams: value,
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasLoadedFirebaseGame.current) return;
    const firebaseGameRef = ref(db, "currentGame");
    set(firebaseGameRef, makeSafeGame(data.currentGame)).catch(() => {
      // ignore for now
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
  const teamAbbrLookup = Object.fromEntries(sortedTeams.map((team) => [team.abbr.toUpperCase(), team.id]));
  const currentGame = makeSafeGame(data.currentGame);
  const dailyUsedTeamIds = new Set(
    data.dailyResultsRows.flatMap((row) => [row.awayTeamId, row.homeTeamId]).filter(Boolean)
  );
  const protectedPages = ["live", "daily", "quick", "admin"];

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
  const awayRoster = [...players.filter((p) => p.teamId === currentGame.awayTeamId)].sort((a, b) => Number(a.number || 999) - Number(b.number || 999) || a.name.localeCompare(b.name));
  const homeRoster = [...players.filter((p) => p.teamId === currentGame.homeTeamId)].sort((a, b) => Number(a.number || 999) - Number(b.number || 999) || a.name.localeCompare(b.name));
  const selectedAdminTeam = teams.find((t) => t.id === selectedAdminTeamId);
  const selectedAdminRoster = [...players.filter((p) => p.teamId === selectedAdminTeamId)].sort((a, b) => Number(a.number || 999) - Number(b.number || 999) || a.name.localeCompare(b.name));

  const currentAwayBatter = awayRoster.find((p) => p.id === currentGame.awayLineup[currentGame.awayBatterIndex]);
  const currentHomeBatter = homeRoster.find((p) => p.id === currentGame.homeLineup[currentGame.homeBatterIndex]);
  const currentAwayPitcher = awayRoster.find((p) => p.id === currentGame.awayPitcherId);
  const currentHomePitcher = homeRoster.find((p) => p.id === currentGame.homePitcherId);
  const currentBatter = currentGame.half === "Top" ? currentAwayBatter : currentHomeBatter;
  const onDeckBatter = currentGame.half === "Top"
    ? awayRoster.find((p) => p.id === currentGame.awayLineup[(currentGame.awayBatterIndex + 1) % 9])
    : homeRoster.find((p) => p.id === currentGame.homeLineup[(currentGame.homeBatterIndex + 1) % 9]);
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

  
  function updateChallenges(side, delta) {
    const field = side === "away" ? "awayChallenges" : "homeChallenges";
    const currentValue = side === "away" ? (currentGame.awayChallenges || 0) : (currentGame.homeChallenges || 0);
    updateCurrentGame(field, Math.max(0, Math.min(2, currentValue + delta)));
  }

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


  function exportLeagueData() {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        storageKey: STORAGE_KEY,
        data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const link = document.createElement("a");
      link.href = url;
      link.download = `franchise-tracker-export-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert("Could not export league data.");
    }
  }

  function triggerImportLeagueData() {
    importFileRef.current?.click();
  }

  async function importLeagueData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedData = parsed?.data ?? parsed;

      if (!importedData || typeof importedData !== "object") {
        throw new Error("Invalid file");
      }

      setData((prev) => ({
        ...prev,
        teams: Array.isArray(importedData.teams) ? importedData.teams : prev.teams,
        players: Array.isArray(importedData.players) ? importedData.players : prev.players,
        currentGame: importedData.currentGame ? makeSafeGame(importedData.currentGame) : prev.currentGame,
        dailyResultsRows: Array.isArray(importedData.dailyResultsRows) ? importedData.dailyResultsRows : prev.dailyResultsRows,
        dailyResultsDate: importedData.dailyResultsDate || prev.dailyResultsDate,
      }));

      setPage("dashboard");
      window.alert("League data imported successfully.");
    } catch (error) {
      window.alert("That file could not be imported.");
    } finally {
      event.target.value = "";
    }
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
        if (next.awayPitcherId && next.awayPitcherId !== pitcherId) next.awayPitcherHistory = [...next.awayPitcherHistory, next.awayPitcherId];
        next.awayPitcherId = pitcherId;
      } else {
        if (next.homePitcherId && next.homePitcherId !== pitcherId) next.homePitcherHistory = [...next.homePitcherHistory, next.homePitcherId];
        next.homePitcherId = pitcherId;
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
        return;
      }

      if (action === "strikes") {
        next.strikes = Math.max(0, Math.min(2, next.strikes + delta));
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
        next.latestPlay = "Foul ball.";
        next.playLog = ["Foul ball.", ...next.playLog];
        return;
      }

      if (action === "swinging" || action === "called") {
        const strikeText = action === "swinging" ? "Strike swinging." : "Called strike.";
        if (next.strikes >= 2) {
          next.latestPlay = action === "swinging" ? `${currentBatter ? currentBatter.name : "Batter"} struck out swinging.` : `${currentBatter ? currentBatter.name : "Batter"} struck out looking.`;
          next.playLog = [next.latestPlay, ...next.playLog];
          clearCount(next);
          next.outs += 1;
          stepBatter(next);
          maybeAdvanceHalfInning(next);
        } else {
          next.strikes += 1;
          next.latestPlay = strikeText;
          next.playLog = [strikeText, ...next.playLog];
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
    commitGameUpdate((next) => {
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
        clearCount(next);
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
        };
        text = custom || map[type] || text;
        clearCount(next);

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

      next.latestPlay = text;
      next.playLog = [text, ...next.playLog];
      if (category !== "out" || !text.includes("Score update")) {
        next.lastAnnouncement = next.lastAnnouncement || "No scoring update yet.";
      }
    });

    setPlayInput("");
    setFielderName("");
  }

  function addTeam() {
  if (!newTeam.city || !newTeam.name || !newTeam.abbr) return;

  const nextTeam = {
    id: crypto.randomUUID(),
    city: newTeam.city.trim(),
    name: newTeam.name.trim(),
    abbr: newTeam.abbr.trim().toUpperCase(),
    league: newTeam.league,
    division: newTeam.division,
    wins: Number(newTeam.wins) || 0,
    losses: Number(newTeam.losses) || 0,
    runDiff: Number(newTeam.runDiff) || 0,
  };

  setData((prev) => {
    const nextTeams = [...prev.teams, nextTeam];
    syncTeamsToFirebase(nextTeams);
    return { ...prev, teams: nextTeams };
  });

  setNewTeam({ city: "", name: "", abbr: "", league: "AL", division: "East", wins: 0, losses: 0, runDiff: 0 });
}

  function deleteTeam(teamId) {
    setData((prev) => ({
      ...prev,
      teams: prev.teams.filter((team) => team.id !== teamId),
      players: prev.players.filter((player) => player.teamId !== teamId),
      dailyResultsRows: prev.dailyResultsRows.map((row) => ({ ...row, awayTeamId: row.awayTeamId === teamId ? "" : row.awayTeamId, homeTeamId: row.homeTeamId === teamId ? "" : row.homeTeamId })),
    }));
  }

  function editTeam(teamId, field, value) {
    setData((prev) => ({ ...prev, teams: prev.teams.map((team) => team.id === teamId ? { ...team, [field]: value } : team) }));
  }

  function addPlayer() {
  alert("addPlayer fired");
  console.log("[Firebase Debug] addPlayer fired", {
    teamId: newPlayer.teamId,
    name: newPlayer.name,
    number: newPlayer.number,
  });

  if (!newPlayer.teamId || !newPlayer.name) {
    alert("guard blocked addPlayer");
    console.log("[Firebase Debug] guard blocked addPlayer", {
      teamId: newPlayer.teamId,
      name: newPlayer.name,
      number: newPlayer.number,
    });
    return;
  }

  setData((prev) => {
    const nextPlayers = [
      ...prev.players,
      {
        id: crypto.randomUUID(),
        teamId: newPlayer.teamId,
        name: newPlayer.name,
        number: newPlayer.number,
      },
    ];

    alert("about to write players");
    console.log("[Firebase Debug] writing players", {
      count: nextPlayers.length,
      lastPlayer: nextPlayers[nextPlayers.length - 1],
    });

    syncPlayersToFirebase(nextPlayers);

    return {
      ...prev,
      players: nextPlayers,
    };
  });

  setNewPlayer({ teamId: newPlayer.teamId, name: "", number: "" });
  setTimeout(() => playerNameInputRef.current?.focus(), 0);
}
}

  function deletePlayer(playerId) {
  setData((prev) => {
    const nextPlayers = prev.players.filter((player) => player.id !== playerId);
    console.log("[Firebase Debug] deleting player", {
      playerId,
      remaining: nextPlayers.length,
    });
    syncPlayersToFirebase(nextPlayers);
    return {
      ...prev,
      players: nextPlayers,
    };
  });
}

  function updateRecord(teamId, field, value) {
    setData((prev) => ({ ...prev, teams: prev.teams.map((team) => team.id === teamId ? { ...team, [field]: Number(value) } : team) }));
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

  function applyQuickEntryInput() {
    const lines = quickEntryInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) return;

    const warnings = [];
    const parsedRows = [];
    const usedTeamIds = new Set(
      data.dailyResultsRows.flatMap((row) => [row.awayTeamId, row.homeTeamId]).filter(Boolean)
    );

    lines.forEach((line, index) => {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length !== 4) {
        warnings.push(`Line ${index + 1} skipped: use format "SF 5 SD 2".`);
        return;
      }

      const [awayToken, awayScoreRaw, homeToken, homeScoreRaw] = parts;
      const awayTeamId = teamAbbrLookup[awayToken.toUpperCase()];
      const homeTeamId = teamAbbrLookup[homeToken.toUpperCase()];
      const awayScore = Number(awayScoreRaw);
      const homeScore = Number(homeScoreRaw);

      if (!awayTeamId || !homeTeamId) {
        warnings.push(`Line ${index + 1} skipped: team abbreviation not recognized.`);
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
      if (usedTeamIds.has(awayTeamId) || usedTeamIds.has(homeTeamId)) {
        warnings.push(`Line ${index + 1} skipped: one of those teams is already added today.`);
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

    if (!parsedRows.length) {
      setBulkWarnings(warnings);
      return;
    }

    setData((prev) => {
      const existingRows = [...prev.dailyResultsRows];
      let parseIndex = 0;

      const updatedRows = existingRows.map((row) => {
        const isEmpty =
          !row.awayTeamId &&
          !row.homeTeamId &&
          row.awayScore === "" &&
          row.homeScore === "";
        if (isEmpty && parseIndex < parsedRows.length) {
          const nextRow = parsedRows[parseIndex];
          parseIndex += 1;
          return nextRow;
        }
        return row;
      });

      while (parseIndex < parsedRows.length) {
        updatedRows.push(parsedRows[parseIndex]);
        parseIndex += 1;
      }

      return {
        ...prev,
        dailyResultsRows: updatedRows,
      };
    });

    setBulkWarnings(warnings);
    setQuickEntryInput("");
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

        if (awayIndex >= 0) updatedTeams[awayIndex] = { ...updatedTeams[awayIndex], wins: updatedTeams[awayIndex].wins + (awayWon ? 1 : 0), losses: updatedTeams[awayIndex].losses + (homeWon ? 1 : 0), runDiff: (updatedTeams[awayIndex].runDiff || 0) - margin };
        if (homeIndex >= 0) updatedTeams[homeIndex] = { ...updatedTeams[homeIndex], wins: updatedTeams[homeIndex].wins + (homeWon ? 1 : 0), losses: updatedTeams[homeIndex].losses + (awayWon ? 1 : 0), runDiff: (updatedTeams[homeIndex].runDiff || 0) + margin };

        newGames.unshift({ id: crypto.randomUUID(), date: prev.dailyResultsDate, awayTeamId: row.awayTeamId, homeTeamId: row.homeTeamId, awayScore, homeScore, status: "Final", quickEntry: true });
      });

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
    const finishedGame = { ...currentGame, id: crypto.randomUUID(), status: "Final" };
    setData((prev) => ({
      ...prev,
      games: [finishedGame, ...prev.games],
      teams: prev.teams.map((team) => {
        if (team.id === currentGame.homeTeamId) return { ...team, wins: team.wins + (homeWon ? 1 : 0), losses: team.losses + (awayWon ? 1 : 0), runDiff: (team.runDiff || 0) + margin };
        if (team.id === currentGame.awayTeamId) return { ...team, wins: team.wins + (awayWon ? 1 : 0), losses: team.losses + (homeWon ? 1 : 0), runDiff: (team.runDiff || 0) - margin };
        return team;
      }),
      currentGame: { ...defaultCurrentGame(), date: new Date().toISOString().slice(0, 10) },
    }));
    setPage("dashboard");
  }


  function setLiveInningHalf(nextHalf) {
    clearBanner();
    setData((prev) => ({
      ...prev,
      currentGame: {
        ...makeSafeGame(prev.currentGame),
        inningStatus: "",
        half: nextHalf,
        status: prev.currentGame.status === "Not Started" ? "Live" : prev.currentGame.status,
      },
    }));
  }

  function changeLiveInning(delta) {
    clearBanner();
    setData((prev) => ({
      ...prev,
      currentGame: {
        ...makeSafeGame(prev.currentGame),
        inningStatus: "",
        inning: Math.max(1, (Number(prev.currentGame.inning) || 1) + delta),
        status: prev.currentGame.status === "Not Started" ? "Live" : prev.currentGame.status,
      },
    }));
  }

  function resetCurrentGame() {
    if (!window.confirm("Reset this live game back to a fresh start?")) return;

    setData((prev) => {
      const current = makeSafeGame(prev.currentGame);
      const fresh = defaultCurrentGame();

      return {
        ...prev,
        currentGame: {
          ...fresh,
          date: current.date || fresh.date,
          awayTeamId: current.awayTeamId,
          homeTeamId: current.homeTeamId,
          awayLineup: current.awayLineup,
          homeLineup: current.homeLineup,
          awayPitcherId: current.awayPitcherId,
          homePitcherId: current.homePitcherId,
          awayLook: current.awayLook || fresh.awayLook,
          homeLook: current.homeLook || fresh.homeLook,
        },
      };
    });

    setInningBanner("");
  }



  function debugFirebase(label, payload) {
    try {
      console.log(`[Firebase Debug] ${label}`, payload);
    } catch (error) {
      // ignore
    }
  }

  function syncTeamsToFirebase(nextTeams) {
    debugFirebase("WRITE teams -> Firebase", {
      count: Array.isArray(nextTeams) ? nextTeams.length : "not-array",
      firstTeam: Array.isArray(nextTeams) && nextTeams[0]
        ? {
            id: nextTeams[0].id,
            abbr: nextTeams[0].abbr,
            name: nextTeams[0].name,
          }
        : null,
    });

    set(ref(db, "teams"), nextTeams)
      .then(() => {
        debugFirebase("WRITE teams success", {
          count: Array.isArray(nextTeams) ? nextTeams.length : "not-array",
        });
      })
      .catch((error) => {
        console.error("[Firebase Debug] WRITE teams failed", error);
      });
  }

  function syncPlayersToFirebase(nextPlayers) {
    debugFirebase("WRITE players -> Firebase", {
      count: Array.isArray(nextPlayers) ? nextPlayers.length : "not-array",
      lastPlayer:
        Array.isArray(nextPlayers) && nextPlayers.length
          ? nextPlayers[nextPlayers.length - 1]
          : null,
    });

    set(ref(db, "players"), nextPlayers)
      .then(() => {
        debugFirebase("WRITE players success", {
          count: Array.isArray(nextPlayers) ? nextPlayers.length : "not-array",
        });
      })
      .catch((error) => {
        console.error("[Firebase Debug] WRITE players failed", error);
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
        ];

  return (
    <div className="app-shell wide-shell">
      <div className="topbar">
        <div>
          <h1>Franchise Tracker</h1>
          <p>MLB The Show 26 commissioner dashboard</p>
        </div>
        <div className="topbar-actions">
          <button onClick={exportLeagueData}>Export Data</button>
          <button onClick={triggerImportLeagueData}>Import Data</button>
          <button className="danger" onClick={resetLeague}>Reset All Data</button>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json"
            className="hidden-file-input"
            onChange={importLeagueData}
          />
        </div>
      </div>
      <div className="nav">
        <button onClick={() => goToPage("dashboard")}>Dashboard</button>
        <button onClick={() => goToPage("standings")}>Standings</button>
        {controlsUnlocked && (
          <>
            <button onClick={() => goToPage("live")}>Live Game</button>
            <button onClick={() => goToPage("daily")}>Daily Results</button>
            <button onClick={() => goToPage("quick")}>Quick Update</button>
            <button onClick={() => goToPage("admin")}>Admin</button>
          </>
        )}
      </div>

      <div className="access-card">
        <div>
          <strong>{controlsUnlocked ? "Controls unlocked" : "Viewer mode"}</strong>
          <div className="muted">
            {controlsUnlocked
              ? "All pages are available."
              : "Only Dashboard and Standings are available until unlocked."}
          </div>
        </div>

        {controlsUnlocked ? (
          <button onClick={lockControls}>Lock Controls</button>
        ) : (
          <div className="access-form">
            <input
              type="password"
              value={controlPasswordInput}
              onChange={(e) => setControlPasswordInput(e.target.value)}
              placeholder="Enter control password"
            />
            <button onClick={unlockControls}>Unlock Controls</button>
          </div>
        )}
      </div>



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
                          <ChallengeBars count={currentGame.awayChallenges || 0} />
                        </div>

                        <div className="score-center">
                          <span className="score-number">{currentGame.awayScore}</span>
                          <span className="score-dash">-</span>
                          <span className="score-number">{currentGame.homeScore}</span>
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
                          <ChallengeBars count={currentGame.homeChallenges || 0} />
                        </div>
                      </div>

                      <div className="inning-text unified-inning-text">{displayGameState}</div>

                      <div className="count-bubble unified-count-bubble">
                        {combinedCountText}
                      </div>

                      <div className="active-batter-banner">At Bat: {currentBatter ? `#${currentBatter.number || "--"} ${currentBatter.name}` : (currentGame.liveBatterName ? `#${currentGame.liveBatterNumber || "--"} ${currentGame.liveBatterName}` : "Set lineup")}</div>
                      <div className="muted">Pitching: {fieldingPitcher ? `#${fieldingPitcher.number || "--"} ${fieldingPitcher.name}` : (currentGame.livePitcherName ? `#${currentGame.livePitcherNumber || "--"} ${currentGame.livePitcherName}` : "Set pitcher")}</div>

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
                                {(inningBanner || currentGame.status === "Final") && <div className="event-banner">Inning Status: {displayGameState}</div>}
              </>
            ) : (
              <p>No live game set up yet.</p>
            )}
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
        </div>
      )}

      {page === "live" && (
        <div className="live-layout">
          <div className="card live-main-card">
            <h2>Live Scoring</h2>
            {homeTeam && awayTeam && <div className="matchup-line">{awayTeam.abbr} {currentGame.awayScore} - {currentGame.homeScore} {homeTeam.abbr}</div>}

            <div className="live-top-setup">
              <div><label>Away Team</label><select value={currentGame.awayTeamId} onChange={(e) => updateCurrentGame("awayTeamId", e.target.value)}><option value="">Select away team</option>{sortedTeams.map((team) => <option value={team.id} key={team.id}>{teamOptionLabel(team)}</option>)}</select></div>
              <div><label>Home Team</label><select value={currentGame.homeTeamId} onChange={(e) => updateCurrentGame("homeTeamId", e.target.value)}><option value="">Select home team</option>{sortedTeams.map((team) => <option value={team.id} key={team.id}>{teamOptionLabel(team)}</option>)}</select></div>
              <div><label>Date</label><input type="date" value={currentGame.date} onChange={(e) => updateCurrentGame("date", e.target.value)} /></div>
              <div><label>Status</label><select value={currentGame.status} onChange={(e) => updateCurrentGame("status", e.target.value)}><option>Not Started</option><option>Live</option><option>Mid-Inning</option><option>Final</option></select></div>
            </div>

            <div className="live-correction-row">
              <div className="live-correction-group">
                <span className="live-correction-label">Inning</span>
                <button onClick={() => changeLiveInning(-1)}>-</button>
                <span className="live-correction-value">{currentGame.inning}</span>
                <button onClick={() => changeLiveInning(1)}>+</button>
              </div>

              <div className="live-correction-group">
                <span className="live-correction-label">Half</span>
                <button onClick={() => setLiveInningHalf("Top")}>Top</button>
                <button onClick={() => setLiveInningHalf("Bottom")}>Bot</button>
                <button onClick={() => setLiveInningHalf("Mid")}>Mid</button>
                <button onClick={() => setLiveInningHalf("End")}>End</button>
              </div>

              <div className="live-correction-group">
                <button className="danger-lite" onClick={resetCurrentGame}>Reset This Game</button>
              </div>
            </div>

            <div className="mlb-live-layout">
              <div className="score-panel">
                <div className="unified-scoreboard-card">
                  <div className="unified-scoreboard-header">
                    <div className="team-look-column">
                      <div className="team-pill" style={{ background: awayColors.gradient ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})` : awayColors.main, borderColor: awayColors.border, color: awayColors.text }}>
                        {awayTeam ? awayTeam.abbr : "AWY"}
                      </div>
                      <ChallengeBars count={currentGame.awayChallenges || 0} />
                      <div className="challenge-controls">
                        <button onClick={() => updateChallenges("away",-1)}>-</button>
                        <span>Challenges</span>
                        <button onClick={() => updateChallenges("away",1)}>+</button>
                      </div>
                      <button className="look-switch-button" onClick={() => cycleLiveLook("away")}>{liveAwayLookLabel}</button>
                    </div>

                    <div className="score-center">
                      <span className="score-number">{currentGame.awayScore}</span>
                      <span className="score-dash">-</span>
                      <span className="score-number">{currentGame.homeScore}</span>
                    </div>

                    <div className="team-look-column">
                      <div className="team-pill" style={{ background: homeColors.gradient ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})` : homeColors.main, borderColor: homeColors.border, color: homeColors.text }}>
                        {homeTeam ? homeTeam.abbr : "HME"}
                      </div>
                      <ChallengeBars count={currentGame.homeChallenges || 0} />
                      <div className="challenge-controls">
                        <button onClick={() => updateChallenges("home",-1)}>-</button>
                        <span>Challenges</span>
                        <button onClick={() => updateChallenges("home",1)}>+</button>
                      </div>
                      <button className="look-switch-button" onClick={() => cycleLiveLook("home")}>{liveHomeLookLabel}</button>
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

                  <div className="inning-text unified-inning-text">{displayGameState}</div>

                  <div className="count-bubble unified-count-bubble">
                    {combinedCountText}
                  </div>

                  <div className="active-batter-banner">At Bat: {currentBatter ? `#${currentBatter.number || "--"} ${currentBatter.name}` : (currentGame.liveBatterName ? `#${currentGame.liveBatterNumber || "--"} ${currentGame.liveBatterName}` : "Set lineup")}</div>
                  <div className="muted">On Deck: {onDeckBatter ? `#${onDeckBatter.number || "--"} ${onDeckBatter.name}` : "—"}</div>
                  <div className="muted">Pitching: {fieldingPitcher ? `#${fieldingPitcher.number || "--"} ${fieldingPitcher.name}` : (currentGame.livePitcherName ? `#${currentGame.livePitcherNumber || "--"} ${currentGame.livePitcherName}` : "Set pitcher")}</div>

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

      {page === "daily" && (
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
                    <div><select value={row.awayTeamId} onChange={(e) => updateDailyRow(row.id, "awayTeamId", e.target.value)}><option value="">Away team</option>{sortedTeams.map((team) => <option value={team.id} key={team.id}>{teamOptionLabel(team)}</option>)}</select></div>
                    <div><input type="number" value={row.awayScore} onChange={(e) => updateDailyRow(row.id, "awayScore", e.target.value)} placeholder="0" /></div>
                    <div><select value={row.homeTeamId} onChange={(e) => updateDailyRow(row.id, "homeTeamId", e.target.value)}><option value="">Home team</option>{sortedTeams.map((team) => <option value={team.id} key={team.id}>{teamOptionLabel(team)}</option>)}</select></div>
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

          <div className="card daily-helper-card">
            <h3>Quick Add</h3>
            <p className="muted">Enter one matchup at a time like <strong>SF 5 SD 2</strong>. Duplicate teams are skipped automatically.</p>

            {bulkWarnings.length > 0 && (
              <div className="bulk-warning-box">
                {bulkWarnings.map((warning, index) => (
                  <div key={`${warning}-${index}`}>{warning}</div>
                ))}
              </div>
            )}

            <div className="quick-entry-row">
              <input
                className="quick-entry-input"
                value={quickEntryInput}
                onChange={(e) => setQuickEntryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyQuickEntryInput();
                  }
                }}
                placeholder="SF 5 SD 2"
              />
              <button onClick={applyQuickEntryInput}>Add Entry</button>
            </div>

            <h3>Teams Added Today</h3>
            <p className="muted">Red means already added somewhere in today’s results. Gray means not added yet.</p>

            <div className="team-status-grid">
              {sortedTeams.map((team) => (
                <div
                  key={team.id}
                  className={`team-status-chip ${dailyUsedTeamIds.has(team.id) ? "is-added" : "is-open"}`}
                >
                  <span className="team-status-abbr">{team.abbr}</span>
                  <span className="team-status-name">{team.name}</span>
                </div>
              ))}
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
                        style={{ gridTemplateColumns: "30px 1fr 80px 80px 60px 60px" }}
                      >
                        <span>#</span>
                        <span>Team</span>
                        <span>W-L</span>
                        <span>PCT</span>
                        <span>GB</span>
                        <span>RD</span>
                      </div>
                      {divisionTeams.map((team, index) => (
                        <div
                          className="standings-row"
                          key={team.id}
                          style={{ gridTemplateColumns: "30px 1fr 80px 80px 60px 60px" }}
                        >
                          <span>{index + 1}</span>
                          <span>{team.abbr}</span>
                          <span>{team.wins}-{team.losses}</span>
                          <span>{pct(team.wins, team.losses)}</span>
                          <span>{gamesBack(team, leader)}</span>
                          <span>{team.runDiff > 0 ? `+${team.runDiff}` : team.runDiff}</span>
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
                    .sort((a, b) => a.abbr.localeCompare(b.abbr) || a.name.localeCompare(b.name));

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

                          <div>
                            <label>Run Diff</label>
                            <input
                              type="number"
                              value={team.runDiff || 0}
                              onChange={(e) => updateRecord(team.id, "runDiff", e.target.value)}
                            />
                          </div>

                          <div className="muted">{pct(team.wins, team.losses)}</div>
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

      {page === "admin" && (
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
                {sortedTeams.map((team) => <option key={team.id} value={team.id}>{teamOptionLabel(team)}</option>)}
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
