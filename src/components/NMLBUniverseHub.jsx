import React,{useMemo,useState} from 'react';
import { buildNMLBUniverse } from '../utils/nmlbUniverseUtils';
import { NMLB_BRAND } from '../config/nmlbBrand';

const short=n=>n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);

function Section({kicker,title,children,aside}){return <section className="card nmlb63-section"><header><div><small>{kicker}</small><h3>{title}</h3></div>{aside}</header>{children}</section>}

export default function NMLBUniverseHub({data,teams,playoffPicture=[],compact=false}){
  const [tab,setTab]=useState('network');
  const u=useMemo(()=>buildNMLBUniverse(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const tabs=[['network','Network'],['power','Power Index'],['history','History & Chases'],['business','Business'],['culture','Culture']];
  return <div className={`nmlb63-hub ${compact?'is-compact':''}`}>
    <section className={`nmlb63-spectacle tone-${u.spectacle.tone}`}>
      <div><small>{u.spectacle.kicker}</small><h2>{u.spectacle.headline}</h2><p>{u.spectacle.detail}</p></div>
      <div className="nmlb63-brand-seal"><b>NMLB</b><span>{NMLB_BRAND.name}</span><em>EST. IN THIS UNIVERSE</em></div>
    </section>
    <nav className="nmlb63-tabs">{tabs.map(([id,label])=><button type="button" key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}>{label}</button>)}</nav>

    {tab==='network'&&<>
      <section className="nmlb63-network-hero card"><div><small>NMLB NETWORK · LIVE DESK</small><h2>{u.network.breaking}</h2><p>{u.network.lead}</p><strong>DEBATE: {u.network.debate}</strong></div><div className="nmlb63-onair">ON AIR</div></section>
      <Section kicker="PROGRAMMING GRID" title="The network has a day, not just random cards"><div className="nmlb63-show-grid">{u.network.slots.map(([time,show,hook,hosts])=><article key={show}><small>{time}</small><strong>{show}</strong><p>{hook}</p><span>{hosts}</span></article>)}</div></Section>
      <section className="nmlb63-two"><Section kicker="NMLB FILMS" title="Documentaries from the universe"><div className="nmlb63-doc-list">{u.documentaries.slice(0,5).map(d=><article key={d.id}><small>{d.tag}</small><strong>{d.title}</strong><p>{d.dek}</p></article>)}</div></Section><Section kicker="NMLB MAGAZINE" title={`Issue ${u.magazine.issue}`}><div className="nmlb63-mag-cover"><span>NMLB</span><small>THE LEAGUE MAGAZINE</small><strong>{u.magazine.cover?.abbr||'NMLB'}</strong><h3>{u.magazine.coverLine}</h3>{u.magazine.secondary.map(x=><p key={x}>{x}</p>)}</div></Section></section>
      <Section kicker="FRONT PAGES" title="When the league wakes up to a headline"><div className="nmlb63-frontpages">{u.frontPages.map(p=><article className={`tone-${p.tone}`} key={p.id}><small>{p.masthead}</small><h3>{p.headline}</h3><p>{p.dek}</p></article>)}</div></Section>
    </>}

    {tab==='power'&&<>
      <Section kicker="NMLB POWER INDEX" title="Who is actually scary right now?" aside={<span className="nmlb63-live-pill">UPDATES WITH THE LEAGUE</span>}><div className="nmlb63-power-list">{u.power.slice(0,15).map(x=><article key={x.team.id}><b>{x.rank}</b><strong>{x.team.abbr}</strong><span>{x.team.wins}-{x.team.losses}</span><em>{x.label}</em><i style={{'--score':`${x.score}%`}}/><u>{x.score}</u></article>)}</div></Section>
      <Section kicker="FRANCHISE TRAJECTORY" title="Where every club is headed"><div className="nmlb63-trajectory-grid">{u.trajectory.slice(0,12).map(x=><article key={x.team.id}><small>{x.team.abbr}</small><strong>{x.state}</strong><span>Legacy {x.legacy}/100 · {x.titleCount} title{x.titleCount===1?'':'s'}</span></article>)}</div></Section>
      <Section kicker="SCHEDULE STORYLINES" title="The schedule itself has a story"><div className="nmlb63-story-list">{u.schedule.slice(0,8).map((x,i)=><article key={`${x.team.id}-${i}`}><small>{x.kicker} · {x.importance}</small><strong>{x.headline}</strong><p>{x.detail}</p></article>)}</div></Section>
    </>}

    {tab==='history'&&<>
      <Section kicker="RECORD CHASE DRAMA" title="History gets louder as it gets closer"><div className="nmlb63-chase-grid">{u.chases.length?u.chases.map(x=><article key={x.id}><small>{x.urgency}</small><h3>{x.player.name}</h3><strong>{x.current.toLocaleString()} / {x.target.toLocaleString()} {x.label}</strong><div><i style={{width:`${x.progress}%`}}/></div><p>{x.remaining===0?`Record passed · ${x.holder}`:`${x.remaining.toLocaleString()} away from ${x.holder}`}</p></article>):<p className="muted">Enter major record holders in Player Legacy and this desk turns them into live chases.</p>}</div></Section>
      <section className="nmlb63-two"><Section kicker="INSTANT CLASSICS" title="Games the league refuses to forget"><div className="nmlb63-ranking">{u.canon.classics.slice(0,7).map((x,i)=><p key={x.game.id||i}><b>#{i+1}</b><strong>{x.title}</strong><span>{x.label} · Drama {x.drama}</span></p>)}</div></Section><Section kicker="HEARTBREAK ARCHIVE" title="Pain is also history"><div className="nmlb63-ranking">{u.canon.heartbreak.slice(0,7).map((x,i)=><p key={x.game.id||i}><b>#{i+1}</b><strong>{x.title}</strong><span>Heartbreak {x.heartbreak}/100</span></p>)}</div></Section></section>
    </>}

    {tab==='business'&&<>
      <section className="nmlb63-business-hero card"><div><small>NMLB BUSINESS REPORT</small><h2>{short(u.business.totalAttendance)} fans in the current attendance model</h2><p>{short(u.business.totalMerch)} weekly merch units · {u.business.sellouts} sellout-level markets</p></div><div><small>HOTTEST MARKET</small><strong>{u.business.topMarket?.team.abbr||'—'}</strong><span>{u.business.topMarket?.market||'FORMING'}</span></div></section>
      <Section kicker="MARKET TABLE" title="Winning, hype and October move product"><div className="nmlb63-market-list">{u.business.rows.slice(0,15).map((x,i)=><article key={x.team.id}><b>{i+1}</b><strong>{x.team.abbr}</strong><span>{x.market}</span><em>{short(x.merch)} merch / wk</em><u>{short(x.attendance)} avg crowd</u><small className={x.growth>=0?'up':'down'}>{x.growth>=0?'↑':'↓'} {Math.abs(x.growth)}%</small></article>)}</div></Section>
      <Section kicker="EVENT ECONOMICS" title="Culture can move a market too"><p className="nmlb63-big-copy">Concerts, Fan Fest, rivalry dates, ceremonies, clinches and postseason games now have somewhere to matter: attendance, market heat and merch demand can all be read together instead of living in separate corners of the app.</p></Section>
    </>}

    {tab==='culture'&&<>
      <Section kicker="NMLB IDENTITY" title="This is a league now"><div className="nmlb63-identity-grid"><article><small>LEAGUE NAME</small><strong>Nicky's Major League Baseball</strong><span>NMLB</span></article><article><small>LEAGUE COLORS</small><strong>Royal Purple · White · Black</strong><div className="nmlb63-swatches"><i/><i/><i/></div></article><article><small>SEASON LANGUAGE</small><strong>Stories · spectacle · history</strong><span>Tracked baseball facts. Simulated culture.</span></article></div></Section>
      <section className={`card nmlb63-postseason tone-${u.postseason.stage.toLowerCase().replace(/\s+/g,'-')}`}><div><small>{u.postseason.stage}</small><h2>{u.postseason.headline}</h2><p>{u.postseason.detail}</p></div><div><strong>{u.postseason.qualified.length}</strong><span>POSTSEASON CLUBS</span><b>{u.postseason.eliminated.length} eliminated</b></div></section>
      <Section kicker="SEASON NARRATIVE" title={u.narrative.era}><p>{u.narrative.summary}</p><div className="nmlb63-timeline">{u.narrative.timeline.map(x=><article className={x.done?'done':''} key={x.label}><i/><small>{x.label}</small><strong>{x.done?'IN THE STORY':'STILL AHEAD'}</strong><span>{x.detail}</span></article>)}</div></Section>
      <Section kicker="THE LEAGUE'S OWN METRICS" title="Stats that belong to the NMLB universe"><div className="nmlb63-culture-metrics"><article><small>CHAOS</small><strong>{u.network.v6.chaos.chaos}</strong><span>{u.network.v6.chaos.label}</span></article><article><small>DRAMA</small><strong>{u.network.v6.chaos.drama}</strong><span>League-wide tension</span></article><article><small>MAIN CHARACTER</small><strong>{u.network.v6.timeCapsule.mainCharacter}</strong><span>Timeline ownership</span></article><article><small>SEASON MOOD</small><strong>{u.network.v6.timeCapsule.leagueMood}</strong><span>{u.network.v6.timeCapsule.hashtag}</span></article></div></Section>
      <Section kicker="AWARDS NIGHT" title="The NMLB knows how to make a reveal"><div className="nmlb63-awards-preview">{(data.leagueExtras?.awardRace||[]).slice(0,8).map(a=><article key={`${a.id}-${a.scope}`}><span>{a.icon||'🏆'}</span><small>{a.scope||'REGULAR'} · {a.category}</small><strong>{a.award}</strong><b>{a.leader}</b><em>{a.teamAbbr} · {a.stat}</em></article>)}{!(data.leagueExtras?.awardRace||[]).length&&<p className="muted">Populate award races in League Center and this becomes the nominees board for Awards Night.</p>}</div></Section>
    </>}
  </div>;
}
