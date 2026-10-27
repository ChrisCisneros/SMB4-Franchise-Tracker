import React,{useMemo,useState} from 'react';
import LivePage from './LivePage';
import QuickPage from './QuickPage';
import DailyPage from './DailyPage';
import BracketAdminPage from './BracketAdminPage';
import AdminPage from './AdminPage';
import SeasonCalendar from '../components/SeasonCalendar';
import { GAME_NIGHT_BANK,autoFillGameNights,autoGameNightFor,getScheduledGameNight } from '../utils/gameNightUtils';
import { autoFiveGameWeeks,calendarSummary,currentSeasonDay,normalizeSeasonCalendar,parseCompactSchedule,scheduleEntryLabel,toggleCalendarGameDay } from '../utils/seasonCalendarUtils';
import { CEREMONY_TYPES,buildCeremonyTimeline,seedOpeningCeremonies } from '../utils/ceremonyUtils';
import { buildHeadToHead } from '../utils/historyUtils';
import { buildMilestoneCeremonySuggestions } from '../utils/mediaMemoryUtils';
import { BALLPARK_EVENT_BANK,buildBallparkLife,buildBallparkDirectory,buildAttendanceForecast } from '../utils/ballparkLifeUtils';

const TABS=[['live','Game Operations'],['quick','Quick Results'],['daily','Daily Results'],['bracket','Bracket Control'],['admin','League Admin'],['calendar','Season & Calendar'],['ballpark','Ballpark Life'],['history','History & Records'],['world','Media & World']];

export default function ModeratorHubPage({ctx}){
  const {data,teams,setData,syncLeagueExtrasToFirebase}=ctx;
  const [tab,setTab]=useState('live');
  const [gameNumber,setGameNumber]=useState(1);
  const [scheduleText,setScheduleText]=useState('');
  const [selectedScheduleGame,setSelectedScheduleGame]=useState(null);
  const [scheduleInsertMode,setScheduleInsertMode]=useState('append');
  const [ceremonyTiming,setCeremonyTiming]=useState('PREGAME');
  const extras=data.leagueExtras||{};
  const selected=getScheduledGameNight(data,gameNumber);
  const summary=calendarSummary(data);
  const ceremonies=useMemo(()=>buildCeremonyTimeline(data,teams),[data,teams]);
  const todaySlot=useMemo(()=>currentSeasonDay(data,teams),[data,teams]);
  const todayPromo=todaySlot?.gameNumber?getScheduledGameNight(data,todaySlot.gameNumber):null;
  const rivalries=useMemo(()=>buildHeadToHead(data.games||[],teams,data.seasonHistory||[]),[data.games,data.seasonHistory,teams]);
  const milestoneSuggestions=useMemo(()=>buildMilestoneCeremonySuggestions(data,teams),[data,teams]);
  const ballparkLife=useMemo(()=>buildBallparkLife(data,teams,ctx.playoffPicture||[],Date.now()),[data,teams,ctx.playoffPicture]);
  const ballparkDirectory=useMemo(()=>buildBallparkDirectory(data,teams),[data,teams]);
  const selectedSlot=useMemo(()=>normalizeSeasonCalendar(data).map((x,i)=>({slotIndex:i,gameNumber:Number(x||0)})).find(x=>x.gameNumber===Number(gameNumber)),[data,gameNumber]);
  const selectedSchedule=(extras.seasonSchedule||[]).find(x=>Number(x.gameNumber)===Number(gameNumber));
  const selectedMeta=extras.gameDayMeta?.[String(gameNumber)]||{timeType:'NIGHT'};
  const selectedHomeAbbr=selectedSchedule?.location==='away'?selectedSchedule?.opponentAbbr:(extras.calendarAnchorTeamAbbr||'SF');
  const selectedAwayAbbr=selectedSchedule?.location==='away'?(extras.calendarAnchorTeamAbbr||'SF'):selectedSchedule?.opponentAbbr;
  const selectedHome=teams.find(t=>t.abbr===selectedHomeAbbr);
  const selectedAway=teams.find(t=>t.abbr===selectedAwayAbbr);
  const selectedAttendance=useMemo(()=>buildAttendanceForecast(data,teams,selectedHome?.id,selectedAway?.id,selected,null),[data,teams,selectedHome?.id,selectedAway?.id,selected]);
  const saveExtras=next=>{setData(p=>({...p,leagueExtras:next}));syncLeagueExtrasToFirebase?.(next)};
  const savePatch=patch=>saveExtras({...extras,...patch});
  const saveNight=(n,promo)=>{const next={...extras,gameNightSchedule:{...(extras.gameNightSchedule||{})}};if(promo)next.gameNightSchedule[String(n)]={...promo,gameNumber:Number(n),source:promo.source||'manual'};else delete next.gameNightSchedule[String(n)];saveExtras(next)};
  const surprise=()=>saveNight(gameNumber,autoGameNightFor(data,teams,gameNumber));
  const setGameDayMeta=(patch)=>savePatch({gameDayMeta:{...(extras.gameDayMeta||{}),[String(gameNumber)]:{...(extras.gameDayMeta?.[String(gameNumber)]||{}),...patch}}});
  const autoFill=()=>saveExtras({...extras,gameNightSchedule:autoFillGameNights(data,teams)});
  const toggleSlot=slotIndex=>{const before=normalizeSeasonCalendar(data)[slotIndex];const nextCal=toggleCalendarGameDay(data,slotIndex);savePatch({seasonCalendar:nextCal});if(before)setGameNumber(before);else{const assigned=nextCal[slotIndex];if(assigned)setGameNumber(assigned)}};
  const autoLayout=()=>savePatch({seasonCalendar:autoFiveGameWeeks()});
  const clearCalendar=()=>{if(window.confirm('Clear all 40 Game Day placements? Promotions and matchup order will stay saved.'))savePatch({seasonCalendar:[]})};
  const renumberSchedule=list=>(list||[]).slice(0,40).map((x,i)=>({...x,gameNumber:i+1}));
  const importSchedule=()=>{
    const parsed=parseCompactSchedule(scheduleText).map(({gameNumber,...x})=>x);
    if(!parsed.length)return window.alert('Paste at least one matchup first. Example: a LAD, SD, a COL');
    const current=renumberSchedule(extras.seasonSchedule||[]);
    const room=Math.max(0,40-current.length);
    if(!room)return window.alert('The 40-game schedule is already full. Delete a matchup before adding another.');
    const additions=parsed.slice(0,room);
    let insertIndex=current.length;
    if(selectedScheduleGame&&scheduleInsertMode!=='append'){
      const selectedIndex=Math.max(0,current.findIndex(x=>Number(x.gameNumber)===Number(selectedScheduleGame)));
      insertIndex=scheduleInsertMode==='before'?selectedIndex:selectedIndex+1;
    }
    const next=renumberSchedule([...current.slice(0,insertIndex),...additions,...current.slice(insertIndex)]);
    savePatch({seasonSchedule:next});
    setScheduleText('');
    if(additions.length<parsed.length)window.alert(`Only ${additions.length} matchup${additions.length===1?'':'s'} added because the schedule caps at 40 games.`);
    setSelectedScheduleGame(Math.min(insertIndex+1,next.length)||null);
    setScheduleInsertMode('append');
  };
  const deleteScheduleEntry=gameNo=>{
    const next=renumberSchedule((extras.seasonSchedule||[]).filter(x=>Number(x.gameNumber)!==Number(gameNo)));
    savePatch({seasonSchedule:next});
    setSelectedScheduleGame(null);
    setGameNumber(Math.max(1,Math.min(Number(gameNumber)||1,Math.max(1,next.length))));
  };
  const seedCeremonies=()=>{const seeded=seedOpeningCeremonies(data,teams);if(!seeded.length)return window.alert('Archive a completed season first so the League Office knows who won the leagues and World Series.');const existing=(extras.ceremonies||[]).filter(c=>c.seasonName!==(data.activeSeasonName||'Season 4'));savePatch({ceremonies:[...seeded,...existing]})};
  const addCeremony=()=>{const type=window.prompt(`Ceremony type:\n${CEREMONY_TYPES.map(x=>`${x.id} — ${x.name}`).join('\n')}`,'anniversary');if(!type)return;const teamAbbr=(window.prompt('Team abbreviation:','')||'').toUpperCase();const team=teams.find(t=>t.abbr===teamAbbr);const title=window.prompt('Ceremony title:',CEREMONY_TYPES.find(x=>x.id===type)?.name||'Special Ceremony');if(!title)return;const c={id:crypto.randomUUID(),type,teamId:team?.id||'',teamAbbr,title,detail:window.prompt('Ceremony details:','')||'',gameNumber:Number(gameNumber)||1,timing:ceremonyTiming,status:'scheduled',seasonName:data.activeSeasonName||'Season 4',createdAt:new Date().toISOString()};savePatch({ceremonies:[c,...(extras.ceremonies||[])]})};
  const removeCeremony=id=>savePatch({ceremonies:(extras.ceremonies||[]).filter(c=>c.id!==id)});
  const scheduleMilestone=s=>{const gameNo=Number(window.prompt(`Attach ${s.title} to game number:`,String(todaySlot?.gameNumber||1)))||1;const c={id:crypto.randomUUID(),type:'milestone',teamId:s.team?.id||'',teamAbbr:s.team?.abbr||'',title:s.title,detail:s.detail,gameNumber:gameNo,status:'scheduled',seasonName:data.activeSeasonName||'Season',createdAt:new Date().toISOString()};savePatch({ceremonies:[c,...(extras.ceremonies||[])]})};

  const addItem=(key,item)=>saveExtras({...extras,[key]:[{id:crypto.randomUUID(),createdAt:new Date().toISOString(),...item},...(extras[key]||[])]});
  const addHistory=()=>{const title=window.prompt('Historical event title:');if(!title)return;addItem('manualEvents',{date:window.prompt('Date / season:','')||'',teamAbbr:window.prompt('Team abbreviation (optional):','')||'',title,note:window.prompt('What happened?','')||''})};
  const addRecord=()=>{const title=window.prompt('Custom league record:');if(!title)return;addItem('customRecords',{title,holder:window.prompt('Record holder:','')||'',value:window.prompt('Record value:','')||'',note:window.prompt('Context / season:','')||''})};
  const addAchievement=()=>{const teamAbbr=window.prompt('Team abbreviation:');if(!teamAbbr)return;addItem('achievements',{teamAbbr,title:window.prompt('Achievement title:','')||'',note:window.prompt('Why they earned it:','')||''})};
  const addStoryline=()=>{const title=window.prompt('Storyline headline:');if(!title)return;addItem('storylines',{title,status:'Active',note:window.prompt('Storyline details:','')||''})};
  const addCommentary=()=>{const text=window.prompt('Manual commentary:');if(!text)return;addItem('commentary',{text,date:new Date().toLocaleString()})};
  const addWorldMoment=()=>{const title=window.prompt('World moment headline:');if(!title)return;addItem('worldMoments',{type:window.prompt('Type (CROWD / MERCH / CULTURE / EVENT):','CULTURE')||'CULTURE',icon:window.prompt('Emoji/icon:','✨')||'✨',title,detail:window.prompt('What happened?','')||''})};
  const setBrand=()=>{const name=window.prompt('Official league name:',extras.officialLeagueName||'Super Mega Baseball League');if(!name)return;const abbr=window.prompt('League abbreviation:',extras.officialLeagueAbbr||'SMBL');saveExtras({...extras,officialLeagueName:name,officialLeagueAbbr:abbr||'SMBL'})};
  const addBallparkEvent=()=>{const phase=(window.prompt('Phase (PREGAME / IN-GAME / POSTGAME / OFF-DAY):','PREGAME')||'PREGAME').toUpperCase();const title=window.prompt('Event title:','');if(!title)return;const gameNo=Number(window.prompt('Attach to game number (0 for off-day/general):',String(todaySlot?.gameNumber||0)))||0;addItem('ballparkEvents',{phase,title,icon:window.prompt('Emoji/icon:','✨')||'✨',detail:window.prompt('What happens?','')||'',gameNumber:gameNo})};
  const addBankEvent=(phase,item)=>addItem('ballparkEvents',{phase,icon:item[0],title:item[1],detail:item[2],gameNumber:Number(todaySlot?.gameNumber||0)});
  const removeBallparkEvent=id=>savePatch({ballparkEvents:(extras.ballparkEvents||[]).filter(x=>x.id!==id)});
  const nameRivalry=()=>{const a=(window.prompt('First team abbreviation:','')||'').toUpperCase();if(!a)return;const b=(window.prompt('Second team abbreviation:','')||'').toUpperCase();if(!b)return;const ta=teams.find(t=>t.abbr===a),tb=teams.find(t=>t.abbr===b);if(!ta||!tb)return window.alert('Both abbreviations must match teams in the league.');const defaultName=`${a}–${b} Series`;const name=window.prompt('Rivalry name:',defaultName);if(!name)return;const key=[ta.id,tb.id].sort().join('-');savePatch({rivalryNames:{...(extras.rivalryNames||{}),[key]:name}})};

  return <div className="league-office-page">
    <section className="card league-office-hero"><div><span>AUTHORIZED PERSONNEL</span><h1>League Office</h1><p>Game operations, season administration, ceremonies, promotions, history and the living-world controls all live here now.</p></div><b>COMMISSIONER MODE</b></section>
    <section className="league-office-status-strip"><div><small>CURRENT DAY</small><strong>{todaySlot?.gameNumber?`W${todaySlot.week} ${todaySlot.weekday} · G${todaySlot.gameNumber}`:'Season Complete'}</strong><span>{todaySlot?.gameNumber?scheduleEntryLabel(todaySlot.schedule):'No next regular-season game'}</span></div><div><small>TONIGHT</small><strong>{todayPromo?`${todayPromo.icon||'🎟️'} ${todayPromo.name}`:'Regular Game Day'}</strong><span>{todayPromo?.giveaway||'No special promotion scheduled'}</span></div><div><small>CALENDAR</small><strong>{summary.scheduled}/40</strong><span>{summary.remaining} games still need dates</span></div><div><small>WORLD</small><strong>{(extras.worldMoments||[]).length} moments</strong><span>{ceremonies.length} ceremonies scheduled</span></div></section>
    <div className="league-office-tabs">{TABS.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
    {tab==='live'&&<LivePage ctx={ctx}/>} {tab==='quick'&&<QuickPage ctx={ctx}/>} {tab==='daily'&&<DailyPage ctx={ctx}/>} {tab==='bracket'&&<BracketAdminPage ctx={ctx}/>} {tab==='admin'&&<AdminPage ctx={ctx}/>} 

    {tab==='calendar'&&<div className="office-calendar-stack">
      <section className="card office-schedule-import office-schedule-first"><div className="fan-kicker">STEP 1 · MATCHUP ORDER</div><h2>Add the 40-Game Schedule First</h2><p>Paste your Giants schedule here. One matchup per line or comma. <b>a LAD</b> = @ LAD; <b>SD</b> = vs SD. After importing, Step 2 is simply clicking the calendar days where those games happen.</p><div className="office-anchor-row"><label>Calendar club <input value={extras.calendarAnchorTeamAbbr||'SF'} maxLength="4" onChange={e=>savePatch({calendarAnchorTeamAbbr:e.target.value.toUpperCase()})}/></label><small>Only this team's completed games advance the highlighted calendar day. Other streamed games stay on the same day.</small></div><textarea rows="7" value={scheduleText} onChange={e=>setScheduleText(e.target.value)} placeholder={'a LAD\nSD\na COL\nARI'}/><div className="inline-buttons"><button onClick={importSchedule}>{scheduleInsertMode==='append'?'Add Matchups':scheduleInsertMode==='before'?'Insert Before Selected':'Insert After Selected'}</button><button className={scheduleInsertMode==='append'?'active ghost':'ghost'} onClick={()=>setScheduleInsertMode('append')}>Append</button><button className={scheduleInsertMode==='before'?'active ghost':'ghost'} disabled={!selectedScheduleGame} onClick={()=>setScheduleInsertMode('before')}>Insert Before</button><button className={scheduleInsertMode==='after'?'active ghost':'ghost'} disabled={!selectedScheduleGame} onClick={()=>setScheduleInsertMode('after')}>Insert After</button><button className="ghost" onClick={()=>{if(window.confirm('Clear the entire 40-game matchup list?')){savePatch({seasonSchedule:[]});setSelectedScheduleGame(null)}}}>Clear Matchups</button></div><small>{scheduleInsertMode==='append'?'New matchups will be added after the current list.':`New matchups will be inserted ${scheduleInsertMode} Game ${selectedScheduleGame}.`} Click a matchup below to select it.</small><div className="office-schedule-preview editable">{(extras.seasonSchedule||[]).length?(extras.seasonSchedule||[]).map(x=><div className={`office-schedule-chip ${Number(selectedScheduleGame)===Number(x.gameNumber)?'selected':''}`} key={x.gameNumber}><button type="button" onClick={()=>{setGameNumber(Number(x.gameNumber));setSelectedScheduleGame(Number(x.gameNumber))}} className={Number(gameNumber)===Number(x.gameNumber)?'active':''}><small>G{x.gameNumber}</small><b>{x.location==='away'?'@':'vs'} {x.opponentAbbr||'TBD'}</b></button><button type="button" className="schedule-delete" title={`Delete Game ${x.gameNumber}`} onClick={()=>deleteScheduleEntry(x.gameNumber)}>×</button></div>):<span>No matchups imported yet.</span>}</div><small>{(extras.seasonSchedule||[]).length}/40 matchup slots populated · {Math.max(0,40-(extras.seasonSchedule||[]).length)} open</small></section>

      <section className="card league-office-calendar"><div className="office-section-head"><div><span>STEP 2 · PLACE GAME DAYS</span><h2>8-Week Schedule Builder</h2><p>Click any Mon–Sun slot to make it a Game Day. Your imported matchups fill those dates in order from Game 1 through Game 40.</p></div><div><label>Season starts Monday <input type="date" value={extras.seasonStartMonday||''} onChange={e=>savePatch({seasonStartMonday:e.target.value})}/></label><button onClick={autoLayout}>✨ Auto 5/Week</button><button className="ghost" onClick={clearCalendar}>Clear Dates</button></div></div>
        <SeasonCalendar data={data} teams={teams} editable onToggle={toggleSlot} selectedGameNumber={gameNumber}/>
      </section>

      <section className="card office-game-day-control"><div className="office-section-head"><div><span>GAME DAY CONTROL</span><h2>Edit Any Scheduled Game Without Touching the Calendar</h2><p>Pick the game directly. Calendar clicking is now optional.</p></div></div><div className="office-game-day-controls"><label>Game Day<select value={gameNumber} onChange={e=>setGameNumber(Number(e.target.value))}>{(extras.seasonSchedule||[]).map(x=><option key={x.gameNumber} value={x.gameNumber}>{`G${x.gameNumber} · ${extras.gameDayMeta?.[String(x.gameNumber)]?.timeType||'NIGHT'} · ${x.location==='away'?'@':'vs'} ${x.opponentAbbr||'TBD'}`}</option>)}</select></label><label>First Pitch<select value={selectedMeta.timeType||'NIGHT'} onChange={e=>setGameDayMeta({timeType:e.target.value})}><option>DAY</option><option>AFTERNOON</option><option>TWILIGHT</option><option>NIGHT</option></select></label><div className="office-game-day-readout"><small>FULL EVENT NAME</small><strong>{selected?`${selected.icon||'🎟️'} ${selected.name}`:'Regular Game Day'}</strong><span>{selected?.giveaway||'No promotion selected'}</span></div><div className="office-game-day-readout"><small>BALLPARK</small><strong>{selectedAttendance?.park?.name||'TBD'}</strong><span>{selectedAttendance?`${selectedAttendance.projected.toLocaleString()} projected · ${selectedAttendance.pctFull}% of ${selectedAttendance.park.capacity.toLocaleString()}`:'Set a matchup first'}</span></div></div></section>

      <div className="office-calendar-grid">
        <section className="card office-promotion-editor"><div className="fan-kicker">STEP 3 · PROMOTIONS</div><h2>Game {gameNumber} · {selectedMeta.timeType||'NIGHT'} Theme</h2><div className="office-promo-actions"><button onClick={surprise}>🎲 Surprise Me</button><button onClick={autoFill}>✨ Auto-Fill Promotions</button>{selected&&<button className="ghost" onClick={()=>saveNight(gameNumber,null)}>Clear Game {gameNumber}</button>}</div><div className="fan-promo-picker compact">{GAME_NIGHT_BANK.map(p=><button key={p.id} className={selected?.id===p.id?'active':''} onClick={()=>saveNight(gameNumber,{...p,source:'manual'})}><span>{p.icon}</span><b>{p.name}</b><small>{p.giveaway}</small></button>)}</div></section>
      </div>

      <section className="card office-ceremony-editor"><div className="office-section-head"><div><span>CEREMONIES & TRADITIONS</span><h2>Opening Week, Honors & Legacy Nights</h2><p>Seed the prior champions automatically, schedule any ceremony, or turn a detected milestone into a ballpark event.</p></div><div className="office-ceremony-actions"><label>Timing<select value={ceremonyTiming} onChange={e=>setCeremonyTiming(e.target.value)}><option>PREGAME</option><option>IN-GAME</option><option>POSTGAME</option></select></label><button onClick={seedCeremonies}>💍 Seed Opening Ceremonies</button><button onClick={addCeremony}>Add Ceremony to G{gameNumber}</button></div></div>{milestoneSuggestions.length>0&&<div className="office-milestone-suggestions"><small>MILESTONE SUGGESTIONS</small>{milestoneSuggestions.map((m,i)=><button type="button" key={`${m.team?.id}-${m.title}-${i}`} onClick={()=>scheduleMilestone(m)}><b>{m.team?.abbr}</b><span>{m.title}</span><em>Schedule →</em></button>)}</div>}<div className="office-ceremony-list">{ceremonies.length?ceremonies.map(c=><article key={c.id}><span>{c.type==='championship-opening'?'💍🏆🎏':CEREMONY_TYPES.find(x=>x.id===c.type)?.icon||'✨'}</span><div><small>GAME {c.gameNumber||'—'} · {c.timing||'PREGAME'} · {c.teamAbbr||'LEAGUE'}</small><strong>{c.title}</strong><p>{c.detail}</p></div><button className="ghost" onClick={()=>removeCeremony(c.id)}>Remove</button></article>):<p className="muted">No ceremonies scheduled yet. Seed the previous champions for Opening Week.</p>}</div></section>
      <div className="office-calendar-summary"><b>{summary.scheduled}/40</b><span>Game Days placed</span><b>{Object.keys(extras.gameNightSchedule||{}).length}</b><span>Promotions scheduled</span><b>{ceremonies.length}</b><span>Ceremonies scheduled</span></div>
    </div>}

    {tab==='ballpark'&&<div className="office-calendar-stack">
      <section className="card league-office-world"><div className="office-section-head"><div><span>BALLPARK LIFE DIRECTOR</span><h2>Before, During, After — and Off-Days Too</h2><p>Schedule a specific experience, or let the living-world engine fill the day automatically.</p></div><div><button onClick={addBallparkEvent}>Add Custom Event</button></div></div><div className="office-world-grid"><div><span>Today</span><strong>{ballparkLife.phase}</strong><small>{ballparkLife.label}</small></div><div><span>Scheduled Events</span><strong>{(extras.ballparkEvents||[]).length}</strong><small>manual ballpark moments</small></div><div><span>Game</span><strong>{ballparkLife.gameNumber||'OFF'}</strong><small>{ballparkLife.slot?.schedule?scheduleEntryLabel(ballparkLife.slot.schedule):'standalone day'}</small></div></div></section>
      <section className="card office-ballpark-directory"><div className="fan-kicker">LEAGUE BALLPARK DIRECTORY</div><h2>Every Club Has a Home</h2><div className="office-ballpark-directory-grid">{ballparkDirectory.map(p=><article key={p.team.id}><small>{p.team.abbr}</small><strong>{p.name}</strong><span>Capacity {p.capacity.toLocaleString()}</span><em>{p.atmosphere}</em><p>{p.famousSection} · {p.signatureFood}</p></article>)}</div></section>
      <section className="card office-ballpark-bank"><div className="fan-kicker">QUICK EVENT BANK</div><h2>Drop Something Into Today</h2>{Object.entries(BALLPARK_EVENT_BANK).map(([phase,items])=><div className="office-ballpark-group" key={phase}><strong>{phase.toUpperCase()}</strong><div>{items.slice(0,6).map((item,i)=><button type="button" key={`${phase}-${i}`} onClick={()=>addBankEvent(phase==='pregame'?'PREGAME':phase==='ingame'?'IN-GAME':phase==='postgame'?'POSTGAME':'OFF-DAY',item)}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></button>)}</div></div>)}</section>
      <section className="card office-ceremony-editor"><div className="fan-kicker">SCHEDULED BALLPARK EVENTS</div><h2>Manual Overrides & Special Experiences</h2><div className="office-ceremony-list">{(extras.ballparkEvents||[]).length?(extras.ballparkEvents||[]).map(e=><article key={e.id}><span>{e.icon||'✨'}</span><div><small>{e.phase||'EVENT'} · {e.gameNumber?`GAME ${e.gameNumber}`:'OFF-DAY / GENERAL'}</small><strong>{e.title}</strong><p>{e.detail}</p></div><button className="ghost" onClick={()=>removeBallparkEvent(e.id)}>Remove</button></article>):<p className="muted">Nothing manually scheduled. The automatic Ballpark Life engine will still keep the world moving.</p>}</div></section>
    </div>}

    {tab==='history'&&<section className="card league-office-world"><div className="office-section-head"><div><span>HISTORY & RECORDS</span><h2>Permanent League Memory</h2><p>Add the simulated/classic moments the automatic game history cannot know.</p></div><div><button onClick={addHistory}>Add History Event</button><button onClick={addRecord}>Add Custom Record</button><button onClick={addAchievement}>Add Achievement</button></div></div><div className="office-world-grid"><div><span>Manual Events</span><strong>{(extras.manualEvents||[]).length}</strong><small>league/franchise moments</small></div><div><span>Custom Records</span><strong>{(extras.customRecords||[]).length}</strong><small>manual record-book entries</small></div><div><span>Achievements</span><strong>{(extras.achievements||[]).length}</strong><small>franchise cabinet honors</small></div><div><span>Classic Games</span><strong>{(extras.manualClassics||[]).length}</strong><small>simulated classics saved</small></div></div></section>}
    {tab==='world'&&<section className="card league-office-world"><div className="office-section-head"><div><span>MEDIA & WORLD</span><h2>Living Universe Controls</h2><p>Branding, narratives and presentation controls for the simulated public world.</p></div><div><button onClick={setBrand}>Edit League Identity</button><button onClick={nameRivalry}>Name Rivalry</button><button onClick={addStoryline}>Add Storyline</button><button onClick={addCommentary}>Add Commentary</button><button onClick={addWorldMoment}>Trigger World Moment</button></div></div><div className="office-world-grid"><div><span>Official League</span><strong>{extras.officialLeagueName||'Super Mega Baseball League'}</strong><small>@{extras.officialLeagueAbbr||'SMBL'}</small></div><div><span>Game Days</span><strong>{summary.scheduled}</strong><small>of 40 placed on calendar</small></div><div><span>Storylines</span><strong>{(extras.storylines||[]).length}</strong><small>tracked league narratives</small></div><div><span>World Moments</span><strong>{(extras.worldMoments||[]).length}</strong><small>shared culture events</small></div><div><span>Named Rivalries</span><strong>{Object.keys(extras.rivalryNames||{}).length}</strong><small>{rivalries.length} tracked matchup histories</small></div></div></section>}
  </div>;
}
