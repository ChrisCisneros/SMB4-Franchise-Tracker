import React,{useEffect,useMemo,useState} from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';
import { buildAnalystDesk,buildFanPoll,buildFanUniverse,buildMerch,buildProgramming,buildSocialChatter,getSeasonPulse } from '../utils/fandomUtils';
import { buildFanClubs,buildFanTraditions,buildLegacyDebates,buildLivingFeed,buildMediaUniverse,buildPlayerFanPages } from '../utils/livingWorldUtils';
import { buildGameDaySocial } from '../utils/gameDaySocialUtils';
import GameDaySocial from '../components/GameDaySocial';

function TeamBadge({team,onClick,active=false}){if(!team)return <span>—</span>;const c=getTeamColorsByAbbr(team.abbr);const Tag=onClick?'button':'span';return <Tag type={onClick?'button':undefined} onClick={onClick} className={`fan-team-badge ${onClick?'is-clickable':''} ${active?'is-active':''}`} style={{'--fan-main':c.main,'--fan-alt':c.alt,'--fan-border':c.border,'--fan-text':c.text}}>{team.abbr}</Tag>}
function Meter({value}){return <div className="fan-meter"><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
const fmtPct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const shortNum=n=>n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);

export default function FandomPage({ctx}){
  const {data,teams,playoffPicture,favoriteTeam}=ctx;
  const [now,setNow]=useState(Date.now());
  const [teamId,setTeamId]=useState('');
  const [merchOffset,setMerchOffset]=useState(0);
  const [feedFilter,setFeedFilter]=useState('all');
  const [feedPaused,setFeedPaused]=useState(false);
  const [cultureView,setCultureView]=useState('clubs');
  const pulse=useMemo(()=>getSeasonPulse(data,teams),[data,teams]);
  const universe=useMemo(()=>buildFanUniverse(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const poll=useMemo(()=>buildFanPoll(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const chatter=useMemo(()=>buildSocialChatter(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const analysts=useMemo(()=>buildAnalystDesk(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const products=useMemo(()=>buildMerch(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const programming=useMemo(()=>buildProgramming(pulse,new Date(now)),[pulse,now]);
  const selectedId=teamId||favoriteTeam?.id||universe.teamStates[0]?.team.id;
  const selected=universe.teamStates.find(x=>x.team.id===selectedId);
  const selectedColors=getTeamColorsByAbbr(selected?.team?.abbr);
  const fandomStyle={'--fandom-main':selectedColors.main,'--fandom-alt':selectedColors.alt,'--fandom-border':selectedColors.border,'--fandom-text':selectedColors.text};
  const selectedProducts=products.filter(p=>!selected||p.team.id===selected.team.id);
  const merch=[...selectedProducts.slice(merchOffset),...selectedProducts.slice(0,merchOffset)].slice(0,4);
  const topRivalries=universe.rivalries.slice(0,6);
  const liveFeed=useMemo(()=>buildLivingFeed(data,teams,playoffPicture,now,selectedId),[data,teams,playoffPicture,now,selectedId]);
  const fanClubs=useMemo(()=>buildFanClubs(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const playerPages=useMemo(()=>buildPlayerFanPages(data,teams),[data,teams]);
  const mediaUniverse=useMemo(()=>buildMediaUniverse(),[]);
  const traditions=useMemo(()=>buildFanTraditions(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const debates=useMemo(()=>buildLegacyDebates(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const gameDaySocial=useMemo(()=>buildGameDaySocial(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const filteredFeed=liveFeed.filter(p=>feedFilter==='all'||p.kind===feedFilter);
  const selectedClubs=fanClubs.filter(c=>c.team.id===selectedId);
  const selectedPlayers=playerPages.filter(p=>p.team?.id===selectedId).slice(0,8);
  const selectedTradition=traditions.find(t=>t.team.id===selectedId);

  useEffect(()=>{if(feedPaused)return undefined;const t=setInterval(()=>setNow(Date.now()),8000);return()=>clearInterval(t)},[feedPaused]);
  useEffect(()=>setMerchOffset(0),[selectedId]);
  useEffect(()=>{const t=setInterval(()=>setMerchOffset(x=>x+1),75000);return()=>clearInterval(t)},[selectedProducts.length]);

  return <div className="fandom-page" style={fandomStyle}>
    <section className="card fandom-hero">
      <div><div className="fan-kicker">FRANCHISE CENTRAL 4.8 · GAME DAY NETWORK</div><h1>The League Never Logs Off.</h1><p>Fans, media, rivalries, player stans, hot takes, radio voices, merch, traditions and baseball culture — all reacting to the league you actually play.</p>{selected&&<div className="fan-portal-now"><TeamBadge team={selected.team}/><span>NOW VISITING</span><strong>{selected.team.city} {selected.team.name} Fan District</strong><small>{selected.mood} · {selected.personality.title} · {selected.atmosphere}</small></div>}</div>
      <div className="fan-week-badge"><small>SEASON RHYTHM</small><strong>WEEK {pulse.week}</strong><span>Day {pulse.dayInWeek} of 5 · {pulse.phase}</span></div>
    </section>

    <section className="fan-week-strip card">
      {Array.from({length:8},(_,i)=>{const w=i+1;const start=(w-1)*5+1,end=w*5;return <div key={w} className={w===pulse.week?'active':w<pulse.week?'done':''}><b>W{w}</b><span>Games {start}–{end}</span><small>{w===1?'Opening':w===4?'All-Star':w===8?'Pennant Race':w<4?'Build-up':'Second Half'}</small></div>})}
    </section>

    {gameDaySocial.phase!=='idle' && <div className="fandom-gameday-wrap"><GameDaySocial social={gameDaySocial} /></div>}

    <section className="card fan-live-wall">
      <div className="fan-live-wall-head"><div><div className="fan-kicker">LIVE FAN WIRE</div><h2>The Baseball Internet Is Awake</h2><p>New simulated posts cycle automatically. Rivalries, moods and player pages react to real league data.</p></div><div className="fan-wire-controls"><span className="fan-live-dot">● LIVE</span><button type="button" onClick={()=>setFeedPaused(x=>!x)}>{feedPaused?'Resume':'Pause'}</button></div></div>
      <div className="fan-feed-tabs">{[['all','Everything'],['fan','Fan Pages'],['rivalry','Rivalry'],['player','Player Stans'],['media','Media'],['league','League Chat']].map(([id,label])=><button type="button" key={id} className={feedFilter===id?'active':''} onClick={()=>setFeedFilter(id)}>{label}</button>)}</div>
      <div className="fan-live-feed">{filteredFeed.map(post=><article className={`fan-wire-post ${post.tone}`} key={post.id}><div className="fan-wire-avatar">{post.team?<TeamBadge team={post.team}/>:<span className="league-avatar">FC</span>}</div><div className="fan-wire-body"><div className="fan-wire-meta"><strong>{post.name}</strong><span>{post.handle}</span><em>{post.badge}</em><small>{post.time}</small></div><p>{post.text}</p><div className="fan-wire-actions"><span>♡ {Math.round(12+((post.id.length*37)%480))}</span><span>↻ {Math.round(3+((post.id.length*11)%95))}</span><span>💬 {Math.round(2+((post.id.length*7)%64))}</span></div></div></article>)}</div>
    </section>

    <div className="fan-grid-2">
      <section className="card fan-programming"><div className="fan-kicker">SMB NETWORK PROGRAMMING</div><h2>{programming.daypart} Lineup</h2><p>{programming.headline}</p>{programming.shows.map(s=><div className="fan-show" key={s[0]}><b>{s[0]}</b><span>{s[1]}</span></div>)}</section>
      <section className="card fan-league-mood"><div className="fan-kicker">LEAGUE MOOD</div><h2>{universe.leagueMood}</h2><p>{pulse.completed<20?'Every fanbase is still writing its version of the season.':pulse.completed<35?'Expectations are hardening into pressure.':'Every inning feels louder now.'}</p><div className="fan-live-bulbs"><span>📣 Fan Pulse Live</span><span>🛍️ Store Rotating</span><span>📊 Polls Drifting</span><span>📻 Radio Lines Open</span><span>🔥 Rivalries Talking</span></div></section>
    </div>

    <section className="card fanbase-index-card"><div className="fan-section-head"><div><div className="fan-kicker">FANBASE INDEX</div><h2>Choose Your Crowd</h2><p className="fan-section-subtitle">Jump between clubs and the whole district takes on that team's colors, culture and chatter.</p></div><select value={selectedId||''} onChange={e=>setTeamId(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.abbr} — {t.city} {t.name}</option>)}</select></div>
      <div className="fan-team-switcher" aria-label="Choose a team fan page">{teams.map(t=><TeamBadge key={t.id} team={t} active={t.id===selectedId} onClick={()=>setTeamId(t.id)}/>)}</div>
      {selected&&<div className="fan-selected-team"><div className="fan-team-title"><TeamBadge team={selected.team}/><div><h2>{selected.team.city} {selected.team.name}</h2><p>{selected.personality.icon} {selected.personality.title} · {selected.personality.detail}</p></div><strong className={`fan-mood mood-${selected.mood.toLowerCase()}`}>{selected.mood}</strong></div><div className="fan-metric-grid">
        {[['Approval',selected.approval],['Hype',selected.hype],['Bandwagon',selected.bandwagon],['Market Heat',selected.marketHeat]].map(([l,v])=><div key={l}><span>{l}</span><strong>{Math.round(v)}</strong><Meter value={v}/></div>)}
      </div><div className="fan-team-context"><span>Expected: {fmtPct(selected.expected)}</span><span>Actual: {fmtPct(selected.actual)}</span><span>Atmosphere: {selected.atmosphere}</span><span>Titles: {selected.history.titles}</span>{selectedTradition&&<span>Tradition: {selectedTradition.tradition}</span>}</div></div>}
    </section>

    <section className="card fan-culture-center"><div className="fan-section-head"><div><div className="fan-kicker">FAN CULTURE DIRECTORY</div><h2>People, Pages & Personalities</h2></div><div className="fan-culture-tabs">{[['clubs','Fan Pages'],['players','Player Pages'],['media','Media'],['traditions','Traditions']].map(([id,label])=><button key={id} type="button" className={cultureView===id?'active':''} onClick={()=>setCultureView(id)}>{label}</button>)}</div></div>
      {cultureView==='clubs'&&<div className="fan-identity-grid">{selectedClubs.map(c=><article key={c.id} className="fan-identity-card"><TeamBadge team={c.team}/><div><strong>{c.name}</strong><span>{c.handle}</span><p>{c.bio}</p><small>{c.archetype.icon} {c.archetype.label} · {shortNum(c.followers)} followers</small></div></article>)}</div>}
      {cultureView==='players'&&<div className="fan-identity-grid">{selectedPlayers.length?selectedPlayers.map(p=><article key={p.id} className="fan-identity-card player-page-card"><TeamBadge team={p.team}/><div><strong>{p.name}</strong><span>{p.handle}</span><p>{p.player.name} fan-made page · {p.stats.hits} H · {p.stats.hr} HR · {p.stats.wins}-{p.stats.losses} pitching.</p><small>⭐ {shortNum(p.followers)} followers</small></div></article>):<div className="fan-empty">Add tracked players to this club and their fan pages will start appearing here.</div>}</div>}
      {cultureView==='media'&&<div className="fan-media-roster">{mediaUniverse.map(m=><article key={m.id}><div>{m.initials}</div><strong>{m.name}</strong><span>{m.handle}</span><small>{m.role} · {m.show}</small></article>)}</div>}
      {cultureView==='traditions'&&<div className="fan-tradition-grid">{traditions.slice().sort((a,b)=>b.loyalty-a.loyalty).map(t=><article key={t.team.id}><TeamBadge team={t.team}/><div><strong>{t.tradition}</strong><span>{t.identity}</span><p>{t.crowd} crowd · Loyalty {t.loyalty}/100</p></div></article>)}</div>}
    </section>

    <div className="fan-grid-2">
      <section className="card"><div className="fan-kicker">LIVE FAN POLL</div><h2>{poll.question}</h2>{poll.options.map(o=><div className="fan-poll" key={o.team.id}><TeamBadge team={o.team}/><div><i style={{width:`${o.pct}%`}}/></div><strong>{o.pct}%</strong></div>)}<small className="muted">{poll.votes.toLocaleString()} simulated fan votes · percentages drift as the conversation moves.</small></section>
      <section className="card"><div className="fan-kicker">SMB SOCIAL QUICK HITS</div><h2>The Timeline Is Normal About Baseball</h2><div className="fan-social-list">{chatter.map((x,i)=><div className={`fan-post ${x.tone}`} key={`${x.handle}-${i}`}><strong>{x.handle}</strong><span>{x.team}</span><p>{x.text}</p></div>)}</div></section>
    </div>

    <section className="card fan-debate-desk"><div className="fan-kicker">DIAMOND DEBATE</div><h2>Arguments Keeping the League Awake</h2><div className="fan-debate-grid">{debates.map(d=><article key={d.id}><small>{d.label}</small><strong>{d.question}</strong><div><span>{d.sideA} <b>{d.a}%</b></span><i><em style={{width:`${d.a}%`}}/></i><span>{d.sideB} <b>{d.b}%</b></span></div></article>)}</div></section>

    <section className="card"><div className="fan-kicker">SMB NETWORK DESK</div><h2>Recurring Analysts</h2><div className="fan-analyst-grid">{analysts.length?analysts.map(a=><div className="fan-analyst" key={a.id}><div>{a.initials}</div><strong>{a.name}</strong><small>{a.role}</small><p>PICK: <b>{a.pick?.abbr}</b></p><span>{a.reason}</span></div>):<div className="fan-empty">Set a Live matchup and the analyst desk will make its picks.</div>}</div></section>

    <section className="card fan-store"><div className="fan-store-head"><div><div className="fan-kicker">OFFICIAL TEAM STORE</div><h2>{selected?`${selected.team.abbr} Featured Merch`:'League Store'}</h2><p>Fake shop. Very real imaginary demand.</p></div><button type="button" onClick={()=>setMerchOffset(x=>x+1)}>Rotate Drop</button></div><div className="fan-merch-grid">{merch.map(p=>{const c=getTeamColorsByAbbr(p.team.abbr);return <article key={p.id} className="fan-merch-card" style={{'--shop-main':c.main,'--shop-alt':c.alt,'--shop-border':c.border,'--shop-text':c.text}}><div className="fan-merch-art"><span>{p.team.abbr}</span><b>{p.type}</b></div><small>{p.tag}</small><h3>{p.name}</h3><div><span>★ FAN FAVORITE</span><button type="button">View Item</button></div></article>})}</div><div className="fan-ad-strip"><strong>VISIT THE TEAM STORE</strong><span>Opening Day drops · rivalry gear · playoff collections · retired-number legacy merch</span><b>SHOP THE LEAGUE →</b></div></section>

    <div className="fan-grid-2">
      <section className="card"><div className="fan-kicker">RIVALRY HEAT</div><h2>Games Fans Circle</h2>{topRivalries.map(r=><div className="fan-rivalry" key={`${r.teamAId}-${r.teamBId}`}><div><TeamBadge team={r.teamA}/><b>vs</b><TeamBadge team={r.teamB}/></div><Meter value={r.heat}/><span>{r.label} · {r.games} games · {r.postseasonGames} postseason</span></div>)}</section>
      <section className="card"><div className="fan-kicker">TICKET & CROWD WATCH</div><h2>Tonight's Atmosphere</h2>{[...universe.teamStates].sort((a,b)=>b.marketHeat-a.marketHeat).slice(0,8).map(x=><div className="fan-ticket" key={x.team.id}><TeamBadge team={x.team}/><div><strong>{x.atmosphere}</strong><span>{x.marketHeat>=75?'🔥 High demand':x.marketHeat>=50?'Steady demand':'Seats available'}</span></div><b>{Math.round(x.marketHeat)}</b></div>)}</section>
    </div>
  </div>
}
