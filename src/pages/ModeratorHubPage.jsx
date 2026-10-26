import React,{useMemo,useState} from 'react';
import LivePage from './LivePage';
import QuickPage from './QuickPage';
import DailyPage from './DailyPage';
import BracketAdminPage from './BracketAdminPage';
import AdminPage from './AdminPage';
import SeasonCalendar from '../components/SeasonCalendar';
import { GAME_NIGHT_BANK,autoFillGameNights,autoGameNightFor,getScheduledGameNight } from '../utils/gameNightUtils';
import { autoFiveGameWeeks,calendarSummary,normalizeSeasonCalendar,parseCompactSchedule,toggleCalendarGameDay } from '../utils/seasonCalendarUtils';
import { CEREMONY_TYPES,buildCeremonyTimeline,seedOpeningCeremonies } from '../utils/ceremonyUtils';
import { buildHeadToHead } from '../utils/historyUtils';

const TABS=[['live','Game Operations'],['quick','Quick Results'],['daily','Daily Results'],['bracket','Bracket Control'],['admin','League Admin'],['calendar','Season & Calendar'],['history','History & Records'],['world','Media & World']];

export default function ModeratorHubPage({ctx}){
  const {data,teams,setData,syncLeagueExtrasToFirebase}=ctx;
  const [tab,setTab]=useState('live');
  const [gameNumber,setGameNumber]=useState(1);
  const [scheduleText,setScheduleText]=useState('');
  const extras=data.leagueExtras||{};
  const selected=getScheduledGameNight(data,gameNumber);
  const summary=calendarSummary(data);
  const ceremonies=useMemo(()=>buildCeremonyTimeline(data,teams),[data,teams]);
  const rivalries=useMemo(()=>buildHeadToHead(data.games||[],teams,data.seasonHistory||[]),[data.games,data.seasonHistory,teams]);
  const saveExtras=next=>{setData(p=>({...p,leagueExtras:next}));syncLeagueExtrasToFirebase?.(next)};
  const savePatch=patch=>saveExtras({...extras,...patch});
  const saveNight=(n,promo)=>{const next={...extras,gameNightSchedule:{...(extras.gameNightSchedule||{})}};if(promo)next.gameNightSchedule[String(n)]={...promo,gameNumber:Number(n),source:promo.source||'manual'};else delete next.gameNightSchedule[String(n)];saveExtras(next)};
  const surprise=()=>saveNight(gameNumber,autoGameNightFor(data,teams,gameNumber));
  const autoFill=()=>saveExtras({...extras,gameNightSchedule:autoFillGameNights(data,teams)});
  const toggleSlot=slotIndex=>{const before=normalizeSeasonCalendar(data)[slotIndex];const nextCal=toggleCalendarGameDay(data,slotIndex);savePatch({seasonCalendar:nextCal});if(before)setGameNumber(before);else{const assigned=nextCal[slotIndex];if(assigned)setGameNumber(assigned)}};
  const autoLayout=()=>savePatch({seasonCalendar:autoFiveGameWeeks()});
  const clearCalendar=()=>{if(window.confirm('Clear all 40 Game Day placements? Promotions and matchup order will stay saved.'))savePatch({seasonCalendar:[]})};
  const importSchedule=()=>{const parsed=parseCompactSchedule(scheduleText);if(!parsed.length)return window.alert('Paste at least one matchup first. Example: a LAD, SD, a COL');savePatch({seasonSchedule:parsed});setScheduleText('');};
  const seedCeremonies=()=>{const seeded=seedOpeningCeremonies(data,teams);if(!seeded.length)return window.alert('Archive a completed season first so the League Office knows who won the leagues and World Series.');const existing=(extras.ceremonies||[]).filter(c=>c.seasonName!==(data.activeSeasonName||'Season 4'));savePatch({ceremonies:[...seeded,...existing]})};
  const addCeremony=()=>{const type=window.prompt(`Ceremony type:\n${CEREMONY_TYPES.map(x=>x.id).join(', ')}`,'anniversary');if(!type)return;const teamAbbr=(window.prompt('Team abbreviation:','')||'').toUpperCase();const team=teams.find(t=>t.abbr===teamAbbr);const title=window.prompt('Ceremony title:',CEREMONY_TYPES.find(x=>x.id===type)?.name||'Special Ceremony');if(!title)return;const c={id:crypto.randomUUID(),type,teamId:team?.id||'',teamAbbr,title,detail:window.prompt('Ceremony details:','')||'',gameNumber:Number(window.prompt('Attach to game number:','1'))||1,status:'scheduled',seasonName:data.activeSeasonName||'Season 4',createdAt:new Date().toISOString()};savePatch({ceremonies:[c,...(extras.ceremonies||[])]})};
  const removeCeremony=id=>savePatch({ceremonies:(extras.ceremonies||[]).filter(c=>c.id!==id)});

  const addItem=(key,item)=>saveExtras({...extras,[key]:[{id:crypto.randomUUID(),createdAt:new Date().toISOString(),...item},...(extras[key]||[])]});
  const addHistory=()=>{const title=window.prompt('Historical event title:');if(!title)return;addItem('manualEvents',{date:window.prompt('Date / season:','')||'',teamAbbr:window.prompt('Team abbreviation (optional):','')||'',title,note:window.prompt('What happened?','')||''})};
  const addRecord=()=>{const title=window.prompt('Custom league record:');if(!title)return;addItem('customRecords',{title,holder:window.prompt('Record holder:','')||'',value:window.prompt('Record value:','')||'',note:window.prompt('Context / season:','')||''})};
  const addAchievement=()=>{const teamAbbr=window.prompt('Team abbreviation:');if(!teamAbbr)return;addItem('achievements',{teamAbbr,title:window.prompt('Achievement title:','')||'',note:window.prompt('Why they earned it:','')||''})};
  const addStoryline=()=>{const title=window.prompt('Storyline headline:');if(!title)return;addItem('storylines',{title,status:'Active',note:window.prompt('Storyline details:','')||''})};
  const addCommentary=()=>{const text=window.prompt('Manual commentary:');if(!text)return;addItem('commentary',{text,date:new Date().toLocaleString()})};
  const addWorldMoment=()=>{const title=window.prompt('World moment headline:');if(!title)return;addItem('worldMoments',{type:window.prompt('Type (CROWD / MERCH / CULTURE / EVENT):','CULTURE')||'CULTURE',icon:window.prompt('Emoji/icon:','✨')||'✨',title,detail:window.prompt('What happened?','')||''})};
  const setBrand=()=>{const name=window.prompt('Official league name:',extras.officialLeagueName||'Super Mega Baseball League');if(!name)return;const abbr=window.prompt('League abbreviation:',extras.officialLeagueAbbr||'SMBL');saveExtras({...extras,officialLeagueName:name,officialLeagueAbbr:abbr||'SMBL'})};
  const nameRivalry=()=>{const a=(window.prompt('First team abbreviation:','')||'').toUpperCase();if(!a)return;const b=(window.prompt('Second team abbreviation:','')||'').toUpperCase();if(!b)return;const ta=teams.find(t=>t.abbr===a),tb=teams.find(t=>t.abbr===b);if(!ta||!tb)return window.alert('Both abbreviations must match teams in the league.');const defaultName=`${a}–${b} Series`;const name=window.prompt('Rivalry name:',defaultName);if(!name)return;const key=[ta.id,tb.id].sort().join('-');savePatch({rivalryNames:{...(extras.rivalryNames||{}),[key]:name}})};

  return <div className="league-office-page">
    <section className="card league-office-hero"><div><span>AUTHORIZED PERSONNEL</span><h1>League Office</h1><p>Game operations, season administration, ceremonies, promotions, history and the living-world controls all live here now.</p></div><b>COMMISSIONER MODE</b></section>
    <div className="league-office-tabs">{TABS.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
    {tab==='live'&&<LivePage ctx={ctx}/>} {tab==='quick'&&<QuickPage ctx={ctx}/>} {tab==='daily'&&<DailyPage ctx={ctx}/>} {tab==='bracket'&&<BracketAdminPage ctx={ctx}/>} {tab==='admin'&&<AdminPage ctx={ctx}/>} 

    {tab==='calendar'&&<div className="office-calendar-stack">
      <section className="card office-schedule-import office-schedule-first"><div className="fan-kicker">STEP 1 · MATCHUP ORDER</div><h2>Add the 40-Game Schedule First</h2><p>Paste your Giants schedule here. One matchup per line or comma. <b>a LAD</b> = @ LAD; <b>SD</b> = vs SD. After importing, Step 2 is simply clicking the calendar days where those games happen.</p><div className="office-anchor-row"><label>Calendar club <input value={extras.calendarAnchorTeamAbbr||'SF'} maxLength="4" onChange={e=>savePatch({calendarAnchorTeamAbbr:e.target.value.toUpperCase()})}/></label><small>Only this team's completed games advance the highlighted calendar day. Other streamed games stay on the same day.</small></div><textarea rows="7" value={scheduleText} onChange={e=>setScheduleText(e.target.value)} placeholder={'a LAD\nSD\na COL\nARI'}/><div className="inline-buttons"><button onClick={importSchedule}>Import Matchups</button><button className="ghost" onClick={()=>savePatch({seasonSchedule:[]})}>Clear Matchups</button></div><div className="office-schedule-preview">{(extras.seasonSchedule||[]).length?(extras.seasonSchedule||[]).map(x=><button type="button" key={x.gameNumber} onClick={()=>setGameNumber(Number(x.gameNumber))} className={Number(gameNumber)===Number(x.gameNumber)?'active':''}><small>G{x.gameNumber}</small><b>{x.location==='away'?'@':'vs'} {x.opponentAbbr||'TBD'}</b></button>):<span>No matchups imported yet.</span>}</div><small>{(extras.seasonSchedule||[]).length}/40 matchup slots populated</small></section>

      <section className="card league-office-calendar"><div className="office-section-head"><div><span>STEP 2 · PLACE GAME DAYS</span><h2>8-Week Schedule Builder</h2><p>Click any Mon–Sun slot to make it a Game Day. Your imported matchups fill those dates in order from Game 1 through Game 40.</p></div><div><label>Season starts Monday <input type="date" value={extras.seasonStartMonday||''} onChange={e=>savePatch({seasonStartMonday:e.target.value})}/></label><button onClick={autoLayout}>✨ Auto 5/Week</button><button className="ghost" onClick={clearCalendar}>Clear Dates</button></div></div>
        <SeasonCalendar data={data} teams={teams} editable onToggle={toggleSlot} selectedGameNumber={gameNumber}/>
      </section>

      <div className="office-calendar-grid">
        <section className="card office-promotion-editor"><div className="fan-kicker">STEP 3 · PROMOTIONS</div><h2>Game {gameNumber} Theme Night</h2><div className="office-promo-actions"><button onClick={surprise}>🎲 Surprise Me</button><button onClick={autoFill}>✨ Auto-Fill Promotions</button>{selected&&<button className="ghost" onClick={()=>saveNight(gameNumber,null)}>Clear Game {gameNumber}</button>}</div><div className="fan-promo-picker compact">{GAME_NIGHT_BANK.map(p=><button key={p.id} className={selected?.id===p.id?'active':''} onClick={()=>saveNight(gameNumber,{...p,source:'manual'})}><span>{p.icon}</span><b>{p.name}</b><small>{p.giveaway}</small></button>)}</div></section>
      </div>

      <section className="card office-ceremony-editor"><div className="office-section-head"><div><span>CEREMONIES & TRADITIONS</span><h2>Opening Week, Honors & Legacy Nights</h2><p>Seed the prior champions automatically, or schedule any ceremony on a specific game.</p></div><div><button onClick={seedCeremonies}>💍 Seed Opening Ceremonies</button><button onClick={addCeremony}>Add Ceremony</button></div></div><div className="office-ceremony-list">{ceremonies.length?ceremonies.map(c=><article key={c.id}><span>{c.type==='championship-opening'?'💍🏆🎏':CEREMONY_TYPES.find(x=>x.id===c.type)?.icon||'✨'}</span><div><small>GAME {c.gameNumber||'—'} · {c.teamAbbr||'LEAGUE'}</small><strong>{c.title}</strong><p>{c.detail}</p></div><button className="ghost" onClick={()=>removeCeremony(c.id)}>Remove</button></article>):<p className="muted">No ceremonies scheduled yet. Seed the previous champions for Opening Week.</p>}</div></section>
      <div className="office-calendar-summary"><b>{summary.scheduled}/40</b><span>Game Days placed</span><b>{Object.keys(extras.gameNightSchedule||{}).length}</b><span>Promotions scheduled</span><b>{ceremonies.length}</b><span>Ceremonies scheduled</span></div>
    </div>}

    {tab==='history'&&<section className="card league-office-world"><div className="office-section-head"><div><span>HISTORY & RECORDS</span><h2>Permanent League Memory</h2><p>Add the simulated/classic moments the automatic game history cannot know.</p></div><div><button onClick={addHistory}>Add History Event</button><button onClick={addRecord}>Add Custom Record</button><button onClick={addAchievement}>Add Achievement</button></div></div><div className="office-world-grid"><div><span>Manual Events</span><strong>{(extras.manualEvents||[]).length}</strong><small>league/franchise moments</small></div><div><span>Custom Records</span><strong>{(extras.customRecords||[]).length}</strong><small>manual record-book entries</small></div><div><span>Achievements</span><strong>{(extras.achievements||[]).length}</strong><small>franchise cabinet honors</small></div><div><span>Classic Games</span><strong>{(extras.manualClassics||[]).length}</strong><small>simulated classics saved</small></div></div></section>}
    {tab==='world'&&<section className="card league-office-world"><div className="office-section-head"><div><span>MEDIA & WORLD</span><h2>Living Universe Controls</h2><p>Branding, narratives and presentation controls for the simulated public world.</p></div><div><button onClick={setBrand}>Edit League Identity</button><button onClick={nameRivalry}>Name Rivalry</button><button onClick={addStoryline}>Add Storyline</button><button onClick={addCommentary}>Add Commentary</button><button onClick={addWorldMoment}>Trigger World Moment</button></div></div><div className="office-world-grid"><div><span>Official League</span><strong>{extras.officialLeagueName||'Super Mega Baseball League'}</strong><small>@{extras.officialLeagueAbbr||'SMBL'}</small></div><div><span>Game Days</span><strong>{summary.scheduled}</strong><small>of 40 placed on calendar</small></div><div><span>Storylines</span><strong>{(extras.storylines||[]).length}</strong><small>tracked league narratives</small></div><div><span>World Moments</span><strong>{(extras.worldMoments||[]).length}</strong><small>shared culture events</small></div><div><span>Named Rivalries</span><strong>{Object.keys(extras.rivalryNames||{}).length}</strong><small>{rivalries.length} tracked matchup histories</small></div></div></section>}
  </div>;
}
