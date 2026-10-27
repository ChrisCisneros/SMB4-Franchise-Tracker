import React, { useMemo, useState } from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';
import { buildLeagueRecords } from '../utils/recordsUtils';
import { buildDynasties } from '../utils/universeUtils';
import { buildPlayerCareerBoard, buildHeadToHead } from '../utils/historyUtils';
import { makeSafePlayoffBracket } from '../utils/playoffUtils';
import {
  buildAnchorPicks, buildBestGames, buildCinderellaRuns, buildFakeFanPolls,
  buildFirstMilestones, buildGameExcitement, buildGamesThatMatter, buildLeagueFirsts,
  buildNoHitWatch, buildRecordChases, buildSeasonGrades, buildTeamEras,
  buildTeamNicknames, buildTeamOfWeek, buildV4TeamMetrics, buildWinProbability,
  personalityForMetric
} from '../utils/v4Utils';

const TABS=[['intelligence','League Intelligence'],['legacy','Banners & Legacy'],['broadcast','Broadcast Studio'],['season','Season Center'],['players','Players & Ceremonies']];
const pct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const rd=n=>`${Number(n||0)>0?'+':''}${Number(n||0)}`;
function Pill({children,tone=''}){return <span className={`v4-pill ${tone}`}>{children}</span>}
function Empty({children}){return <div className="v4-empty">{children}</div>}
function Meter({value,label}){const n=Math.max(0,Math.min(100,Number(value||0)));return <div className="v4-meter"><div><span>{label}</span><strong>{Math.round(n)}</strong></div><div className="v4-meter-track"><i style={{width:`${n}%`}}/></div></div>}
function TeamChip({team}){const c=getTeamColorsByAbbr(team?.abbr);return <span className="v4-team-chip" style={{'--v4-team':c.main,'--v4-border':c.border}}><i/>{team?.abbr||'TBD'}</span>}
function SectionTitle({kicker,title,detail,action}){return <div className="v4-section-title"><div><small>{kicker}</small><h3>{title}</h3>{detail&&<p>{detail}</p>}</div>{action}</div>}

export default function V4CenterPage({ctx}){
  const {data,teams,playoffPicture,currentGame,controlsUnlocked,setData,syncLeagueExtrasToFirebase,syncGamesToFirebase}=ctx;
  const [tab,setTab]=useState('intelligence');
  const [selectedTeamId,setSelectedTeamId]=useState(teams[0]?.id||'');
  const [ceremonyId,setCeremonyId]=useState('');
  const extras=data.leagueExtras||{};
  const activeSeason=data.activeSeasonName||'Season 4';
  const metrics=useMemo(()=>buildV4TeamMetrics(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const metric=metrics.find(m=>m.team.id===selectedTeamId)||metrics[0]||null;
  const records=useMemo(()=>buildLeagueRecords(data.seasonHistory||[],teams),[data.seasonHistory,teams]);
  const dynasties=useMemo(()=>buildDynasties(data.seasonHistory||[],teams),[data.seasonHistory,teams]);
  const cinderellas=useMemo(()=>buildCinderellaRuns(data.seasonHistory||[]),[data.seasonHistory]);
  const eras=useMemo(()=>buildTeamEras(data.seasonHistory||[],teams),[data.seasonHistory,teams]);
  const firstMilestones=useMemo(()=>buildFirstMilestones(data.seasonHistory||[],teams),[data.seasonHistory,teams]);
  const leagueFirsts=useMemo(()=>buildLeagueFirsts(data.seasonHistory||[],data.games||[],teams),[data.seasonHistory,data.games,teams]);
  const grades=useMemo(()=>buildSeasonGrades(teams,data.seasonHistory||[]),[teams,data.seasonHistory]);
  const recordChases=useMemo(()=>buildRecordChases(teams,data.seasonHistory||[]),[teams,data.seasonHistory]);
  const teamWeek=useMemo(()=>buildTeamOfWeek(metrics),[metrics]);
  const bestGames=useMemo(()=>buildBestGames(data,teams),[data,teams]);
  const gameImportance=useMemo(()=>buildGamesThatMatter(currentGame,metrics),[currentGame,metrics]);
  const liveProb=useMemo(()=>buildWinProbability(currentGame,teams),[currentGame,teams]);
  const noHit=useMemo(()=>buildNoHitWatch(currentGame,teams),[currentGame,teams]);
  const fanPolls=useMemo(()=>buildFakeFanPolls(metrics,activeSeason),[metrics,activeSeason]);
  const anchorPicks=useMemo(()=>buildAnchorPicks(currentGame,metrics),[currentGame,metrics]);
  const nicknames=useMemo(()=>buildTeamNicknames(metrics),[metrics]);
  const careers=useMemo(()=>buildPlayerCareerBoard(data.players||[],data.seasonHistory||[]),[data.players,data.seasonHistory]);
  const rivalries=useMemo(()=>buildHeadToHead(data.games||[],teams,data.seasonHistory||[]),[data.games,teams,data.seasonHistory]);
  const bannerHistory=useMemo(()=>[...(data.seasonHistory||[])].reverse().map((season,index)=>{
    const bracket=makeSafePlayoffBracket(season.playoffBracket);
    const seasonTeams=season.teams||[];
    const team=(id)=>seasonTeams.find(t=>t.id===id)||teams.find(t=>t.id===id)||null;
    const al=team(bracket.al?.lc?.winnerTeamId);
    const nl=team(bracket.nl?.lc?.winnerTeamId);
    const champ=team(season.championTeamId||bracket.finals?.winnerTeamId);
    return {id:season.id||`season-${index}`,name:season.name||`Season ${index+1}`,al,nl,champ};
  }),[data.seasonHistory,teams]);
  const currentRivalry=currentGame?.awayTeamId&&currentGame?.homeTeamId?rivalries.find(r=>(r.teamAId===currentGame.awayTeamId&&r.teamBId===currentGame.homeTeamId)||(r.teamBId===currentGame.awayTeamId&&r.teamAId===currentGame.homeTeamId)):null;
  const avgGames=teams.length?teams.reduce((s,t)=>s+Number(t.wins||0)+Number(t.losses||0),0)/teams.length:0;
  const midseason=avgGames>=18&&avgGames<=24;
  const seasonComplete=teams.length>0&&teams.every(t=>Number(t.wins||0)+Number(t.losses||0)>=40);
  const isOpening=avgGames<=1;
  const isPlayoff=currentGame?.gameType==='playoff';
  const isChampionship=isPlayoff&&['finals','worldSeries'].includes(currentGame?.playoffSeriesId);
  const theme=isChampionship?'CHAMPIONSHIP':isPlayoff?'PLAYOFF INTENSITY':currentRivalry?.games>=2?'RIVALRY NIGHT':midseason?'ALL-STAR BREAK':isOpening?'OPENING DAY':'REGULAR SEASON';
  const currentExcitement=currentGame?.status==='Final'?buildGameExcitement(currentGame):null;
  const ceremony=(extras.retiredNumbers||[]).find(x=>x.id===ceremonyId)||null;
  const clutchActive=(liveProb.leverageScore||0)>=62 && currentGame?.latestPlay && currentGame.latestPlay!=="No play recorded yet.";

  const saveExtras=(patch)=>{const next={...extras,...patch};syncLeagueExtrasToFirebase(next);setData(p=>({...p,leagueExtras:next}));};
  const addItem=(key,item)=>saveExtras({[key]:[{id:crypto.randomUUID(),createdAt:new Date().toISOString(),...item},...(extras[key]||[])]});
  const removeItem=(key,id)=>saveExtras({[key]:(extras[key]||[]).filter(x=>x.id!==id)});
  const ask=(label,def='')=>window.prompt(label,def);

  const saveStandingsSnapshot=()=>{
    const ordered=[...metrics].sort((a,b)=>a.currentRank-b.currentRank).map(m=>({teamId:m.team.id,rank:m.currentRank,wins:Number(m.team.wins||0),losses:Number(m.team.losses||0),runDiff:Number(m.team.runDiff||0)}));
    addItem('standingsSnapshots',{label:`${activeSeason} snapshot`,teams:ordered});
  };
  const addEvent=()=>{const title=ask('Historical event title:');if(!title)return;addItem('manualEvents',{date:ask('Date / season:',''),teamAbbr:ask('Team abbreviation (optional):',''),title,note:ask('What happened?','')});};
  const addRecord=()=>{const title=ask('Custom league record:');if(!title)return;addItem('customRecords',{title,holder:ask('Record holder:',''),value:ask('Record value:',''),note:ask('Context / season:','')});};
  const addAchievement=()=>{const teamAbbr=ask('Team abbreviation:');if(!teamAbbr)return;addItem('achievements',{teamAbbr,title:ask('Achievement title:',''),note:ask('Why they earned it:','')});};
  const addStoryline=()=>{const title=ask('Storyline headline:');if(!title)return;addItem('storylines',{title,status:'Active',note:ask('Storyline details:','')});};
  const addCalendar=()=>{const title=ask('Calendar event:');if(!title)return;addItem('leagueCalendar',{date:ask('Date / game marker:',''),title,note:ask('Details:','')});};
  const addTopPlay=()=>{const title=ask('Top play headline:');if(!title)return;addItem('topPlays',{date:currentGame?.date||new Date().toISOString().slice(0,10),title,note:ask('What happened?',''),teamAbbr:ask('Team abbreviation:','')});};
  const addClassic=()=>{const title=ask('Classic game title:');if(!title)return;addItem('manualClassicGames',{title,score:Number(ask('Excitement score 0-100:','95'))||95,note:ask('Why it belongs here:',''),date:ask('Date / season:','')});};
  const addCommentary=()=>{const text=ask('Broadcast commentary:');if(!text)return;addItem('commentary',{text,date:currentGame?.date||'',gameKey:`${currentGame?.awayTeamId||''}-${currentGame?.homeTeamId||''}`});};
  const addHofCandidate=()=>{const name=ask('Hall of Fame candidate:');if(!name)return;addItem('hofBallot',{name,teamAbbr:ask('Primary team:',''),case:ask('Hall of Fame case:',''),votes:0});};
  const voteHof=(id)=>saveExtras({hofBallot:(extras.hofBallot||[]).map(x=>x.id===id?{...x,votes:Number(x.votes||0)+1}:x)});
  const inductCandidate=(candidate)=>{const hof=[{id:crypto.randomUUID(),name:candidate.name,teamAbbr:candidate.teamAbbr,note:candidate.case,inductedAt:new Date().toISOString()},...(extras.hallOfFame||[])];saveExtras({hallOfFame:hof,hofBallot:(extras.hofBallot||[]).filter(x=>x.id!==candidate.id)});};
  const addBracketPrediction=()=>{const champion=ask('Predicted champion abbreviation:');if(!champion)return;addItem('bracketPredictions',{season:activeSeason,champion,al:ask('Predicted AL champion:',''),nl:ask('Predicted NL champion:',''),note:ask('Prediction note:','')});};
  const addEndGameNote=()=>{
    const games=[...(data.games||[])]; if(!games.length){window.alert('No finalized games yet.');return;} const latest=[...games].sort((a,b)=>(Date.parse(b.finalizedAt||b.date||'')||0)-(Date.parse(a.finalizedAt||a.date||'')||0))[0]; const note=ask('End-game note:',latest.gameNote||''); if(note===null)return;
    const next=games.map(g=>g.id===latest.id?{...g,gameNote:note}:g); syncGamesToFirebase(next); setData(p=>({...p,games:next}));
  };

  const currentPlayLog=(currentGame?.playLog||[]).map(x=>String(x));
  const achievementAlerts=[];
  (data.players||[]).forEach(p=>{
    if(Number(p.hits||0)>=4)achievementAlerts.push({player:p,label:'4-HIT GAME',icon:'4️⃣'});
    const name=String(p.name||'').toLowerCase(); if(!name)return;
    const logs=currentPlayLog.filter(x=>x.toLowerCase().includes(name));
    const hr=logs.filter(x=>/home run/i.test(x)).length; if(hr>=2)achievementAlerts.push({player:p,label:`${hr}-HR GAME`,icon:'💣'});
    const kinds=['single','double','triple','home run']; if(kinds.every(k=>logs.some(x=>new RegExp(k,'i').test(x))))achievementAlerts.push({player:p,label:'HIT FOR THE CYCLE',icon:'🔄'});
  });

  return <div className="v4-page">
    <section className={`card v4-hero v4-theme-${theme.toLowerCase().replace(/\s+/g,'-')}`}>
      <div><div className="v4-kicker">SMB4 FRANCHISE CENTRAL · VERSION 4.20</div><h1>League Center</h1><p>The living layer: projections, banners, fan chatter, milestone history, broadcast modes, ceremonies and season storytelling.</p></div>
      <div className="v4-hero-pills"><Pill tone="live">V4 LIVE</Pill><Pill>{theme}</Pill><Pill>{(data.games||[]).length} games stored</Pill><Pill>{(data.seasonHistory||[]).length} seasons archived</Pill></div>
    </section>
    <nav className="v4-tabbar">{TABS.map(([id,label])=><button className={tab===id?'active':''} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>

    {tab==='intelligence'&&<div className="v4-stack">
      <section className="card"><SectionTitle kicker="RACE CONTROL" title="League Intelligence" detail="Magic numbers, playoff projection, SOS, momentum, splits and movement — recalculated from live league data." action={controlsUnlocked?<button onClick={saveStandingsSnapshot}>Save Standings Snapshot</button>:null}/>
        <div className="v4-metric-table"><div className="v4-metric-row head"><span>Team</span><span>W-L</span><span>Home</span><span>Away</span><span>SOS</span><span>Momentum</span><span>Playoff %*</span><span>M#</span><span>E#</span><span>Move</span></div>{metrics.map(m=><button className={`v4-metric-row ${selectedTeamId===m.team.id?'selected':''}`} key={m.team.id} onClick={()=>setSelectedTeamId(m.team.id)}><TeamChip team={m.team}/><strong>{m.team.wins}-{m.team.losses}</strong><span>{m.profile.homeWins}-{m.profile.homeLosses}</span><span>{m.profile.awayWins}-{m.profile.awayLosses}</span><span>{pct(m.sos)}</span><span>{Math.round(m.momentum)}</span><strong>{Math.round(m.playoffProbability)}%</strong><span>{m.playoffMagic??'—'}</span><span>{m.eliminationNumber??'—'}</span><span className={m.movement>0?'up':m.movement<0?'down':''}>{m.previousRank?m.movement>0?`▲${m.movement}`:m.movement<0?`▼${Math.abs(m.movement)}`:'—':'NEW'}</span></button>)}</div>
        <p className="v4-footnote">*V4 Playoff Projection is a deterministic tracker estimate using current record, remaining games, run differential, momentum and the present cutoff — not a real-world probability model.</p>
      </section>
      <div className="v4-grid-3">
        <div className="card">{metric?<><SectionTitle kicker="TEAM DNA" title={`${metric.team.abbr} Personality`}/><div className="v4-personality"><span>{personalityForMetric(metric).icon}</span><div><h2>{personalityForMetric(metric).title}</h2><p>{personalityForMetric(metric).detail}</p></div></div><Meter value={metric.momentum} label="Momentum Meter"/><Meter value={metric.playoffProbability} label="Playoff Projection"/><div className="v4-split-grid"><div><span>Home</span><strong>{metric.profile.homeWins}-{metric.profile.homeLosses}</strong><small>{pct(metric.homePct)}</small></div><div><span>Away</span><strong>{metric.profile.awayWins}-{metric.profile.awayLosses}</strong><small>{pct(metric.awayPct)}</small></div></div></>:<Empty>No team data yet.</Empty>}</div>
        <div className="card"><SectionTitle kicker="PLAYOFF BUBBLE" title="Who Is Sweating?"/>{metrics.filter(m=>m.playoffProbability>=25&&m.playoffProbability<=75).slice(0,8).map(m=><div className="v4-list-row" key={m.team.id}><TeamChip team={m.team}/><span>{Math.round(m.playoffProbability)}% · M# {m.playoffMagic??'—'} · E# {m.eliminationNumber??'—'}</span></div>)}{!metrics.some(m=>m.playoffProbability>=25&&m.playoffProbability<=75)&&<Empty>No clear bubble yet.</Empty>}</div>
        <div className="card"><SectionTitle kicker="TEAM OF THE WEEK" title={teamWeek?.team?.abbr||'Waiting...'}/>{teamWeek?<><h2>{teamWeek.recentWins}-{Math.max(0,teamWeek.recentGames-teamWeek.recentWins)} recent</h2><p>{teamWeek.recentRF} runs scored · {teamWeek.recentRA} allowed</p><Meter value={teamWeek.momentum} label="Momentum"/></>:<Empty>Permanent game history will select the weekly club.</Empty>}</div>
      </div>
      <div className="v4-grid-2">
        <div className="card"><SectionTitle kicker="CLINCH SCENARIOS" title="Next Step Toward October"/>{metrics.slice().sort((a,b)=>(a.playoffMagic??99)-(b.playoffMagic??99)).slice(0,8).map(m=><div className="v4-clinch-row" key={m.team.id}><TeamChip team={m.team}/><p>{m.playoffMagic===0?'Playoff position effectively secured by current math.':m.playoffMagic!=null?`Any combination of ${m.playoffMagic} ${m.team.abbr} wins / first-team-out losses reaches the current clinch threshold.`:'Cutoff not established yet.'}</p></div>)}</div>
        <div className="card"><SectionTitle kicker="GAMES THAT MATTER" title={gameImportance?.label||'Set a matchup'}/>{gameImportance?<><div className="v4-big-number">{gameImportance.score}</div><p>{gameImportance.away.team.abbr} at {gameImportance.home.team.abbr}</p><div className="v4-tag-wrap">{gameImportance.reasons.map(r=><Pill key={r}>{r}</Pill>)}</div></>:<Empty>Your current Live matchup will get an importance grade here.</Empty>}</div>
      </div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="RECORD CHASE" title="History Within Reach"/>{recordChases.map(x=><div className="v4-list-row" key={x.team.id}><TeamChip team={x.team}/><span>{x.needed===0?'At the archived wins record':`${x.needed} wins from matching ${x.targetWins}`}</span></div>)}</div><div className="card"><SectionTitle kicker="WHAT CHANGED?" title="Standings Movement" detail="Save snapshots during the season to create a real movement history."/>{metrics.filter(m=>m.previousRank).slice(0,12).map(m=><div className="v4-list-row" key={m.team.id}><TeamChip team={m.team}/><span>#{m.previousRank} → #{m.currentRank} {m.movement>0?`▲ ${m.movement}`:m.movement<0?`▼ ${Math.abs(m.movement)}`:'—'}</span></div>)}{!metrics.some(m=>m.previousRank)&&<Empty>Save the first standings snapshot, then compare after more games.</Empty>}</div></div>
      <div className="card"><SectionTitle kicker="PLAYOFF RACE GRAPH" title="Projection Ladder"/><div className="v4-race-bars">{metrics.map(m=><div key={m.team.id}><TeamChip team={m.team}/><div className="v4-race-track"><i style={{width:`${m.playoffProbability}%`}}/></div><strong>{Math.round(m.playoffProbability)}%</strong></div>)}</div></div>
    </div>}

    {tab==='legacy'&&<div className="v4-stack">
      <section className="card v412-banner-hall"><SectionTitle kicker="HALL OF BANNERS & AWARDS" title="Pennants on the Wall. Trophies in the Case." detail="A horizontal season-by-season hall modeled after the physical display: league winners earn banners; the World Series winner gets the trophy and championship rings."/>
        {bannerHistory.length?<div className="v412-banner-corridor">{bannerHistory.map(season=><article className="v412-season-hardware" key={season.id}><div className="v412-season-label"><small>ARCHIVED</small><strong>{season.name}</strong></div><div className="v412-pennant-row"><div className="v412-pennant al"><span>AMERICAN LEAGUE</span><strong>{season.al?.abbr||'TBD'}</strong><small>LEAGUE CHAMPION</small></div><div className="v412-pennant nl"><span>NATIONAL LEAGUE</span><strong>{season.nl?.abbr||'TBD'}</strong><small>LEAGUE CHAMPION</small></div></div><div className="v412-world-trophy"><span>🏆</span><div><small>WORLD SERIES CHAMPION</small><strong>{season.champ?.abbr||'TBD'}</strong><p>{season.champ?`${season.champ.city||''} ${season.champ.name||''}`.trim():'Awaiting archive'}</p></div></div><div className="v413-ring-case"><span>💍</span><div><small>CHAMPIONSHIP RINGS</small><strong>{season.champ?.abbr||'TBD'} · {season.name}</strong><p>{season.champ?'Banner raised · trophy displayed · rings awarded':'Awaiting champion'}</p></div></div></article>)}</div>:<Empty>Archive a completed postseason and this hall will begin filling itself.</Empty>}
        <div className="v412-hall-summary">{records.teamStats.filter(t=>t.championships||t.wsAppearances).sort((a,b)=>b.championships-a.championships||b.wsAppearances-a.wsAppearances).map(t=><div key={t.teamId}><strong>{t.abbr}</strong><span>🏆 {t.championships||0} · 🚩 {t.wsAppearances||0}</span></div>)}</div>
      </section>
      <section className="card"><SectionTitle kicker="TROPHY MAP" title="League Hardware Map"/><div className="v4-trophy-map">{teams.map(t=>{const s=records.teamStats.find(x=>x.teamId===t.id)||{};return <div key={t.id} className={s.championships?'has-title':''}><TeamChip team={t}/><strong>{s.championships||0}</strong><small>titles</small><span>{s.playoffAppearances||0} PO · {s.wsAppearances||0} WS</span></div>})}</div></section>
      <div className="v4-grid-3"><div className="card"><SectionTitle kicker="CINDERELLA RUNS" title="Underdogs Who Wouldn't Leave"/>{cinderellas.length?cinderellas.map((x,i)=><div className="v4-list-row" key={i}><strong>#{x.seed} {x.team?.abbr||'TBD'}</strong><span>{x.season} · {x.type}</span></div>):<Empty>No 5–8 seed has reached the World Series in archived data yet.</Empty>}</div><div className="card"><SectionTitle kicker="DYNASTY SCORE" title="League Royalty"/>{dynasties.slice(0,8).map((d,i)=><div className="v4-ranking" key={d.teamId}><b>#{i+1}</b><strong>{d.abbr}</strong><span>{d.dynastyScore} pts · {d.championships} titles</span></div>)}</div><div className="card"><SectionTitle kicker="TEAM ERAS" title="Windows of Contention"/>{eras.slice(0,8).map((e,i)=><div className="v4-list-row" key={i}><strong>{e.abbr}</strong><span>{e.start} → {e.end} · {e.playoffs} PO · {e.titles} titles</span></div>)}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="FIRST-EVER MILESTONES" title="Franchise Firsts"/>{firstMilestones.slice().reverse().slice(0,18).map((x,i)=><div className="v4-list-row" key={i}><strong>{x.team?.abbr||'TBD'}</strong><span>{x.type} · {x.season}</span></div>)}</div><div className="card"><SectionTitle kicker="LEAGUE FIRSTS" title="The First Time It Happened"/>{leagueFirsts.map((x,i)=><div className="v4-list-row" key={i}><strong>{x.title}</strong><span>{x.detail}</span></div>)}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="ACHIEVEMENT CABINETS" title="Custom Franchise Honors" action={controlsUnlocked?<button onClick={addAchievement}>Add Achievement</button>:null}/>{(extras.achievements||[]).map(x=><div className="v4-achievement" key={x.id}><span>★</span><div><strong>{x.teamAbbr} · {x.title}</strong><p>{x.note}</p></div>{controlsUnlocked&&<button onClick={()=>removeItem('achievements',x.id)}>×</button>}</div>)}</div><div className="card"><SectionTitle kicker="CUSTOM RECORD BOOK" title="Records You Know That The App Doesn't" action={controlsUnlocked?<button onClick={addRecord}>Add Record</button>:null}/>{(extras.customRecords||[]).map(x=><div className="v4-list-row" key={x.id}><div><strong>{x.title}</strong><small>{x.note}</small></div><span>{x.holder} · {x.value}</span></div>)}</div></div>
      <section className="card"><SectionTitle kicker="MANUAL HISTORY" title="Franchise & League Event Timeline" detail="Add trades, legendary simulated games, relocations, controversies, records — anything worth remembering." action={controlsUnlocked?<button onClick={addEvent}>Add Historical Event</button>:null}/><div className="v4-timeline">{(extras.manualEvents||[]).map(x=><div key={x.id}><i/><small>{x.date}</small><strong>{x.teamAbbr?`${x.teamAbbr} · `:''}{x.title}</strong><p>{x.note}</p></div>)}</div></section>
    </div>}

    {tab==='broadcast'&&<div className="v4-stack">
      <section className={`card v4-broadcast-preview theme-${theme.toLowerCase().replace(/\s+/g,'-')}`}><SectionTitle kicker="AUTO BROADCAST THEME" title={theme} detail="Opening Day, rivalry, playoff and championship looks trigger automatically from game context."/>{currentGame?.awayTeamId&&currentGame?.homeTeamId?<div className="v4-broadcast-match"><TeamChip team={teams.find(t=>t.id===currentGame.awayTeamId)}/><strong>{currentGame.awayScore} – {currentGame.homeScore}</strong><TeamChip team={teams.find(t=>t.id===currentGame.homeTeamId)}/></div>:<Empty>Set a live matchup to preview the broadcast package.</Empty>}{currentRivalry&&<Pill tone="hot">RIVALRY MODE · {currentRivalry.games} recorded meetings</Pill>}</section>
      <div className="v4-grid-3"><div className="card"><SectionTitle kicker="WIN PROBABILITY" title={`${liveProb.away}% / ${liveProb.home}%`}/><div className="v4-winprob"><i style={{width:`${liveProb.away}%`}}/><b style={{width:`${liveProb.home}%`}}/></div><div className="v4-winprob-labels"><span>Away {liveProb.away}%</span><span>Home {liveProb.home}%</span></div><p className="v4-footnote">V4 game-state estimate — score, inning, bases, current records and run differential.</p></div><div className="card"><SectionTitle kicker="LEVERAGE" title={liveProb.leverage}/><Meter value={liveProb.leverageScore||0} label="Leverage Index"/><p>Late, close games with traffic on the bases rise toward EXTREME.</p></div><div className="card"><SectionTitle kicker="CROWD MOMENTUM" title={`${liveProb.crowd}/100`}/><Meter value={liveProb.crowd} label="Home Crowd Energy"/><p>Score, inning and current baserunners drive the atmosphere meter.</p></div></div>
      {noHit.length>0&&<section className="card v4-alert-card"><SectionTitle kicker="MILESTONE WATCH" title="No-Hitter / Perfect Game Watch"/>{noHit.map((x,i)=><div key={i} className="v4-nohit"><span>👀</span><div><h2>{x.pitching.abbr} NO-HIT WATCH</h2><p>{x.batter.abbr} still has 0 hits through the current game state.{x.perfect?' Perfect-game conditions may still be alive based on tracked hits/errors.':''}</p></div></div>)}</section>}
      {clutchActive&&<section className="card v4-clutch-card"><div className="v4-clutch-badge">CLUTCH PLAY</div><div><strong>{currentGame.latestPlay}</strong><p>{liveProb.leverage} leverage · game-state swing moment</p></div></section>}
      {achievementAlerts.length>0&&<section className="card"><SectionTitle kicker="PLAYER ALERTS" title="Something Special Is Happening"/><div className="v4-alert-grid">{achievementAlerts.map((a,i)=><div key={i}><span>{a.icon}</span><strong>{a.player.name}</strong><small>{a.label}</small></div>)}</div></section>}
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="NEWS ANCHOR PICKS" title="Pregame Desk"/>{anchorPicks.length?anchorPicks.map(p=><div className="v4-anchor" key={p.name}><div className="v4-avatar">{p.name.split(' ').map(x=>x[0]).join('')}</div><div><strong>{p.name}</strong><p>Picks <b>{p.pick.abbr}</b> · {p.reason}</p></div></div>):<Empty>Set a matchup to get analyst picks.</Empty>}</div><div className="card"><SectionTitle kicker="FAN POLL" title={fanPolls[0]?.question||'Waiting for league data'}/>{fanPolls[0]&&<>{fanPolls[0].options.map(o=><div className="v4-poll-row" key={o.team.id}><TeamChip team={o.team}/><div><i style={{width:`${o.pct}%`}}/></div><strong>{o.pct}%</strong></div>)}<small>{fanPolls[0].votes.toLocaleString()} simulated SMB Network fan votes</small></>}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="MANUAL COMMENTARY" title="Broadcast Booth" action={controlsUnlocked?<button onClick={addCommentary}>Add Commentary</button>:null}/>{(extras.commentary||[]).slice(0,8).map(x=><blockquote key={x.id}>“{x.text}” <small>{x.date}</small></blockquote>)}</div><div className="card"><SectionTitle kicker="TOP PLAY FEED" title="Highlights Desk" action={controlsUnlocked?<button onClick={addTopPlay}>Mark Top Play</button>:null}/>{(extras.topPlays||[]).slice(0,8).map(x=><div className="v4-list-row" key={x.id}><div><strong>{x.title}</strong><small>{x.note}</small></div><span>{x.teamAbbr} · {x.date}</span></div>)}</div></div>
      <section className="card"><SectionTitle kicker="BEST GAMES" title="Instant Classics" action={controlsUnlocked?<div className="inline-buttons"><button onClick={addClassic}>Add Simulated Classic</button><button onClick={addEndGameNote}>Note Latest Game</button></div>:null}/><div className="v4-classics">{bestGames.slice(0,12).map((g,i)=><div key={g.id||g.createdAt||i} className={g.excitement.score>=85?'classic':''}><b>#{i+1}</b><div><strong>{g.manual?g.title:`${g.away?.abbr||'AWY'} ${g.awayScore} – ${g.home?.abbr||'HME'} ${g.homeScore}`}</strong><small>{g.gameNote||g.note||g.excitement.reasons.join(' · ')}</small></div><span>{g.excitement.score}<small>{g.excitement.label}</small></span></div>)}</div></section>
      {(isPlayoff||isChampionship)&&<section className="card v4-intro-package"><div className="v4-kicker">{isChampionship?'WORLD SERIES INTRO':'PLAYOFF INTRO'}</div><h1>{isChampionship?'THE FINAL STAGE':'OCTOBER STARTS HERE'}</h1><div className="v4-broadcast-match"><TeamChip team={teams.find(t=>t.id===currentGame.awayTeamId)}/><strong>VS</strong><TeamChip team={teams.find(t=>t.id===currentGame.homeTeamId)}/></div><p>{currentRivalry?`${currentRivalry.games} recorded head-to-head games · ${currentRivalry.postseasonGames} postseason meetings`:'A new postseason chapter begins.'}</p></section>}
    </div>}

    {tab==='season'&&<div className="v4-stack">
      <section className={`card v4-season-package ${isOpening?'opening-day':''} ${midseason?'midseason':''}`}><SectionTitle kicker={isOpening?'OPENING DAY PACKAGE':midseason?'GAME 20 / ALL-STAR BREAK':'SEASON PACKAGE'} title={activeSeason} detail={isOpening?'Bunting, defending-champion energy and a clean slate.':midseason?'Halfway point reached — time for the midseason report.':'The season package changes as the year moves.'}/><div className="v4-bunting">{Array.from({length:13},(_,i)=><i key={i}/>)}</div><div className="v4-season-summary"><div><span>Average Games</span><strong>{avgGames.toFixed(1)}</strong></div><div><span>Leader</span><strong>{metrics[0]?.team?.abbr||'—'}</strong></div><div><span>Team of Week</span><strong>{teamWeek?.team?.abbr||'—'}</strong></div><div><span>Status</span><strong>{seasonComplete?'Complete':midseason?'Midseason':isOpening?'Opening':'In Progress'}</strong></div></div></section>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="MIDSEASON REPORT" title={midseason?'Report Card Is Live':'Unlocks Around Game 20'}/>{metrics.slice(0,8).map((m,i)=><div className="v4-list-row" key={m.team.id}><strong>#{i+1} {m.team.abbr}</strong><span>{m.team.wins}-{m.team.losses} · {rd(m.team.runDiff)} · Momentum {Math.round(m.momentum)}</span></div>)}</div><div className="card"><SectionTitle kicker="END-OF-SEASON" title={seasonComplete?'Final Report Ready':'Season In Progress'}/>{grades.slice(0,10).map(g=><div className="v4-grade-row" key={g.team.id}><TeamChip team={g.team}/><strong>{g.grade}</strong><span>{g.delta>=0?'+':''}{(g.delta*100).toFixed(1)} pts vs franchise baseline</span></div>)}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="FRANCHISE TRAJECTORY" title="Who Is Rising?"/>{grades.slice(0,12).map(g=><div className="v4-list-row" key={g.team.id}><TeamChip team={g.team}/><span>{g.delta>=.05?'📈 Rising':g.delta<=-.05?'📉 Falling':'➡ Stable'} · baseline {pct(g.baseline)} → current {pct(g.pct)}</span></div>)}</div><div className="card"><SectionTitle kicker="TEAM NICKNAMES" title="The League Gives You a Reputation"/>{nicknames.slice(0,12).map(n=><div className="v4-list-row" key={n.team.id}><TeamChip team={n.team}/><span><b>{n.nickname}</b> · {n.personality.title}</span></div>)}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="LEAGUE CALENDAR" title="Dates That Matter" action={controlsUnlocked?<button onClick={addCalendar}>Add Event</button>:null}/>{(extras.leagueCalendar||[]).map(x=><div className="v4-list-row" key={x.id}><strong>{x.date||'TBD'}</strong><span>{x.title} · {x.note}</span></div>)}</div><div className="card"><SectionTitle kicker="STORYLINE TRACKER" title="Threads To Follow" action={controlsUnlocked?<button onClick={addStoryline}>Add Storyline</button>:null}/>{(extras.storylines||[]).map(x=><div className="v4-storyline" key={x.id}><Pill tone="live">{x.status}</Pill><strong>{x.title}</strong><p>{x.note}</p></div>)}</div></div>
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="BRACKET PREDICTIONS" title="Before October Knows" action={controlsUnlocked?<button onClick={addBracketPrediction}>Add Prediction</button>:null}/>{(extras.bracketPredictions||[]).map(x=><div className="v4-prediction" key={x.id}><strong>🏆 {x.champion}</strong><span>AL {x.al||'—'} · NL {x.nl||'—'}</span><p>{x.note}</p></div>)}</div><div className="card"><SectionTitle kicker="SEASON INTRO" title="Presentation Mode"/><div className="v4-season-intro"><span>⚾</span><div><small>WELCOME TO</small><h2>{activeSeason.toUpperCase()}</h2><p>{extras.seasonTagline||'Every team starts at zero. Every story starts now.'}</p></div></div></div></div>
    </div>}

    {tab==='players'&&<div className="v4-stack">
      <section className="card"><SectionTitle kicker="PLAYER CARDS" title="Career Card Wall"/><div className="v4-player-card-grid">{careers.slice(0,30).map(p=>{const team=teams.find(t=>t.id===p.teamId);const c=getTeamColorsByAbbr(team?.abbr);return <div className="v4-player-card" key={p.id} style={{'--pc-main':c.main,'--pc-border':c.border}}><div className="v4-player-card-top"><span>#{p.number||'—'}</span><TeamChip team={team}/></div><h3>{p.name}</h3><div><span>AVG <b>{p.careerAB?pct(p.careerAvg):'.000'}</b></span><span>H <b>{p.careerHits}</b></span><span>HR <b>{p.careerHR}</b></span><span>W-L <b>{p.careerPitchingWins}-{p.careerPitchingLosses}</b></span></div></div>})}</div></section>
      {ceremony&&<section className="card v4-ceremony-stage"><button className="v4-ceremony-close" onClick={()=>setCeremonyId('')}>Close Ceremony</button><div className="v4-ceremony-number">{ceremony.title}</div><div className="v4-kicker">{ceremony.teamAbbr} RETIREMENT CEREMONY</div><h1>{ceremony.name}</h1><p>{ceremony.note}</p><strong>FOREVER IN THE RAFTERS</strong></section>}
      <div className="v4-grid-2"><div className="card"><SectionTitle kicker="HALL OF FAME BALLOT" title="The Ballot Box" action={controlsUnlocked?<button onClick={addHofCandidate}>Add Candidate</button>:null}/>{(extras.hofBallot||[]).map(c=><div className="v4-hof-ballot" key={c.id}><div><strong>{c.name}</strong><span>{c.teamAbbr}</span><p>{c.case}</p></div><div><b>{c.votes} vote{c.votes===1?'':'s'}</b>{controlsUnlocked&&<><button onClick={()=>voteHof(c.id)}>Vote</button><button onClick={()=>inductCandidate(c)}>Induct</button></>}</div></div>)}</div><div className="card"><SectionTitle kicker="RETIREMENT CEREMONY MODE" title="Numbers In The Rafters"/>{(extras.retiredNumbers||[]).map(x=><div className="v4-retirement" key={x.id}><div className="v4-retired-number">{x.title}</div><div><small>{x.teamAbbr}</small><h2>{x.name}</h2><p>{x.note}</p>{controlsUnlocked&&<button onClick={()=>setCeremonyId(x.id)}>Launch Ceremony</button>}</div></div>)}{!(extras.retiredNumbers||[]).length&&<Empty>Retire a number from League Operations and its ceremony card will appear here.</Empty>}</div></div>
      <section className="card"><SectionTitle kicker="SPECIAL ACHIEVEMENTS" title="Cycle · Multi-HR · Four-Hit Game · Milestones"/><p className="muted">Live player counters and the play log automatically surface 4-hit games, multi-HR games and cycles when the tracked data supports them. Manual achievements can preserve simulated-game feats too.</p><div className="v4-alert-grid">{achievementAlerts.map((a,i)=><div key={i}><span>{a.icon}</span><strong>{a.player.name}</strong><small>{a.label}</small></div>)}{!achievementAlerts.length&&<Empty>No live special achievement alert right now.</Empty>}</div></section>
      <section className="card"><SectionTitle kicker="FRANCHISE MILESTONE TIMELINES" title="From First October To First Trophy"/><div className="v4-timeline">{firstMilestones.slice().reverse().map((x,i)=><div key={i}><i/><small>{x.season}</small><strong>{x.team?.abbr||'TBD'} · {x.type}</strong></div>)}</div></section>
    </div>}
  </div>;
}
