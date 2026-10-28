import React, { useEffect, useMemo, useState } from "react";
import { BaseDiamond } from "../components/GameWidgets";
import LiveField from "../components/LiveField";
import { getVisibleInnings, renderInningCell } from "../utils/gameDisplay";
import { gamesBack, pct, wildCardGamesBack, getPlayoffMarker } from "../utils/standingsUtils";
import { WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";
import { buildPowerRankings } from "../utils/universeUtils";
import { buildNewsFeed } from "../utils/newsUtils";
import { buildDashboardAlerts, buildGameRecords } from "../utils/historyUtils";
import { buildLeagueRecords } from "../utils/recordsUtils";
import { buildNoHitWatch, buildV4TeamMetrics, buildWinProbability, buildGamesThatMatter } from "../utils/v4Utils";
import { buildHeadToHead } from "../utils/historyUtils";
import { buildFanUniverse, buildFanPoll, buildMerch, buildSocialChatter, getSeasonPulse } from "../utils/fandomUtils";
import { buildLivingFeed } from "../utils/livingWorldUtils";
import { buildGameDaySocial } from "../utils/gameDaySocialUtils";
import GameDaySocial from "../components/GameDaySocial";
import { getTeamColorsByAbbr } from "../config/teamColors";
import { buildWorldState } from "../utils/cultureUtils";
import { buildSeasonCalendar, currentSeasonDay, scheduleEntryLabel } from "../utils/seasonCalendarUtils";
import { ceremonyForGame } from "../utils/ceremonyUtils";
import ChampionshipCeremony from "../components/ChampionshipCeremony";
import { buildAroundLeagueTonight, buildDynamicAds, buildFansTalkingAbout, buildHotColdBoard, buildTicketForecast, buildWeeklyMediaRoundup } from "../utils/mediaMemoryUtils";
import { buildLeagueMainCharacter, buildMediaOutlets, buildOffDayWorld, buildPredictionReceipts, buildTopicLifecycles } from "../utils/lifeSystemsUtils";
import { buildBallparkLife, buildHistoricGameAlerts, buildRevengeWatch, buildAttendanceForecast, buildBallparkProfile } from "../utils/ballparkLifeUtils";

function MiniPill({ children, tone="" }) { return <span className={`v3-mini-pill ${tone}`}>{children}</span>; }
function TeamMark({ team, colors = { main:"#0f172a", alt:"#1e293b", border:"#334155", text:"#ffffff", gradient:false } }) {
  if (!team) return <div className="v3-team-mark v3-team-mark-empty">—</div>;
  return <div className="v3-team-mark" style={{background:colors?.gradient?`linear-gradient(135deg,${colors.main},${colors.alt})`:colors?.main,borderColor:colors?.border,color:colors?.text}}>{team.abbr}</div>;
}

export default function DashboardPage({ ctx }) {
  const {
    awayColors, awayTeam, battingBaseColors, bestRecordTeam, bestRunDiff, bigMomentBanner,
    currentGame, dashboardScoreboardAwayTeam, dashboardScoreboardGame, dashboardScoreboardHomeTeam,
    favoriteDivisionChaser, favoriteDivisionLeader, favoriteDivisionRank, favoriteGamesLeft,
    favoriteMarker, favoriteTeam, gameTeamRecordLabel, homeColors, homeTeam, isPlayoffLiveGame,
    isWorldSeriesGame, lastFinalAwayTeam, lastFinalGame, lastFinalHomeTeam, liveLeaderClass,
    liveTeamRecordLabel, playoffBroadcastVars, playoffGameTitle, playoffPicture, playoffSeedForTeam,
    scoreFlashSide, teams, tightestDivisionRace, worstRecordTeam, data, setPage, setData, syncLeagueExtrasToFirebase
  } = ctx;

  const [dashboardClock,setDashboardClock]=useState(Date.now());
  const [merchSlide,setMerchSlide]=useState(0);
  const [tickerSlide,setTickerSlide]=useState(0);
  const [activeCeremony,setActiveCeremony]=useState(null);
  useEffect(()=>{const t=setInterval(()=>setDashboardClock(Date.now()),7000);return()=>clearInterval(t)},[]);
  useEffect(()=>{const t=setInterval(()=>setMerchSlide(x=>x+1),22000);return()=>clearInterval(t)},[]);
  useEffect(()=>{const t=setInterval(()=>setTickerSlide(x=>x+1),9000);return()=>clearInterval(t)},[]);
  const activeSeason = data.activeSeasonName || "Season 4";
  const ticketForecast = useMemo(()=>buildTicketForecast(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const hotCold = useMemo(()=>buildHotColdBoard(teams),[teams]);
  const tonightBoard = useMemo(()=>buildAroundLeagueTonight(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const talkingAbout = useMemo(()=>buildFansTalkingAbout(data,teams,playoffPicture),[data,teams,playoffPicture,dashboardClock]);
  const dynamicAds = useMemo(()=>buildDynamicAds(data,teams,playoffPicture),[data,teams,playoffPicture,dashboardClock]);
  const weeklyRoundup = useMemo(()=>buildWeeklyMediaRoundup(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const lifeMainCharacter = useMemo(()=>buildLeagueMainCharacter(data,teams,playoffPicture),[data,teams,playoffPicture,dashboardClock]);
  const lifeTopics = useMemo(()=>buildTopicLifecycles(data,teams,playoffPicture),[data,teams,playoffPicture,dashboardClock]);
  const lifeReceipts = useMemo(()=>buildPredictionReceipts(data,teams),[data,teams]);
  const lifeOutlets = useMemo(()=>buildMediaOutlets(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const offDayWorld = useMemo(()=>buildOffDayWorld(data,teams,playoffPicture),[data,teams,playoffPicture,dashboardClock]);
  const ballparkLife = useMemo(()=>buildBallparkLife(data,teams,playoffPicture,dashboardClock),[data,teams,playoffPicture,dashboardClock]);
  const historicAlerts = useMemo(()=>buildHistoricGameAlerts(data,teams),[data,teams,dashboardClock]);
  const revengeWatch = useMemo(()=>buildRevengeWatch(data,teams),[data,teams]);
  const v4Metrics = useMemo(()=>buildV4TeamMetrics(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanUniverse = useMemo(()=>buildFanUniverse(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanPoll = useMemo(()=>buildFanPoll(data,teams,playoffPicture,dashboardClock),[data,teams,playoffPicture,dashboardClock]);
  const fanChatter = useMemo(()=>buildSocialChatter(data,teams,playoffPicture,dashboardClock),[data,teams,playoffPicture,dashboardClock]);
  const livingFeed = useMemo(()=>buildLivingFeed(data,teams,playoffPicture,dashboardClock,favoriteTeam?.id).slice(0,3),[data,teams,playoffPicture,dashboardClock,favoriteTeam?.id]);
  const gameDaySocial = useMemo(()=>buildGameDaySocial(data,teams,playoffPicture,dashboardClock),[data,teams,playoffPicture,dashboardClock]);
  const seasonPulse = useMemo(()=>getSeasonPulse(data,teams),[data,teams]);
  const worldState = useMemo(()=>buildWorldState(data,teams,playoffPicture,dashboardClock),[data,teams,playoffPicture,dashboardClock]);
  const seasonCalendar = useMemo(()=>buildSeasonCalendar(data,teams),[data,teams]);
  const todaySlot = useMemo(()=>currentSeasonDay(data,teams),[data,teams]);
  const upcomingSlots = useMemo(()=>{
    if(!todaySlot)return seasonCalendar.filter(x=>x.gameNumber&&!x.result).slice(0,3);
    return seasonCalendar.filter(x=>x.gameNumber && x.slotIndex>=todaySlot.slotIndex && !x.result).slice(0,3);
  },[seasonCalendar,todaySlot]);
  const todayCeremonies = useMemo(()=>todaySlot?.gameNumber?ceremonyForGame(data,teams,todaySlot.gameNumber):[],[data,teams,todaySlot?.gameNumber]);
  const readyCeremony = todayCeremonies.find(c=>c.status!=='completed' && ['banner','rings','trophy','championship-opening'].includes(c.type))||null;
  const completeCeremony=(ceremony,revealed=[])=>{
    if(!ceremony)return;
    const extras=data.leagueExtras||{};
    const ceremonies=(extras.ceremonies||[]).map(c=>c.id===ceremony.id?{...c,status:'completed',completedAt:new Date().toISOString()}:c);
    const completion={id:`complete-${ceremony.id}`,ceremonyId:ceremony.id,teamId:ceremony.teamId||'',teamAbbr:ceremony.teamAbbr||'',originSeasonName:ceremony.originSeasonName||ceremony.seasonName||'',revealed,completedAt:new Date().toISOString()};
    const ceremonyCompletions=[completion,...(extras.ceremonyCompletions||[]).filter(x=>x.ceremonyId!==ceremony.id)];
    const memory={id:`glory-${ceremony.id}`,type:'LEGACY',icon:'🏆',title:`${ceremony.teamAbbr||'League'} ceremony enters the Hall of Glory`,detail:`${ceremony.title} was completed and its championship hardware is now permanently unveiled.`,createdAt:new Date().toISOString()};
    const worldMoments=[memory,...(extras.worldMoments||[]).filter(x=>x.id!==memory.id)];
    const next={...extras,ceremonies,ceremonyCompletions,worldMoments};
    syncLeagueExtrasToFirebase?.(next); setData?.(p=>({...p,leagueExtras:next})); setActiveCeremony(null);
  };
  const merchPool = useMemo(()=>buildMerch(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const featuredMerch = merchPool.length ? merchPool[merchSlide%merchPool.length] : null;
  const dashboardMerch = merchPool.length ? Array.from({length:Math.min(3,merchPool.length)},(_,i)=>merchPool[(merchSlide+i)%merchPool.length]) : [];
  const v4Prob = useMemo(()=>buildWinProbability(currentGame,teams),[currentGame,teams]);
  const v4NoHit = useMemo(()=>buildNoHitWatch(currentGame,teams),[currentGame,teams]);
  const v4Importance = useMemo(()=>buildGamesThatMatter(currentGame,v4Metrics),[currentGame,v4Metrics]);
  const v4Rivalries = useMemo(()=>buildHeadToHead(data.games||[],teams,data.seasonHistory||[]),[data.games,teams,data.seasonHistory]);
  const calendarAnchorTeam = teams.find(t=>t.abbr===(data.leagueExtras?.calendarAnchorTeamAbbr||'SF'))||favoriteTeam;
  const todayOpponent = teams.find(t=>t.abbr===todaySlot?.schedule?.opponentAbbr);
  const forecastHome = currentGame?.homeTeamId ? teams.find(t=>t.id===currentGame.homeTeamId) : (todaySlot?.schedule?.location==='away'?todayOpponent:calendarAnchorTeam);
  const forecastAway = currentGame?.awayTeamId ? teams.find(t=>t.id===currentGame.awayTeamId) : (todaySlot?.schedule?.location==='away'?calendarAnchorTeam:todayOpponent);
  const v4Rivalry = currentGame?.awayTeamId&&currentGame?.homeTeamId ? v4Rivalries.find(r=>(r.teamAId===currentGame.awayTeamId&&r.teamBId===currentGame.homeTeamId)||(r.teamBId===currentGame.awayTeamId&&r.teamAId===currentGame.homeTeamId)) : null;
  const attendanceForecast = useMemo(()=>buildAttendanceForecast(data,teams,forecastHome?.id,forecastAway?.id,todaySlot?.promo,v4Rivalry),[data,teams,forecastHome?.id,forecastAway?.id,todaySlot?.promo,v4Rivalry]);
  const gameRecords = useMemo(()=>buildGameRecords(data.games||[],teams,data.seasonHistory||[]),[data.games,teams,data.seasonHistory]);
  const alerts = useMemo(()=>buildDashboardAlerts(data,teams),[data,teams]);
  const power = useMemo(()=>buildPowerRankings(teams).slice(0,5),[teams]);
  const news = useMemo(()=>buildNewsFeed(data,teams).slice(0,4),[data,teams]);
  const leagueRecords = useMemo(()=>buildLeagueRecords(data.seasonHistory||[],teams),[data.seasonHistory,teams]);
  const latestArchive = data.seasonHistory?.[0];
  const defendingChampion = latestArchive ? (latestArchive.teams||[]).find(t=>t.id===latestArchive.championTeamId) : null;
  const gamesPlayedTotal = teams.reduce((sum,t)=>sum+Number(t.wins||0)+Number(t.losses||0),0)/2;
  const seasonProgress = teams.length ? Math.min(100,Math.round((gamesPlayedTotal/(teams.length*20))*100)) : 0;
  const hasLiveMatchup = Boolean(homeTeam && awayTeam);
  const clinchedTeams = teams.map((team) => {
    const picture = playoffPicture.find((p)=>p.league===team.league);
    const divisionLeader = picture?.divisionLeaders?.find((leader)=>leader.division===team.division);
    const marker = picture ? getPlayoffMarker(team,picture,divisionLeader) : '';
    return {team,marker};
  }).filter((row)=>['w','x','y','z'].includes(row.marker));
  const clinchLabel = (marker) => marker === 'z' ? '#1 SEED' : marker === 'y' ? 'DIVISION' : marker === 'w' ? 'WILD CARD' : 'PLAYOFFS';
  const openingDay = data.leagueExtras?.openingDay || '';
  const seasonTagline = data.leagueExtras?.seasonTagline || '';
  const openingCountdown = openingDay ? Math.ceil((new Date(`${openingDay}T12:00:00`).getTime() - Date.now()) / 86400000) : null;
  const avgGamesPerTeam = teams.length ? teams.reduce((sum,t)=>sum+Number(t.wins||0)+Number(t.losses||0),0)/teams.length : 0;
  const v4Midseason = avgGamesPerTeam >= 19 && avgGamesPerTeam <= 21;
  const v4Opening = avgGamesPerTeam <= 1;
  const v4Championship = isPlayoffLiveGame && ["finals","worldSeries"].includes(currentGame.playoffSeriesId);
  const v4Theme = v4Championship ? "championship" : isPlayoffLiveGame ? "playoff" : (v4Rivalry?.games||0)>=2 ? "rivalry" : v4Midseason ? "allstar" : v4Opening ? "opening" : "regular";
  const tickerItems = useMemo(()=>{
    const items=[
      ...news.slice(0,4).map(x=>`${x.category}: ${x.headline}`),
      fanPoll.options[0] ? `FAN POLL: ${fanPoll.options[0].team.abbr} leads "${fanPoll.question}" at ${fanPoll.options[0].pct}%` : null,
      fanChatter[0] ? `SMB SOCIAL: ${fanChatter[0].handle} — ${fanChatter[0].text}` : null,
      featuredMerch ? `TEAM STORE: ${featuredMerch.name} · ${featuredMerch.tag}` : null,
      `WEEK ${seasonPulse.week}: ${seasonPulse.phase}`
    ].filter(Boolean);
    return items;
  },[news,fanPoll,fanChatter,featuredMerch,seasonPulse]);
  const opponentRows = useMemo(() => {
    if (!favoriteTeam) return [];
    const teamMap = new Map(teams.map((team) => [team.id, team]));
    const rows = new Map();
    (data.games || []).forEach((game) => {
      if (!game || game.status !== 'Final') return;
      if ((game.seasonName || activeSeason) !== activeSeason) return;
      const isAway = game.awayTeamId === favoriteTeam.id;
      const isHome = game.homeTeamId === favoriteTeam.id;
      if (!isAway && !isHome) return;
      const opponentId = isAway ? game.homeTeamId : game.awayTeamId;
      const opponent = teamMap.get(opponentId);
      if (!opponent) return;
      const runsFor = Number(isAway ? game.awayScore : game.homeScore) || 0;
      const runsAgainst = Number(isAway ? game.homeScore : game.awayScore) || 0;
      const won = runsFor > runsAgainst;
      const row = rows.get(opponentId) || { opponent, wins:0, losses:0, runsFor:0, runsAgainst:0, homeWins:0, homeLosses:0, awayWins:0, awayLosses:0, games:0, last:null };
      row.games += 1;
      row.runsFor += runsFor;
      row.runsAgainst += runsAgainst;
      if (won) row.wins += 1; else if (runsAgainst > runsFor) row.losses += 1;
      if (isHome) won ? row.homeWins += 1 : row.homeLosses += 1;
      if (isAway) won ? row.awayWins += 1 : row.awayLosses += 1;
      const stamp = Date.parse(game.finalizedAt || game.date || '') || 0;
      if (!row.last || stamp >= row.last.stamp) row.last = { stamp, won, runsFor, runsAgainst, date:game.date || '' };
      rows.set(opponentId,row);
    });
    return [...rows.values()].sort((a,b) => b.games-a.games || b.wins-a.wins || a.opponent.abbr.localeCompare(b.opponent.abbr));
  }, [data.games, teams, favoriteTeam, activeSeason]);

  return <div className={`dashboard-v3 dashboard-v3-home dashboard-v4 dashboard-v4-${v4Theme}`}>
    {activeCeremony&&<ChampionshipCeremony ceremony={activeCeremony} team={teams.find(t=>t.id===activeCeremony.teamId)||teams.find(t=>t.abbr===activeCeremony.teamAbbr)} onClose={()=>setActiveCeremony(null)} onComplete={(revealed)=>completeCeremony(activeCeremony,revealed)}/>}

    <section className="dashboard-universe-plaza dashboard-network-top">
      <div className="dashboard-network-brand"><span>● LIVE</span><strong>SMB NETWORK</strong><small>{activeSeason} · VERSION 4.22</small></div>
      <div className="dashboard-universe-ticker"><b>AROUND THE LEAGUE</b><span>{tickerItems.length?tickerItems[tickerSlide%tickerItems.length]:`${activeSeason} is ready for first pitch.`}</span></div>
      <div className="dashboard-network-status"><small>SEASON</small><strong>{seasonProgress}%</strong><span>{defendingChampion?`🏆 ${defendingChampion.abbr} defending champ`:'The league is live'}</span></div>
    </section>
    <section className="dashboard-world-pulse"><div className="dashboard-world-live"><i/> WORLD PULSE</div><div className="dashboard-world-moments">{worldState.moments.map((m,i)=><span key={`${m.type}-${i}`}><b>{m.icon} {m.type}</b>{m.title}</span>)}</div><div className="dashboard-world-tags">{worldState.trending.map(x=><em key={x}>{x}</em>)}</div></section>
    <section className="card dashboard-today-package">
      <div className="dashboard-today-title"><div><span>TODAY IN THE LEAGUE</span><h2>{todaySlot?.gameNumber?`Game ${todaySlot.gameNumber} · ${scheduleEntryLabel(todaySlot.schedule)}`:'Schedule Day TBD'}</h2><p>{todaySlot?.dateLabel?`${todaySlot.weekday} · ${todaySlot.dateLabel}`:`Week ${todaySlot?.week||seasonPulse.week} · ${todaySlot?.weekday||'Game Day'}`}</p></div><button type="button" onClick={()=>setPage?.('fandom')}>Full Calendar →</button></div>
      <div className="dashboard-today-grid"><div><small>EVENT</small><strong>{todayCeremonies[0]?`${todayCeremonies[0].type==='championship-opening'?'💍🏆🎏':'✨'} ${todayCeremonies[0].title}`:todaySlot?.promo?`${todaySlot.promo.icon||'🎟️'} ${todaySlot.promo.name}`:'Regular Game Day'}</strong><span>{todayCeremonies[0]?.detail||todaySlot?.promo?.giveaway||'The baseball world is getting ready.'}</span></div><div><small>FAN PULSE</small><strong>{fanUniverse.leagueMood}</strong><span>{gameDaySocial.phase!=='idle'?`${gameDaySocial.watching.toLocaleString()} simulated live viewers`:`Week ${seasonPulse.week} conversation is building`}</span></div><div><small>GAME IMPORTANCE</small><strong>{v4Importance?.label||'Regular Season'}</strong><span>{v4Rivalry?`${Math.round(v4Rivalry.heat||0)} rivalry heat`:'Every game adds to the story'}</span></div><div><small>BALLPARK</small><strong>{attendanceForecast?.park?.name||'League Ballpark'}</strong><span>{attendanceForecast?`${(attendanceForecast.actual||attendanceForecast.projected).toLocaleString()} ${attendanceForecast.actual?'in park':'projected'} · ${attendanceForecast.pctFull}% full`:'Attendance forecast building'}</span></div></div>
    </section>
    <section className="v3-dashboard-main-grid">
      <div className="v3-dashboard-primary">
        {readyCeremony&&<section className="ceremony-ready-card"><span>{readyCeremony.type==='championship-opening'?'💍🏆🎏':'🎏'}</span><div><small>CEREMONY READY · {readyCeremony.timing||'PREGAME'}</small><strong>{readyCeremony.title}</strong><p>{readyCeremony.detail}</p></div><button type="button" onClick={()=>setActiveCeremony(readyCeremony)}>Begin Ceremony</button></section>}
        <section className="card dashboard-v4-intel">
          <div><span>Broadcast Theme</span><strong>{v4Theme === "allstar" ? "ALL-STAR BREAK" : v4Theme.toUpperCase()}</strong></div>
          <div><span>Win Probability</span><strong>{v4Prob.away}% / {v4Prob.home}%</strong></div>
          <div><span>Leverage</span><strong>{v4Prob.leverage}</strong></div>
          <div><span>Crowd</span><strong>{v4Prob.crowd}/100</strong></div>
          <div><span>Game Importance</span><strong>{v4Importance?.label || "—"}</strong></div>
          {v4Rivalry && <div><span>Rivalry</span><strong>{v4Rivalry.games} meetings</strong></div>}
        </section>

        <div className={`card v3-broadcast-hero ${liveLeaderClass} ${scoreFlashSide?`scorebug-flash-${scoreFlashSide}`:""} ${isPlayoffLiveGame?"playoff-broadcast-bg":""}`} style={playoffBroadcastVars}>
          <div className="v3-broadcast-topline">
            <div><div className="v3-eyebrow">{hasLiveMatchup?"NOW PLAYING":"LATEST FROM THE LEAGUE"}</div><strong>{hasLiveMatchup?(isPlayoffLiveGame?playoffGameTitle(currentGame):"Regular Season"):lastFinalGame?(lastFinalGame.gameType==='playoff'?playoffGameTitle(lastFinalGame):"Final Result"):"Season 4 Central"}</strong></div>
            <div className="v3-broadcast-state">{hasLiveMatchup?<MiniPill tone="live">● LIVE</MiniPill>:lastFinalGame?<MiniPill>FINAL</MiniPill>:<MiniPill tone="gold">READY</MiniPill>}</div>
          </div>
          {bigMomentBanner&&<div className={`big-moment-banner v3-big-moment ${scoreFlashSide?`big-moment-${scoreFlashSide}`:""}`}>{bigMomentBanner}</div>}

          {hasLiveMatchup ? <>
            <div className="v3-matchup-stage">
              <div className="v3-match-team">{isPlayoffLiveGame&&<span className="dashboard-seed-pill">#{playoffSeedForTeam(awayTeam.id)}</span>}<TeamMark team={awayTeam} colors={awayColors}/><strong>{awayTeam.city} {awayTeam.name}</strong><span>{liveTeamRecordLabel("away",awayTeam)}</span></div>
              <div className="v3-score-center">
                {isWorldSeriesGame(currentGame)&&<div className="v3-trophy">🏆</div>}
                <div className="v3-scoreline"><b>{currentGame.awayScore}</b><em>–</em><b>{currentGame.homeScore}</b></div>
                <div className="v3-game-state">{currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}</div>
                <div className="v3-live-meta"><MiniPill>{currentGame.balls}-{currentGame.strikes} count</MiniPill><MiniPill>{currentGame.outs} out{currentGame.outs===1?'':'s'}</MiniPill></div>
                <BaseDiamond bases={currentGame.bases} colors={battingBaseColors}/>
              </div>
              <div className="v3-match-team">{isPlayoffLiveGame&&<span className="dashboard-seed-pill">#{playoffSeedForTeam(homeTeam.id)}</span>}<TeamMark team={homeTeam} colors={homeColors}/><strong>{homeTeam.city} {homeTeam.name}</strong><span>{liveTeamRecordLabel("home",homeTeam)}</span></div>
            </div>
          </> : lastFinalGame && lastFinalAwayTeam && lastFinalHomeTeam ? <div className="v3-matchup-stage">
              <div className="v3-match-team"><TeamMark team={lastFinalAwayTeam}/><strong>{lastFinalAwayTeam.city} {lastFinalAwayTeam.name}</strong><span>{gameTeamRecordLabel(lastFinalGame,lastFinalAwayTeam)}</span></div>
              <div className="v3-score-center">{isWorldSeriesGame(lastFinalGame)&&<div className="v3-trophy">🏆</div>}<div className="v3-scoreline"><b>{lastFinalGame.awayScore}</b><em>–</em><b>{lastFinalGame.homeScore}</b></div><div className="v3-game-state">FINAL</div><MiniPill>{lastFinalGame.date||'Latest result'}</MiniPill></div>
              <div className="v3-match-team"><TeamMark team={lastFinalHomeTeam}/><strong>{lastFinalHomeTeam.city} {lastFinalHomeTeam.name}</strong><span>{gameTeamRecordLabel(lastFinalGame,lastFinalHomeTeam)}</span></div>
            </div> : <div className="v3-opening-stage"><div className="v3-opening-ball">⚾</div><div><div className="v3-eyebrow">OPENING DAY MODE</div><h3>{activeSeason} is ready.</h3><p>Set the first matchup in Live Controls and the dashboard will become a live broadcast center.</p></div>{defendingChampion&&<div className="v3-defending"><span>Defending Champion</span><strong>🏆 {defendingChampion.abbr}</strong></div>}</div>}

          {hasLiveMatchup && (
            <div className={`dashboard-live-stage ${gameDaySocial.phase!=='idle'?'has-social':''}`}>
              <div className="v3-dashboard-field-wrap">
                <LiveField
                  game={currentGame}
                  battingColors={battingBaseColors}
                  compact
                />
              </div>
              {gameDaySocial.phase!=='idle' && <div className="dashboard-live-social-panel"><GameDaySocial social={gameDaySocial} compact onOpenFandom={()=>setPage?.('fandom')} /></div>}
            </div>
          )}

          {dashboardScoreboardGame && dashboardScoreboardAwayTeam && dashboardScoreboardHomeTeam && <div className="v3-linescore-wrap">
            <div className="v3-linescore-row v3-linescore-head"><span>TEAM</span>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`h-${n}`}>{n}</span>)}<span>R</span><span>H</span><span>E</span></div>
            <div className="v3-linescore-row"><strong>{dashboardScoreboardAwayTeam.abbr}</strong>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`a-${n}`}>{renderInningCell("away",n,dashboardScoreboardGame)}</span>)}<strong>{dashboardScoreboardGame.awayScore}</strong><span>{dashboardScoreboardGame.awayHits}</span><span>{dashboardScoreboardGame.awayErrors}</span></div>
            <div className="v3-linescore-row"><strong>{dashboardScoreboardHomeTeam.abbr}</strong>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`b-${n}`}>{renderInningCell("home",n,dashboardScoreboardGame)}</span>)}<strong>{dashboardScoreboardGame.homeScore}</strong><span>{dashboardScoreboardGame.homeHits}</span><span>{dashboardScoreboardGame.homeErrors}</span></div>
          </div>}
        </div>

        {dashboardMerch.length>0 && <section className="dashboard-market-row">
          <div className="dashboard-market-label"><span>FRANCHISE CENTRAL MARKET</span><strong>Fresh drops from around the league</strong><small>Simulated shop promos rotate while you browse.</small></div>
          {dashboardMerch.map((item,i)=>{const c=getTeamColorsByAbbr(item.team.abbr);return <button type="button" className="dashboard-market-ad" key={`${item.id}-${i}`} onClick={()=>setPage?.('fandom')} style={{'--ad-main':c.main,'--ad-alt':c.alt,'--ad-border':c.border,'--ad-text':c.text}}><span>{item.tag}</span><b>{item.team.abbr}</b><strong>{item.name}</strong><small>SHOP DROP →</small></button>})}
        </section>}

        {v4NoHit.length>0 && <section className="dashboard-v4-milestone">{v4NoHit.map((x,i)=><div key={i}><b>👀 NO-HIT WATCH</b><span>{x.pitching.abbr} has held {x.batter.abbr} hitless through the current game state.</span></div>)}</section>}

        <section className="dashboard-media-memory-grid">
          <article className="card dashboard-ticket-forecast"><small>TICKET FORECAST</small><strong>{ticketForecast.label}</strong><span>{ticketForecast.team?.abbr||'—'} {ticketForecast.opponent?`vs ${ticketForecast.opponent.abbr}`:''} · demand {ticketForecast.demand}/100</span><div className="dashboard-demand-meter"><i style={{width:`${ticketForecast.demand}%`}}/></div></article>
          <article className="card dashboard-hot-cold"><small>HOT / COLD</small><strong>{hotCold.hot[0]?`🔥 ${hotCold.hot[0].abbr} ${hotCold.hot[0].streak}`:'No hot streak yet'}</strong><span>{hotCold.cold[0]?`🥶 ${hotCold.cold[0].abbr} ${hotCold.cold[0].streak}`:'No cold streak yet'}</span></article>
          <article className="card dashboard-weekly-roundup"><small>WEEK {weeklyRoundup.week} MEDIA ROUNDUP</small><strong>{weeklyRoundup.headline}</strong><span>{weeklyRoundup.rivalry?`${weeklyRoundup.rivalry.teamA?.abbr}/${weeklyRoundup.rivalry.teamB?.abbr} is the loudest rivalry`:weeklyRoundup.phase}</span></article>
        </section>

        <section className="dashboard-life-charge-grid">
          <article className="card dashboard-main-character"><small>{lifeMainCharacter.label}</small><strong>{lifeMainCharacter.title}</strong><span>{lifeMainCharacter.detail}</span><div className="life-heat-track"><i style={{width:`${lifeMainCharacter.heat}%`}}/></div></article>
          <article className="card dashboard-topic-life"><small>TOPIC LIFECYCLE</small><strong>{lifeTopics[0]?.stage||'EMERGING'} · {lifeTopics[0]?.topic||'Season conversation'}</strong><span>{lifeTopics[0]?.fatigue||'The story is still forming.'}</span></article>
          <article className="card dashboard-receipt"><small>RECEIPT DESK</small><strong>{lifeReceipts[0]?.team?.abbr||'LEAGUE'} · {lifeReceipts[0]?.verdict||'NO RECEIPT YET'}</strong><span>{lifeReceipts[0]?.oldTake||lifeOutlets[0]?.stance}</span></article>
          <article className="card dashboard-offday"><small>{offDayWorld.label}</small><strong>{offDayWorld.items[0]?.title||'The league keeps moving'}</strong><span>{offDayWorld.items[0]?.detail}</span></article>
        </section>

      </div>

      <aside className="v3-dashboard-rail">
        <div className="card v3-rail-card"><div className="v3-rail-head"><div><span>POWER FIVE</span><h3>League Rankings</h3></div><button onClick={()=>setPage?.('league')}>All</button></div><div className="v3-power-mini">{power.map((t,i)=><div key={t.id}><b>{i+1}</b><strong>{t.abbr}</strong><span>{t.wins}-{t.losses}</span><small>{t.runDiff>=0?'+':''}{t.runDiff} RD</small></div>)}</div></div>

        <div className="card v3-rail-card v3-franchise-focus"><div className="v3-rail-head"><div><span>FRANCHISE FOCUS</span><h3>{favoriteTeam?.abbr || '—'}</h3></div>{favoriteMarker&&<MiniPill tone="gold">{favoriteMarker}</MiniPill>}</div>{favoriteTeam?<><div className="v3-focus-record"><strong>{favoriteTeam.wins}-{favoriteTeam.losses}</strong><span>{pct(favoriteTeam.wins,favoriteTeam.losses)}</span></div><div className="v3-focus-grid"><div><span>Division</span><strong>#{favoriteDivisionRank||'—'}</strong></div><div><span>RD</span><strong>{favoriteTeam.runDiff>0?'+':''}{favoriteTeam.runDiff||0}</strong></div><div><span>Games Left</span><strong>{favoriteGamesLeft}</strong></div></div><p>{favoriteDivisionRank===1?`Leading the ${favoriteTeam.league} ${favoriteTeam.division}${favoriteDivisionChaser?` over ${favoriteDivisionChaser.abbr}`:''}.`:`${gamesBack(favoriteTeam,favoriteDivisionLeader)} GB in the division.`}</p></>:<p className="muted">No franchise selected.</p>}</div>

        <div className="card v3-rail-card dashboard-fandom-card"><div className="v3-rail-head"><div><span>FAN PULSE</span><h3>Week {seasonPulse.week} · {seasonPulse.phase}</h3></div><button onClick={()=>setPage?.('fandom')}>Fandom →</button></div><div className="dashboard-fan-mood"><strong>{fanUniverse.leagueMood}</strong><span>{fanPoll.question}</span></div>{fanPoll.options.slice(0,2).map(o=><div className="dashboard-fan-poll" key={o.team.id}><b>{o.team.abbr}</b><i><em style={{width:`${o.pct}%`}}/></i><span>{o.pct}%</span></div>)}<div className="dashboard-living-wire">{livingFeed.slice(0,2).map(x=><p key={x.id}><b>{x.handle}</b> {x.text}</p>)}</div>{featuredMerch&&<div className="dashboard-merch-ad"><small>{featuredMerch.tag}</small><strong>{featuredMerch.name}</strong><span>Visit Team Store →</span></div>}</div>

        {historicAlerts[0]&&<div className={`card v3-rail-card dashboard-extreme-card ${historicAlerts[0].live?'is-live':''}`}><div className="v3-rail-head"><div><span>{historicAlerts[0].kicker}</span><h3>{historicAlerts[0].tier} Moment</h3></div><b>{historicAlerts[0].score}/100</b></div><strong>{historicAlerts[0].headline}</strong><small>{historicAlerts[0].detail}</small></div>}
        <div className="card v3-rail-card dashboard-ballpark-card"><div className="v3-rail-head"><div><span>BALLPARK LIFE</span><h3>{ballparkLife.phase}</h3></div><button onClick={()=>setPage?.('fandom')}>Explore</button></div>{ballparkLife.events.slice(0,2).map(e=><div key={e.id} className="dashboard-ballpark-row"><b>{e.icon}</b><span><strong>{e.title}</strong><small>{e.detail}</small></span></div>)}{revengeWatch[0]&&<div className="dashboard-ballpark-row"><b>⚔️</b><span><strong>{revengeWatch[0].label}</strong><small>{revengeWatch[0].loserTeam?.abbr} remembers {revengeWatch[0].winnerTeam?.abbr}</small></span></div>}</div>
        <div className="card v3-rail-card dashboard-happening-card"><div className="v3-rail-head"><div><span>WHAT'S HAPPENING</span><h3>Universe Now</h3></div><button onClick={()=>setPage?.('fandom')}>Explore</button></div><div className="dashboard-happening-list">{(worldState.moments||[]).slice(0,4).map((m,i)=><div key={`${m.type}-${i}`}><b>{m.icon||'•'}</b><span><strong>{m.title}</strong><small>{m.detail||m.type}</small></span></div>)}{(worldState.trending||[]).slice(0,2).map(tag=><div key={tag}><b>#</b><span><strong>{tag}</strong><small>Trending around the league</small></span></div>)}</div></div>

        <div className="card v3-rail-card"><div className="v3-rail-head"><div><span>RECORD WATCH</span><h3>V3 Game Book</h3></div><button onClick={()=>setPage?.('league')}>Archive</button></div>{alerts.length?alerts.map((a,i)=><div className="v3-alert-row" key={i}><span>{a.label}</span><strong>{a.value}</strong><small>{a.detail}</small></div>):<div className="v3-empty-compact">Finalize games to unlock live game records.</div>}</div>
      </aside>
    </section>


    {(v4Opening || v4Midseason) && <div className={`dashboard-v4-bunting ${v4Midseason ? "allstar" : "opening"}`}>{Array.from({length:15},(_,i)=><i key={i}/>)}</div>}





    <section className="dashboard-next-strip card">
      <div className="dashboard-next-label"><span>COMING UP</span><strong>Next on the franchise calendar</strong></div>
      <div className="dashboard-next-games">{upcomingSlots.length?upcomingSlots.map((slot,i)=><button type="button" key={slot.slotIndex} onClick={()=>setPage?.('fandom')} className={i===0?'next':''}><small>{i===0?'NEXT':`AFTER THAT`} · W{slot.week} {slot.weekday}</small><b>{scheduleEntryLabel(slot.schedule)}</b><span>{slot.promo?`${slot.promo.icon||'🎟️'} ${slot.promo.name}`:slot.dateLabel||`Game ${slot.gameNumber}`}</span></button>):<div className="dashboard-next-empty">No future franchise games are placed yet.</div>}</div>
    </section>

    {clinchedTeams.length > 0 && <section className="v3-clinch-strip"><div className="v3-section-heading compact"><div><span>POSTSEASON TICKETS PUNCHED</span><h3>Clinched</h3></div></div><div className="v3-clinch-list">{clinchedTeams.map(({team,marker})=><div className="v3-clinch-card" key={team.id}><span>{clinchLabel(marker)}</span><strong>{team.abbr}</strong><small>{team.wins}-{team.losses}</small></div>)}</div></section>}


    <section className="dashboard-culture-strip">
      <div className="card dashboard-around-tonight"><div className="v3-section-heading compact"><div><span>AROUND THE LEAGUE TONIGHT</span><h3>What matters elsewhere</h3></div></div>{tonightBoard.map((x,i)=><div className="dashboard-tonight-row" key={`${x.type}-${i}`}><b>{x.icon}</b><span><strong>{x.title}</strong><small>{x.detail}</small></span></div>)}</div>
      <div className="card dashboard-talking-about"><div className="v3-section-heading compact"><div><span>FANS ARE TALKING ABOUT</span><h3>Conversation Board</h3></div></div>{talkingAbout.map((x,i)=><div className="dashboard-topic-row" key={`${x.label}-${i}`}><b>{x.icon}</b><span><strong>{x.label}</strong><small>{x.detail}</small></span></div>)}</div>
      <div className="card dashboard-ad-rotation"><div className="v3-section-heading compact"><div><span>COMMERCIAL BREAK</span><h3>From around the league</h3></div></div>{dynamicAds.slice(0,3).map(ad=><article key={ad.id}><small>{ad.kicker}</small><strong>{ad.title}</strong><p>{ad.copy}</p><b>{ad.cta} →</b></article>)}</div>
    </section>

    <section className="dashboard-recent-only"><div className="card v3-recent-results"><div className="v3-section-heading compact"><div><span>SCOREBOARD</span><h3>Recent Finals</h3></div><button onClick={()=>setPage?.('league')}>Game Archive →</button></div><div className="v3-recent-list">{gameRecords.games.length?gameRecords.games.slice(0,6).map(g=><div key={g.id}><small>{g.date} · {g.gameType==='playoff'?'POST':'REG'}</small><strong>{g.away?.abbr||'AWY'} {g.awayScore} <em>–</em> {g.home?.abbr||'HME'} {g.homeScore}</strong></div>):<div className="v3-empty-compact">Season finals will appear here automatically.</div>}</div></div></section>

    <section className="card v3-opponent-book">
      <div className="v3-section-heading compact"><div><span>{activeSeason.toUpperCase()} SERIES BOOK</span><h3>{favoriteTeam?.abbr || 'Franchise'} vs Opponents</h3></div><MiniPill>{opponentRows.reduce((sum,row)=>sum+row.games,0)} scored games</MiniPill></div>
      {opponentRows.length ? <div className="v3-opponent-scroll"><div className="v3-opponent-head"><span>Opponent</span><span>Record</span><span>Runs</span><span>Diff</span><span>Home</span><span>Away</span><span>Last</span></div>{opponentRows.map((row)=>{const diff=row.runsFor-row.runsAgainst;return <div className="v3-opponent-row" key={row.opponent.id}><div className="v3-opponent-team"><strong>{row.opponent.abbr}</strong><small>{row.opponent.city} {row.opponent.name}</small></div><strong className={row.wins>row.losses?'positive':row.losses>row.wins?'negative':''}>{row.wins}-{row.losses}</strong><span>{row.runsFor}-{row.runsAgainst}</span><span className={diff>0?'positive':diff<0?'negative':''}>{diff>0?'+':''}{diff}</span><span>{row.homeWins}-{row.homeLosses}</span><span>{row.awayWins}-{row.awayLosses}</span><span className={row.last?.won?'positive':'negative'}>{row.last?`${row.last.won?'W':'L'} ${row.last.runsFor}-${row.last.runsAgainst}`:'—'}</span></div>})}</div> : <div className="v3-opponent-empty"><strong>Your {activeSeason} matchup book starts with the first final.</strong><span>Every finalized scored game will automatically add the opponent, series record, runs for/against, home/away split and latest result here.</span></div>}
    </section>
  </div>;
}
