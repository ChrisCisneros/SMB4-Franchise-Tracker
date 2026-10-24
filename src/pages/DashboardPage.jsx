import React, { useMemo } from "react";
import { BaseDiamond } from "../components/GameWidgets";
import { getVisibleInnings, renderInningCell } from "../utils/gameDisplay";
import { gamesBack, pct, wildCardGamesBack, getPlayoffMarker } from "../utils/standingsUtils";
import { WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";
import { buildPowerRankings } from "../utils/universeUtils";
import { buildNewsFeed } from "../utils/newsUtils";
import { buildDashboardAlerts, buildGameRecords } from "../utils/historyUtils";
import { buildLeagueRecords } from "../utils/recordsUtils";

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
    scoreFlashSide, teams, tightestDivisionRace, worstRecordTeam, data, setPage
  } = ctx;

  const activeSeason = data.activeSeasonName || "Season 4";
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

  return <div className="dashboard-v3 dashboard-v3-home">
    <section className="v3-dashboard-masthead">
      <div>
        <div className="v3-eyebrow">SMB4 FRANCHISE CENTRAL · VERSION 3</div>
        <h2>{activeSeason}</h2>
        <p>{seasonTagline || (gamesPlayedTotal ? `${Math.round(gamesPlayedTotal)} league games completed` : "Opening Day awaits — the league is reset and ready.")}</p>
      </div>
      <div className="v3-season-status">
        <div><span>Season Progress</span><strong>{seasonProgress}%</strong></div>
        <div className="v3-progress-track"><i style={{width:`${seasonProgress}%`}} /></div>
        <div className="v3-status-pills"><MiniPill tone="live">V3 LIVE</MiniPill><MiniPill>{gameRecords.games.length} archived games</MiniPill>{openingCountdown!==null&&openingCountdown>=0&&<MiniPill>{openingCountdown===0?'Opening Day':`${openingCountdown} days to Opening Day`}</MiniPill>}{defendingChampion&&<MiniPill tone="gold">🏆 {defendingChampion.abbr} defending champ</MiniPill>}</div>
      </div>
    </section>

    <section className="v3-dashboard-main-grid">
      <div className="v3-dashboard-primary">
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

          {dashboardScoreboardGame && dashboardScoreboardAwayTeam && dashboardScoreboardHomeTeam && <div className="v3-linescore-wrap">
            <div className="v3-linescore-row v3-linescore-head"><span>TEAM</span>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`h-${n}`}>{n}</span>)}<span>R</span><span>H</span><span>E</span></div>
            <div className="v3-linescore-row"><strong>{dashboardScoreboardAwayTeam.abbr}</strong>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`a-${n}`}>{renderInningCell("away",n,dashboardScoreboardGame)}</span>)}<strong>{dashboardScoreboardGame.awayScore}</strong><span>{dashboardScoreboardGame.awayHits}</span><span>{dashboardScoreboardGame.awayErrors}</span></div>
            <div className="v3-linescore-row"><strong>{dashboardScoreboardHomeTeam.abbr}</strong>{getVisibleInnings(dashboardScoreboardGame).map(n=><span key={`b-${n}`}>{renderInningCell("home",n,dashboardScoreboardGame)}</span>)}<strong>{dashboardScoreboardGame.homeScore}</strong><span>{dashboardScoreboardGame.homeHits}</span><span>{dashboardScoreboardGame.homeErrors}</span></div>
          </div>}
        </div>

        <div className="v3-section-heading"><div><span>THE LEAGUE TODAY</span><h3>Top Stories</h3></div><button onClick={()=>setPage?.('news')}>Open Newsroom →</button></div>
        <div className="v3-story-grid">{news.length ? news.map((story,i)=><article className={`card v3-story-card ${i===0?'lead':''}`} key={story.id||i}><div className="v3-story-meta"><span>{story.category}</span><small>{story.dateLabel}</small></div><h3>{story.headline}</h3><p>{story.dek}</p></article>) : <article className="card v3-story-card lead"><div className="v3-story-meta"><span>SEASON PREVIEW</span></div><h3>The league is quiet now. It won’t stay that way.</h3><p>Game finals, playoff races, record alerts and championship stories will populate this desk automatically.</p></article>}</div>
      </div>

      <aside className="v3-dashboard-rail">
        <div className="card v3-rail-card"><div className="v3-rail-head"><div><span>POWER FIVE</span><h3>League Rankings</h3></div><button onClick={()=>setPage?.('league')}>All</button></div><div className="v3-power-mini">{power.map((t,i)=><div key={t.id}><b>{i+1}</b><strong>{t.abbr}</strong><span>{t.wins}-{t.losses}</span><small>{t.runDiff>=0?'+':''}{t.runDiff} RD</small></div>)}</div></div>

        <div className="card v3-rail-card v3-franchise-focus"><div className="v3-rail-head"><div><span>FRANCHISE FOCUS</span><h3>{favoriteTeam?.abbr || '—'}</h3></div>{favoriteMarker&&<MiniPill tone="gold">{favoriteMarker}</MiniPill>}</div>{favoriteTeam?<><div className="v3-focus-record"><strong>{favoriteTeam.wins}-{favoriteTeam.losses}</strong><span>{pct(favoriteTeam.wins,favoriteTeam.losses)}</span></div><div className="v3-focus-grid"><div><span>Division</span><strong>#{favoriteDivisionRank||'—'}</strong></div><div><span>RD</span><strong>{favoriteTeam.runDiff>0?'+':''}{favoriteTeam.runDiff||0}</strong></div><div><span>Games Left</span><strong>{favoriteGamesLeft}</strong></div></div><p>{favoriteDivisionRank===1?`Leading the ${favoriteTeam.league} ${favoriteTeam.division}${favoriteDivisionChaser?` over ${favoriteDivisionChaser.abbr}`:''}.`:`${gamesBack(favoriteTeam,favoriteDivisionLeader)} GB in the division.`}</p></>:<p className="muted">No franchise selected.</p>}</div>

        <div className="card v3-rail-card"><div className="v3-rail-head"><div><span>RECORD WATCH</span><h3>V3 Game Book</h3></div><button onClick={()=>setPage?.('league')}>Archive</button></div>{alerts.length?alerts.map((a,i)=><div className="v3-alert-row" key={i}><span>{a.label}</span><strong>{a.value}</strong><small>{a.detail}</small></div>):<div className="v3-empty-compact">Finalize games to unlock live game records.</div>}</div>
      </aside>
    </section>

    {clinchedTeams.length > 0 && <section className="v3-clinch-strip"><div className="v3-section-heading compact"><div><span>POSTSEASON TICKETS PUNCHED</span><h3>Clinched</h3></div></div><div className="v3-clinch-list">{clinchedTeams.map(({team,marker})=><div className="v3-clinch-card" key={team.id}><span>{clinchLabel(marker)}</span><strong>{team.abbr}</strong><small>{team.wins}-{team.losses}</small></div>)}</div></section>}

    <section className="v3-dashboard-bottom-grid">
      <div className="card v3-race-card"><div className="v3-section-heading compact"><div><span>POSTSEASON RACE</span><h3>Playoff Picture</h3></div><button onClick={()=>setPage?.('standings')}>Full Standings →</button></div><div className="dashboard-playoff-grid">{playoffPicture.map(picture=><div className="dashboard-playoff-card v3-playoff-card" key={picture.league}><h3>{picture.league}</h3><div className="playoff-section-label">Division Leaders</div>{picture.divisionLeaders.map((team,index)=><div className="dashboard-race-row" key={team.id}><strong>{index+1}</strong><span>{team.abbr}</span><span>{team.wins}-{team.losses}</span><span>{team.runDiff>0?`+${team.runDiff}`:team.runDiff}</span></div>)}<div className="playoff-section-label">Wild Card Cut</div>{picture.wildcardTeams.slice(Math.max(0,WILD_CARD_TEAMS_PER_LEAGUE-2),WILD_CARD_TEAMS_PER_LEAGUE+2).map((team,index)=>{const actualIndex=Math.max(0,WILD_CARD_TEAMS_PER_LEAGUE-2)+index;const isCutoff=actualIndex===WILD_CARD_TEAMS_PER_LEAGUE-1;return <div className={`dashboard-race-row ${isCutoff?'dashboard-cutoff-row':''}`} key={team.id}><strong>{actualIndex<WILD_CARD_TEAMS_PER_LEAGUE?`WC${actualIndex+1}`:'OUT'}</strong><span>{team.abbr}</span><span>{team.wins}-{team.losses}</span><span>{wildCardGamesBack(team,picture.cutoffTeam,actualIndex)}</span></div>})}</div>)}</div></div>

      <div className="card v3-league-pulse"><div className="v3-section-heading compact"><div><span>LEAGUE PULSE</span><h3>At a Glance</h3></div></div><div className="v3-pulse-grid"><div><span>Best Record</span><strong>{bestRecordTeam?`${bestRecordTeam.abbr} ${bestRecordTeam.wins}-${bestRecordTeam.losses}`:'—'}</strong></div><div><span>Run Diff Leader</span><strong>{bestRunDiff?`${bestRunDiff.abbr} ${bestRunDiff.runDiff>0?'+':''}${bestRunDiff.runDiff}`:'—'}</strong></div><div><span>Bottom Record</span><strong>{worstRecordTeam?`${worstRecordTeam.abbr} ${worstRecordTeam.wins}-${worstRecordTeam.losses}`:'—'}</strong></div><div><span>Tightest Race</span><strong>{tightestDivisionRace?`${tightestDivisionRace.league} ${tightestDivisionRace.division}`:'—'}</strong></div><div><span>Archived Seasons</span><strong>{leagueRecords.summary.seasonsArchived}</strong></div><div><span>Permanent Games</span><strong>{gameRecords.games.length}</strong></div></div></div>

      <div className="card v3-recent-results"><div className="v3-section-heading compact"><div><span>SCOREBOARD</span><h3>Recent Finals</h3></div><button onClick={()=>setPage?.('league')}>Game Archive →</button></div><div className="v3-recent-list">{gameRecords.games.length?gameRecords.games.slice(0,6).map(g=><div key={g.id}><small>{g.date} · {g.gameType==='playoff'?'POST':'REG'}</small><strong>{g.away?.abbr||'AWY'} {g.awayScore} <em>–</em> {g.home?.abbr||'HME'} {g.homeScore}</strong></div>):<div className="v3-empty-compact">Season 4 finals will appear here automatically.</div>}</div></div>
    </section>
  </div>;
}
