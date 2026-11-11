import React, { useEffect, useMemo, useState } from 'react';
import { getPlayoffSeries, makeSafePlayoffBracket } from '../utils/playoffUtils';
import { getPostseasonColorsByAbbr } from '../config/teamColors';

const DAYS=['MON','TUE','WED','THU','FRI','SAT','SUN'];
const SERIES=[
  ['AL','al_qf1','AL Quarterfinal A'],['AL','al_qf2','AL Quarterfinal B'],['AL','al_qf3','AL Quarterfinal C'],['AL','al_qf4','AL Quarterfinal D'],
  ['AL','al_sf1','ALDS A'],['AL','al_sf2','ALDS B'],['AL','al_lc','ALCS'],
  ['NL','nl_qf1','NL Quarterfinal A'],['NL','nl_qf2','NL Quarterfinal B'],['NL','nl_qf3','NL Quarterfinal C'],['NL','nl_qf4','NL Quarterfinal D'],
  ['NL','nl_sf1','NLDS A'],['NL','nl_sf2','NLDS B'],['NL','nl_lc','NLCS'],['NMLB','finals','NMLB Classic · World Series'],
];
const abbr=(teams,id)=>teams.find(t=>t.id===id)?.abbr||'TBD';
const roundTone=(meta)=>meta?.id==='finals'?'world-series':meta?.id?.endsWith('_lc')?'championship-series':meta?.id?.includes('_sf')?'division-series':'quarterfinal';

export default function PostseasonCalendar({data={},teams=[],editable=false,onSave}){
  const [selectedDay,setSelectedDay]=useState(null);
  const [selectedGame,setSelectedGame]=useState(null);
  const rawEntries=data.leagueExtras?.postseasonCalendar||{};
  const bracket=useMemo(()=>makeSafePlayoffBracket(data.playoffBracket),[data.playoffBracket]);
  const finalGames=useMemo(()=>{
    const current=data.activeSeasonName;
    return (data.games||[]).filter(game=>game?.gameType==='playoff'&&game?.status==='Final'&&(!current||game.seasonName===current)).reduce((map,game)=>{
      const id=game.playoffSeriesId||''; if(!id)return map; (map[id] ||= []).push(game); return map;
    },{});
  },[data.games,data.activeSeasonName]);
  const seriesRows=useMemo(()=>SERIES.map(([league,id,label])=>{
    const series=getPlayoffSeries(bracket,id); const played=Math.max(Array.isArray(series.games)?series.games.length:0,Number(series.awayWins||0)+Number(series.homeWins||0));
    return {league,id,label,series,played,matchup:`${abbr(teams,series.awayTeamId)} vs ${abbr(teams,series.homeTeamId)}`};
  }),[bracket,teams]);
  const seriesFor=(id)=>seriesRows.find(x=>x.id===id);
  const entries=useMemo(()=>Object.fromEntries(Object.entries(rawEntries).map(([day,rows])=>[day,(rows||[]).filter(row=>{
    if(row?.seasonName&&row.seasonName!==data.activeSeasonName)return false;
    if(row?.status==='event')return true;
    const meta=seriesRows.find(x=>x.id===row?.seriesId);
    return Boolean(meta)&&(!row?.matchup||row.matchup===meta.matchup);
  })]).filter(([,rows])=>rows.length)),[rawEntries,seriesRows,data.activeSeasonName]);
  const allEntries=useMemo(()=>Object.values(entries).flat().filter(Boolean),[entries]);
  const selectedSeries=selectedGame?seriesFor(selectedGame.seriesId):null;
  const selectedGameEntry=selectedGame?allEntries.find(x=>x.seriesId===selectedGame.seriesId&&Number(x.game)===Number(selectedGame.game)):null;

  // Once a series is complete, unused Game 4/5 entries are no longer part of the calendar.
  useEffect(()=>{
    const cleaned={}; let changed=false;
    Object.entries(entries).forEach(([day,rows])=>{
      const next=(rows||[]).filter(row=>{
        if(row.status==='event'||!row.seriesId||!row.game)return true;
        const meta=seriesFor(row.seriesId); const keep=!meta?.series?.winnerTeamId||Number(row.game)<=meta.played;
        if(!keep)changed=true;
        return keep;
      });
      if(next.length)cleaned[day]=next;
    });
    if(changed)onSave?.(cleaned);
  },[bracket]);

  const saveGameToDay=(day)=>{
    if(!editable||!selectedGame||selectedGameEntry)return;
    const meta=seriesFor(selectedGame.seriesId); if(!meta)return;
    const game=Number(selectedGame.game); const next={...entries,[String(day)]:[...(entries[String(day)]||[]),{id:crypto.randomUUID(),day:Number(day),seasonName:data.activeSeasonName,seriesId:meta.id,game,round:meta.label,series:meta.label,matchup:meta.matchup,conditional:game>3,time:'POSTSEASON',status:'scheduled'}]};
    onSave?.(next);setSelectedDay(day);setSelectedGame(null);
  };
  const addOffDay=()=>{const day=selectedDay??0;const name=window.prompt('Postseason event or off-day name:','NMLB Network Fan Fest');if(!name)return;const next={...entries,[String(day)]:[...(entries[String(day)]||[]),{id:crypto.randomUUID(),day,seasonName:data.activeSeasonName,round:'League Event',series:'Off-Day',game:'—',matchup:name,time:'ALL DAY',status:'event'}]};onSave?.(next);setSelectedDay(day);};
  const removeEntry=(day,id)=>onSave?.({...entries,[String(day)]:(entries[String(day)]||[]).filter(x=>x.id!==id)});
  const renderDay=(day)=>{const rows=entries[String(day)]||[];const selected=selectedDay===day;const winnerMeta=rows.map(entry=>entry.seriesId?seriesFor(entry.seriesId):null).find(meta=>meta?.series?.winnerTeamId);const winnerId=winnerMeta?.series?.winnerTeamId;const winnerTeam=winnerId?teams.find(team=>team.id===winnerId):null;const winnerColors=winnerTeam?getPostseasonColorsByAbbr(winnerTeam.abbr):null;const winnerStyle=winnerColors?{'--postseason-winner-main':winnerColors.main,'--postseason-winner-alt':winnerColors.alt,'--postseason-winner-border':winnerColors.border}:undefined;const dayTone=roundTone(rows.map(entry=>entry.seriesId?seriesFor(entry.seriesId):null).find(Boolean));return <div className={`postseason-calendar-cell ${rows.length?'has-entries':''} ${rows.length?`postseason-round-${dayTone}`:''} ${winnerTeam?'has-winner':''} ${selected?'selected':''} ${selectedGame?'ready-to-place':''}`} style={winnerStyle} onClick={()=>{setSelectedDay(day);saveGameToDay(day)}}><div><b>DAY {day+1}</b>{winnerTeam&&<span className="postseason-winner-badge">🏆 {winnerTeam.abbr} WIN</span>}{selectedGame&&<span>PLACE GAME</span>}</div>{rows.map(entry=>{const meta=entry.seriesId?seriesFor(entry.seriesId):null;const entryTime=entry.status==='event'?(entry.time||'ALL DAY'):'POSTSEASON';const finalGame=meta&&entry.game!=='—'?finalGames[meta.id]?.[Number(entry.game)-1]:null;return <div className={`postseason-calendar-entry ${meta?`postseason-round-${roundTone(meta)}`:''}`} key={entry.id}><small>{entryTime} · {entry.game==='—'?'EVENT':`GAME ${entry.game}${entry.conditional?'*':''}`}</small><strong>{meta?.matchup||entry.matchup||'TBD'}</strong><span>{finalGame?`FINAL · ${finalGame.awayScore}-${finalGame.homeScore}`:`${entry.round||entry.series}${entry.conditional?' · IF NEEDED':''}`}</span>{editable&&<i role="button" tabIndex={0} onClick={e=>{e.stopPropagation();removeEntry(day,entry.id)}}>×</i>}</div>})}{!rows.length&&<em>{selectedGame?'CLICK TO PLACE GAME':'OPEN DAY'}</em>}</div>};

  return <section className="card postseason-calendar-editor"><div className="postseason-calendar-editor-head"><div><small>POSTSEASON CALENDAR</small><h2>Plan the entire postseason</h2><p>Choose a series, select Game 1–5, then click the day where that game will happen. Games 4 and 5 are conditional until needed.</p></div><div><b>{allEntries.length}</b><span>scheduled postseason entries</span></div></div><div className="postseason-calendar-legend"><span className="postseason-legend-quarterfinal">● QUARTERFINALS</span><span className="postseason-legend-division">● DIVISION SERIES</span><span className="postseason-legend-championship">● CHAMPIONSHIP SERIES</span><span className="postseason-legend-world">● WORLD SERIES</span><span>🏆 WINNER COLOR</span></div><div className="postseason-series-planner"><div className="postseason-series-list"><small>1 · SELECT A SERIES AND GAME</small>{seriesRows.map(meta=>{const active=selectedGame?.seriesId===meta.id;return <article className={`postseason-series-plan postseason-round-${roundTone(meta)} ${active?'active':''}`} key={meta.id}><button type="button" className="postseason-series-plan-head" onClick={()=>setSelectedGame({seriesId:meta.id,game:Math.min(5,meta.played+1)})}><span>{meta.league} · {meta.label}</span><strong>{meta.matchup}</strong><em>{meta.series.winnerTeamId?`${abbr(teams,meta.series.winnerTeamId)} won ${meta.series.awayWins}-${meta.series.homeWins}`:meta.played?`${meta.matchup} · ${meta.played} played`:'Series not started'}</em></button><div className="postseason-game-slots">{[1,2,3,4,5].map(game=>{const planned=allEntries.some(x=>x.seriesId===meta.id&&Number(x.game)===game);const completed=game<=meta.played;const conditional=game>3;const unavailable=Boolean(meta.series.winnerTeamId)&&game>meta.played;return <button type="button" key={game} disabled={unavailable||planned} className={`${selectedGame?.seriesId===meta.id&&selectedGame.game===game?'selected':''} ${planned?'planned':''} ${completed?'completed':''} ${conditional?'conditional':''}`} onClick={()=>setSelectedGame({seriesId:meta.id,game})}>{completed?'✓ ':''}G{game}{conditional?'*':''}{planned?' · PLACED':''}</button>})}</div></article>})}</div><div className="postseason-matchup-instruction"><small>2 · CLICK A DAY</small><strong>{selectedGame?(selectedGameEntry?`Game ${selectedGame.game} is already placed.`:`${selectedSeries?.matchup||'TBD vs TBD'} · Game ${selectedGame.game}${selectedGame.game>3?'*':''} selected.`):'Select a game above, then click a calendar day.'}</strong><button type="button" onClick={addOffDay} disabled={!editable}>+ Add League Event</button></div></div><div className="postseason-calendar-grid"><div className="postseason-calendar-corner">POSTSEASON WEEK</div>{DAYS.map(d=><div className="postseason-calendar-dayhead" key={d}>{d}</div>)}{Array.from({length:6},(_,week)=><React.Fragment key={week}><div className="postseason-calendar-weeklabel"><strong>W{week+1}</strong><span>POSTSEASON</span></div>{Array.from({length:7},(_,dayOffset)=>renderDay(week*7+dayOffset))}</React.Fragment>)}</div><div className="postseason-calendar-actions"><button type="button" onClick={()=>setSelectedGame({seriesId:seriesRows[0]?.id,game:1})} disabled={!editable||!seriesRows.length}>Select First Game</button><span>{editable?'Select Game 1, click a day, then continue with Game 2. The planner stays available while you scroll.':'The postseason plan will fill as games are assigned and finalized.'}</span></div></section>;
}
