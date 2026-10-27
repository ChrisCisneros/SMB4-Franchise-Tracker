import React,{useEffect,useMemo,useState} from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';
import { buildAnalystDesk,buildFanPoll,buildFanUniverse,buildMerch,buildProgramming,buildSocialChatter,getSeasonPulse } from '../utils/fandomUtils';
import { buildFanClubs,buildFanTraditions,buildLegacyDebates,buildLivingFeed,buildMediaUniverse } from '../utils/livingWorldUtils';
import { buildGameDaySocial } from '../utils/gameDaySocialUtils';
import { getScheduledGameNight } from '../utils/gameNightUtils';
import SeasonCalendar from '../components/SeasonCalendar';
import GameDaySocial from '../components/GameDaySocial';
import { buildBallparkCulture,buildCultureAwards,buildCultureTrends,buildFanSurvey,buildGameThreadArchive,buildGiveawayMarket,buildLocalBusinesses,buildSocialGrowth,buildTeamCultureProfiles,buildTicketMarket,buildWorldState } from '../utils/cultureUtils';
import { buildDynamicAds,buildFanbaseGrudges,buildFakePodcasts,buildFansTalkingAbout,buildTeamVibes,buildTicketForecast } from '../utils/mediaMemoryUtils';
import { buildFanRelationships,buildFranchiseReputations,buildMediaOutlets,buildOffDayWorld,buildStadiumFolklore,buildTeamTraditionFiles,buildTopicLifecycles } from '../utils/lifeSystemsUtils';
import { buildBallparkLife,buildCityBuzz,buildConsequenceChains,buildCrowdPersonality,buildCulturalAwards,buildFanbaseRelationshipNetwork,buildHistoricGameAlerts,buildRevengeWatch } from '../utils/ballparkLifeUtils';

function TeamBadge({team,onClick,active=false}){if(!team)return <span>—</span>;const c=getTeamColorsByAbbr(team.abbr);const Tag=onClick?'button':'span';return <Tag type={onClick?'button':undefined} onClick={onClick} className={`fan-team-badge ${onClick?'is-clickable':''} ${active?'is-active':''}`} style={{'--fan-main':c.main,'--fan-alt':c.alt,'--fan-border':c.border,'--fan-text':c.text}}>{team.abbr}</Tag>}
function Meter({value}){return <div className="fan-meter"><i style={{width:`${Math.max(0,Math.min(100,Number(value)||0))}%`}}/></div>}
const fmtPct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const shortNum=n=>n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);
const TABS=[['overview','Overview'],['district','Fan District'],['social','Social'],['calendar','Calendar'],['ballpark','Ballpark Life'],['rivalries','Relationships'],['media','Media'],['merch','Merch & Collectibles'],['culture','Culture & Lore']];

export default function FandomPage({ctx}){
  const {data,teams,playoffPicture,favoriteTeam,controlsUnlocked,setPage}=ctx;
  const [now,setNow]=useState(Date.now());
  const [teamId,setTeamId]=useState('');
  const [tab,setTab]=useState('overview');
  const [merchOffset,setMerchOffset]=useState(0);
  const [feedFilter,setFeedFilter]=useState('all');
  const [feedPaused,setFeedPaused]=useState(false);
  const [cultureView,setCultureView]=useState('clubs');
  const [promoGame,setPromoGame]=useState(1);

  const pulse=useMemo(()=>getSeasonPulse(data,teams),[data,teams]);
  const universe=useMemo(()=>buildFanUniverse(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const selectedId=teamId||favoriteTeam?.id||universe.teamStates[0]?.team.id;
  const selected=universe.teamStates.find(x=>x.team.id===selectedId);
  const selectedColors=getTeamColorsByAbbr(selected?.team?.abbr);
  const fandomStyle={'--fandom-main':selectedColors.main,'--fandom-alt':selectedColors.alt,'--fandom-border':selectedColors.border,'--fandom-text':selectedColors.text};

  const poll=useMemo(()=>buildFanPoll(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const chatter=useMemo(()=>buildSocialChatter(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const analysts=useMemo(()=>buildAnalystDesk(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const products=useMemo(()=>buildMerch(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const programming=useMemo(()=>buildProgramming(pulse,new Date(now)),[pulse,now]);
  const liveFeed=useMemo(()=>buildLivingFeed(data,teams,playoffPicture,now,selectedId),[data,teams,playoffPicture,now,selectedId]);
  const fanClubs=useMemo(()=>buildFanClubs(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const mediaUniverse=useMemo(()=>buildMediaUniverse(),[]);
  const traditions=useMemo(()=>buildFanTraditions(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const debates=useMemo(()=>buildLegacyDebates(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const gameDaySocial=useMemo(()=>buildGameDaySocial(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const worldState=useMemo(()=>buildWorldState(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const ballparkCulture=useMemo(()=>buildBallparkCulture(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureAwards=useMemo(()=>buildCultureAwards(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const localBusinesses=useMemo(()=>buildLocalBusinesses(teams),[teams]);
  const giveawayMarket=useMemo(()=>buildGiveawayMarket(data,teams),[data,teams]);
  const teamCultureProfiles=useMemo(()=>buildTeamCultureProfiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const ticketMarket=useMemo(()=>buildTicketMarket(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const socialGrowth=useMemo(()=>buildSocialGrowth(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanSurvey=useMemo(()=>buildFanSurvey(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureTrends=useMemo(()=>buildCultureTrends(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const threadArchive=useMemo(()=>buildGameThreadArchive(data,teams),[data,teams]);
  const teamVibes=useMemo(()=>buildTeamVibes(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const grudges=useMemo(()=>buildFanbaseGrudges(data,teams),[data,teams]);
  const podcasts=useMemo(()=>buildFakePodcasts(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const dynamicAds=useMemo(()=>buildDynamicAds(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const talkingAbout=useMemo(()=>buildFansTalkingAbout(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const ticketForecast=useMemo(()=>buildTicketForecast(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanRelationships=useMemo(()=>buildFanRelationships(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const franchiseReputations=useMemo(()=>buildFranchiseReputations(data,teams),[data,teams]);
  const stadiumFolklore=useMemo(()=>buildStadiumFolklore(data,teams),[data,teams]);
  const traditionFiles=useMemo(()=>buildTeamTraditionFiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const mediaOutlets=useMemo(()=>buildMediaOutlets(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const topicLifecycles=useMemo(()=>buildTopicLifecycles(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const offDayWorld=useMemo(()=>buildOffDayWorld(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const ballparkLife=useMemo(()=>buildBallparkLife(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const relationshipNetwork=useMemo(()=>buildFanbaseRelationshipNetwork(data,teams),[data,teams]);
  const revengeWatch=useMemo(()=>buildRevengeWatch(data,teams),[data,teams]);
  const historicAlerts=useMemo(()=>buildHistoricGameAlerts(data,teams),[data,teams,now]);
  const cityBuzz=useMemo(()=>buildCityBuzz(data,teams),[data,teams]);
  const consequenceChains=useMemo(()=>buildConsequenceChains(data,teams),[data,teams]);
  const culturalAwards=useMemo(()=>buildCulturalAwards(data,teams),[data,teams]);

  const filteredFeed=liveFeed.filter(p=>feedFilter==='all'||p.kind===feedFilter);
  const selectedClubs=fanClubs.filter(c=>c.team.id===selectedId);
  const selectedTradition=traditions.find(t=>t.team.id===selectedId);
  const selectedGameNight=getScheduledGameNight(data,promoGame);
  const selectedCulture=ballparkCulture.find(x=>x.team.id===selectedId);
  const selectedProfile=teamCultureProfiles.find(x=>x.team.id===selectedId);
  const selectedTickets=ticketMarket.find(x=>x.team.id===selectedId);
  const selectedVibe=teamVibes.find(x=>x.team.id===selectedId);
  const selectedReputation=franchiseReputations.find(x=>x.team.id===selectedId);
  const selectedFolklore=stadiumFolklore.find(x=>x.team.id===selectedId);
  const selectedTraditionFile=traditionFiles.find(x=>x.team.id===selectedId);
  const selectedGrudges=grudges.filter(g=>g.teamAId===selectedId||g.teamBId===selectedId).slice(0,8);
  const selectedRivalries=universe.rivalries.filter(r=>r.teamAId===selectedId||r.teamBId===selectedId).slice(0,8);
  const selectedRelationships=fanRelationships.filter(r=>r.a?.team?.id===selectedId||r.b?.team?.id===selectedId).slice(0,8);
  const selectedProducts=products.filter(p=>!selected||p.team.id===selected.team.id);
  const merch=[...selectedProducts.slice(merchOffset),...selectedProducts.slice(0,merchOffset)].slice(0,4);
  const moodHistory=Array.from({length:8},(_,i)=>{const week=i+1;const base=Math.round(selected?.approval||50);const wobble=((selectedId?.length||3)*13+week*17)%23-11;const value=Math.max(8,Math.min(96,base+wobble));return {week,value,label:value>=75?'Euphoric':value>=60?'Confident':value>=45?'Restless':value>=30?'Frustrated':'Furious'};});
  const relationshipMap=relationshipNetwork.filter(x=>x.teamAId===selectedId||x.teamBId===selectedId).map(x=>({team:x.teamAId===selectedId?x.teamB:x.teamA,intensity:Math.max(x.hostility,x.affinity),label:x.label,reason:x.reason,affinity:x.affinity,hostility:x.hostility})).sort((a,b)=>b.intensity-a.intensity).slice(0,10);
  const selectedCrowd=buildCrowdPersonality(data,teams,selectedId);
  const selectedCityBuzz=cityBuzz.find(x=>x.team.id===selectedId);

  useEffect(()=>{if(feedPaused)return undefined;const t=setInterval(()=>setNow(Date.now()),8000);return()=>clearInterval(t)},[feedPaused]);
  useEffect(()=>setMerchOffset(0),[selectedId]);
  useEffect(()=>{const t=setInterval(()=>setMerchOffset(x=>x+1),75000);return()=>clearInterval(t)},[selectedProducts.length]);

  const TeamChooser=()=> <section className="card fanbase-index-card"><div className="fan-section-head"><div><div className="fan-kicker">FANBASE INDEX</div><h2>Choose Your Crowd</h2><p className="fan-section-subtitle">Every district now has its own grudges, relationships, culture and local media personality.</p></div><select value={selectedId||''} onChange={e=>setTeamId(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.abbr} — {t.city} {t.name}</option>)}</select></div><div className="fan-team-switcher">{teams.map(t=><TeamBadge key={t.id} team={t} active={t.id===selectedId} onClick={()=>setTeamId(t.id)}/>)}</div>{selected&&<div className="fan-selected-team"><div className="fan-team-title"><TeamBadge team={selected.team}/><div><h2>{selected.team.city} {selected.team.name}</h2><p>{selected.personality.icon} {selected.personality.title} · {selected.personality.detail}</p></div><strong className={`fan-mood mood-${selected.mood.toLowerCase()}`}>{selected.mood}</strong></div><div className="fan-metric-grid">{[['Approval',selected.approval],['Hype',selected.hype],['Bandwagon',selected.bandwagon],['Market Heat',selected.marketHeat]].map(([l,v])=><div key={l}><span>{l}</span><strong>{Math.round(v)}</strong><Meter value={v}/></div>)}</div><div className="fan-team-context"><span>Expected: {fmtPct(selected.expected)}</span><span>Actual: {fmtPct(selected.actual)}</span><span>Atmosphere: {selected.atmosphere}</span><span>Titles: {selected.history.titles}</span>{selectedTradition&&<span>Tradition: {selectedTradition.tradition}</span>}</div></div>}</section>;

  return <div className="fandom-page" style={fandomStyle}>
    <section className="card fandom-hero"><div><div className="fan-kicker">FRANCHISE CENTRAL 4.19 · LIVING LEAGUE</div><h1>The League Never Logs Off.</h1><p>Every club now gets its own fan district, relationships, ballpark life, local culture, social ecosystem and memories that create future consequences.</p>{selected&&<div className="fan-portal-now"><TeamBadge team={selected.team}/><span>NOW VISITING</span><strong>{selected.team.city} {selected.team.name} Fan District</strong><small>{selected.mood} · {selected.personality.title} · {selected.atmosphere}</small></div>}</div><div className="fan-week-badge"><small>SEASON RHYTHM</small><strong>WEEK {pulse.week}</strong><span>{pulse.phase}</span></div></section>

    <nav className="fandom-subtabs" aria-label="Fandom sections">{TABS.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</nav>

    {tab==='overview'&&<>
      <TeamChooser/>
      <section className="fandom-vibes-grid"><article className="card fandom-vibe-card"><div className="fan-kicker">TEAM VIBES</div><h2>{selected?.team?.abbr||'CLUB'} · {selectedVibe?.vibe||'STEADY'}</h2><p>{selectedVibe?.identity||'Fan identity still forming'} · {selectedVibe?.nickname||'Baseball town'}</p><div className="fandom-vibe-stats"><span><b>{Math.round(selectedVibe?.approval||50)}</b> approval</span><span><b>{Math.round(selectedVibe?.marketHeat||50)}</b> market heat</span><span><b>{selectedVibe?.atmosphere||'GOOD CROWD'}</b> atmosphere</span></div></article><article className="card fandom-ticket-forecast"><div className="fan-kicker">TICKET FORECAST</div><h2>{ticketForecast.label}</h2><strong>{ticketForecast.demand}/100 demand</strong><p>{ticketForecast.opponent?`${ticketForecast.team?.abbr} vs ${ticketForecast.opponent.abbr}`:'Next franchise game'} · {ticketForecast.roadInvasion}% visiting-fan pressure</p><Meter value={ticketForecast.demand}/></article><article className="card fandom-talking-card"><div className="fan-kicker">FANS ARE TALKING ABOUT</div><h2>Right Now</h2>{talkingAbout.slice(0,4).map((x,i)=><p key={`${x.label}-${i}`}><b>{x.icon} {x.label}</b><span>{x.detail}</span></p>)}</article></section>
      <section className="card culture-world-board"><div className="fan-section-head"><div><div className="fan-kicker">WORLD PULSE</div><h2>What's Happening Around the Baseball World</h2></div><div className="culture-trends">{worldState.trending.map(x=><span key={x}>{x}</span>)}</div></div><div className="culture-moment-grid">{worldState.moments.map((m,i)=><article key={`${m.type}-${i}`}><span>{m.icon}</span><div><small>{m.type}</small><strong>{m.title}</strong><p>{m.detail}</p></div></article>)}</div></section>
      <section className="fandom-life-wire card"><div><div className="fan-kicker">THE LEAGUE NEVER SLEEPS</div><h2>{offDayWorld.label}</h2><p>{offDayWorld.isOff?'No game tonight does not mean no baseball world.':'Even between pitches, the culture keeps moving.'}</p></div><div className="offday-life-list">{offDayWorld.items.slice(0,4).map(x=><span key={x.title}><b>{x.icon} {x.title}</b><small>{x.detail}</small></span>)}</div></section>
    </>}

    {tab==='district'&&<>
      <TeamChooser/>
      <section className="fandom-supercharge-grid"><article className="card"><div className="fan-kicker">FRANCHISE REPUTATION</div><h2>{selected?.team?.abbr} · {selectedReputation?.era||'OPEN ERA'}</h2><div className="reputation-tags">{selectedReputation?.labels.map(x=><span key={x}>{x}</span>)}</div><p>Reputation score {selectedReputation?.score||50}/100.</p></article><article className="card"><div className="fan-kicker">BALLPARK IDENTITY</div><h2>{selectedCulture?.identity||'Culture forming'}</h2><p>Loudness {selectedCulture?.loud||50} · Loyalty {selectedCulture?.loyalty||50} · Food buzz {selectedCulture?.food||50}</p></article><article className="card"><div className="fan-kicker">FANBASE IDENTITY</div><h2>{selectedProfile?.identity||'Still forming'}</h2><p>Favorite team to beat: {selectedProfile?.favoriteOpponent?.abbr||selectedProfile?.hatedOpponent?.abbr||'Still developing'}</p></article><article className="card"><div className="fan-kicker">CURRENT TRADITION</div><h2>{selectedTraditionFile?.chant||'The chant is forming'}</h2><p>{selectedTraditionFile?.ritual}</p></article></section>
      <section className="card fan-culture-center"><div className="fan-section-head"><div><div className="fan-kicker">FAN CULTURE DIRECTORY</div><h2>People, Pages & Personalities</h2></div><div className="fan-culture-tabs">{[['clubs','Fan Pages'],['media','Local Media'],['traditions','Traditions']].map(([id,label])=><button key={id} className={cultureView===id?'active':''} onClick={()=>setCultureView(id)}>{label}</button>)}</div></div>{cultureView==='clubs'&&<div className="fan-identity-grid">{selectedClubs.map(c=><article key={c.id} className="fan-identity-card"><TeamBadge team={c.team}/><div><strong>{c.name}</strong><span>{c.handle}</span><p>{c.bio}</p><small>{c.archetype.icon} {c.archetype.label} · {shortNum(c.followers)} followers</small></div></article>)}</div>}{cultureView==='media'&&<div className="fan-media-roster">{mediaUniverse.slice(0,6).map(m=><article key={m.id}><div>{m.initials}</div><strong>{selected?.team?.abbr} {m.name}</strong><span>{m.handle}</span><small>{m.role} · local beat</small></article>)}</div>}{cultureView==='traditions'&&<div className="fan-tradition-grid">{traditions.filter(t=>t.team.id===selectedId).map(t=><article key={t.team.id}><TeamBadge team={t.team}/><div><strong>{t.tradition}</strong><span>{t.identity}</span><p>{t.crowd} crowd · Loyalty {t.loyalty}/100</p></div></article>)}</div>}</section>
      <section className="card"><div className="fan-kicker">COMMUNITY MOOD HISTORY</div><h2>Eight Weeks of Emotional Stability™</h2><div className="fandom-mood-history">{moodHistory.map(x=><div key={x.week}><small>W{x.week}</small><i><em style={{height:`${x.value}%`}}/></i><strong>{x.label}</strong><span>{x.value}</span></div>)}</div></section>
      <section className="card"><div className="fan-kicker">LOCAL BASEBALL ECONOMY</div><h2>{selected?.team?.abbr} Businesses in the Conversation</h2>{localBusinesses.filter(x=>x.team.id===selectedId).slice(0,6).map(x=><div className="culture-business-post" key={x.id}><strong>{x.name}</strong><small>{x.handle} · {x.type}</small><p>{x.text}</p></div>)}</section>
    </>}

    {tab==='social'&&<>
      {gameDaySocial.phase!=='idle'&&<div className="fandom-gameday-wrap"><GameDaySocial social={gameDaySocial}/></div>}
      <section className="card fan-live-wall"><div className="fan-live-wall-head"><div><div className="fan-kicker">LIVE FAN WIRE</div><h2>The Baseball Internet Is Awake</h2></div><div className="fan-wire-controls"><span className="fan-live-dot">● LIVE</span><button onClick={()=>setFeedPaused(x=>!x)}>{feedPaused?'Resume':'Pause'}</button></div></div><div className="fan-feed-tabs">{[['all','Everything'],['fan','Fan Pages'],['rivalry','Rivalry'],['media','Media'],['league','League Chat']].map(([id,label])=><button key={id} className={feedFilter===id?'active':''} onClick={()=>setFeedFilter(id)}>{label}</button>)}</div><div className="fan-live-feed">{filteredFeed.map(post=><article className={`fan-wire-post ${post.tone}`} key={post.id}><div className="fan-wire-avatar">{post.team?<TeamBadge team={post.team}/>:<span className="league-avatar">FC</span>}</div><div className="fan-wire-body"><div className="fan-wire-meta"><strong>{post.name}</strong><span>{post.handle}</span><em>{post.badge}</em><small>{post.time}</small></div><p>{post.text}</p><div className="fan-wire-actions"><span>♡ {12+((post.id.length*37)%480)}</span><span>↻ {3+((post.id.length*11)%95)}</span><span>💬 {2+((post.id.length*7)%64)}</span></div></div></article>)}</div></section>
      <div className="fan-grid-2"><section className="card"><div className="fan-kicker">LIVE FAN POLL</div><h2>{poll.question}</h2>{poll.options.map(o=><div className="fan-poll" key={o.team.id}><TeamBadge team={o.team}/><div><i style={{width:`${o.pct}%`}}/></div><strong>{o.pct}%</strong></div>)}</section><section className="card"><div className="fan-kicker">SMB SOCIAL QUICK HITS</div><h2>The Timeline Is Normal About Baseball</h2><div className="fan-social-list">{chatter.map((x,i)=><div className={`fan-post ${x.tone}`} key={`${x.handle}-${i}`}><strong>{x.handle}</strong><span>{x.team}</span><p>{x.text}</p></div>)}</div></section></div>
    </>}

    {tab==='calendar'&&<>
      <section className="fan-week-strip card">{Array.from({length:8},(_,i)=>{const w=i+1;return <div key={w} className={w===pulse.week?'active':w<pulse.week?'done':''}><b>W{w}</b><span>Games {(w-1)*5+1}–{w*5}</span><small>{w===1?'Opening':w===4?'All-Star':w===8?'Pennant Race':w<4?'Build-up':'Second Half'}</small></div>})}</section>
      <section className="card fan-game-night-planner"><div className="fan-section-head"><div><div className="fan-kicker">GAME NIGHT CALENDAR</div><h2>Promotions, Giveaways & Special Nights</h2></div><div className="fan-game-night-actions"><label>Game <select value={promoGame} onChange={e=>setPromoGame(Number(e.target.value))}>{Array.from({length:40},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>{controlsUnlocked?<button onClick={()=>setPage?.('office')}>Open League Office →</button>:<span className="fan-calendar-lock">🔒 League Office controlled</span>}</div></div>{selectedGameNight&&<div className="fan-tonight-promo"><span>{selectedGameNight.icon||'🎟️'}</span><div><small>GAME {promoGame}</small><strong>{selectedGameNight.name}</strong><p>{selectedGameNight.giveaway||'Special game-day event'}</p></div></div>}<SeasonCalendar data={data} teams={teams} selectedGameNumber={promoGame} onSelectGame={setPromoGame}/><div className="fan-calendar-print-row"><span>League Office controls Game Days, matchups, promotions and ceremonies.</span><button onClick={()=>window.print()}>🖨 Print Season Calendar</button></div></section>
    </>}

    {tab==='ballpark'&&<>
      <TeamChooser/>
      <section className="ballpark-life-hero card"><div><div className="fan-kicker">BALLPARK LIFE ENGINE</div><h2>{ballparkLife.label}</h2><p>{ballparkLife.isOff?'No game does not mean no baseball world. The building still has a life.':'A game day now has a before, during and after — not just a first pitch and final out.'}</p></div><div><small>CITY BUZZ</small><strong>{selectedCityBuzz?.label||'INTERESTED'}</strong><span>{selectedCityBuzz?.score||50}/100</span></div></section>
      <section className="ballpark-timeline card"><div className="fan-kicker">TODAY'S EXPERIENCE</div><h2>Game Day Timeline</h2><div className="ballpark-timeline-grid">{ballparkLife.timeline.map((e,i)=><article key={`${e.id}-${i}`}><span>{e.icon}</span><small>{e.phase}</small><strong>{e.title}</strong><p>{e.detail}</p><em>{e.source==='manual'?'League Office scheduled':'Living world generated'}</em></article>)}</div></section>
      <section className="fandom-supercharge-grid"><article className="card"><div className="fan-kicker">CROWD PERSONALITY</div><h2>{selectedCrowd?.type||'BALLPARK CROWD'}</h2><p>Loudness {selectedCrowd?.loudness||50} · Boo factor {selectedCrowd?.booFactor||50} · Road respect {selectedCrowd?.travelRespect||50}</p><small>The crowd {selectedCrowd?.ritual||'reacts to the game in its own way'}.</small></article><article className="card"><div className="fan-kicker">REVENGE WATCH</div><h2>{revengeWatch[0]?.label||'No revenge game yet'}</h2><p>{revengeWatch[0]?`${revengeWatch[0].loserTeam?.abbr} remembers what ${revengeWatch[0].winnerTeam?.abbr} did. Heat ${revengeWatch[0].heat}/100.`:'A repeated blowout will put a future meeting on the revenge board.'}</p></article><article className="card"><div className="fan-kicker">LEAGUE EVENT MAGNITUDE</div><h2>{historicAlerts[0]?.tier||'ROUTINE'}</h2><p>{historicAlerts[0]?.headline||'The league is waiting for its next stop-everything moment.'}</p><small>{historicAlerts[0]?.detail||'Monster innings, huge comebacks, blowouts and marathons get remembered.'}</small></article><article className="card"><div className="fan-kicker">CULTURAL AWARDS WATCH</div><h2>{culturalAwards[0]?.winner||'Still forming'}</h2><p>{culturalAwards[0]?.award}</p><small>{culturalAwards[0]?.detail}</small></article></section>
      {consequenceChains.length>0&&<section className="card consequence-chain-card"><div className="fan-kicker">CAUSE → REACTION → MEMORY</div><h2>Universe Consequence Chain</h2><strong>{consequenceChains[0].source}</strong><div>{consequenceChains[0].steps.map((x,i)=><span key={i}><b>{i+1}</b>{x}</span>)}</div></section>}
    </>}

    {tab==='rivalries'&&<>
      <TeamChooser/>
      <section className="fandom-rivalry-grid"><article className="card"><div className="fan-kicker">FANBASE GRUDGES</div><h2>{selected?.team?.abbr} has its own enemies now</h2>{selectedGrudges.length?selectedGrudges.map((g,i)=>{const other=g.teamAId===selectedId?g.teamB:g.teamA;return <div className="fandom-grudge-row" key={`${g.teamAId}-${g.teamBId}-${i}`}><strong>{selected?.team?.abbr} ↔ {other?.abbr||'—'}</strong><span>{g.label} · {g.intensity}/100 · {g.reason||`${g.games||0} tracked meetings`}</span></div>}):<p className="muted">No real grudge yet — the division baseline will start building one as games pile up.</p>}</article><article className="card"><div className="fan-kicker">FANBASE RELATIONSHIP MAP</div><h2>Allies, friends, rivals and grudges</h2>{relationshipMap.map(x=><div className={`fandom-relationship-map-row relationship-${x.label.toLowerCase()}`} key={x.team.id}><TeamBadge team={x.team}/><Meter value={x.intensity}/><strong>{x.label}</strong><span>{x.intensity}</span><small>{x.reason}</small></div>)}</article></section>
      <section className="card"><div className="fan-kicker">RIVALRY HEAT</div><h2>Games {selected?.team?.abbr} Fans Circle</h2>{selectedRivalries.length?selectedRivalries.map(r=><div className="fan-rivalry" key={`${r.teamAId}-${r.teamBId}`}><div><TeamBadge team={r.teamA}/><b>vs</b><TeamBadge team={r.teamB}/></div><Meter value={r.heat}/><span>{r.label||'Rivalry'} · {r.games} games · {r.postseasonGames} postseason</span></div>):<p className="muted">The rivalry history is still being written.</p>}</section>
      <section className="card"><div className="fan-kicker">FAN ACCOUNT RELATIONSHIPS</div><h2>The timeline has local lore</h2>{selectedRelationships.length?selectedRelationships.map((r,i)=><div className="fan-relationship-row" key={`${r.a.id}-${r.b.id}-${i}`}><strong>{r.a.handle||r.a.name} ↔ {r.b.handle||r.b.name}</strong><span>{r.relation} · heat {r.heat}</span></div>):<p className="muted">This district is still deciding who it wants to fight with online.</p>}</section>
    </>}

    {tab==='media'&&<>
      <div className="fan-grid-2"><section className="card fan-programming"><div className="fan-kicker">SMB NETWORK PROGRAMMING</div><h2>{programming.daypart} Lineup</h2><p>{programming.headline}</p>{programming.shows.map(s=><div className="fan-show" key={s[0]}><b>{s[0]}</b><span>{s[1]}</span></div>)}</section><section className="card"><div className="fan-kicker">PODCAST NETWORK</div><h2>Fresh Episodes</h2>{podcasts.map(p=><div className="fandom-podcast" key={p.show}><small>{p.show} · {p.host}</small><strong>{p.episode}</strong><span>{p.topics[0]}</span></div>)}</section></div>
      <section className="fandom-media-personality-grid"><article className="card"><div className="fan-kicker">MEDIA BIAS BOARD</div><h2>Everybody covers the same league differently</h2>{mediaOutlets.slice(0,6).map(o=><div className="life-media-row" key={o.id}><div><strong>{o.name}</strong><small>{o.bias}</small></div><span>{o.stance}</span></div>)}</article><article className="card"><div className="fan-kicker">TOPIC FATIGUE</div><h2>What the internet is done hearing about</h2>{topicLifecycles.slice(0,6).map(t=><div className="life-topic-row" key={t.topic}><b>{t.stage}</b><strong>{t.topic}</strong><span>{t.fatigue}</span></div>)}</article></section>
      <section className="card"><div className="fan-kicker">SMB NETWORK DESK</div><h2>Recurring Analysts</h2><div className="fan-analyst-grid">{analysts.length?analysts.map(a=><div className="fan-analyst" key={a.id}><div>{a.initials}</div><strong>{a.name}</strong><small>{a.role}</small><p>PICK: <b>{a.pick?.abbr}</b></p><span>{a.reason}</span></div>):<div className="fan-empty">Set a Live matchup and the analyst desk will make its picks.</div>}</div></section>
      <section className="card"><div className="fan-kicker">COMMERCIAL BREAK</div><h2>Local + League Ads</h2><div className="fandom-ad-grid">{dynamicAds.map(ad=><div className="fandom-ad" key={ad.id}><small>{ad.kicker}</small><strong>{ad.title}</strong><span>{ad.copy}</span></div>)}</div></section>
    </>}

    {tab==='merch'&&<>
      <section className="card fan-store"><div className="fan-store-head"><div><div className="fan-kicker">OFFICIAL TEAM STORE</div><h2>{selected?`${selected.team.abbr} Featured Merch`:'League Store'}</h2><p>Fake shop. Very real imaginary demand.</p></div><button onClick={()=>setMerchOffset(x=>x+1)}>Rotate Drop</button></div><div className="fan-merch-grid">{merch.map(p=>{const c=getTeamColorsByAbbr(p.team.abbr);return <article key={p.id} className="fan-merch-card" style={{'--shop-main':c.main,'--shop-alt':c.alt,'--shop-border':c.border,'--shop-text':c.text}}><div className="fan-merch-art"><span>{p.team.abbr}</span><b>{p.type}</b></div><small>{p.tag}</small><h3>{p.name}</h3><div><span>★ FAN FAVORITE</span><button>View Item</button></div></article>})}</div></section>
      <div className="fan-grid-2"><section className="card culture-market-card"><div className="fan-kicker">SECONDARY MARKET</div><h2>Giveaway Gremlins</h2>{giveawayMarket.length?giveawayMarket.slice(0,8).map(x=><div className="culture-market-row" key={`${x.id}-${x.gameNumber}`}><span>{x.icon||'🎁'}</span><div><strong>Game {x.gameNumber} · {x.name}</strong><small>{x.scarcity} · {x.listings} fake listings</small></div><b>{x.marketValue}</b></div>):<p className="muted">Resellers appear around active giveaway days.</p>}</section><section className="card culture-ticket-card"><div className="fan-kicker">TICKET & CROWD MARKET</div><h2>{selected?.team?.abbr} Demand</h2>{selectedTickets&&<><div className="culture-demand"><strong>{selectedTickets.demand}</strong><span>/100 · {selectedTickets.label}</span></div><Meter value={selectedTickets.demand}/><div className="culture-identity-list"><div><span>Sellout Streak</span><strong>{selectedTickets.selloutStreak||'—'}</strong></div><div><span>Road Invasion</span><strong>{selectedTickets.roadInvasion||0}%</strong></div></div></>}</section></div>
    </>}

    {tab==='culture'&&<>
      <TeamChooser/>
      <section className="fandom-supercharge-grid"><article className="card"><div className="fan-kicker">BALLPARK FOLKLORE</div><h2>{selectedFolklore?.legend||'The stories are forming'}</h2>{selectedFolklore?.lore.map((x,i)=><p key={i}>• {x}</p>)}<small>{selectedFolklore?.superstition}</small></article><article className="card"><div className="fan-kicker">TEAM TRADITIONS</div><h2>{selectedTraditionFile?.chant||'The chant is still forming'}</h2><p>{selectedTraditionFile?.ritual}</p><small>After wins: {selectedTraditionFile?.postWin}</small></article><article className="card"><div className="fan-kicker">CULTURE POWER BOARD</div><h2>League Leaders</h2>{cultureAwards.slice(0,4).map(x=><div className="fandom-grudge-row" key={x.award}><strong>{x.award}</strong><span>{x.winner?.team?.abbr||'—'} · {x.value}</span></div>)}</article><article className="card"><div className="fan-kicker">SOCIAL ACCOUNT GROWTH</div><h2>Who Owns the Timeline?</h2>{socialGrowth.slice(0,4).map(x=><div className="culture-growth-row" key={x.team.id}><TeamBadge team={x.team}/><div><strong>@{x.team.abbr}Faithful</strong><small>{x.reputation}</small></div><b>{shortNum(x.followers)}</b></div>)}</article></section>
      <div className="culture-grid-2"><section className="card culture-trend-card"><div className="fan-kicker">TRENDING AROUND THE LEAGUE</div><h2>Memes, Hashtags & Running Arguments</h2>{cultureTrends.map(x=><div className="culture-trend-row" key={x.tag}><strong>{x.tag}</strong><span>{x.status}</span><p>{x.detail}</p></div>)}</section><section className="card culture-survey-card"><div className="fan-kicker">ANNUAL FAN SURVEY · LIVE SAMPLE</div><h2>The Fans Have Opinions</h2><div className="culture-survey-grid">{fanSurvey.map(x=><div key={x.q}><small>{x.q}</small><strong>{x.winner}</strong><span>{x.detail}</span></div>)}</div></section></div>
      <section className="card fan-debate-desk"><div className="fan-kicker">DIAMOND DEBATE</div><h2>Arguments Keeping the League Awake</h2><div className="fan-debate-grid">{debates.map(d=><article key={d.id}><small>{d.label}</small><strong>{d.question}</strong><div><span>{d.sideA} <b>{d.a}%</b></span><i><em style={{width:`${d.a}%`}}/></i><span>{d.sideB} <b>{d.b}%</b></span></div></article>)}</div></section>
      <section className="card culture-thread-archive"><div className="fan-kicker">GAME THREAD ARCHIVE</div><h2>The Internet Remembers</h2><div className="culture-thread-scroll">{threadArchive.length?threadArchive.map(x=><article key={x.id}><small>{x.label}</small><strong>{x.score}</strong><span>Peak watching {shortNum(x.peak)}</span><em>Drama {Math.min(100,Math.round(x.drama))}/100</em></article>):<p className="muted">Finalize games and the archive will start collecting game threads.</p>}</div></section>
    </>}
  </div>;
}
