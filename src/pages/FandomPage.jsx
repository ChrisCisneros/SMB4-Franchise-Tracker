import React,{useEffect,useMemo,useState} from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';
import { buildAnalystDesk,buildFanPoll,buildFanUniverse,buildMerch,buildProgramming,buildSocialChatter,getSeasonPulse } from '../utils/fandomUtils';
import { buildFanClubs,buildFanTraditions,buildLegacyDebates,buildLivingFeed,buildMediaUniverse,buildPlayerFanPages } from '../utils/livingWorldUtils';
import { buildGameDaySocial } from '../utils/gameDaySocialUtils';
import { getScheduledGameNight } from '../utils/gameNightUtils';
import SeasonCalendar from '../components/SeasonCalendar';
import GameDaySocial from '../components/GameDaySocial';
import { buildBallparkCulture,buildCultureAwards,buildCultureTrends,buildFanSurvey,buildGameThreadArchive,buildGiveawayMarket,buildLocalBusinesses,buildSocialGrowth,buildTeamCultureProfiles,buildTicketMarket,buildWorldState } from '../utils/cultureUtils';
import { buildDynamicAds,buildFanbaseGrudges,buildFakePodcasts,buildFansTalkingAbout,buildTeamVibes,buildTicketForecast } from '../utils/mediaMemoryUtils';
import { buildFanRelationships,buildFranchiseReputations,buildMediaOutlets,buildOffDayWorld,buildStadiumFolklore,buildTeamTraditionFiles,buildTopicLifecycles } from '../utils/lifeSystemsUtils';

function TeamBadge({team,onClick,active=false}){if(!team)return <span>—</span>;const c=getTeamColorsByAbbr(team.abbr);const Tag=onClick?'button':'span';return <Tag type={onClick?'button':undefined} onClick={onClick} className={`fan-team-badge ${onClick?'is-clickable':''} ${active?'is-active':''}`} style={{'--fan-main':c.main,'--fan-alt':c.alt,'--fan-border':c.border,'--fan-text':c.text}}>{team.abbr}</Tag>}
function Meter({value}){return <div className="fan-meter"><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
const fmtPct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const shortNum=n=>n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);

export default function FandomPage({ctx}){
  const {data,teams,playoffPicture,favoriteTeam,setData,syncLeagueExtrasToFirebase,controlsUnlocked,setPage}=ctx;
  const [now,setNow]=useState(Date.now());
  const [teamId,setTeamId]=useState('');
  const [merchOffset,setMerchOffset]=useState(0);
  const [feedFilter,setFeedFilter]=useState('all');
  const [feedPaused,setFeedPaused]=useState(false);
  const [cultureView,setCultureView]=useState('clubs');
  const [promoGame,setPromoGame]=useState(1);
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
  const selectedGameNight=getScheduledGameNight(data,promoGame);

  const worldState=useMemo(()=>buildWorldState(data,teams,playoffPicture,now),[data,teams,playoffPicture,now]);
  const ballparkCulture=useMemo(()=>buildBallparkCulture(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureAwards=useMemo(()=>buildCultureAwards(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const localBusinesses=useMemo(()=>buildLocalBusinesses(teams),[teams]);
  const giveawayMarket=useMemo(()=>buildGiveawayMarket(data,teams),[data,teams]);
  const selectedCulture=ballparkCulture.find(x=>x.team.id===selectedId);
  const teamCultureProfiles=useMemo(()=>buildTeamCultureProfiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const selectedProfile=teamCultureProfiles.find(x=>x.team.id===selectedId);
  const ticketMarket=useMemo(()=>buildTicketMarket(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const selectedTickets=ticketMarket.find(x=>x.team.id===selectedId);
  const socialGrowth=useMemo(()=>buildSocialGrowth(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanSurvey=useMemo(()=>buildFanSurvey(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureTrends=useMemo(()=>buildCultureTrends(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const threadArchive=useMemo(()=>buildGameThreadArchive(data,teams),[data,teams]);
  const teamVibes=useMemo(()=>buildTeamVibes(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const selectedVibe=teamVibes.find(x=>x.team.id===selectedId);
  const grudges=useMemo(()=>buildFanbaseGrudges(data,teams),[data,teams]);
  const podcasts=useMemo(()=>buildFakePodcasts(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const dynamicAds=useMemo(()=>buildDynamicAds(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const talkingAbout=useMemo(()=>buildFansTalkingAbout(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const ticketForecast=useMemo(()=>buildTicketForecast(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanRelationships=useMemo(()=>buildFanRelationships(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const franchiseReputations=useMemo(()=>buildFranchiseReputations(data,teams),[data,teams]);
  const selectedReputation=franchiseReputations.find(x=>x.team.id===selectedId);
  const stadiumFolklore=useMemo(()=>buildStadiumFolklore(data,teams),[data,teams]);
  const selectedFolklore=stadiumFolklore.find(x=>x.team.id===selectedId);
  const traditionFiles=useMemo(()=>buildTeamTraditionFiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const selectedTraditionFile=traditionFiles.find(x=>x.team.id===selectedId);
  const mediaOutlets=useMemo(()=>buildMediaOutlets(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const topicLifecycles=useMemo(()=>buildTopicLifecycles(data,teams,playoffPicture),[data,teams,playoffPicture,now]);
  const offDayWorld=useMemo(()=>buildOffDayWorld(data,teams,playoffPicture),[data,teams,playoffPicture,now]);

  useEffect(()=>{if(feedPaused)return undefined;const t=setInterval(()=>setNow(Date.now()),8000);return()=>clearInterval(t)},[feedPaused]);
  useEffect(()=>setMerchOffset(0),[selectedId]);
  useEffect(()=>{const t=setInterval(()=>setMerchOffset(x=>x+1),75000);return()=>clearInterval(t)},[selectedProducts.length]);

  return <div className="fandom-page" style={fandomStyle}>
    <section className="card fandom-hero">
      <div><div className="fan-kicker">FRANCHISE CENTRAL 4.17 · SUPERCHARGED UNIVERSE</div><h1>The League Never Logs Off.</h1><p>Fans, media, rivalries, player stans, hot takes, radio voices, merch, traditions and baseball culture — all reacting to the league you actually play.</p>{selected&&<div className="fan-portal-now"><TeamBadge team={selected.team}/><span>NOW VISITING</span><strong>{selected.team.city} {selected.team.name} Fan District</strong><small>{selected.mood} · {selected.personality.title} · {selected.atmosphere}</small></div>}</div>
      <div className="fan-week-badge"><small>SEASON RHYTHM</small><strong>WEEK {pulse.week}</strong><span>Day {pulse.dayInWeek} of 5 · {pulse.phase}</span></div>
    </section>

    <section className="fan-week-strip card">
      {Array.from({length:8},(_,i)=>{const w=i+1;const start=(w-1)*5+1,end=w*5;return <div key={w} className={w===pulse.week?'active':w<pulse.week?'done':''}><b>W{w}</b><span>Games {start}–{end}</span><small>{w===1?'Opening':w===4?'All-Star':w===8?'Pennant Race':w<4?'Build-up':'Second Half'}</small></div>})}
    </section>

    <section className="card fan-game-night-planner">
      <div className="fan-section-head"><div><div className="fan-kicker">GAME NIGHT CALENDAR</div><h2>Promotions, Giveaways & Special Nights</h2><p className="fan-section-subtitle">The public schedule is here for fans to browse. Promotions feed chatter, official posts, merch buzz and simulated crowd interest.</p></div><div className="fan-game-night-actions"><label>Game <select value={promoGame} onChange={e=>setPromoGame(Number(e.target.value))}>{Array.from({length:40},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>{controlsUnlocked?<><button type="button" onClick={()=>setPage?.('office')}>Open League Office →</button></>:<span className="fan-calendar-lock">🔒 League Office controlled</span>}</div></div>
      {selectedGameNight&&<div className="fan-tonight-promo"><span>{selectedGameNight.icon||'🎟️'}</span><div><small>GAME {promoGame}</small><strong>{selectedGameNight.name}</strong><p>{selectedGameNight.giveaway||'Special game-day event'}</p></div></div>}
      <SeasonCalendar data={data} teams={teams} selectedGameNumber={promoGame} onSelectGame={setPromoGame}/>
      <div className="fan-calendar-print-row"><span>League Office controls Game Days, matchups, promotions and ceremonies.</span><button type="button" onClick={()=>window.print()}>🖨 Print Season Calendar</button></div>
    </section>

    <section className="card culture-world-board">
      <div className="fan-section-head"><div><div className="fan-kicker">WORLD PULSE</div><h2>What's Happening Around the Baseball World</h2><p className="fan-section-subtitle">Shared culture moments give Dashboard, Fandom and the public league the same heartbeat.</p></div><div className="culture-trends">{worldState.trending.map(x=><span key={x}>{x}</span>)}</div></div>
      <div className="culture-moment-grid">{worldState.moments.map((m,i)=><article key={`${m.type}-${i}`}><span>{m.icon}</span><div><small>{m.type}</small><strong>{m.title}</strong><p>{m.detail}</p></div></article>)}</div>
    </section>

    <div className="culture-grid-3">
      <section className="card culture-ballpark-card"><div className="fan-kicker">BALLPARK IDENTITY</div><h2>{selected?.team?.abbr||'Club'} Fan Culture</h2>{selectedCulture?<><div className="culture-big-label">{selectedCulture.identity}</div><div className="culture-meter-row"><span>Loudness</span><Meter value={selectedCulture.loud}/><b>{selectedCulture.loud}</b></div><div className="culture-meter-row"><span>Loyalty</span><Meter value={selectedCulture.loyalty}/><b>{selectedCulture.loyalty}</b></div><div className="culture-meter-row"><span>Food Buzz</span><Meter value={selectedCulture.food}/><b>{selectedCulture.food}</b></div><div className="culture-meter-row"><span>Friendly</span><Meter value={selectedCulture.friendly}/><b>{selectedCulture.friendly}</b></div></>:null}</section>
      <section className="card culture-market-card"><div className="fan-kicker">SECONDARY MARKET</div><h2>Giveaway Gremlins</h2>{giveawayMarket.length?giveawayMarket.slice(0,5).map(x=><div className="culture-market-row" key={`${x.id}-${x.gameNumber}`}><span>{x.icon||'🎁'}</span><div><strong>Game {x.gameNumber} · {x.name}</strong><small>{x.scarcity} · {x.listings} fake listings</small></div><b>{x.marketValue}</b></div>):<p className="muted">Resellers only appear on giveaway day and linger for a couple of calendar days afterward.</p>}</section>
      <section className="card culture-business-card"><div className="fan-kicker">LOCAL BASEBALL ECONOMY</div><h2>Businesses in the Conversation</h2>{localBusinesses.filter(x=>!selectedId||x.team.id===selectedId).slice(0,4).map(x=><div className="culture-business-post" key={x.id}><strong>{x.name}</strong><small>{x.handle} · {x.type}</small><p>{x.text}</p></div>)}</section>
    </div>

    <section className="card culture-awards-card"><div className="fan-section-head"><div><div className="fan-kicker">CULTURE POWER BOARD</div><h2>If the Season Ended Tonight...</h2></div></div><div className="culture-awards-grid">{cultureAwards.map(x=><div key={x.award}><small>{x.award}</small><strong>{x.winner?.team?.abbr||'—'}</strong><span>{x.value}</span></div>)}</div></section>

    <div className="culture-grid-3">
      <section className="card culture-identity-card"><div className="fan-kicker">FANBASE IDENTITY</div><h2>{selected?.team?.abbr||'Club'} Culture File</h2>{selectedProfile?<div className="culture-identity-list"><div><span>Identity</span><strong>{selectedProfile.identity}</strong></div><div><span>Favorite Team to Beat</span><strong>{selectedProfile.favoriteOpponent?.abbr||'Still developing'}</strong></div><div><span>Public Enemy</span><strong>{selectedProfile.villain?.name||selectedProfile.hatedOpponent?.abbr||'Nobody yet'}</strong></div><div><span>Cult Hero</span><strong>{selectedProfile.hero?.name||'Waiting for a hero'}</strong></div><div><span>Fan Mood</span><strong>{selectedProfile.mood}</strong></div></div>:null}</section>
      <section className="card culture-ticket-card"><div className="fan-kicker">TICKET & CROWD MARKET</div><h2>{selected?.team?.abbr||'Club'} Demand</h2>{selectedTickets?<><div className="culture-demand"><strong>{selectedTickets.demand}</strong><span>/100 · {selectedTickets.label}</span></div><Meter value={selectedTickets.demand}/><div className="culture-identity-list"><div><span>Sellout Streak</span><strong>{selectedTickets.selloutStreak||'—'}</strong></div><div><span>Road Invasion</span><strong>{selectedTickets.roadInvasion||0}%</strong></div></div></>:null}</section>
      <section className="card culture-growth-card"><div className="fan-kicker">SOCIAL ACCOUNT GROWTH</div><h2>Who Owns the Timeline?</h2>{socialGrowth.slice(0,5).map(x=><div className="culture-growth-row" key={x.team.id}><TeamBadge team={x.team}/><div><strong>@{x.team.abbr}Faithful</strong><small>{x.reputation}</small></div><b>{shortNum(x.followers)}</b><em className={x.weekly>=0?'up':'down'}>{x.weekly>=0?'+':''}{x.weekly}/wk</em></div>)}</section>
    </div>

    <div className="culture-grid-2">
      <section className="card culture-trend-card"><div className="fan-kicker">TRENDING AROUND THE LEAGUE</div><h2>Memes, Hashtags & Running Arguments</h2>{cultureTrends.map(x=><div className="culture-trend-row" key={x.tag}><strong>{x.tag}</strong><span>{x.status}</span><p>{x.detail}</p></div>)}</section>
      <section className="card culture-survey-card"><div className="fan-kicker">ANNUAL FAN SURVEY · LIVE SAMPLE</div><h2>The Fans Have Opinions</h2><div className="culture-survey-grid">{fanSurvey.map(x=><div key={x.q}><small>{x.q}</small><strong>{x.winner}</strong><span>{x.detail}</span></div>)}</div></section>
    </div>

    <section className="card culture-thread-archive"><div className="fan-section-head"><div><div className="fan-kicker">GAME THREAD ARCHIVE</div><h2>The Internet Remembers</h2><p className="fan-section-subtitle">Recent finals get a cultural afterlife: peak simulated audience, drama level and thread identity.</p></div></div><div className="culture-thread-scroll">{threadArchive.length?threadArchive.map(x=><article key={x.id}><small>{x.label}</small><strong>{x.score}</strong><span>Peak watching {shortNum(x.peak)}</span><em>Drama {Math.min(100,Math.round(x.drama))}/100</em></article>):<p className="muted">Finalize games and the archive will start collecting game threads.</p>}</div></section>

    <section className="fandom-vibes-grid">
      <article className="card fandom-vibe-card"><div className="fan-kicker">TEAM VIBES</div><h2>{selected?.team?.abbr||'CLUB'} · {selectedVibe?.vibe||'STEADY'}</h2><p>{selectedVibe?.identity||'Fan identity still forming'} · {selectedVibe?.nickname||'Baseball town'}</p><div className="fandom-vibe-stats"><span><b>{Math.round(selectedVibe?.approval||50)}</b> approval</span><span><b>{Math.round(selectedVibe?.marketHeat||50)}</b> market heat</span><span><b>{selectedVibe?.atmosphere||'GOOD CROWD'}</b> atmosphere</span></div></article>
      <article className="card fandom-ticket-forecast"><div className="fan-kicker">TICKET FORECAST</div><h2>{ticketForecast.label}</h2><strong>{ticketForecast.demand}/100 demand</strong><p>{ticketForecast.opponent?`${ticketForecast.team?.abbr} vs ${ticketForecast.opponent.abbr}`:'Next franchise game'} · {ticketForecast.roadInvasion}% visiting-fan pressure</p><Meter value={ticketForecast.demand}/></article>
      <article className="card fandom-talking-card"><div className="fan-kicker">FANS ARE TALKING ABOUT</div><h2>Right Now</h2>{talkingAbout.slice(0,4).map((x,i)=><p key={`${x.label}-${i}`}><b>{x.icon} {x.label}</b><span>{x.detail}</span></p>)}</article>
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

    <section className="fandom-media-life-grid">
      <article className="card"><div className="fan-kicker">FANBASE GRUDGES</div><h2>Who still has receipts?</h2>{grudges.slice(0,5).map((g,i)=><div className="fandom-grudge-row" key={`${g.teamAId}-${g.teamBId}-${i}`}><strong>{g.teamA?.abbr||'A'} ↔ {g.teamB?.abbr||'B'}</strong><span>{g.label} · {g.intensity}/100</span></div>)}</article>
      <article className="card"><div className="fan-kicker">PODCAST NETWORK</div><h2>Fresh Episodes</h2>{podcasts.map(p=><div className="fandom-podcast" key={p.show}><small>{p.show} · {p.host}</small><strong>{p.episode}</strong><span>{p.topics[0]}</span></div>)}</article>
      <article className="card"><div className="fan-kicker">COMMERCIAL BREAK</div><h2>Local + League Ads</h2>{dynamicAds.slice(0,3).map(ad=><div className="fandom-ad" key={ad.id}><small>{ad.kicker}</small><strong>{ad.title}</strong><span>{ad.copy}</span></div>)}</article>
    </section>

    <section className="fandom-supercharge-grid">
      <article className="card"><div className="fan-kicker">FAN ACCOUNT RELATIONSHIPS</div><h2>The timeline has lore</h2>{fanRelationships.slice(0,5).map((r,i)=><div className="fan-relationship-row" key={`${r.a.id}-${r.b.id}-${i}`}><strong>{r.a.handle||r.a.name} ↔ {r.b.handle||r.b.name}</strong><span>{r.relation} · heat {r.heat}</span></div>)}</article>
      <article className="card"><div className="fan-kicker">FRANCHISE REPUTATION</div><h2>{selected?.team?.abbr} · {selectedReputation?.era||'OPEN ERA'}</h2><div className="reputation-tags">{selectedReputation?.labels.map(x=><span key={x}>{x}</span>)}</div><p>Reputation score {selectedReputation?.score||50}/100 · this evolves with titles, playoff history, current form and the stories fans keep repeating.</p></article>
      <article className="card"><div className="fan-kicker">BALLPARK FOLKLORE</div><h2>{selectedFolklore?.legend||'The stories are forming'}</h2>{selectedFolklore?.lore.map((x,i)=><p key={i}>• {x}</p>)}<small>{selectedFolklore?.superstition}</small></article>
      <article className="card"><div className="fan-kicker">TEAM TRADITIONS</div><h2>{selectedTraditionFile?.chant||'The chant is still forming'}</h2><p>{selectedTraditionFile?.ritual}</p><small>After wins: {selectedTraditionFile?.postWin}</small></article>
    </section>

    <section className="fandom-life-wire card"><div><div className="fan-kicker">THE LEAGUE NEVER SLEEPS</div><h2>{offDayWorld.label}</h2><p>{offDayWorld.isOff?'No game tonight does not mean no baseball world.':'Even between pitches, the culture keeps moving.'}</p></div><div className="offday-life-list">{offDayWorld.items.slice(0,4).map(x=><span key={x.title}><b>{x.icon} {x.title}</b><small>{x.detail}</small></span>)}</div></section>

    <section className="fandom-media-personality-grid">
      <article className="card"><div className="fan-kicker">MEDIA BIAS BOARD</div><h2>Everybody covers the same league differently</h2>{mediaOutlets.slice(0,4).map(o=><div className="life-media-row" key={o.id}><div><strong>{o.name}</strong><small>{o.bias}</small></div><span>{o.stance}</span></div>)}</article>
      <article className="card"><div className="fan-kicker">TOPIC FATIGUE</div><h2>What the internet is done hearing about</h2>{topicLifecycles.slice(0,5).map(t=><div className="life-topic-row" key={t.topic}><b>{t.stage}</b><strong>{t.topic}</strong><span>{t.fatigue}</span></div>)}</article>
    </section>

    <section className="card fan-store"><div className="fan-store-head"><div><div className="fan-kicker">OFFICIAL TEAM STORE</div><h2>{selected?`${selected.team.abbr} Featured Merch`:'League Store'}</h2><p>Fake shop. Very real imaginary demand.</p></div><button type="button" onClick={()=>setMerchOffset(x=>x+1)}>Rotate Drop</button></div><div className="fan-merch-grid">{merch.map(p=>{const c=getTeamColorsByAbbr(p.team.abbr);return <article key={p.id} className="fan-merch-card" style={{'--shop-main':c.main,'--shop-alt':c.alt,'--shop-border':c.border,'--shop-text':c.text}}><div className="fan-merch-art"><span>{p.team.abbr}</span><b>{p.type}</b></div><small>{p.tag}</small><h3>{p.name}</h3><div><span>★ FAN FAVORITE</span><button type="button">View Item</button></div></article>})}</div><div className="fan-ad-strip"><strong>VISIT THE TEAM STORE</strong><span>Opening Day drops · rivalry gear · playoff collections · retired-number legacy merch</span><b>SHOP THE LEAGUE →</b></div></section>

    <div className="fan-grid-2">
      <section className="card"><div className="fan-kicker">RIVALRY HEAT</div><h2>Games Fans Circle</h2>{topRivalries.map(r=><div className="fan-rivalry" key={`${r.teamAId}-${r.teamBId}`}><div><TeamBadge team={r.teamA}/><b>vs</b><TeamBadge team={r.teamB}/></div><Meter value={r.heat}/><span>{r.label} · {r.games} games · {r.postseasonGames} postseason</span></div>)}</section>
      <section className="card"><div className="fan-kicker">TICKET & CROWD WATCH</div><h2>Tonight's Atmosphere</h2>{[...universe.teamStates].sort((a,b)=>b.marketHeat-a.marketHeat).slice(0,8).map(x=><div className="fan-ticket" key={x.team.id}><TeamBadge team={x.team}/><div><strong>{x.atmosphere}</strong><span>{x.marketHeat>=75?'🔥 High demand':x.marketHeat>=50?'Steady demand':'Seats available'}</span></div><b>{Math.round(x.marketHeat)}</b></div>)}</section>
    </div>
  </div>
}
