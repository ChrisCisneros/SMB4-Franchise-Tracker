import { useEffect } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "../firebase";
import { STORAGE_KEY } from "../config/constants";
import { defaultLeagueExtras, makeSafeGame } from "../utils/gameState";
import { makeSafePlayoffBracket } from "../utils/playoffUtils";

const LEAGUE_EXTRAS_BACKUP_KEY = `${STORAGE_KEY}.leagueExtras.v5`;
const PROTECTED_SNAPSHOT_PATH = "leagueProtected/v5Snapshot";
const LEGACY_LIVE_KEYS = [
  `${STORAGE_KEY}.currentGame.v5`,
  `${STORAGE_KEY}.currentGame.syncTrace.v8`,
];

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
function stripLiveGame(data={}){
  const { currentGame: _currentGame, ...persistable } = data || {};
  return persistable;
}
function clearLegacyLivePersistence(){
  try{
    LEGACY_LIVE_KEYS.forEach((key)=>localStorage.removeItem(key));
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return;
    const parsed=JSON.parse(raw);
    if(parsed&&typeof parsed==='object'&&hasOwn(parsed,'currentGame')){
      delete parsed.currentGame;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(parsed));
    }
  }catch{}
}

function mergeRemoteExtras(prevExtras={},remoteExtras={}){
  const backup=readLeagueExtrasBackup()||{};
  const merged={...defaultLeagueExtras,...backup,...prevExtras,...remoteExtras};
  const prevSession=prevExtras?.ceremonySession;
  const remoteSession=remoteExtras?.ceremonySession;
  if(prevSession&&remoteSession){
    const prevStamp=Date.parse(prevSession.updatedAt||prevSession.completedAt||prevSession.startedAt||0)||0;
    const remoteStamp=Date.parse(remoteSession.updatedAt||remoteSession.completedAt||remoteSession.startedAt||0)||0;
    if(prevStamp>remoteStamp)merged.ceremonySession=prevSession;
  }
  for(const key of Object.keys(defaultLeagueExtras)){
    if(!hasOwn(remoteExtras,key)){
      if(hasOwn(prevExtras,key))merged[key]=prevExtras[key];
      else if(hasOwn(backup,key))merged[key]=backup[key];
    }
  }
  return merged;
}

export default function usePersistence({ data, setData }) {
  function syncTeamsToFirebase(nextTeams) {
    return set(ref(db, "teams"), nextTeams).catch((error) => console.error("[Firebase Debug] WRITE teams failed", error));
  }

  function syncPlayersToFirebase(nextPlayers) {
    return set(ref(db, "players"), nextPlayers).catch((error) => console.error("[Firebase Debug] WRITE players failed", error));
  }

  // V6.4.13: Firebase is the only persisted authority for the live game.
  // React may render an optimistic local update, but no localStorage copy,
  // recovery revision, reconnect republish, or local-vs-remote arbitration exists.
  function syncCurrentGameToFirebase(nextCurrentGame) {
    const safeGame=makeSafeGame(nextCurrentGame);
    return set(ref(db, "currentGame"), safeGame).catch((error) => {
      console.error("[Firebase Debug] WRITE currentGame failed", error);
    });
  }

  function syncLastFinalGameToFirebase(nextLastFinalGame) {
    return set(ref(db, "lastFinalGame"), nextLastFinalGame).catch((error) => console.error("[Firebase Debug] WRITE lastFinalGame failed", error));
  }

  function syncPlayoffBracketToFirebase(nextBracket) {
    return set(ref(db, "playoffBracket"), nextBracket).catch((error) => console.error("[Firebase Debug] WRITE playoffBracket failed", error));
  }

  function syncDailyResultsRowsToFirebase(nextRows) {
    return set(ref(db, "dailyResultsRows"), nextRows).catch((error) => console.error("[Firebase Debug] WRITE dailyResultsRows failed", error));
  }

  function syncSeasonHistoryToFirebase(nextHistory) {
    return set(ref(db, "seasonHistory"), nextHistory).catch((error) => console.error("[Firebase Debug] WRITE seasonHistory failed", error));
  }

  function syncLeagueExtrasToFirebase(nextExtras) {
    const backup=readLeagueExtrasBackup()||{};
    const current=data?.leagueExtras||{};
    const canonical={...defaultLeagueExtras,...backup,...current,...(nextExtras||{})};
    const updatedAt=Date.now();
    writeLeagueExtrasBackup(canonical,updatedAt);
    const snapshot={version:5,updatedAt,json:JSON.stringify(canonical)};
    return Promise.all([
      set(ref(db, "leagueExtras"), canonical),
      set(ref(db, PROTECTED_SNAPSHOT_PATH), snapshot),
    ]).catch((error) => console.error("[Firebase Debug] WRITE leagueExtras/V5 backup failed", error));
  }

  function syncGamesToFirebase(nextGames) {
    return set(ref(db, "games"), nextGames).catch((error) => console.error("[Firebase Debug] WRITE games failed", error));
  }

  function syncActiveSeasonNameToFirebase(nextName) {
    return set(ref(db, "activeSeasonName"), nextName).catch((error) => console.error("[Firebase Debug] WRITE activeSeasonName failed", error));
  }

  function syncAllDataToFirebase() {
    // Intentionally exclude currentGame. Bulk sync must never overwrite a live game
    // with whatever happens to be in this browser's React state.
    syncTeamsToFirebase(data.teams);
    syncPlayersToFirebase(data.players);
    syncLastFinalGameToFirebase(data.lastFinalGame || null);
    syncGamesToFirebase(data.games || []);
    syncLeagueExtrasToFirebase(data.leagueExtras || {});
    syncActiveSeasonNameToFirebase(data.activeSeasonName || "Season 4");
    alert("Synced franchise data to Firebase. Live game was left untouched.");
  }

  useEffect(() => {
    clearLegacyLivePersistence();
  }, []);

  useEffect(() => {
    const seasonHistoryRef = ref(db, "seasonHistory");
    return onValue(seasonHistoryRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) return;
      setData((prev) => ({ ...prev, seasonHistory: value }));
    });
  }, [setData]);

  // Local safety persistence is for the franchise universe only. currentGame is
  // deliberately omitted, and this effect does not depend on currentGame, so a
  // pitch/play no longer serializes the whole app into localStorage.
  useEffect(() => {
    const persistable=stripLiveGame(data);
    if(hasMeaningfulLeagueExtras(data.leagueExtras||{}))writeLeagueExtrasBackup(data.leagueExtras||{});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      try {
        const smallerData = {
          ...persistable,
          games: (persistable.games || []).slice(0, 200),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(smallerData));
      } catch {}
    }
  }, [
    data.leagues, data.divisions, data.teams, data.players, data.games,
    data.lastFinalGame, data.dailyResultsDate, data.dailyResultsRows,
    data.runsScored, data.runsAllowed, data.playoffBracket, data.seasonHistory,
    data.activeSeasonName, data.leagueExtras,
  ]);

  useEffect(() => {
    const extrasRef = ref(db, "leagueExtras");
    return onValue(extrasRef, (snapshot) => {
      const value = snapshot.val();
      if (!value || typeof value !== "object") return;
      setData((prev) => ({ ...prev, leagueExtras: mergeRemoteExtras(prev.leagueExtras||{},value) }));
    });
  }, [setData]);

  useEffect(() => {
    const protectedRef = ref(db, PROTECTED_SNAPSHOT_PATH);
    return onValue(protectedRef, (snapshot) => {
      const protectedCopy=safeParseSnapshot(snapshot.val());
      if(!protectedCopy)return;
      const localRecord=readLeagueExtrasBackupRecord();
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
      if (!Array.isArray(value)) return;
      setData((prev) => ({ ...prev, teams: value }));
    });
  }, [setData]);

  useEffect(() => {
    const playersRef = ref(db, "players");
    return onValue(playersRef, (snapshot) => {
      const value = snapshot.val();
      if (!Array.isArray(value)) return;
      setData((prev) => ({ ...prev, players: value }));
    });
  }, [setData]);

  useEffect(() => {
    const gameRef = ref(db, "currentGame");
    return onValue(gameRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) return;
      const cleanRemote=makeSafeGame(value);
      setData((prev) => ({ ...prev, currentGame: cleanRemote }));
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
