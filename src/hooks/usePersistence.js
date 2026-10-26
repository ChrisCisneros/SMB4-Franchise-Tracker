import { useEffect, useRef } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "../firebase";
import { MAX_HISTORY, MAX_PLAY_LOG, STORAGE_KEY } from "../config/constants";
import { makeSafeGame } from "../utils/gameState";
import { makeSafePlayoffBracket } from "../utils/playoffUtils";

export default function usePersistence({ data, setData }) {
  const hasLoadedFirebaseGame = useRef(false);
  const hasLoadedFirebaseTeams = useRef(false);
  const hasLoadedFirebasePlayers = useRef(false);

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

  function syncCurrentGameToFirebase(nextCurrentGame) {
    set(ref(db, "currentGame"), makeSafeGame(nextCurrentGame)).catch((error) => {
      console.error("[Firebase Debug] WRITE currentGame failed", error);
    });
  }

  function syncLastFinalGameToFirebase(nextLastFinalGame) {
    set(ref(db, "lastFinalGame"), nextLastFinalGame).catch((error) => {
      console.error("[Firebase Debug] WRITE lastFinalGame failed", error);
    });
  }

  function syncPlayoffBracketToFirebase(nextBracket) {
    set(ref(db, "playoffBracket"), nextBracket).catch((error) => {
      console.error("[Firebase Debug] WRITE playoffBracket failed", error);
    });
  }


  function syncDailyResultsRowsToFirebase(nextRows) {
    set(ref(db, "dailyResultsRows"), nextRows).catch((error) => {
      console.error("[Firebase Debug] WRITE dailyResultsRows failed", error);
    });
  }

  function syncSeasonHistoryToFirebase(nextHistory) {
    set(ref(db, "seasonHistory"), nextHistory).catch((error) => {
      console.error("[Firebase Debug] WRITE seasonHistory failed", error);
    });
  }

  function syncLeagueExtrasToFirebase(nextExtras) {
    set(ref(db, "leagueExtras"), nextExtras).catch((error) => {
      console.error("[Firebase Debug] WRITE leagueExtras failed", error);
    });
  }

  function syncGamesToFirebase(nextGames) {
    set(ref(db, "games"), nextGames).catch((error) => {
      console.error("[Firebase Debug] WRITE games failed", error);
    });
  }

  function syncActiveSeasonNameToFirebase(nextName) {
    set(ref(db, "activeSeasonName"), nextName).catch((error) => {
      console.error("[Firebase Debug] WRITE activeSeasonName failed", error);
    });
  }

  function syncAllDataToFirebase() {
    syncTeamsToFirebase(data.teams);
    syncPlayersToFirebase(data.players);
    syncCurrentGameToFirebase(data.currentGame);
    syncLastFinalGameToFirebase(data.lastFinalGame || null);
    syncGamesToFirebase(data.games || []);
    syncLeagueExtrasToFirebase(data.leagueExtras || {});
    syncActiveSeasonNameToFirebase(data.activeSeasonName || "Season 4");
    alert("Synced local data to Firebase.");
  }

  useEffect(() => {
    const seasonHistoryRef = ref(db, "seasonHistory");
    return onValue(seasonHistoryRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) return;
      setData((prev) => ({ ...prev, seasonHistory: value }));
    });
  }, [setData]);

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
  }, [data]);

  useEffect(() => {
    const extrasRef = ref(db, "leagueExtras");
    return onValue(extrasRef, (snapshot) => {
      const value = snapshot.val();
      if (!value || typeof value !== "object") return;
      setData((prev) => ({ ...prev, leagueExtras: { awards: [], hallOfFame: [], transactions: [], injuries: [], managers: [], rebrands: [], retiredNumbers: [], prospects: [], milestones: [], openingDay: "", seasonTagline: "", powerRankSnapshots: [], standingsSnapshots: [], customRecords: [], manualEvents: [], achievements: [], hofBallot: [], manualClassicGames: [], commentary: [], topPlays: [], leagueCalendar: [], storylines: [], bracketPredictions: [], officialLeagueName: "Super Mega Baseball League", officialLeagueAbbr: "SMBL", seasonCalendar: [], seasonSchedule: [], seasonStartMonday: "", ceremonies: [], worldMoments: [], rivalryNames: {}, gameNightSchedule: {}, fanAwards: [], fanSurveyHistory: [], socialArchives: [], ...value } }));
    });
  }, [setData]);


  useEffect(() => {
    const gamesRef = ref(db, "games");
    return onValue(gamesRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) return;
      setData((prev) => ({ ...prev, games: value }));
    });
  }, [setData]);

  useEffect(() => {
    const seasonNameRef = ref(db, "activeSeasonName");
    return onValue(seasonNameRef, (snapshot) => {
      const value = snapshot.val();
      if (typeof value !== "string" || !value.trim()) return;
      setData((prev) => ({ ...prev, activeSeasonName: value }));
    });
  }, [setData]);

  useEffect(() => {
    const teamsRef = ref(db, "teams");
    return onValue(teamsRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) {
        hasLoadedFirebaseTeams.current = true;
        return;
      }
      setData((prev) => ({ ...prev, teams: value }));
      hasLoadedFirebaseTeams.current = true;
    });
  }, [setData]);

  useEffect(() => {
    const playersRef = ref(db, "players");
    return onValue(playersRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) {
        hasLoadedFirebasePlayers.current = true;
        return;
      }
      setData((prev) => ({ ...prev, players: value }));
      hasLoadedFirebasePlayers.current = true;
    });
  }, [setData]);

  useEffect(() => {
    const gameRef = ref(db, "currentGame");
    return onValue(gameRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        hasLoadedFirebaseGame.current = true;
        return;
      }
      setData((prev) => ({ ...prev, currentGame: makeSafeGame(value) }));
      hasLoadedFirebaseGame.current = true;
    });
  }, [setData]);

  useEffect(() => {
    const lastFinalGameRef = ref(db, "lastFinalGame");
    return onValue(lastFinalGameRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;
      setData((prev) => ({ ...prev, lastFinalGame: value }));
    });
  }, [setData]);

  useEffect(() => {
    const playoffBracketRef = ref(db, "playoffBracket");
    return onValue(playoffBracketRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;
      setData((prev) => ({
        ...prev,
        playoffBracket: makeSafePlayoffBracket(value),
      }));
    });
  }, [setData]);

  return {
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
  };
}
