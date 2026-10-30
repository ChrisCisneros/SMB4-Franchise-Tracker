import { useEffect, useRef } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "../firebase";
import { MAX_HISTORY, MAX_PLAY_LOG, STORAGE_KEY } from "../config/constants";
import { defaultLeagueExtras, makeSafeGame } from "../utils/gameState";
import { makeSafePlayoffBracket } from "../utils/playoffUtils";

const LEAGUE_EXTRAS_BACKUP_KEY = `${STORAGE_KEY}.leagueExtras.v5`;
const PROTECTED_SNAPSHOT_PATH = "leagueProtected/v5Snapshot";

function hasOwn(obj,key){return Object.prototype.hasOwnProperty.call(obj||{},key)}
function hasMeaningfulLeagueExtras(extras={}){
  return Object.entries(extras||{}).some(([key,value])=>{
    const fallback=defaultLeagueExtras[key];
    if(Array.isArray(value))return value.length>0;
    if(value&&typeof value==='object')return Object.keys(value).length>0;
    if(typeof value==='string')return Boolean(value.trim())&&value!==fallback;
    return value!==undefined&&value!==null&&value!==fallback;
  });
}
function readLeagueExtrasBackupRecord(){
  try{
    const raw=localStorage.getItem(LEAGUE_EXTRAS_BACKUP_KEY);
    const parsed=raw?JSON.parse(raw):null;
    if(!parsed||typeof parsed!=='object')return null;
    if(parsed.extras&&typeof parsed.extras==='object')return parsed;
    return {version:5,updatedAt:0,extras:parsed};
  }catch{return null}
}
function readLeagueExtrasBackup(){return readLeagueExtrasBackupRecord()?.extras||null}
function writeLeagueExtrasBackup(extras,updatedAt=Date.now()){
  try{localStorage.setItem(LEAGUE_EXTRAS_BACKUP_KEY,JSON.stringify({version:5,updatedAt,extras:extras||{}}))}catch{}
}
function safeParseSnapshot(value){
  try{
    const parsed=JSON.parse(value?.json||'');
    return parsed&&typeof parsed==='object'?{extras:parsed,updatedAt:Number(value?.updatedAt||0)}:null;
  }catch{return null}
}
function mergeRemoteExtras(prevExtras={},remoteExtras={}){
  const backup=readLeagueExtrasBackup()||{};
  const merged={...defaultLeagueExtras,...backup,...prevExtras,...remoteExtras};
  // Realtime Database can omit empty arrays/objects. Missing remote fields must never
  // silently erase a locally saved calendar, ceremony plan, museum, or commissioner data.
  for(const key of Object.keys(defaultLeagueExtras)){
    if(!hasOwn(remoteExtras,key)){
      if(hasOwn(prevExtras,key))merged[key]=prevExtras[key];
      else if(hasOwn(backup,key))merged[key]=backup[key];
    }
  }
  return merged;
}

export default function usePersistence({ data, setData }) {
  const hasLoadedFirebaseGame = useRef(false);
  const hasLoadedFirebaseTeams = useRef(false);
  const hasLoadedFirebasePlayers = useRef(false);

  function syncTeamsToFirebase(nextTeams) {
    set(ref(db, "teams"), nextTeams).catch((error) => console.error("[Firebase Debug] WRITE teams failed", error));
  }

  function syncPlayersToFirebase(nextPlayers) {
    set(ref(db, "players"), nextPlayers).catch((error) => console.error("[Firebase Debug] WRITE players failed", error));
  }

  function syncCurrentGameToFirebase(nextCurrentGame) {
    set(ref(db, "currentGame"), makeSafeGame(nextCurrentGame)).catch((error) => console.error("[Firebase Debug] WRITE currentGame failed", error));
  }

  function syncLastFinalGameToFirebase(nextLastFinalGame) {
    set(ref(db, "lastFinalGame"), nextLastFinalGame).catch((error) => console.error("[Firebase Debug] WRITE lastFinalGame failed", error));
  }

  function syncPlayoffBracketToFirebase(nextBracket) {
    set(ref(db, "playoffBracket"), nextBracket).catch((error) => console.error("[Firebase Debug] WRITE playoffBracket failed", error));
  }

  function syncDailyResultsRowsToFirebase(nextRows) {
    set(ref(db, "dailyResultsRows"), nextRows).catch((error) => console.error("[Firebase Debug] WRITE dailyResultsRows failed", error));
  }

  function syncSeasonHistoryToFirebase(nextHistory) {
    set(ref(db, "seasonHistory"), nextHistory).catch((error) => console.error("[Firebase Debug] WRITE seasonHistory failed", error));
  }

  function syncLeagueExtrasToFirebase(nextExtras) {
    const backup=readLeagueExtrasBackup()||{};
    const current=data?.leagueExtras||{};
    const canonical={...defaultLeagueExtras,...backup,...current,...(nextExtras||{})};
    const updatedAt=Date.now();
    writeLeagueExtrasBackup(canonical,updatedAt);
    const snapshot={version:5,updatedAt,json:JSON.stringify(canonical)};
    Promise.all([
      set(ref(db, "leagueExtras"), canonical),
      set(ref(db, PROTECTED_SNAPSHOT_PATH), snapshot),
    ]).catch((error) => console.error("[Firebase Debug] WRITE leagueExtras/V5 backup failed", error));
  }

  function syncGamesToFirebase(nextGames) {
    set(ref(db, "games"), nextGames).catch((error) => console.error("[Firebase Debug] WRITE games failed", error));
  }

  function syncActiveSeasonNameToFirebase(nextName) {
    set(ref(db, "activeSeasonName"), nextName).catch((error) => console.error("[Firebase Debug] WRITE activeSeasonName failed", error));
  }

  function syncAllDataToFirebase() {
    syncTeamsToFirebase(data.teams);
    syncPlayersToFirebase(data.players);
    syncCurrentGameToFirebase(data.currentGame);
    syncLastFinalGameToFirebase(data.lastFinalGame || null);
    syncGamesToFirebase(data.games || []);
    syncLeagueExtrasToFirebase(data.leagueExtras || {});
    syncActiveSeasonNameToFirebase(data.activeSeasonName || "Season 4");
    alert("Synced local data to Firebase. V5 protected league backup refreshed.");
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
    if(hasMeaningfulLeagueExtras(data.leagueExtras||{}))writeLeagueExtrasBackup(data.leagueExtras||{});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch (error) {
      try {
        const smallerData = {
          ...safeData,
          currentGame: { ...safeData.currentGame, history: [], playLog: (safeData.currentGame.playLog || []).slice(0, 40) },
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
      setData((prev) => ({ ...prev, leagueExtras: mergeRemoteExtras(prev.leagueExtras||{},value) }));
    });
  }, [setData]);

  // V5 redundancy layer: this JSON snapshot preserves empty arrays/objects exactly,
  // which Firebase's normal tree representation can otherwise omit.
  useEffect(() => {
    const protectedRef = ref(db, PROTECTED_SNAPSHOT_PATH);
    return onValue(protectedRef, (snapshot) => {
      const protectedCopy=safeParseSnapshot(snapshot.val());
      if(!protectedCopy)return;
      const localRecord=readLeagueExtrasBackupRecord();
      // Never let an older cloud safety copy roll a newer local universe backward.
      if(localRecord?.updatedAt&&protectedCopy.updatedAt<localRecord.updatedAt)return;
      writeLeagueExtrasBackup(protectedCopy.extras,protectedCopy.updatedAt);
      setData((prev)=>({...prev,leagueExtras:mergeRemoteExtras(prev.leagueExtras||{},protectedCopy.extras)}));
    });
  },[setData]);

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
      if (!Array.isArray(value)) { hasLoadedFirebaseTeams.current = true; return; }
      setData((prev) => ({ ...prev, teams: value }));
      hasLoadedFirebaseTeams.current = true;
    });
  }, [setData]);

  useEffect(() => {
    const playersRef = ref(db, "players");
    return onValue(playersRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) { hasLoadedFirebasePlayers.current = true; return; }
      setData((prev) => ({ ...prev, players: value }));
      hasLoadedFirebasePlayers.current = true;
    });
  }, [setData]);

  useEffect(() => {
    const gameRef = ref(db, "currentGame");
    return onValue(gameRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) { hasLoadedFirebaseGame.current = true; return; }
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
      setData((prev) => ({ ...prev, playoffBracket: makeSafePlayoffBracket(value) }));
    });
  }, [setData]);

  return {
    syncTeamsToFirebase, syncPlayersToFirebase, syncCurrentGameToFirebase,
    syncLastFinalGameToFirebase, syncAllDataToFirebase, syncPlayoffBracketToFirebase,
    syncSeasonHistoryToFirebase, syncDailyResultsRowsToFirebase, syncLeagueExtrasToFirebase,
    syncGamesToFirebase, syncActiveSeasonNameToFirebase,
  };
}
