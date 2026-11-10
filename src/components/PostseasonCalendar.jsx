import React, { useMemo, useState } from 'react';

const DAYS=['MON','TUE','WED','THU','FRI','SAT','SUN'];

export default function PostseasonCalendar({data={},teams=[],editable=false,onSave}){
  const [selected,setSelected]=useState(null);
  const entries=data.leagueExtras?.postseasonCalendar||{};
  const current=useMemo(()=>Object.values(entries).flat().filter(Boolean),[entries]);
  const addEntry=(day)=>{
    if(!editable)return;
    const round=window.prompt('Round (Wild Card / Quarterfinals / DS / CS / World Series):','Quarterfinals'); if(round===null)return;
    const series=window.prompt('Series (example: AL QF A):',''); if(series===null)return;
    const game=window.prompt('Game number:','1'); if(game===null)return;
    const matchup=window.prompt('Matchup (example: #1 vs #8 or SF vs LAD):','TBD vs TBD'); if(matchup===null)return;
    const time=window.prompt('First pitch / window:','NIGHT'); if(time===null)return;
    const next={...entries,[String(day)]:[...(entries[String(day)]||[]),{id:crypto.randomUUID(),day:Number(day),round,series,game,matchup,time,status:'scheduled'}]};
    onSave?.(next);setSelected(day);
  };
  const removeEntry=(day,id)=>onSave?.({...entries,[String(day)]:(entries[String(day)]||[]).filter(x=>x.id!==id)});
  return <section className="card postseason-calendar-editor"><div className="postseason-calendar-editor-head"><div><small>POSTSEASON CALENDAR</small><h2>October has its own calendar.</h2><p>Schedule games, shared windows, off-days and TBD matchups without touching the locked regular-season calendar.</p></div><div><b>{current.length}</b><span>scheduled October entries</span></div></div><div className="postseason-calendar-legend"><span>⚾ GAME</span><span>◌ TBD</span><span>📺 BROADCAST WINDOW</span><span>🎪 EVENT / OFF-DAY</span></div><div className="postseason-calendar-grid"><div className="postseason-calendar-corner">POSTSEASON WEEK</div>{DAYS.map(d=><div className="postseason-calendar-dayhead" key={d}>{d}</div>)}{Array.from({length:42},(_,day)=>{const rows=entries[String(day)]||[];return <React.Fragment key={day}><div className={`postseason-calendar-weeklabel ${day%7===0?'week-start':''}`}><strong>W{Math.floor(day/7)+1}</strong><span>OCTOBER</span></div><button type="button" className={`postseason-calendar-cell ${rows.length?'has-entries':''} ${selected===day?'selected':''}`} onClick={()=>{setSelected(day);if(editable&&!rows.length)addEntry(day)}}><div><b>DAY {day+1}</b>{editable&&!rows.length&&<span>+ ADD</span>}</div>{rows.map(entry=><div className="postseason-calendar-entry" key={entry.id}><small>{entry.time||'TBD'} · G{entry.game||'?'}</small><strong>{entry.matchup||'TBD'}</strong><span>{entry.round} · {entry.series}</span>{editable&&<i role="button" tabIndex={0} onClick={e=>{e.stopPropagation();removeEntry(day,entry.id)}}>×</i>}</div>)}{!rows.length&&<em>TBD / OPEN</em>}</button></React.Fragment>})}</div><div className="postseason-calendar-actions"><button type="button" onClick={()=>addEntry(selected??0)} disabled={!editable}>+ Add Postseason Date</button><span>{editable?'Click an empty date or use the button to add a game. Multiple games may share a day.':'The postseason schedule will fill as games are assigned and finalized.'}</span></div></section>;
}
