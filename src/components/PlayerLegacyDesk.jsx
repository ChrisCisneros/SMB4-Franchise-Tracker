import React, { useMemo, useState } from 'react';
import { buildPlayerCareerBoard } from '../utils/historyUtils';
import { buildSpecialAchievements } from '../utils/playerLegacyUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

const STAT_DEFS = [
  {id:'hits',label:'Hits',abbr:'H',icon:'⚾',careerKey:'careerHits',steps:[300,400,500,600,750,1000]},
  {id:'hr',label:'Home Runs',abbr:'HR',icon:'💥',careerKey:'careerHR',steps:[100,150,200,250,300,400]},
  {id:'rbi',label:'RBI',abbr:'RBI',icon:'🔥',careerKey:null,steps:[200,300,400,500,750,1000]},
  {id:'stolenBases',label:'Stolen Bases',abbr:'SB',icon:'⚡',careerKey:null,steps:[100,150,200,250,300,400]},
  {id:'wins',label:'Pitching Wins',abbr:'W',icon:'🏆',careerKey:'careerPitchingWins',steps:[40,50,60,75,100,125]},
  {id:'saves',label:'Saves',abbr:'SV',icon:'🔒',careerKey:null,steps:[50,75,100,125,150,200]},
  {id:'strikeouts',label:'Strikeouts',abbr:'K',icon:'☄️',careerKey:'careerStrikeouts',steps:[200,300,400,500,750,1000]},
];

function milestoneStat(item={}){
  if(item.stat)return item.stat;
  const text=`${item.title||''} ${item.note||''}`.toLowerCase();
  if(/home run|homer|\bhr\b/.test(text))return 'hr';
  if(/stolen base|\bsb\b/.test(text))return 'stolenBases';
  if(/\bsave|\bsv\b/.test(text))return 'saves';
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
  if(a.playerId&&b.id&&a.playerId===b.id)return true;
  return String(a.playerName||'').trim().toLowerCase()===String(b.name||'').trim().toLowerCase();
}
function cleanName(value=''){return String(value||'').trim().replace(/\s+/g,' ')}
function legacyRow({id,name,teamId,teamAbbr,number=''}){
  return {id,name,teamId,teamAbbr,number,careerAB:0,careerHits:0,careerDoubles:0,careerTriples:0,careerHR:0,careerWalks:0,careerStrikeouts:0,careerHBP:0,careerPitchingWins:0,careerPitchingLosses:0,seasonAB:0,seasonHits:0,seasonDoubles:0,seasonTriples:0,seasonHR:0,seasonWalks:0,seasonStrikeouts:0,seasonHBP:0,seasonPitchingWins:0,seasonPitchingLosses:0,careerAvg:0,seasonAvg:0,isLegacyDirectory:true};
}

export default function PlayerLegacyDesk({data,teams,controlsUnlocked,saveExtras,mode='full'}){
  const extras=data.leagueExtras||{};
  const trackedCareers=useMemo(()=>buildPlayerCareerBoard(data.players||[],data.seasonHistory||[]),[data.players,data.seasonHistory]);
  const careers=useMemo(()=>{
    const rows=[...trackedCareers];
    const seen=new Set(rows.map(p=>cleanName(p.name).toLowerCase()));
    const add=(name,teamAbbr='',id='')=>{
      const n=cleanName(name); if(!n)return;
      const key=n.toLowerCase(); if(seen.has(key))return;
      const team=(teams||[]).find(t=>String(t.abbr||'').toUpperCase()===String(teamAbbr||'').toUpperCase())||null;
      rows.push(legacyRow({id:id||`legacy-${key.replace(/[^a-z0-9]+/g,'-')}`,name:n,teamId:team?.id||'',teamAbbr:team?.abbr||String(teamAbbr||'').toUpperCase()}));
      seen.add(key);
    };
    (extras.legacyPlayers||[]).forEach(p=>add(p.name,p.teamAbbr,p.id));
    (extras.achievements||[]).forEach(x=>add(x.playerName,x.teamAbbr));
    (extras.manualEvents||[]).forEach(x=>add(x.playerName,x.teamAbbr));
    (extras.awards||[]).forEach(x=>add(x.winner,x.teamAbbr));
    (extras.awardRace||[]).forEach(x=>add(x.leader,x.teamAbbr));
    (extras.majorPlayerRecords||[]).forEach(x=>add(x.holder,x.teamAbbr));
    return rows.sort((a,b)=>Number(b.careerHits||0)-Number(a.careerHits||0)||Number(b.careerHR||0)-Number(a.careerHR||0)||a.name.localeCompare(b.name));
  },[trackedCareers,extras.legacyPlayers,extras.achievements,extras.manualEvents,extras.awards,extras.awardRace,extras.majorPlayerRecords,teams]);
  const milestones=useMemo(()=>buildSpecialAchievements(data,teams),[data,teams]);
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState('');
  const [stat,setStat]=useState('hr');
  const [value,setValue]=useState('');
  const [note,setNote]=useState('');
  const [retroactive,setRetroactive]=useState(false);
  const results=useMemo(()=>{const q=query.trim().toLowerCase();return q?careers.filter(p=>p.name.toLowerCase().includes(q)||String(teams.find(t=>t.id===p.teamId)?.abbr||p.teamAbbr||'').toLowerCase().includes(q)).slice(0,12):careers.slice(0,12)},[query,careers,teams]);
  const player=careers.find(p=>p.id===selectedId)||results[0]||careers[0]||null;
  const team=teams.find(t=>t.id===player?.teamId)||teams.find(t=>String(t.abbr||'').toUpperCase()===String(player?.teamAbbr||'').toUpperCase())||null;
  const colors=getTeamColorsByAbbr(team?.abbr);
  const owned=player?milestones.filter(m=>playerMatch(m,player)):[];
  const ownedByStat=STAT_DEFS.reduce((o,s)=>(o[s.id]=owned.filter(m=>milestoneStat(m)===s.id),o),{});
  const records=extras.majorPlayerRecords||[];
  const addLegacyPlayer=()=>{
    if(!controlsUnlocked)return;
    const suggested=cleanName(query);
    const name=cleanName(window.prompt('Player name:',suggested)||''); if(!name)return;
    const existing=careers.find(p=>cleanName(p.name).toLowerCase()===name.toLowerCase());
    if(existing){setSelectedId(existing.id);setQuery(existing.name);return;}
    const teamList=(teams||[]).map(t=>t.abbr).filter(Boolean).join(', ');
    const teamAbbr=String(window.prompt(`Team abbreviation (${teamList}):`,'')||'').trim().toUpperCase();
    const teamMatch=(teams||[]).find(t=>String(t.abbr||'').toUpperCase()===teamAbbr);
    if(!teamMatch){window.alert('Choose a valid NMLB team abbreviation so milestones can be filed correctly.');return;}
    const next={id:crypto.randomUUID(),name,teamAbbr:teamMatch.abbr,teamId:teamMatch.id,createdAt:new Date().toISOString()};
    saveExtras({legacyPlayers:[next,...(extras.legacyPlayers||[])]});
    setSelectedId(next.id); setQuery(name);
  };
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
    <div className="v61-legacy-head"><div><small>NMLB 6.4.13 · PLAYER LEGACY DESK</small><h2>Look Up A Player. Build Their Story.</h2><p>Search tracked players and the permanent NMLB legacy directory. Historical players only need to be added once, then they stay searchable for future milestones.</p></div><div className="v61-legacy-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search player or team…"/><div>{results.map(p=>{const t=teams.find(x=>x.id===p.teamId)||teams.find(x=>String(x.abbr||'').toUpperCase()===String(p.teamAbbr||'').toUpperCase());return <button type="button" key={p.id} className={player?.id===p.id?'active':''} onClick={()=>setSelectedId(p.id)}><b>{p.name}</b><span>{t?.abbr||p.teamAbbr||'NMLB'}{p.number?` · #${p.number}`:''}</span></button>})}</div>{controlsUnlocked&&<button type="button" className="v61-legacy-add-player" onClick={addLegacyPlayer}>+ Add Historical Player</button>}</div></div>
    {player?<>
      <div className="v61-player-profile"><div className="v61-player-monogram">{player.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</div><div><small>{team?.abbr||player.teamAbbr||'NMLB'} · PLAYER LEGACY PROFILE</small><h3>{player.name}</h3><span>{owned.length} milestone{owned.length===1?'':'s'} preserved{player.isLegacyDirectory?' · legacy directory':''}</span></div><div className="v61-player-career-strip"><span><b>{player.careerHits}</b> H</span><span><b>{player.careerHR}</b> HR</span><span><b>{player.careerStrikeouts}</b> K</span><span><b>{player.careerPitchingWins}</b> W</span></div></div>
      <div className="v61-ladder-grid">{STAT_DEFS.map(def=>{const list=ownedByStat[def.id]||[];const achieved=new Set(list.map(m=>milestoneValue(m)));const current=def.careerKey?Number(player[def.careerKey]||0):0;return <article key={def.id}><header><span>{def.icon}</span><div><small>{def.label.toUpperCase()}</small><strong>{list.length?`${Math.max(...list.map(m=>milestoneValue(m)))} ${def.abbr}`:'No tier entered'}</strong></div></header><div className="v61-ladder-steps">{def.steps.map(step=><i key={step} className={achieved.has(step)?'earned':current>=step?'eligible':''} title={achieved.has(step)?'Milestone preserved':current>=step?'Career total has reached this tier; add it when ready':'Future milestone'}><b>{step}</b><span>{def.abbr}</span></i>)}</div></article>})}</div>
      {controlsUnlocked&&<div className="v61-add-milestone"><div><small>ADD TO {player.name.toUpperCase()}</small><strong>New Career Milestone</strong></div><select value={stat} onChange={e=>setStat(e.target.value)}>{STAT_DEFS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select><input type="number" min="1" value={value} onChange={e=>setValue(e.target.value)} placeholder="Milestone value"/><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Context / why it matters"/><label><input type="checkbox" checked={retroactive} onChange={e=>setRetroactive(e.target.checked)}/> Date unknown / retroactive</label><button type="button" onClick={addMilestone}>Preserve Milestone</button></div>}
    </>:<div className="v61-legacy-empty"><p className="muted">No player matches yet. Add a historical player to the NMLB legacy directory, then preserve their milestones.</p>{controlsUnlocked&&<button type="button" onClick={addLegacyPlayer}>+ Add Historical Player</button>}</div>}

    {mode!=='profile'&&<div className="v61-major-record-book"><div className="v61-record-book-head"><div><small>THE IMMORTALS</small><h3>All-Time Player Records</h3><p>Enter retired legends once, then every active career has something enormous to chase.</p></div></div><div className="v61-record-book-grid">{STAT_DEFS.filter(d=>['hits','hr','rbi','stolenBases','wins','saves','strikeouts'].includes(d.id)).map(def=>{const rec=records.find(r=>r.stat===def.id);const active=def.careerKey?[...careers].sort((a,b)=>Number(b[def.careerKey]||0)-Number(a[def.careerKey]||0))[0]:null;const remaining=rec&&active?Math.max(0,Number(rec.value)-Number(active[def.careerKey]||0)):null;return <article key={def.id}><div className="v61-record-icon">{def.icon}</div><small>ALL-TIME {def.label.toUpperCase()}</small><strong>{rec?Number(rec.value).toLocaleString():'—'}</strong><b>{rec?.holder||'Record holder not entered'}</b><span>{rec?`${rec.teamAbbr||'LEAGUE'} · ${rec.status||'RETIRED'}`:'Add the retired legend and total'}</span>{active&&rec&&<div className="v61-record-chase"><em>ACTIVE CHASE</em><b>{active.name}</b><span>{Number(active[def.careerKey]||0).toLocaleString()} · {remaining===0?'RECORD REACHED':`${remaining.toLocaleString()} away`}</span></div>}{controlsUnlocked&&<button type="button" onClick={()=>updateRecord(def)}>{rec?'Edit Record':'Set Record'}</button>}</article>})}</div></div>}
  </section>;
}
