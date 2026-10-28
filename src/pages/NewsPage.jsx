import React, { useEffect, useMemo, useState } from "react";
import { buildNewsFeed } from "../utils/newsUtils";
import { buildFanPoll, buildSocialChatter, getSeasonPulse } from "../utils/fandomUtils";
import { buildWorldState } from "../utils/cultureUtils";
import { currentSeasonDay, scheduleEntryLabel } from "../utils/seasonCalendarUtils";
import { ceremonyForGame } from "../utils/ceremonyUtils";
import { buildAroundLeagueTonight, buildDynamicAds, buildFansTalkingAbout, buildHonorInterviews, buildHotColdBoard, buildOnThisDateMoments, buildFakePodcasts, buildWeeklyMediaRoundup } from "../utils/mediaMemoryUtils";
import { buildBroadcastBooth, buildDefiningMoments, buildMediaOutlets, buildPredictionReceipts, buildTopicLifecycles } from "../utils/lifeSystemsUtils";
import { buildBallparkLife, buildCityBuzz, buildConsequenceChains, buildHistoricGameAlerts, buildRevengeWatch } from "../utils/ballparkLifeUtils";
import { buildSpecialAchievements } from "../utils/playerLegacyUtils";

const FILTERS = ["All", "Current", "Facts", "Postseason", "Record Book", "Archive"];
const FEATURE_ROTATE_MS = 120000;
const FACT_ROTATE_MS = 90000;
const TICKER_ROTATE_MS = 14000;

function storyBucket(story) {
  if (["Game Final", "League Watch", "Pennant Race", "Hot & Cold", "Milestone Watch", "Race to October", "Transactions", "Injury Report", "Developing", "League Alert"].includes(story.category)) return "Current";
  if (["By the Numbers", "Did You Know?", "History Lesson", "Franchise Spotlight"].includes(story.category) || story.kind === "fact") return "Facts";
  if (["Championship", "Postseason"].includes(story.category)) return "Postseason";
  if (["Record Book", "V3 Record Alert"].includes(story.category)) return "Record Book";
  return "Archive";
}

function rotateList(list, offset) {
  if (!list.length) return [];
  const safe = ((offset % list.length) + list.length) % list.length;
  return [...list.slice(safe), ...list.slice(0, safe)];
}

function StoryMeta({ story }) {
  return (
    <div className="news-story-topline">
      <span className="news-category-pill">{story.category}</span>
      <span className="news-date">{story.dateLabel}</span>
    </div>
  );
}

function TeamTags({ story }) {
  if (!story.teams?.length) return null;
  return <div className="news-team-row">{story.teams.map((abbr) => <span key={`${story.id}-${abbr}`}>{abbr}</span>)}</div>;
}

function LeadStory({ story }) {
  return <article className={`news-lead-story news-tone-${story.tone || "archive"}`}><div className="news-lead-overlay"/><div className="news-lead-content"><StoryMeta story={story}/><div className="news-breaking-label">Featured on SMB Network</div><h3>{story.headline}</h3><p>{story.dek}</p><TeamTags story={story}/></div></article>;
}

function SideStory({ story }) {
  return <article className={`news-side-story news-tone-${story.tone || "archive"}`}><StoryMeta story={story}/><h3>{story.headline}</h3><p>{story.dek}</p><TeamTags story={story}/></article>;
}

function HeadlineStory({ story }) {
  return <article className={`news-headline-row news-tone-${story.tone || "archive"}`}><div className="news-headline-copy"><StoryMeta story={story}/><h3>{story.headline}</h3><p>{story.dek}</p></div><TeamTags story={story}/></article>;
}

function FactCard({ story }) {
  return (
    <article className={`news-fact-card news-tone-${story.tone || "archive"}`}>
      <StoryMeta story={story}/>
      <div className="news-fact-value">{story.factValue || "•"}</div>
      <div className="news-fact-label">{story.factLabel || story.category}</div>
      <h4>{story.headline}</h4>
      <p>{story.dek}</p>
      <TeamTags story={story}/>
    </article>
  );
}

export default function NewsPage({ ctx }) {
  const { data, teams } = ctx;
  const [filter, setFilter] = useState("All");
  const [featureOffset, setFeatureOffset] = useState(0);
  const [factOffset, setFactOffset] = useState(0);
  const [tickerOffset, setTickerOffset] = useState(0);
  const stories = useMemo(() => buildNewsFeed(data, teams), [data, teams]);
  const fanPoll = useMemo(() => buildFanPoll(data, teams, ctx.playoffPicture || [], Date.now()), [data, teams, ctx.playoffPicture, featureOffset]);
  const social = useMemo(() => buildSocialChatter(data, teams, ctx.playoffPicture || [], Date.now()).slice(0,4), [data, teams, ctx.playoffPicture, tickerOffset]);
  const pulse = useMemo(() => getSeasonPulse(data, teams), [data, teams]);
  const worldState = useMemo(() => buildWorldState(data, teams, ctx.playoffPicture || [], Date.now()), [data, teams, ctx.playoffPicture, tickerOffset]);
  const aroundTonight=useMemo(()=>buildAroundLeagueTonight(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture]);
  const talkingAbout=useMemo(()=>buildFansTalkingAbout(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture,tickerOffset]);
  const podcasts=useMemo(()=>buildFakePodcasts(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture]);
  const honorInterviews=useMemo(()=>buildHonorInterviews(data),[data]);
  const onThisDate=useMemo(()=>buildOnThisDateMoments(data,teams),[data,teams]);
  const hotCold=useMemo(()=>buildHotColdBoard(teams),[teams]);
  const ads=useMemo(()=>buildDynamicAds(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture,tickerOffset]);
  const weekly=useMemo(()=>buildWeeklyMediaRoundup(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture]);
  const historicAlerts=useMemo(()=>buildHistoricGameAlerts(data,teams),[data,teams,tickerOffset]);
  const ballparkLife=useMemo(()=>buildBallparkLife(data,teams,ctx.playoffPicture||[],Date.now()),[data,teams,ctx.playoffPicture,tickerOffset]);
  const revengeWatch=useMemo(()=>buildRevengeWatch(data,teams),[data,teams]);
  const consequenceChains=useMemo(()=>buildConsequenceChains(data,teams),[data,teams]);
  const cityBuzz=useMemo(()=>buildCityBuzz(data,teams),[data,teams]);
  const mediaOutlets=useMemo(()=>buildMediaOutlets(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture]);
  const topicLifecycles=useMemo(()=>buildTopicLifecycles(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture,tickerOffset]);
  const predictionReceipts=useMemo(()=>buildPredictionReceipts(data,teams),[data,teams]);
  const broadcastBooth=useMemo(()=>buildBroadcastBooth(data,teams),[data,teams]);
  const definingMoments=useMemo(()=>buildDefiningMoments(data,teams),[data,teams]);
  const preservedAchievements=useMemo(()=>buildSpecialAchievements(data,teams),[data,teams]);
  const todaySlot = useMemo(()=>currentSeasonDay(data,teams),[data,teams]);
  const todayCeremonies = useMemo(()=>todaySlot?.gameNumber?ceremonyForGame(data,teams,todaySlot.gameNumber):[],[data,teams,todaySlot?.gameNumber]);
  const filtered = filter === "All" ? stories : stories.filter((story) => storyBucket(story) === filter);
  const factStories = filtered.filter((story) => story.kind === "fact");
  const editorialStories = filtered.filter((story) => story.kind !== "fact");
  const rotatedEditorial = rotateList(editorialStories.length ? editorialStories : factStories, featureOffset);
  const rotatedFacts = rotateList(factStories, factOffset);
  const lead = rotatedEditorial[0] || null;
  const sideStories = rotatedEditorial.slice(1, 3);
  const latestStories = rotatedEditorial.slice(3);
  const tickerStories = stories.length ? stories : filtered;
  const ticker = tickerStories.length ? tickerStories[tickerOffset % tickerStories.length] : null;
  const currentCount = stories.filter((story) => storyBucket(story) === "Current").length;
  const factCount = stories.filter((story) => storyBucket(story) === "Facts").length;
  const historyCount = stories.filter((story) => ["Archive","Postseason","Record Book"].includes(storyBucket(story))).length;

  useEffect(() => {
    const timer = window.setInterval(() => setFeatureOffset((n) => n + 1), FEATURE_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setFactOffset((n) => n + 4), FACT_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTickerOffset((n) => n + 1), TICKER_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setFeatureOffset(0);
    setFactOffset(0);
  }, [filter]);

  return (
    <div className="news-page">
      <section className="news-masthead card">
        <div className="news-brand-block"><div className="news-network-mark">SMB</div><div><div className="news-kicker">SMB4 League Network</div><h2>League News</h2><p>A constantly rotating feed of headlines, races, records, history, weird stats and league-wide baseball nonsense.</p></div></div>
        <div className="news-masthead-stats"><div><strong>{stories.length}</strong><span>Story Pool</span></div><div><strong>{factCount}</strong><span>Facts</span></div><div><strong>{historyCount}</strong><span>History</span></div></div>
      </section>

      <section className="news-today-edition card"><div><small>TODAY'S BASEBALL WORLD</small><strong>{todaySlot?.gameNumber?`G${todaySlot.gameNumber} · ${scheduleEntryLabel(todaySlot.schedule)}`:'League off-day / schedule forming'}</strong><span>{todaySlot?.dateLabel?`${todaySlot.weekday} · ${todaySlot.dateLabel}`:`Week ${pulse.week} · ${pulse.phase}`}</span></div><div><small>TONIGHT</small><strong>{todayCeremonies[0]?.title||todaySlot?.promo?.name||worldState.moments?.[0]?.title||'Around the league'}</strong><span>{todayCeremonies[0]?.detail||todaySlot?.promo?.giveaway||worldState.leagueMood}</span></div><div className="news-edition-stamp"><b>DAILY DIAMOND</b><em>{pulse.phase}</em></div></section>

      {!!ticker && <div className="news-ticker news-ticker-live" aria-label="SMB Network live ticker"><span className="news-ticker-label"><i/>LIVE</span><strong key={ticker.id}>{ticker.headline}</strong><span className="news-ticker-date">{ticker.dateLabel}</span></div>}

      <section className="news-network-strip">
        <div><span className="news-live-dot"/><strong>SMB NETWORK LIVE</strong><small>Featured stories rotate every 2 minutes</small></div>
        <div className="news-network-chips"><span>{currentCount} current</span><span>{factCount} facts & nuggets</span><span>{stories.length} total stories</span></div>
      </section>

      {historicAlerts[0]&&<section className={`news-extreme-alert card ${historicAlerts[0].live?'is-live':''}`}><div><small>{historicAlerts[0].kicker}</small><strong>{historicAlerts[0].tier} · {historicAlerts[0].score}/100</strong></div><h2>{historicAlerts[0].headline}</h2><p>{historicAlerts[0].detail}</p><div>{(historicAlerts[0].tags||[]).map(t=><span key={t}>{t}</span>)}</div></section>}

      {preservedAchievements[0]&&<section className="news-player-milestone card"><div><small>🏅 MILESTONE DESK</small><strong>{preservedAchievements[0].season||data.activeSeasonName}</strong></div><h2>{preservedAchievements[0].playerName||preservedAchievements[0].teamAbbr||'Player Milestone'} · {preservedAchievements[0].title}</h2><p>{preservedAchievements[0].note||'A player milestone has been preserved in league history.'}</p><span>{preservedAchievements[0].teamAbbr||'LEAGUE'} · PERMANENT ACHIEVEMENT</span></section>}

      <section className="news-living-league-grid">
        <article className="card"><div className="news-kicker">BALLPARK LIFE</div><h3>{ballparkLife.label}</h3>{ballparkLife.events.slice(0,3).map(e=><p key={e.id}><b>{e.icon} {e.phase}</b><span>{e.title} · {e.detail}</span></p>)}</article>
        <article className="card"><div className="news-kicker">REVENGE WATCH</div><h3>Old scores do not stay buried</h3>{revengeWatch.slice(0,3).map(r=><p key={r.key}><b>{r.label}</b><span>{r.loserTeam?.abbr} remembers {r.winnerTeam?.abbr} · heat {r.heat}</span></p>)}</article>
        <article className="card"><div className="news-kicker">CITY BUZZ</div><h3>Where baseball owns the conversation</h3>{cityBuzz.slice(0,4).map(x=><p key={x.team.id}><b>{x.team.abbr} · {x.label}</b><span>{x.score}/100</span></p>)}</article>
      </section>
      {consequenceChains[0]&&<section className="news-consequence card"><div className="news-kicker">THE STORY KEEPS MOVING</div><h3>{consequenceChains[0].source}</h3><div>{consequenceChains[0].steps.map((x,i)=><span key={i}><b>{i+1}</b>{x}</span>)}</div></section>}

      <section className="news-world-pulse card"><div><span>WORLD PULSE</span><strong>{worldState.leagueMood}</strong></div>{worldState.moments.map((m,i)=><p key={`${m.type}-${i}`}><b>{m.icon} {m.type}</b>{m.title}</p>)}<div>{worldState.trending.map(x=><em key={x}>{x}</em>)}</div></section>

      <section className="news-media-grid">
        <article className="card news-around-tonight"><div className="news-kicker">AROUND THE LEAGUE TONIGHT</div><h3>What the desk is watching</h3>{aroundTonight.slice(0,5).map((x,i)=><p key={`${x.type}-${i}`}><b>{x.icon} {x.title}</b><span>{x.detail}</span></p>)}</article>
        <article className="card news-hot-cold-board"><div className="news-kicker">HOT / COLD BOARD</div><h3>Streak Watch</h3><div><strong>🔥 HOT</strong>{hotCold.hot.slice(0,3).map(t=><span key={t.id}>{t.abbr} {t.streak}</span>)}</div><div><strong>🥶 COLD</strong>{hotCold.cold.slice(0,3).map(t=><span key={t.id}>{t.abbr} {t.streak}</span>)}</div></article>
        <article className="card news-weekly-roundup"><div className="news-kicker">WEEK {weekly.week} ROUNDUP</div><h3>{weekly.headline}</h3><p>{weekly.teamOfWeek?`${weekly.teamOfWeek.abbr} is the media desk's team of the week.`:weekly.phase}</p>{weekly.rivalry&&<p><b>Rivalry:</b> {weekly.rivalry.teamA?.abbr} / {weekly.rivalry.teamB?.abbr}</p>}</article>
      </section>

      <section className="news-life-network">
        <article className="card"><div className="news-kicker">MEDIA PERSONALITIES</div><h3>Same league. Different agendas.</h3>{mediaOutlets.slice(0,4).map(o=><div className="life-media-row" key={o.id}><div><strong>{o.name}</strong><small>{o.type} · {o.tone}</small></div><span>{o.stance}</span></div>)}</article>
        <article className="card"><div className="news-kicker">STORY LIFECYCLES</div><h3>What is rising — and what is getting old</h3>{topicLifecycles.slice(0,5).map(t=><div className={`life-topic-row stage-${t.stage.toLowerCase()}`} key={t.topic}><b>{t.stage}</b><strong>{t.topic}</strong><span>{t.fatigue}</span></div>)}</article>
        <article className="card"><div className="news-kicker">PREDICTION RECEIPTS</div><h3>The desk remembers.</h3>{predictionReceipts.slice(0,4).map(r=><div className="life-receipt-row" key={r.team?.id}><b>{r.team?.abbr}</b><div><strong>{r.verdict}</strong><span>{r.oldTake}</span><small>{r.now}</small></div></div>)}</article>
      </section>

      <section className="news-booth-strip card"><div><div className="news-kicker">TONIGHT'S BROADCAST CREW</div><h3>The booth has opinions too</h3></div>{broadcastBooth.slice(0,3).map(b=><div key={b.name}><strong>{b.name}</strong><span>{b.role} · {b.style}</span><small>{b.trait}</small></div>)}</section>

      {definingMoments.length>0&&<section className="news-defining-moment card"><div><small>SEASON MEMORY WATCH</small><strong>#{definingMoments[0].rank} · {definingMoments[0].tier}</strong></div><h3>{definingMoments[0].title}</h3><p>{definingMoments[0].detail}</p></section>}

      <section className="news-talking card"><div><div className="news-kicker">FANS ARE TALKING ABOUT</div><h3>The conversation right now</h3></div><div>{talkingAbout.map((x,i)=><span key={`${x.label}-${i}`}><b>{x.icon} {x.label}</b><small>{x.detail}</small></span>)}</div></section>

      <section className="news-podcast-row"><div className="news-section-heading"><div><div className="news-kicker">SMB AUDIO NETWORK</div><h3>Latest Podcasts</h3></div></div><div className="news-podcast-grid">{podcasts.map(p=><article className="card" key={p.show}><small>{p.show} · {p.host}</small><strong>{p.episode}</strong>{p.topics.map(t=><span key={t}>• {t}</span>)}</article>)}</div></section>

      {(honorInterviews.length>0||onThisDate.length>0)&&<section className="news-memory-grid">{honorInterviews.length>0&&<article className="card"><div className="news-kicker">LEGENDS DESK</div><h3>Honor Interview</h3><strong>{honorInterviews[0].name} · {honorInterviews[0].team||'LEAGUE'}</strong><blockquote>“{honorInterviews[0].quote}”</blockquote><small>{honorInterviews[0].occasion}</small></article>}{onThisDate.length>0&&<article className="card"><div className="news-kicker">ON THIS DATE</div><h3>{onThisDate[0].title}</h3><p>{onThisDate[0].detail}</p></article>}</section>}

      <section className="news-ad-grid">{ads.slice(0,3).map(ad=><article key={ad.id}><small>{ad.kicker}</small><strong>{ad.title}</strong><span>{ad.copy}</span><b>{ad.cta} →</b></article>)}</section>

      <section className="news-fandom-strip card"><div><div className="news-kicker">FAN & MEDIA PULSE · WEEK {pulse.week}</div><h3>{fanPoll.question}</h3><div className="news-fan-mini-poll">{fanPoll.options.slice(0,4).map(o=><span key={o.team.id}><b>{o.team.abbr}</b> {o.pct}%</span>)}</div></div><div className="news-social-wire">{social.slice(0,2).map((x,i)=><p key={i}><b>{x.handle}</b> {x.text}</p>)}</div></section>

      <div className="news-toolbar"><div className="news-section-title"><span>Newsroom</span><strong>{filter === "All" ? "Top Stories" : filter}</strong></div><div className="news-filter-row">{FILTERS.map((item)=><button key={item} className={filter===item?"news-filter-active":""} onClick={()=>setFilter(item)}>{item}</button>)}</div></div>

      {!lead ? <div className="card news-empty-state"><div className="news-kicker">News Desk</div><h3>No headlines in this section yet.</h3><p className="muted">As the season develops, this desk will fill itself with league stories and facts.</p></div> : <>
        <section className="news-top-grid news-rotating-grid"><LeadStory key={`lead-${lead.id}`} story={lead}/><div className="news-side-stack">{sideStories.length ? sideStories.map((story)=><SideStory key={story.id} story={story}/>) : <aside className="news-desk-note card"><div className="news-kicker">League Desk</div><h3>The news cycle never stops.</h3><p>The lead story changes automatically while the full story pool stays available below.</p></aside>}</div></section>

        {!!rotatedFacts.length && <section className="news-facts-section"><div className="news-section-heading"><div><div className="news-kicker">Numbers & Nuggets</div><h3>Rotating Facts Desk</h3></div><span>refreshes every 90 sec · {factStories.length} in pool</span></div><div className="news-fact-grid">{rotatedFacts.slice(0,8).map((story)=><FactCard key={story.id} story={story}/>)}</div></section>}

        {!!latestStories.length && <section className="news-latest-section"><div className="news-section-heading"><div><div className="news-kicker">Around the League</div><h3>News Wire</h3></div><span>{latestStories.length} more stor{latestStories.length===1?"y":"ies"}</span></div><div className="news-headline-list">{latestStories.map((story)=><HeadlineStory key={story.id} story={story}/>)}</div></section>}

        {!!stories.length && <section className="news-all-stories card"><div className="news-section-heading"><div><div className="news-kicker">Full Archive</div><h3>All Stories & Nuggets</h3></div><span>{stories.length} total</span></div><div className="news-all-story-grid">{stories.map((story)=><button type="button" key={`all-${story.id}`} className="news-all-story" onClick={()=>{ const idx=editorialStories.findIndex((s)=>s.id===story.id); if(idx>=0)setFeatureOffset(idx); }}><span>{story.category}</span><strong>{story.headline}</strong><small>{story.dateLabel}</small></button>)}</div></section>}
      </>}
    </div>
  );
}
