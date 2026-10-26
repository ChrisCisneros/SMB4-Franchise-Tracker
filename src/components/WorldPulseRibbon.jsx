import React,{useEffect,useMemo,useState} from 'react';
import { buildWorldState } from '../utils/cultureUtils';
import { currentSeasonDay,scheduleEntryLabel } from '../utils/seasonCalendarUtils';

export default function WorldPulseRibbon({data,teams,playoffPicture=[],page=''}){
  const [tick,setTick]=useState(()=>Date.now());
  useEffect(()=>{const id=setInterval(()=>setTick(Date.now()),30000);return()=>clearInterval(id)},[]);
  const world=useMemo(()=>buildWorldState(data,teams,playoffPicture,tick),[data,teams,playoffPicture,tick]);
  const today=useMemo(()=>currentSeasonDay(data,teams),[data,teams]);
  if(['dashboard','news','fandom','office','live','quick','daily','admin','bracketAdmin'].includes(page))return null;
  const moments=(world.moments||[]).slice(0,2);
  if(!moments.length&&!world.trending?.length&&!today)return null;
  return <div className="global-world-pulse" aria-label="Around the league">
    <div className="global-world-pulse-live"><i/>WORLD PULSE</div>
    {today?.gameNumber&&<div className="global-world-pulse-today"><small>TODAY</small><b>G{today.gameNumber} {scheduleEntryLabel(today.schedule)}</b>{today.promo&&<em>{today.promo.icon||'🎟️'} {today.promo.name}</em>}</div>}
    <div className="global-world-pulse-moments">{moments.map((m,i)=><span key={`${m.type}-${i}`}><b>{m.icon||'•'} {m.type}</b><em>{m.title}</em></span>)}</div>
    <div className="global-world-pulse-tags">{(world.trending||[]).slice(0,2).map(tag=><small key={tag}>{tag}</small>)}</div>
  </div>;
}
