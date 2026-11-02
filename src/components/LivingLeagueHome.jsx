import React,{useMemo} from 'react';
import { buildV6LivingLeague } from '../utils/v6LivingLeagueUtils';

const pct=n=>`${Math.max(0,Math.min(100,Math.round(Number(n)||0)))}%`;
function Meter({value}){return <i className="v6-meter"><em style={{width:pct(value)}}/></i>}
function Card({kicker,title,children,className=''}){return <article className={`card v6-life-card ${className}`}><small>{kicker}</small><h3>{title}</h3>{children}</article>}

export default function LivingLeagueHome({data,teams,playoffPicture,setPage}){
  const world=useMemo(()=>buildV6LivingLeague(data,teams,playoffPicture,Date.now()),[data,teams,playoffPicture]);
  const topMood=world.moods[0];
  const topFan=world.fans[0];
  const topConversation=world.conversations[0];
  const topTravel=world.travel.find(x=>x.team?.abbr==='SF')||world.travel[0];
  const topPark=world.parkLedger[0];
  const topAfter=world.aftermath[0];
  const topMeaning=world.meaningful[0];
  return <section className="v6-living-league-home">
    <header className="card v6-home-hero">
      <div><small>VERSION 6.1 · THE LIVING LEAGUE</small><h2>{world.headline}</h2><p>{world.phase.label} · {world.phase.tone}</p><div className="v6-hero-tags"><span>{world.todayLabel}</span><span>{world.pulse.phase}</span><span>CHAOS {world.chaos.chaos}/100</span><span>DRAMA {world.chaos.drama}/100</span>{world.dayEvent&&<span>{world.dayEvent.icon||'🎟️'} {world.dayEvent.name||world.dayEvent.title}</span>}</div></div>
      <div className="v6-chaos-orb"><small>LEAGUE CHAOS</small><strong>{world.chaos.chaos}</strong><span>{world.chaos.label}</span></div>
    </header>

    <div className="v6-today-grid">
      <Card kicker="TODAY IN THE LEAGUE" title={world.hottestTopic||'The baseball world keeps moving'} className="v6-span-2">
        <p>{world.chaos.detail}</p><div className="v6-mini-list">{world.meaningful.slice(0,3).map(x=><span key={x.team.id}><b>{x.label}</b> {x.team.abbr} · {x.detail}</span>)}{!world.meaningful.length&&<span><b>{world.pulse.phase}</b> The league is between major pressure points, which means everybody has time to argue.</span>}</div>
      </Card>
      <Card kicker="CITY MOOD" title={topMood?`${topMood.team.city} · ${topMood.mood}`:'League mood forming'}><p>{topMood?.climate||world.leagueMood}</p><label>Hope <b>{topMood?.hope||50}</b></label><Meter value={topMood?.hope||50}/><label>Anxiety <b>{topMood?.anxiety||50}</b></label><Meter value={topMood?.anxiety||50}/></Card>
      <Card kicker="WHAT CHANGED" title={world.previous[0]?.title||'The archive is quiet'}><p>{world.previous[0]?.detail||'The next final will create the next chapter.'}</p>{world.previous.slice(1,3).map((x,i)=><small className="v6-line" key={i}>{x.label} · {x.title}</small>)}</Card>
    </div>

    <div className="v6-life-grid">
      <Card kicker="THE LEAGUE FEED" title="Everybody is talking to everybody" className="v6-span-2">
        <div className="v6-conversation-stack">{world.conversations.slice(0,5).map((x,i)=><div key={i}><b>{x.relation}</b><span>{x.prompt}</span><em>{x.heat} heat</em></div>)}</div>
      </Card>
      <Card kicker="RECURRING FAN" title={topFan?.name||'Fan character roster'}><p><b>{topFan?.handle}</b> · {topFan?.identity}</p><p>{topFan?.runningJoke}</p><small>{topFan?.followers?.toLocaleString?.()||0} followers · prediction accuracy {topFan?.accuracy||0}%</small><button onClick={()=>setPage?.('fandom')}>Visit Fandom →</button></Card>
      <Card kicker="MEDIA ECOSYSTEM" title={world.media.shows[0]?.show||'Around the Diamond'}><p>{world.media.shows[0]?.hook}</p><div className="v6-mini-list">{world.media.shows.slice(1,4).map(s=><span key={s.show}><b>{s.slot}</b> {s.show} · {s.voice}</span>)}</div><button onClick={()=>setPage?.('news')}>Open Newsroom →</button></Card>
      <Card kicker="WEEKLY SHOW" title={world.weekly.title}><p>{world.weekly.dek}</p>{world.weekly.segments.slice(0,3).map(x=><small className="v6-line" key={x.label}><b>{x.label}</b> · {x.title} · {x.detail}</small>)}</Card>
      <Card kicker="CLINCH / ELIMINATION AFTERMATH" title={topAfter?`${topAfter.team.abbr} · ${topAfter.label}`:'The pressure wave is building'}><p>{topAfter?.detail||topMeaning?.detail||'Once a team clinches or is eliminated, the story will live for multiple league days instead of disappearing into a standings symbol.'}</p></Card>
    </div>

    <div className="v6-world-grid">
      <Card kicker="ROAD TRIP / HOMESTAND" title={topTravel?`${topTravel.team.abbr} · ${topTravel.tripLabel}`:'Schedule rhythm'}><strong>{topTravel?.recentRecord||'0-0'} · {topTravel?.mood||'FORMING'}</strong><p>{topTravel?.lastOpp?`Last stop involved ${topTravel.lastOpp.abbr}.`:world.tomorrow?`Next placed game: Game ${world.tomorrow.gameNumber}.`:'The next trip starts when the calendar says so.'}</p></Card>
      <Card kicker="BALLPARK REPUTATION" title={topPark?`${topPark.team.abbr} · ${topPark.reputation}`:'Park mythology'}><p>{topPark?.legend}</p><small>Home record {topPark?.homeRecord||'0-0'} · {topPark?.walkoffs||0} walk-offs</small></Card>
      <Card kicker="EVENT AFTERMATH" title={world.eventAftermath[0]?.name||'The park stays alive'}><p>{world.eventAftermath[0]?.detail||'Concerts, movies, Fan Fest and other off-day events will now keep generating chatter after the gates close.'}</p>{world.eventAftermath[0]&&<small>{world.eventAftermath[0].label} · Day {world.eventAftermath[0].day}</small>}</Card>
      <Card kicker="HISTORY ECHO" title={world.echoes[0]?.title||'Today is still becoming history'}><p>{world.echoes[0]?.detail||'As more seasons accumulate, current streaks and races will increasingly compare themselves to the archive.'}</p></Card>
    </div>

    <div className="v6-world-grid">
      <Card kicker="SEASON TIME CAPSULE" title={`${world.timeCapsule.season} · ${world.timeCapsule.hashtag}`}><p>{world.timeCapsule.summary}</p><small>Main character {world.timeCapsule.mainCharacter} · Mood {world.timeCapsule.leagueMood}</small></Card>
      <Card kicker="EMERGING TRADITION" title={world.emergingTraditions[0]?.name||'The next ritual starts somewhere'}><p>{world.emergingTraditions[0]?.detail||'Repeat an event across seasons and the app will start treating it like part of the culture.'}</p><small>{world.emergingTraditions[0]?.status||'TRADITION WATCH'}</small></Card>
      <Card kicker="NAMED GAME" title={world.namedGames[0]?.name||'Waiting for the next game people name forever'}><p>{world.namedGames[0]?.score||'Huge games can now pick up informal names and live on as cultural shorthand.'}</p><small>{world.namedGames[0]?.label||'MEMORY WATCH'}</small></Card>
      <Card kicker="SPOILER WATCH" title={world.spoilerBoard[0]?`${world.spoilerBoard[0].team.abbr} has a new job`:'Nobody is in spoiler mode yet'}><p>{world.spoilerBoard[0]?.detail||'Once eliminated, a team stays narratively relevant by becoming dangerous to contenders.'}</p></Card>
    </div>

    <div className="v6-bottom-grid">
      <Card kicker="PREVIOUSLY ON…" title="The SMB League"><div className="v6-mini-list">{world.previous.slice(0,5).map((x,i)=><span key={i}><b>{x.label}</b> {x.title}</span>)}</div></Card>
      <Card kicker="ON THIS DAY" title={world.onThisDay[0]?.title||'Memory Lane'}><p>{world.onThisDay[0]?.detail||'Historical anniversaries will surface here as the archive grows.'}</p></Card>
      <Card kicker="NEXT STOP" title={world.tomorrow?`Game ${world.tomorrow.gameNumber} · ${world.tomorrow.weekday}`:'Calendar awaiting placement'}><p>{world.tomorrow?.promo?`${world.tomorrow.promo.icon||'🎟️'} ${world.tomorrow.promo.name}`:'The next scheduled baseball day is waiting.'}</p></Card>
    </div>
  </section>;
}
