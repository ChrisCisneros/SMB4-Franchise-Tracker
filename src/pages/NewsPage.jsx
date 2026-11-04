import React, { useEffect, useMemo, useState } from "react";
import { buildNewsFeed } from "../utils/newsUtils";
import { buildFanPoll, buildSocialChatter, getSeasonPulse } from "../utils/fandomUtils";
import { buildWorldState } from "../utils/cultureUtils";
import { currentLeagueDay, scheduleEntryLabel } from "../utils/seasonCalendarUtils";
import { ceremonyForGame } from "../utils/ceremonyUtils";
import { buildAroundLeagueTonight, buildDynamicAds, buildFansTalkingAbout, buildHonorInterviews, buildHotColdBoard, buildOnThisDateMoments, buildFakePodcasts, buildWeeklyMediaRoundup } from "../utils/mediaMemoryUtils";
import { buildBroadcastBooth, buildDefiningMoments, buildMediaOutlets, buildPredictionReceipts, buildTopicLifecycles } from "../utils/lifeSystemsUtils";
import { buildBallparkLife, buildCityBuzz, buildConsequenceChains, buildHistoricGameAlerts, buildRevengeWatch } from "../utils/ballparkLifeUtils";
import { buildSpecialAchievements } from "../utils/playerLegacyUtils";
import { buildV6LivingLeague } from "../utils/v6LivingLeagueUtils";
import NMLBUniverseHub from '../components/NMLBUniverseHub';
import { buildNMLBCulture, predictionSnapshot } from '../utils/nmlbCultureUtils';
import { buildPostseasonNightlyShow, buildPostseasonSeriesMemory, buildAnalystReputation, buildHistoricalComparisons, buildPostseasonMemoryCards, buildPostseasonRivalryHeat } from '../utils/postseasonMemoryUtils';
import { buildStretchRunBoard } from '../utils/finalWeeksUtils';

const FILTERS = ["All", "Current", "Facts", "Postseason", "Record Book", "Archive"];
const FEATURE_ROTATE_MS = 120000;
const FACT_ROTATE_MS = 90000;
const TICKER_ROTATE_MS = 14000;

function storyBucket(story) {
  if (["Game Final", "League Watch", "Pennant Race", "Hot & Cold", "Milestone Watch", "Race to October", "Transactions", "Injury Report", "Developing", "League Alert"].includes(story.category)) return "Current";
  if (["By the Numbers", "Did You Know?", "History Lesson", "Franchise Spotlight"].includes(story.category) || story.kind === "fact") return "Facts";
  if (["Championship", "Postseason", "Clinched", "Eliminated"].includes(story.category)) return "Postseason";
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
      <span className="news-story-tags"><span className="news-category-pill">{story.category}</span>{story.badge && <span className={`news-status-pill news-status-${story.category.toLowerCase()}`}>{story.badge}</span>}</span>
      <span className="news-date">{story.dateLabel}</span>
    </div>
  );
}

function TeamTags({ story }) {
  if (!story.teams?.length) return null;
  return <div className="news-team-row">{story.teams.map((abbr) => <span key={`${story.id}-${abbr}`}>{abbr}</span>)}</div>;
}

function LeadStory({ story }) {
  return <article className={`news-lead-story news-tone-${story.tone || "archive"}`}><div className="news-lead-overlay"/><div className="news-lead-content"><StoryMeta story={story}/><div className="news-breaking-label">Featured on NMLB Network</div><h3>{story.headline}</h3><p>{story.dek}</p><TeamTags story={story}/></div></article>;
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
  const { data, teams, setData, syncLeagueExtrasToFirebase, controlsUnlocked } = ctx;
  const [filter, setFilter] = useState("All");
  const [featureOffset, setFeatureOffset] = useState(0);
  const [factOffset, setFactOffset] = useState(0);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [selectedStory, setSelectedStory] = useState(null);
  const stories = useMemo(() => buildNewsFeed(data, teams, ctx.playoffPicture || []), [data, teams, ctx.playoffPicture]);
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
  const v6=useMemo(()=>buildV6LivingLeague(data,teams,ctx.playoffPicture||[],Date.now()),[data,teams,ctx.playoffPicture,tickerOffset]);
  const culture=useMemo(()=>buildNMLBCulture(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture,tickerOffset]);
  const postseasonPredictions=culture.predictions;
  const postseasonTonight=useMemo(()=>buildPostseasonNightlyShow(data,teams),[data.games,data.activeSeasonName,teams]);
  const postseasonSeries=useMemo(()=>buildPostseasonSeriesMemory(data,teams),[data.games,data.playoffBracket,data.activeSeasonName,teams]);
  const analystReputation=useMemo(()=>buildAnalystReputation(data,teams),[data.leagueExtras?.nmlbLockedPredictions,data.championTeamId,data.playoffBracket,teams]);
  const historicalComparisons=useMemo(()=>buildHistoricalComparisons(data,teams),[data.seasonHistory,teams]);
  const postseasonMemories=useMemo(()=>buildPostseasonMemoryCards(data,teams),[data.games,data.activeSeasonName,teams]);
  const postseasonRivalries=useMemo(()=>buildPostseasonRivalryHeat(data,teams),[data.games,data.seasonHistory,teams]);
  const stretchRun=useMemo(()=>buildStretchRunBoard(data,teams,ctx.playoffPicture||[]),[data,teams,ctx.playoffPicture]);
  const todaySlot = useMemo(()=>currentLeagueDay(data,teams),[data,teams]);
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
    if (!controlsUnlocked || !postseasonPredictions?.phase?.locked || data.leagueExtras?.nmlbLockedPredictions || !postseasonPredictions?.analysts?.length) return;
    const locked = predictionSnapshot(postseasonPredictions);
    const nextExtras = {...(data.leagueExtras||{}), nmlbLockedPredictions: locked};
    setData?.(prev=>({...prev,leagueExtras:nextExtras}));
    syncLeagueExtrasToFirebase?.(nextExtras);
  }, [controlsUnlocked, postseasonPredictions?.phase?.locked, data.leagueExtras?.nmlbLockedPredictions, postseasonPredictions?.analysts?.length]);

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
        <div className="news-brand-block"><div className="news-network-mark">NMLB</div><div><div className="news-kicker">NICKY’S MAJOR LEAGUE BASEBALL · NMLB NETWORK</div><h2>League News</h2><p>Version 6.4.12 newsroom: headlines, recurring shows, city mood, receipts, culture, history and the stories that keep moving after the final out.</p></div></div>
        <div className="news-masthead-stats"><div><strong>{stories.length}</strong><span>Story Pool</span></div><div><strong>{factCount}</strong><span>Facts</span></div><div><strong>{historyCount}</strong><span>History</span></div></div>
      </section>


      {stretchRun.phase.id!=='regular'&&<section className={`nmlb6411-news-stretch ${stretchRun.phase.id}`}><article><small>NMLB STRETCH RUN DESK · {stretchRun.phase.tag}</small><h2>{stretchRun.phase.label}</h2><p>{stretchRun.phase.detail}</p></article><article><small>BUBBLE WATCH</small>{stretchRun.bubble.slice(0,5).map(x=><span key={x.team.id}><b>{x.team.abbr}</b><strong>DIV E# {x.divE} · WC E# {x.wcE}</strong></span>)}</article><article><small>RACE NIGHT</small><h3>{stretchRun.raceNight.pressureTeams} pressure clubs</h3><p>{stretchRun.raceNight.possibleClinches} possible one-result decisions are sitting on the board.</p></article></section>}
      {postseasonPredictions.phase.id!=='preview'&&<section className="nmlb64-news-ramp">
        <article><small>NMLB NETWORK · ROAD TO OCTOBER</small><h2>{postseasonPredictions.phase.label}</h2><p>{postseasonPredictions.phase.detail}</p><div className="nmlb64-culture-tags"><span>WEEK {postseasonPredictions.phase.week||culture.week}</span><span>{postseasonPredictions.phase.locked?'🔒 PICKS LOCKED':'PICKS CAN STILL MOVE'}</span>{postseasonPredictions.consensus&&<span>CONSENSUS · {postseasonPredictions.consensus.abbr}</span>}</div></article>
        <article className="nmlb64-calls"><small>THE CALLS</small>{postseasonPredictions.analysts.slice(0,4).map(a=><span key={a.name}><b>{a.name}</b><strong>{a.al} / {a.nl} → {a.champion}</strong></span>)}</article>
      </section>}
      {postseasonTonight&&<section className="nmlb648-news-nightly"><article className="card"><small>NMLB POSTSEASON TONIGHT</small><h2>{postseasonTonight.headline}</h2><p>{postseasonTonight.detail}</p><div className="nmlb648-memory-tags"><span>GAME OF THE NIGHT · {postseasonTonight.bestDrama}</span>{postseasonMemories[0]&&<span>{postseasonMemories[0].importance}</span>}</div></article><article className="card"><small>SERIES MEMORY</small>{postseasonSeries.slice(0,3).map(x=><div className="nmlb648-series-line" key={x.id}><b>{x.label}</b><strong>{x.away?.abbr||'TBD'} {x.awayWins}-{x.homeWins} {x.home?.abbr||'TBD'}</strong><span>{x.narrative}</span></div>)}</article><article className="card"><small>ANALYST REPUTATION</small>{analystReputation.slice(0,4).map(a=><div className="nmlb648-analyst-line" key={a.name}><b>{a.name}</b><span>{a.verdict}</span><strong>{a.champion}</strong></div>)}</article><article className="card"><small>HISTORICAL ECHO</small>{historicalComparisons.slice(0,3).map(x=><p key={x.team.id}><b>{x.team.abbr}</b> · {x.detail}</p>)}</article><article className="card"><small>RIVALRY TEMPERATURE</small>{postseasonRivalries.slice(0,3).map(x=><div className="nmlb648-rivalry-line" key={`${x.a.id}-${x.b.id}`}><b>{x.a.abbr} × {x.b.abbr}</b><strong>{x.label} · {x.heat}</strong><span>{x.detail}</span></div>)}</article></section>}
      <section className="nmlb64-culture-strip"><small>NMLB CULTURE DESK · WEEK {culture.week}</small><h2>{culture.activeTraditions[0]?.name||'The league has rituals now.'}</h2><p>{culture.activeTraditions[0]?.detail||'Traditions, recurring voices, rivalry mythology, Network segments and league-wide language now give every part of the season its own personality.'}</p><div className="nmlb64-culture-tags">{culture.segments.slice(0,5).map(([name])=><span key={name}>{name}</span>)}</div></section>

      <section className="news-v6-edition card"><div><small>V6 DAILY EDITION · {v6.phase.label}</small><h2>{v6.headline}</h2><p>{v6.phase.tone}</p></div><div className="news-v6-meters"><span><b>{v6.chaos.chaos}</b> CHAOS</span><span><b>{v6.chaos.drama}</b> DRAMA</span><span><b>{v6.meaningful.length}</b> PRESSURE TEAMS</span></div></section>
      <section className="news-v6-grid"><article className="card"><div className="news-kicker">PREVIOUSLY ON…</div><h3>The NMLB</h3>{v6.previous.slice(0,4).map((x,i)=><p key={i}><b>{x.label}</b><span>{x.title} · {x.detail}</span></p>)}</article><article className="card"><div className="news-kicker">CITY DESK</div><h3>Hope vs. Anxiety</h3>{v6.moods.slice(0,5).map(x=><p key={x.team.id}><b>{x.team.abbr} · {x.mood}</b><span>Hope {x.hope} · Anxiety {x.anxiety} · {x.climate}</span></p>)}</article><article className="card"><div className="news-kicker">PROGRAMMING GRID</div><h3>Today's recurring shows</h3>{v6.media.shows.slice(0,5).map(x=><p key={x.show}><b>{x.slot} · {x.show}</b><span>{x.hook}</span></p>)}</article></section>
      {(v6.aftermath.length>0||v6.spoilerBoard.length>0)&&<section className="news-v6-grid"><article className="card"><div className="news-kicker">POSTSEASON AFTERMATH</div><h3>Clinches and eliminations have a second day now</h3>{v6.aftermath.slice(0,5).map(x=><p key={x.team.id}><b>{x.team.abbr} · {x.label}</b><span>{x.detail}</span></p>)}</article><article className="card"><div className="news-kicker">SPOILER DESK</div><h3>Eliminated does not mean irrelevant</h3>{v6.spoilerBoard.length?v6.spoilerBoard.slice(0,5).map(x=><p key={x.team.id}><b>{x.team.abbr} · {x.label}</b><span>{x.detail}</span></p>):<p><span>No spoiler teams yet. That will change quickly in the stretch run.</span></p>}</article><article className="card"><div className="news-kicker">HISTORY ECHOES</div><h3>Today's stories talking to yesterday</h3>{v6.echoes.slice(0,4).map((x,i)=><p key={i}><b>{x.label}</b><span>{x.title} · {x.detail}</span></p>)}</article></section>}
      <section className="news-today-edition card"><div><small>TODAY'S BASEBALL WORLD · M{todaySlot?.month||1} D{todaySlot?.dayOfMonth||1}</small><strong>{todaySlot?.gameNumber?`G${todaySlot.gameNumber} · ${scheduleEntryLabel(todaySlot.schedule)}`:todaySlot?.dayEvent?`${todaySlot.dayEvent.icon||'✨'} ${todaySlot.dayEvent.name}`:'League off day'}</strong><span>{todaySlot?.dateLabel?`${todaySlot.weekday} · ${todaySlot.dateLabel}`:`Week ${todaySlot?.week||pulse.week} · ${pulse.phase}`}</span></div><div><small>{todaySlot?.gameNumber?'TODAY AT THE PARK':'OFF-DAY FEATURE'}</small><strong>{todayCeremonies[0]?.title||todaySlot?.promo?.displayName||todaySlot?.promo?.name||todaySlot?.dayEvent?.name||worldState.moments?.[0]?.title||'Around the league'}</strong><span>{todayCeremonies[0]?.detail||todaySlot?.promo?.giveaway||todaySlot?.dayEvent?.detail||worldState.leagueMood}</span></div><div className="news-edition-stamp"><b>NMLB DAILY</b><em>{pulse.phase}</em></div></section>

      {!!ticker && <div className="news-ticker news-ticker-live" aria-label="NMLB Network live ticker"><span className="news-ticker-label"><i/>LIVE</span><strong key={ticker.id}>{ticker.headline}</strong><span className="news-ticker-date">{ticker.dateLabel}</span></div>}

      <section className="news-network-strip">
        <div><span className="news-live-dot"/><strong>NMLB NETWORK LIVE</strong><small>Featured stories rotate every 2 minutes</small></div>
        <div className="news-network-chips"><span>{currentCount} current</span><span>{factCount} facts & nuggets</span><span>{stories.length} total stories</span></div>
      </section>

      <section className="news-v5-desk-grid">
        <article className="card news-v5-deep-dive">
          <div className="news-kicker">V5 · THE DEEP DIVE</div>
          <small>{lead?.category||historicAlerts[0]?.kicker||'LEAGUE DESK'}</small>
          <h2>{lead?.headline||historicAlerts[0]?.headline||"The league is still writing tonight's headline."}</h2>
          <p>{lead?.dek||historicAlerts[0]?.detail||'Every game, streak and milestone feeds the next edition of the league story.'}</p>
          {lead&&<button type="button" onClick={()=>setSelectedStory(lead)}>OPEN STORY DOSSIER →</button>}
        </article>
        <article className="card news-v5-storyboard">
          <div className="news-kicker">TOP STORY BOARD</div>
          <h3>What owns the newsroom right now</h3>
          {[...editorialStories].slice(0,6).map((story,i)=><button key={`board-${story.id}`} type="button" onClick={()=>setSelectedStory(story)}><b>{String(i+1).padStart(2,'0')}</b><span><small>{story.category} · {story.dateLabel}</small><strong>{story.headline}</strong></span></button>)}
        </article>
        <article className="card news-v5-assignment-desk">
          <div className="news-kicker">ASSIGNMENT DESK</div>
          <h3>What reporters are chasing</h3>
          <p><b>⚡ Live pulse</b><span>{worldState.leagueMood}</span></p>
          <p><b>📈 Trend</b><span>{topicLifecycles[0]?.topic||'Waiting for the next league-wide obsession'}</span></p>
          <p><b>📚 Memory</b><span>{definingMoments[0]?.title||'The season archive is still forming'}</span></p>
          <p><b>🎙️ Booth note</b><span>{broadcastBooth[0]?.trait||'Pregame notes are being filed'}</span></p>
          <p><b>👀 Next watch</b><span>{aroundTonight[0]?.title||'The next game on the calendar'}</span></p>
        </article>
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

      <section className="news-podcast-row"><div className="news-section-heading"><div><div className="news-kicker">NMLB AUDIO NETWORK</div><h3>Latest Podcasts</h3></div></div><div className="news-podcast-grid">{podcasts.map(p=><article className="card" key={p.show}><small>{p.show} · {p.host}</small><strong>{p.episode}</strong>{p.topics.map(t=><span key={t}>• {t}</span>)}</article>)}</div></section>

      {(honorInterviews.length>0||onThisDate.length>0)&&<section className="news-memory-grid">{honorInterviews.length>0&&<article className="card"><div className="news-kicker">LEGENDS DESK</div><h3>Honor Interview</h3><strong>{honorInterviews[0].name} · {honorInterviews[0].team||'LEAGUE'}</strong><blockquote>“{honorInterviews[0].quote}”</blockquote><small>{honorInterviews[0].occasion}</small></article>}{onThisDate.length>0&&<article className="card"><div className="news-kicker">ON THIS DATE</div><h3>{onThisDate[0].title}</h3><p>{onThisDate[0].detail}</p></article>}</section>}

      <section className="news-ad-grid">{ads.slice(0,3).map(ad=><article key={ad.id}><small>{ad.kicker}</small><strong>{ad.title}</strong><span>{ad.copy}</span><b>{ad.cta} →</b></article>)}</section>

      <section className="news-fandom-strip card"><div><div className="news-kicker">FAN & MEDIA PULSE · WEEK {pulse.week}</div><h3>{fanPoll.question}</h3><div className="news-fan-mini-poll">{fanPoll.options.slice(0,4).map(o=><span key={o.team.id}><b>{o.team.abbr}</b> {o.pct}%</span>)}</div></div><div className="news-social-wire">{social.slice(0,2).map((x,i)=><p key={i}><b>{x.handle}</b> {x.text}</p>)}</div></section>

      <div className="news-toolbar"><div className="news-section-title"><span>Newsroom</span><strong>{filter === "All" ? "Top Stories" : filter}</strong></div><div className="news-filter-row">{FILTERS.map((item)=><button key={item} className={filter===item?"news-filter-active":""} onClick={()=>setFilter(item)}>{item}</button>)}</div></div>

      {!lead ? <div className="card news-empty-state"><div className="news-kicker">News Desk</div><h3>No headlines in this section yet.</h3><p className="muted">As the season develops, this desk will fill itself with league stories and facts.</p></div> : <>
        <section className="news-top-grid news-rotating-grid"><LeadStory key={`lead-${lead.id}`} story={lead}/><div className="news-side-stack">{sideStories.length ? sideStories.map((story)=><SideStory key={story.id} story={story}/>) : <aside className="news-desk-note card"><div className="news-kicker">League Desk</div><h3>The news cycle never stops.</h3><p>The lead story changes automatically while the full story pool stays available below.</p></aside>}</div></section>

        {!!rotatedFacts.length && <section className="news-facts-section"><div className="news-section-heading"><div><div className="news-kicker">Numbers & Nuggets</div><h3>Rotating Facts Desk</h3></div><span>refreshes every 90 sec · {factStories.length} in pool</span></div><div className="news-fact-grid">{rotatedFacts.slice(0,8).map((story)=><FactCard key={story.id} story={story}/>)}</div></section>}

        {!!latestStories.length && <section className="news-latest-section"><div className="news-section-heading"><div><div className="news-kicker">Around the League</div><h3>News Wire</h3></div><span>{latestStories.length} more stor{latestStories.length===1?"y":"ies"}</span></div><div className="news-headline-list">{latestStories.map((story)=><HeadlineStory key={story.id} story={story}/>)}</div></section>}

        {!!stories.length && <section className="news-all-stories card"><div className="news-section-heading"><div><div className="news-kicker">Full Archive</div><h3>All Stories & Nuggets</h3></div><span>{stories.length} total</span></div><div className="news-all-story-grid">{stories.map((story)=><button type="button" key={`all-${story.id}`} className="news-all-story" onClick={()=>{ const idx=editorialStories.findIndex((s)=>s.id===story.id); if(idx>=0)setFeatureOffset(idx); setSelectedStory(story); }}><span>{story.category}</span><strong>{story.headline}</strong><small>{story.dateLabel}</small></button>)}</div></section>}
      </>}

      {selectedStory&&<div className="news-story-dossier-backdrop" role="presentation" onClick={()=>setSelectedStory(null)}><section className={`news-story-dossier news-tone-${selectedStory.tone||'archive'}`} role="dialog" aria-modal="true" aria-label="Story dossier" onClick={e=>e.stopPropagation()}><button className="news-story-dossier-close" type="button" onClick={()=>setSelectedStory(null)}>×</button><div className="news-kicker">NMLB NETWORK · STORY DOSSIER</div><StoryMeta story={selectedStory}/><h2>{selectedStory.headline}</h2><p>{selectedStory.dek}</p><TeamTags story={selectedStory}/><div className="news-dossier-grid"><div><small>DESK</small><strong>{storyBucket(selectedStory)}</strong></div><div><small>EDITION</small><strong>{selectedStory.dateLabel||data.activeSeasonName}</strong></div><div><small>STATUS</small><strong>{selectedStory.kind==='fact'?'REFERENCE':'ACTIVE FILE'}</strong></div></div><h4>WHY IT MATTERS</h4><p>{selectedStory.kind==='fact'?'This nugget is part of the permanent context that makes current games mean more.':'This story is part of the live season narrative. Its prominence will cool as newer games create stronger, fresher storylines.'}</p></section></div>}
    </div>
  );
}
