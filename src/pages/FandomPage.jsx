import React,{useEffect,useMemo,useState} from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';
import { buildAnalystDesk,buildFanPoll,buildFanUniverse,buildMerch,buildProgramming,buildSocialChatter,getSeasonPulse } from '../utils/fandomUtils';

function TeamBadge({team}){if(!team)return <span>—</span>;const c=getTeamColorsByAbbr(team.abbr);return <span className="fan-team-badge" style={{'--fan-main':c.main,'--fan-border':c.border}}>{team.abbr}</span>}
function Meter({value}){return <div className="fan-meter"><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
const fmtPct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';

export default function FandomPage({ctx}){
  const {data,teams,playoffPicture}=ctx;
  const [now,setNow]=useState(Date.now());
  const [teamId,setTeamId]=useState('');
  const [merchOffset,setMerchOffset]=useState(0);
  const pulse=useMemo(()=>getSeasonPulse(data,teams),[data,teams]);
  const universe=useMemo(()=>buildFanUniverse(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const poll=useMemo(()=>buildFanPoll(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const chatter=useMemo(()=>buildSocialChatter(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const analysts=useMemo(()=>buildAnalystDesk(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const products=useMemo(()=>buildMerch(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const programming=useMemo(()=>buildProgramming(pulse,new Date(now)),[pulse,now]);
  const selected=universe.teamStates.find(x=>x.team.id===(teamId||universe.teamStates[0]?.team.id));
  const selectedProducts=products.filter(p=>!selected||p.team.id===selected.team.id);
  const merch=[...selectedProducts.slice(merchOffset),...selectedProducts.slice(0,merchOffset)].slice(0,4);
  const topRivalries=universe.rivalries.slice(0,6);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(t)},[]);
  useEffect(()=>{const t=setInterval(()=>setMerchOffset(x=>x+1),75000);return()=>clearInterval(t)},[selectedProducts.length]);
  return <div className="fandom-page">
    <section className="card fandom-hero">
      <div><div className="fan-kicker">FRANCHISE CENTRAL 4.5 · FANDOM</div><h1>The League Is Watching.</h1><p>Simulated fans, media, hype, merch, rivalries and weekly baseball culture — all reacting to the real league you are playing.</p></div>
      <div className="fan-week-badge"><small>SEASON RHYTHM</small><strong>WEEK {pulse.week}</strong><span>Day {pulse.dayInWeek} of 5 · {pulse.phase}</span></div>
    </section>

    <section className="fan-week-strip card">
      {Array.from({length:8},(_,i)=>{const w=i+1;const start=(w-1)*5+1,end=w*5;return <div key={w} className={w===pulse.week?'active':w<pulse.week?'done':''}><b>W{w}</b><span>Games {start}–{end}</span><small>{w===1?'Opening':w===4?'All-Star':w===8?'Pennant Race':w<4?'Build-up':'Second Half'}</small></div>})}
    </section>

    <div className="fan-grid-2">
      <section className="card fan-programming"><div className="fan-kicker">SMB NETWORK PROGRAMMING</div><h2>{programming.daypart} Lineup</h2><p>{programming.headline}</p>{programming.shows.map(s=><div className="fan-show" key={s[0]}><b>{s[0]}</b><span>{s[1]}</span></div>)}</section>
      <section className="card fan-league-mood"><div className="fan-kicker">LEAGUE MOOD</div><h2>{universe.leagueMood}</h2><p>{pulse.completed<20?'Every fanbase is still writing its version of the season.':pulse.completed<35?'Expectations are hardening into pressure.':'Every inning feels louder now.'}</p><div className="fan-live-bulbs"><span>📣 Fan Pulse Live</span><span>🛍️ Store Rotating</span><span>📊 Polls Drifting</span></div></section>
    </div>

    <section className="card"><div className="fan-section-head"><div><div className="fan-kicker">FANBASE INDEX</div><h2>How Every Fanbase Feels</h2></div><select value={teamId} onChange={e=>setTeamId(e.target.value)}><option value="">League leader</option>{teams.map(t=><option key={t.id} value={t.id}>{t.abbr} — {t.name}</option>)}</select></div>
      {selected&&<div className="fan-selected-team"><div className="fan-team-title"><TeamBadge team={selected.team}/><div><h2>{selected.team.city} {selected.team.name}</h2><p>{selected.personality.icon} {selected.personality.title} · {selected.personality.detail}</p></div><strong className={`fan-mood mood-${selected.mood.toLowerCase()}`}>{selected.mood}</strong></div><div className="fan-metric-grid">
        {[['Approval',selected.approval],['Hype',selected.hype],['Bandwagon',selected.bandwagon],['Market Heat',selected.marketHeat]].map(([l,v])=><div key={l}><span>{l}</span><strong>{Math.round(v)}</strong><Meter value={v}/></div>)}
      </div><div className="fan-team-context"><span>Expected: {fmtPct(selected.expected)}</span><span>Actual: {fmtPct(selected.actual)}</span><span>Atmosphere: {selected.atmosphere}</span><span>Titles: {selected.history.titles}</span></div></div>}
    </section>

    <div className="fan-grid-2">
      <section className="card"><div className="fan-kicker">LIVE FAN POLL</div><h2>{poll.question}</h2>{poll.options.map(o=><div className="fan-poll" key={o.team.id}><TeamBadge team={o.team}/><div><i style={{width:`${o.pct}%`}}/></div><strong>{o.pct}%</strong></div>)}<small className="muted">{poll.votes.toLocaleString()} simulated fan votes · percentages can drift every couple minutes.</small></section>
      <section className="card"><div className="fan-kicker">SMB SOCIAL</div><h2>The Timeline Is Normal About Baseball</h2><div className="fan-social-list">{chatter.map((x,i)=><div className={`fan-post ${x.tone}`} key={`${x.handle}-${i}`}><strong>{x.handle}</strong><span>{x.team}</span><p>{x.text}</p></div>)}</div></section>
    </div>

    <section className="card"><div className="fan-kicker">SMB NETWORK DESK</div><h2>Recurring Analysts</h2><div className="fan-analyst-grid">{analysts.length?analysts.map(a=><div className="fan-analyst" key={a.id}><div>{a.initials}</div><strong>{a.name}</strong><small>{a.role}</small><p>PICK: <b>{a.pick?.abbr}</b></p><span>{a.reason}</span></div>):<div className="fan-empty">Set a Live matchup and the analyst desk will make its picks.</div>}</div></section>

    <section className="card fan-store"><div className="fan-store-head"><div><div className="fan-kicker">OFFICIAL TEAM STORE</div><h2>{selected?`${selected.team.abbr} Featured Merch`:'League Store'}</h2><p>Fake shop. Very real imaginary demand.</p></div><button type="button" onClick={()=>setMerchOffset(x=>x+1)}>Rotate Drop</button></div><div className="fan-merch-grid">{merch.map(p=>{const c=getTeamColorsByAbbr(p.team.abbr);return <article key={p.id} className="fan-merch-card" style={{'--shop-main':c.main,'--shop-border':c.border}}><div className="fan-merch-art"><span>{p.team.abbr}</span><b>{p.type}</b></div><small>{p.tag}</small><h3>{p.name}</h3><div><span>★ FAN FAVORITE</span><button type="button">View Item</button></div></article>})}</div><div className="fan-ad-strip"><strong>VISIT THE TEAM STORE</strong><span>Opening Day drops · rivalry gear · playoff collections · retired-number legacy merch</span><b>SHOP THE LEAGUE →</b></div></section>

    <div className="fan-grid-2">
      <section className="card"><div className="fan-kicker">RIVALRY HEAT</div><h2>Games Fans Circle</h2>{topRivalries.map(r=><div className="fan-rivalry" key={`${r.teamAId}-${r.teamBId}`}><div><TeamBadge team={r.teamA}/><b>vs</b><TeamBadge team={r.teamB}/></div><Meter value={r.heat}/><span>{r.label} · {r.games} games · {r.postseasonGames} postseason</span></div>)}</section>
      <section className="card"><div className="fan-kicker">TICKET & CROWD WATCH</div><h2>Tonight's Atmosphere</h2>{[...universe.teamStates].sort((a,b)=>b.marketHeat-a.marketHeat).slice(0,8).map(x=><div className="fan-ticket" key={x.team.id}><TeamBadge team={x.team}/><div><strong>{x.atmosphere}</strong><span>{x.marketHeat>=75?'🔥 High demand':x.marketHeat>=50?'Steady demand':'Seats available'}</span></div><b>{Math.round(x.marketHeat)}</b></div>)}</section>
    </div>
  </div>
}
