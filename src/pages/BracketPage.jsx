import React from "react";
import { buildNMLBPostseasonTakeover } from "../utils/nmlbUniverseUtils";
import { buildNMLBPostseasonPredictions } from "../utils/nmlbCultureUtils";
import NMLBCommissionersTrophy from "../components/NMLBCommissionersTrophy";
import { getTeamColorsByAbbr } from "../config/teamColors";
import { buildPostseasonSeriesMemory, buildPostseasonNightlyShow, buildPostseasonMythology } from "../utils/postseasonMemoryUtils";
import { buildStretchRunBoard } from "../utils/finalWeeksUtils";
import { buildFinalWeekCommand, buildPostseasonReadiness } from '../utils/v65LifeUtils';

function teamsAverage(teams=[]){ return teams.length?teams.reduce((n,t)=>n+Number(t.wins||0)+Number(t.losses||0),0)/teams.length:0; }

function LeagueWing({league,renderBracketSeries}){
  const leagueKey=league.toLowerCase();
  return <div className={`nmlb64-league-wing ${leagueKey}-wing`}>
    <h3>{league} · ROAD TO THE PENNANT</h3>
    <div className="smb-bracket-grid">
      <div className="smb-bracket-column"><div className="bracket-round-title">Quarterfinals</div>
        {renderBracketSeries(`${leagueKey}_qf1`,`QF A — #1 vs #8`,null,null,"qf-slot-1")}
        {renderBracketSeries(`${leagueKey}_qf2`,`QF B — #4 vs #5`,null,null,"qf-slot-2")}
        {renderBracketSeries(`${leagueKey}_qf3`,`QF C — #3 vs #6`,null,null,"qf-slot-3")}
        {renderBracketSeries(`${leagueKey}_qf4`,`QF D — #2 vs #7`,null,null,"qf-slot-4")}
      </div>
      <div className="smb-bracket-column"><div className="bracket-round-title">{league} Division Series</div>
        {renderBracketSeries(`${leagueKey}_sf1`,`${league}DS A`,null,null,"sf-slot-1")}
        {renderBracketSeries(`${leagueKey}_sf2`,`${league}DS B`,null,null,"sf-slot-2")}
      </div>
      <div className="smb-bracket-column"><div className="bracket-round-title">{league} Championship</div>
        {renderBracketSeries(`${leagueKey}_lc`,`${league}CS · FOR THE PENNANT`,null,null,"lc-slot")}
      </div>
    </div>
  </div>;
}

export default function BracketPage({ ctx }) {
  const { renderBracketSeries, data, teamById, playoffPicture } = ctx;
  const history = data.seasonHistory || [];
  const latest = [...history].sort((a,b)=>(Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0))[0];
  const defendingChampion = latest?.championTeamId ? (latest.teams || []).find((t)=>t.id===latest.championTeamId) : null;
  const currentFinals = data.playoffBracket?.finals || {};
  const avgGames=teamsAverage(data.teams||[]);
  const progress=Math.max(0,Math.min(100,Math.round((avgGames/40)*100)));
  const phase=progress>=90?'POSTSEASON DOORSTEP':progress>=70?'PENNANT RACE':progress>=45?'MIDSEASON PICTURE':'EARLY RACE';
  const wsAway = teamById?.(currentFinals.awayTeamId);
  const wsHome = teamById?.(currentFinals.homeTeamId);
  const champion=teamById?.(currentFinals.winnerTeamId||data.championTeamId);
  const nmlbPostseason=buildNMLBPostseasonTakeover(data,data.teams||[],playoffPicture||[]);
  const predictions=buildNMLBPostseasonPredictions(data,data.teams||[],playoffPicture||[]);
  const champColors=champion?getTeamColorsByAbbr(champion.abbr):null;
  const trophyChampion=champion?{...champion,colors:champColors}:null;
  const seriesMemory=buildPostseasonSeriesMemory(data,data.teams||[]);
  const nightly=buildPostseasonNightlyShow(data,data.teams||[]);
  const mythology=buildPostseasonMythology(data,data.teams||[]);
  const stretchRun=buildStretchRunBoard(data,data.teams||[],playoffPicture||[]);
  const v65Command=buildFinalWeekCommand(data,data.teams||[],playoffPicture||[]);
  const v65Ready=buildPostseasonReadiness(data,data.teams||[],playoffPicture||[]);

  return <div className={`bracket-page nmlb-postseason-page ${nmlbPostseason.stage.toLowerCase().replace(/\s+/g,'-')}`}>
    <div className="card season-format-card bracket-hero-v423"><div><span>NMLB · ROAD TO THE COMMISSIONER'S TROPHY</span><h2>{nmlbPostseason.headline}</h2><p className="muted">{nmlbPostseason.detail}</p></div><div className="bracket-season-progress"><small>{phase}</small><strong>{progress}%</strong><div><i style={{width:`${progress}%`}}/></div><span>League average: {avgGames.toFixed(1)} / 40 games</span></div></div>
    <div className="playoff-hub-strip">
      <div className="playoff-hub-stat"><span>Defending Champion</span><strong>{defendingChampion?.abbr || "—"}</strong></div>
      <div className="playoff-hub-stat"><span>World Series Matchup</span><strong>{wsAway?.abbr && wsHome?.abbr ? `${wsAway.abbr} vs ${wsHome.abbr}` : "TBD"}</strong></div>
      <div className="playoff-hub-stat"><span>NMLB Network Picks</span><strong>{predictions.phase.label}</strong></div>
      <div className="playoff-hub-stat"><span>Season Phase</span><strong>{phase}</strong></div>
    </div>

    {stretchRun.phase.id!=='regular'&&<section className="v65-bracket-ramp card"><div><small>NMLB V6.5 · SELECTION SHOW READINESS</small><h2>{v65Command.selectionReady?'THE FIELD IS SET':`${v65Command.unresolved} SPOT${v65Command.unresolved===1?'':'S'} STILL OPEN`}</h2><p>{v65Command.selectionReady?'All postseason seats are mathematically claimed. The official bracket reveal can begin.':'Projected seeds remain live until every berth is locked.'}</p></div><div className="v65-ready-board">{v65Ready.slice(0,8).map(x=><span key={x.team.id}><b>{x.team.abbr}</b><strong>{x.readiness}%</strong><em>{x.label}</em></span>)}</div></section>}
    {stretchRun.phase.id!=='postseason'&&stretchRun.phase.id!=='regular'&&<section className={`card nmlb6411-projected-bracket ${stretchRun.phase.id}`}><div><small>{stretchRun.phase.id==='selection'?'NMLB SELECTION SHOW':'IF THE SEASON ENDED TONIGHT'}</small><h2>{stretchRun.phase.id==='selection'?'The field is set.':'Projected postseason field'}</h2><p>{stretchRun.phase.id==='selection'?'Seeds, matchups and predictions are ready for the official bracket reveal.':'Ghosted seeds update with the live pennant race until the bracket becomes official.'}</p></div><div className="nmlb6411-projected-field">{stretchRun.field.map(l=><article key={l.league}><h3>{l.league}</h3>{l.seeds.map(x=><span key={x.team.id}><b>#{x.seed}</b><strong>{x.team.abbr}</strong><em>{x.status.marker||'LIVE'}</em></span>)}</article>)}</div></section>}
    {predictions.phase.id!=='preview'&&<section className={`nmlb64-predictions ${predictions.phase.locked?'is-locked':''}`}>
      <div className="nmlb64-predictions-head"><div><small>NMLB NETWORK · POSTSEASON PICKS</small><h3>{predictions.phase.label}</h3><p>{predictions.phase.detail}</p></div><span>{predictions.phase.locked?'🔒 RECEIPTS PRESERVED':'LIVE FORECAST'}</span></div>
      <div className="nmlb64-prediction-grid">{predictions.analysts.slice(0,4).map(a=><div className="nmlb64-prediction-card" key={a.name}><b>{a.name}</b><span>{a.role}</span><strong>{a.al} / {a.nl}</strong><em>Champion: {a.champion} · {a.note}</em></div>)}</div>
      {predictions.consensus&&<div className="nmlb64-consensus"><span>NETWORK CONSENSUS</span><strong>{predictions.consensus.abbr} · {predictions.consensus.votes}/{predictions.analysts.length} picks</strong></div>}
    </section>}

    {nightly&&<section className="nmlb648-bracket-memory card"><div><small>NMLB POSTSEASON TONIGHT</small><h2>{nightly.headline}</h2><p>{nightly.detail}</p></div><div className="nmlb648-bracket-series-memory">{seriesMemory.slice(0,4).map(x=><article key={x.id}><b>{x.label}</b><strong>{x.away?.abbr||'TBD'} {x.awayWins}-{x.homeWins} {x.home?.abbr||'TBD'}</strong><span>{x.narrative}</span><em>SERIES RATING · {x.rating}/10</em></article>)}</div>{mythology.length>0&&<div className="nmlb648-mythology-strip">{mythology.slice(0,5).map(x=><span key={x.team.id}><b>{x.team.abbr}</b> {x.label}</span>)}</div>}</section>}

    <div className="nmlb64-bracket-stage">
      <LeagueWing league="AL" renderBracketSeries={renderBracketSeries}/>
      <div className="nmlb64-finals-core">
        <NMLBCommissionersTrophy champion={trophyChampion} season={data.activeSeasonName||''}/>
        <div className="bracket-round-title">THE NMLB WORLD SERIES</div>
        {renderBracketSeries("finals","WORLD SERIES · FOR THE TROPHY",null,null,"finals-slot world-series-card")}
      </div>
      <LeagueWing league="NL" renderBracketSeries={renderBracketSeries}/>
    </div>
  </div>;
}
