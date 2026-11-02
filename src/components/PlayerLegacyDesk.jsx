import React, { useMemo, useState } from 'react';
import { buildPlayerCareerBoard } from '../utils/historyUtils';
import { buildSpecialAchievements } from '../utils/playerLegacyUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

const STAT_DEFS = [
  {id:'hits',label:'Hits',abbr:'H',icon:'⚾',careerKey:'careerHits',steps:[50,100,200,300,500,750,1000]},
  {id:'hr',label:'Home Runs',abbr:'HR',icon:'💥',careerKey:'careerHR',steps:[25,50,100,150,200,250,300]},
  {id:'rbi',label:'RBI',abbr:'RBI',icon:'🔥',careerKey:null,steps:[50,100,200,300,500,750,1000]},
  {id:'strikeouts',label:'Strikeouts',abbr:'K',icon:'☄️',careerKey:'careerStrikeouts',steps:[100,250,500,750,1000,1500]},
  {id:'wins',label:'Pitching Wins',abbr:'W',icon:'🏆',careerKey:'careerPitchingWins',steps:[25,50,75,100,150,200]},
];

function milestoneStat(item={}){
  if(item.stat)return item.stat;
  const text=`${item.title||''} ${item.note||''}`.toLowerCase();
  if(/home run|homer|\bhr\b/.test(text))return 'hr';
  if(/strikeout|\bk\b/.test(text))return 'strikeouts';
  if(/\brbi\b/.test(text))return 'rbi';
  if(/\bwin/.test(text))return 'wins';
  if(/hit/.test(text))return 'hits';
  return 'other';
}
function milestoneValue(item={}){
  if(Number.isFinite(Number(item.milestoneValue))&&Number(item.milestoneValue)>0)return Number(item.milestoneValue);
  const m=String(item.title||'').match(/\d+/); return m?Number(m[0]):0;
}
function playerMatch(a,b){
  if(a.playerId&&b.id)return a.playerId===b.id;
  return String(a.playerName||'').trim().toLowerCase()===String(b.name||'').trim().toLowerCase();
}

export default function PlayerLegacyDesk({data,teams,controlsUnlocked,saveExtras,mode='full'}){
  const extras=data.leagueExtras||{};
  const careers=useMemo(()=>buildPlayerCareerBoard(data.players||[],data.seasonHistory||[]),[data.players,data.seasonHistory]);
  const milestones=useMemo(()=>buildSpecialAchievements(data,teams),[data,teams]);
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState(careers[0]?.id||'');
  const [stat,setStat]=useState('hr');
  const [value,setValue]=useState('');
  const [note,setNote]=useState('');
  const [retroactive,setRetroactive]=useState(false);
  const results=useMemo(()=>{const q=query.trim().toLowerCase();return q?careers.filter(p=>p.name.toLowerCase().includes(q)||String(teams.find(t=>t.id===p.teamId)?.abbr||'').toLowerCase().includes(q)).slice(0,10):careers.slice(0,10)},[query,careers,teams]);
  const player=careers.find(p=>p.id===selectedId)||results[0]||careers[0]||null;
  const team=teams.find(t=>t.id===player?.teamId)||null;
  const colors=getTeamColorsByAbbr(team?.abbr);
  const owned=player?milestones.filter(m=>playerMatch(m,player)):[];
  const ownedByStat=STAT_DEFS.reduce((o,s)=>(o[s.id]=owned.filter(m=>milestoneStat(m)===s.id),o),{});
  const records=extras.majorPlayerRecords||[];
  const updateRecord=(def)=>{
    if(!controlsUnlocked)return;
    const current=records.find(r=>r.stat===def.id)||{};
    const holder=window.prompt(`${def.label} all-time record holder:`,current.holder||''); if(holder===null||!holder.trim())return;
    const recordValue=Number(window.prompt(`${def.label} record value:`,String(current.value||''))||0); if(!recordValue)return;
    const teamAbbr=String(window.prompt('Primary team abbreviation (optional):',current.teamAbbr||'')||'').toUpperCase();
    const status=String(window.prompt('ACTIVE or RETIRED? ',current.status||'RETIRED')||'RETIRED').toUpperCase();
    const next={id:current.id||crypto.randomUUID(),stat:def.id,label:def.label,holder:holder.trim(),value:recordValue,teamAbbr,status,updatedAt:new Date().toISOString()};
    saveExtras({majorPlayerRecords:[next,...records.filter(r=>r.stat!==def.id)]});
  };
  const addMilestone=()=>{
    if(!controlsUnlocked||!player||!team)return;
    const def=STAT_DEFS.find(s=>s.id===stat); const n=Number(value||0); if(!def||!n)return;
    const duplicate=owned.some(m=>milestoneStat(m)===stat&&milestoneValue(m)===n);
    if(duplicate){window.alert(`${player.name} already has the ${n} ${def.abbr} milestone.`);return;}
    const now=new Date().toISOString(),achievementId=crypto.randomUUID(),historyId=crypto.randomUUID();
    const title=`${n} Career ${def.label}`;
    const achievement={id:achievementId,linkedHistoryId:historyId,createdAt:now,playerId:player.id,playerName:player.name,teamAbbr:team.abbr,title,note,season:retroactive?'Date unknown':(data.activeSeasonName||'Season'),icon:def.icon,stat:def.id,milestoneValue:n,retroactive};
    const history={id:historyId,linkedAchievementId:achievementId,createdAt:now,date:achievement.season,teamAbbr:team.abbr,playerId:player.id,playerName:player.name,title,note,stat:def.id,milestoneValue:n,retroactive};
    saveExtras({achievements:[achievement,...(extras.achievements||[])],manualEvents:[history,...(extras.manualEvents||[])]});
    setValue(''); setNote(''); setRetroactive(false);
  };

  return <section className="card v61-player-legacy" style={{'--legacy-main':colors.main,'--legacy-alt':colors.alt}}>
    <div className="v61-legacy-head"><div><small>NMLB 6.3 · PLAYER LEGACY DESK</small><h2>Look Up A Player. Build Their Story.</h2><p>Milestones live on the player profile, feed the ladder, enter History, and connect to the all-time record book.</p></div><div className="v61-legacy-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search player or team…"/><div>{results.map(p=>{const t=teams.find(x=>x.id===p.teamId);return <button type="button" key={p.id} className={player?.id===p.id?'active':''} onClick={()=>setSelectedId(p.id)}><b>{p.name}</b><span>{t?.abbr||'FA'} · #{p.number||'—'}</span></button>})}</div></div></div>
    {player?<>
      <div className="v61-player-profile"><div className="v61-player-monogram">{player.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</div><div><small>{team?.abbr||'FREE AGENT'} · PLAYER LEGACY PROFILE</small><h3>{player.name}</h3><span>{owned.length} milestone{owned.length===1?'':'s'} preserved</span></div><div className="v61-player-career-strip"><span><b>{player.careerHits}</b> H</span><span><b>{player.careerHR}</b> HR</span><span><b>{player.careerStrikeouts}</b> K</span><span><b>{player.careerPitchingWins}</b> W</span></div></div>
      <div className="v61-ladder-grid">{STAT_DEFS.map(def=>{const list=ownedByStat[def.id]||[];const achieved=new Set(list.map(m=>milestoneValue(m)));const current=def.careerKey?Number(player[def.careerKey]||0):0;return <article key={def.id}><header><span>{def.icon}</span><div><small>{def.label.toUpperCase()}</small><strong>{list.length?`${Math.max(...list.map(m=>milestoneValue(m)))} ${def.abbr}`:'No tier entered'}</strong></div></header><div className="v61-ladder-steps">{def.steps.map(step=><i key={step} className={achieved.has(step)?'earned':current>=step?'eligible':''} title={achieved.has(step)?'Milestone preserved':current>=step?'Career total has reached this tier; add it when ready':'Future milestone'}><b>{step}</b><span>{def.abbr}</span></i>)}</div></article>})}</div>
      {controlsUnlocked&&<div className="v61-add-milestone"><div><small>ADD TO {player.name.toUpperCase()}</small><strong>New Career Milestone</strong></div><select value={stat} onChange={e=>setStat(e.target.value)}>{STAT_DEFS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><input type="number" min="1" value={value} onChange={e=>setValue(e.target.value)} placeholder="Milestone value"/><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Context / why it matters"/><label><input type="checkbox" checked={retroactive} onChange={e=>setRetroactive(e.target.checked)}/> Date unknown / retroactive</label><button type="button" onClick={addMilestone}>Preserve Milestone</button></div>}
    </>:<p className="muted">Add players to the career tracker to build milestone profiles.</p>}

    {mode!=='profile'&&<div className="v61-major-record-book"><div className="v61-record-book-head"><div><small>THE IMMORTALS</small><h3>All-Time Player Records</h3><p>Enter retired legends once, then every active career has something enormous to chase.</p></div></div><div className="v61-record-book-grid">{STAT_DEFS.filter(d=>['hits','hr','rbi','strikeouts'].includes(d.id)).map(def=>{const rec=records.find(r=>r.stat===def.id);const active=def.careerKey?[...careers].sort((a,b)=>Number(b[def.careerKey]||0)-Number(a[def.careerKey]||0))[0]:null;const remaining=rec&&active?Math.max(0,Number(rec.value)-Number(active[def.careerKey]||0)):null;return <article key={def.id}><div className="v61-record-icon">{def.icon}</div><small>ALL-TIME {def.label.toUpperCase()}</small><strong>{rec?Number(rec.value).toLocaleString():'—'}</strong><b>{rec?.holder||'Record holder not entered'}</b><span>{rec?`${rec.teamAbbr||'LEAGUE'} · ${rec.status||'RETIRED'}`:'Add the retired legend and total'}</span>{active&&rec&&<div className="v61-record-chase"><em>ACTIVE CHASE</em><b>{active.name}</b><span>{Number(active[def.careerKey]||0).toLocaleString()} · {remaining===0?'RECORD REACHED':`${remaining.toLocaleString()} away`}</span></div>}{controlsUnlocked&&<button type="button" onClick={()=>updateRecord(def)}>{rec?'Edit Record':'Set Record'}</button>}</article>})}</div></div>}
  </section>;
}
