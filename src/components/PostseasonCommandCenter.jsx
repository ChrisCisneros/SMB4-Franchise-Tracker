import React, { useMemo, useState } from 'react';
import { getPlayoffSeries, getWinsNeededForSeries, makeSafePlayoffBracket } from '../utils/playoffUtils';
import PostseasonCalendar from './PostseasonCalendar';

const SERIES = [
  ['AL','al_qf1','AL Quarterfinal A'],['AL','al_qf2','AL Quarterfinal B'],['AL','al_qf3','AL Quarterfinal C'],['AL','al_qf4','AL Quarterfinal D'],
  ['AL','al_sf1','ALDS A'],['AL','al_sf2','ALDS B'],['AL','al_lc','ALCS'],
  ['NL','nl_qf1','NL Quarterfinal A'],['NL','nl_qf2','NL Quarterfinal B'],['NL','nl_qf3','NL Quarterfinal C'],['NL','nl_qf4','NL Quarterfinal D'],
  ['NL','nl_sf1','NLDS A'],['NL','nl_sf2','NLDS B'],['NL','nl_lc','NLCS'],['NMLB','finals','NMLB Classic · World Series'],
];

const teamName=(team)=>team?.abbr||'TBD';
const score=(game,teams)=>`${teamName(teams.find(t=>t.id===game.awayTeamId))} ${game.awayScore} – ${teamName(teams.find(t=>t.id===game.homeTeamId))} ${game.homeScore}`;

function SeriesCard({item,teams,games}){
  const [league,id,label]=item; const series=games.bracket[id]||{};
  const away=teams.find(t=>t.id===series.awayTeamId), home=teams.find(t=>t.id===series.homeTeamId);
  const played=games.final.filter(g=>g.playoffSeriesId===id).sort((a,b)=>(Date.parse(a.finalizedAt||a.date)||0)-(Date.parse(b.finalizedAt||b.date)||0));
  const count=Math.max(played.length,Array.isArray(series.games)?series.games.length:0);
  const need=getWinsNeededForSeries(id); const winner=teams.find(t=>t.id===series.winnerTeamId);
  const currentAway=away||teams.find(t=>t.id===played[0]?.awayTeamId), currentHome=home||teams.find(t=>t.id===played[0]?.homeTeamId);
  const derived={away:played.filter(g=>Number(g.awayScore)>Number(g.homeScore)).length,home:played.filter(g=>Number(g.homeScore)>Number(g.awayScore)).length};
  const awayWins=Math.max(Number(series.awayWins||0),derived.away), homeWins=Math.max(Number(series.homeWins||0),derived.home);
  const derivedWinner=winner||((awayWins>=need||homeWins>=need)?(awayWins>homeWins?currentAway:currentHome):null);
  const status=derivedWinner?`${derivedWinner.abbr} ADVANCES · ${awayWins}-${homeWins}`:currentAway&&currentHome?((awayWins||homeWins)?`${teamName(currentAway)} ${awayWins} · ${teamName(currentHome)} ${homeWins}`:'SERIES READY'):'MATCHUP TBD';
  return <article className={`postseason-series-card ${derivedWinner?'is-complete':''} ${awayWins||homeWins?'has-score':''}`}><div className="postseason-series-card-head"><small>{league} · {label}</small><b>{derivedWinner?'ADVANCED':count?`GAME ${count+1} NEXT`:'UPCOMING'}</b></div><h3>{teamName(currentAway)} <span>vs</span> {teamName(currentHome)}</h3><strong className="postseason-series-score">{status}</strong><div className="postseason-series-games">{Array.from({length:Math.max(3,need*2-1)},(_,i)=>{const g=played[i];return <span key={i} className={g?'played':''}><b>G{i+1}</b>{g?`${g.awayScore}-${g.homeScore}`:i<count?'ARCHIVED':'TBD'}</span>})}</div>{!derivedWinner&&currentAway&&currentHome&&<em>First to {need} · {count<3?'Games 1–3 ready to enter':`Game ${count+1} opens after the latest final`}</em>}</article>;
}

export default function PostseasonCommandCenter({data={},teams=[]}){
  const [tab,setTab]=useState('overview');
  const [seriesFilter,setSeriesFilter]=useState('all');
  const bracket=useMemo(()=>makeSafePlayoffBracket(data.playoffBracket),[data.playoffBracket]);
  const finals=useMemo(()=> (data.games||[]).filter(g=>g?.gameType==='playoff'&&g?.status==='Final'&&(!data.activeSeasonName||g.seasonName===data.activeSeasonName)),[data.games,data.activeSeasonName]);
  const live=data.currentGame?.gameType==='playoff'&&['Live','Mid-Inning','Warmup','Delay'].includes(data.currentGame?.status)?data.currentGame:null;
  const seriesData={bracket,final:finals};
  const activeSeries=SERIES.map(([league,id,label])=>({league,id,label,series:getPlayoffSeries(bracket,id)})).filter(x=>x.series?.awayTeamId&&x.series?.homeTeamId&&!x.series?.winnerTeamId);
  const wins=finals.reduce((acc,g)=>{const winner=Number(g.awayScore)>Number(g.homeScore)?g.awayTeamId:g.homeTeamId;acc[winner]=(acc[winner]||0)+1;return acc;},{});
  const leader=Object.entries(wins).sort((a,b)=>b[1]-a[1])[0];
  const calendar=finals.reduce((map,g)=>{const date=g.date||g.finalizedAt?.slice(0,10)||'Date TBD';(map[date] ||= []).push(g);return map;},{});
  const seriesGroups={all:SERIES,quarterfinals:SERIES.filter(([,id])=>id.includes('_qf')),division:SERIES.filter(([,id])=>id.includes('_sf')),championship:SERIES.filter(([,id])=>id.includes('_lc')),world:SERIES.filter(([,id])=>id==='finals')};
  const visibleSeries=seriesGroups[seriesFilter]||SERIES;
  return <section className="postseason-command-center card">
    <div className="postseason-command-head"><div><small>V6.9 · NMLB POSTSEASON CONTROL CENTER</small><h2>The road to the trophy is live.</h2><p>Every current matchup, every final score and every elimination point belongs to the postseason story now.</p></div><div className="postseason-command-stats"><span><b>{finals.length}</b> finals</span><span><b>{activeSeries.length}</b> active series</span><span><b>{live?'LIVE':'READY'}</b> broadcast</span></div></div>
    <div className="postseason-command-tabs">{[['overview','Dashboard'],['series','Series Center'],['calendar','Postseason Calendar'],['records','October Records']].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
    {tab==='overview'&&<div className="postseason-command-grid"><article><small>TONIGHT IN OCTOBER</small><strong>{live?`${teamName(teams.find(t=>t.id===live.awayTeamId))} vs ${teamName(teams.find(t=>t.id===live.homeTeamId))}`:'No game currently live'}</strong><span>{live?`${live.awayScore}-${live.homeScore} · ${live.inningStatus||`${live.half} ${live.inning}`}`:'Load a series into Live Scoring to begin the next game.'}</span></article><article><small>POSTSEASON WINS</small><strong>{leader?teamName(teams.find(t=>t.id===leader[0])):'—'}</strong><span>{leader?`${leader[1]} win${leader[1]===1?'':'s'} in the archived October slate`:'The first final will set the board.'}</span></article><article><small>NEXT GAME WINDOWS</small><strong>{activeSeries.length?'TBD → score individually':'BRACKET COMPLETE'}</strong><span>{activeSeries.length?'Multiple series can share a date while each game remains independently tracked.':'The NMLB Classic field is decided.'}</span></article></div>}
    {tab==='series'&&<><div className="postseason-series-filters">{[['all','All Series'],['quarterfinals','Quarterfinals'],['division','Division Series'],['championship','Championship Series'],['world','World Series']].map(([id,label])=><button key={id} className={seriesFilter===id?'active':''} onClick={()=>setSeriesFilter(id)}>{label}</button>)}</div><div className="postseason-series-grid">{visibleSeries.map(item=><SeriesCard key={item[1]} item={item} teams={teams} games={seriesData}/>)}{!visibleSeries.some(([,,],i)=>{const s=getPlayoffSeries(bracket,visibleSeries[i][1]);return s.awayTeamId||s.homeTeamId})&&<p className="muted">The current bracket has not populated this round yet.</p>}</div></>}
    {tab==='calendar'&&<PostseasonCalendar data={data} teams={teams} editable={false}/>} 
    {tab==='records'&&<div className="postseason-record-grid"><article><small>POSTSEASON GAMES</small><strong>{finals.length}</strong><span>Finals preserved this postseason</span></article><article><small>ONE-RUN FINALS</small><strong>{finals.filter(g=>Math.abs(Number(g.awayScore)-Number(g.homeScore))===1).length}</strong><span>Pressure games decided by one run</span></article><article><small>EXTRA-INNING FINALS</small><strong>{finals.filter(g=>Number(g.inning||0)>9||g.extraInnings).length}</strong><span>October games that refused to end</span></article><article><small>WALK-OFF FINALS</small><strong>{finals.filter(g=>g.walkoff).length}</strong><span>Home teams that ended the night</span></article></div>}
  </section>;
}
