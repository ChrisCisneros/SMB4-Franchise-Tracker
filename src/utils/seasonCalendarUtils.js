export const WEEKDAYS=['MON','TUE','WED','THU','FRI','SAT','SUN'];
export const SEASON_WEEKS=8;
export const SEASON_SLOTS=SEASON_WEEKS*7;
export const SEASON_GAMES=40;
export const LEAGUE_MONTH_DAYS=28;
export const LEAGUE_MONTHS=2;

const safe=n=>Number(n||0);
const dateOnly=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))?String(s):'';
const addDays=(iso,days)=>{if(!dateOnly(iso))return '';const [y,m,d]=iso.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d+days));return dt.toISOString().slice(0,10)};
const fmtDate=iso=>{if(!dateOnly(iso))return '';const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)))};

export function leagueDayMeta(slotIndex=0){
  const index=Math.max(0,Math.min(SEASON_SLOTS-1,Number(slotIndex)||0));
  const dayNumber=index+1;
  const month=Math.floor(index/LEAGUE_MONTH_DAYS)+1;
  const dayOfMonth=(index%LEAGUE_MONTH_DAYS)+1;
  return {slotIndex:index,dayNumber,month,dayOfMonth,label:`MONTH ${month} · DAY ${dayOfMonth}`};
}


export function getCalendarAnchorTeam(data={},teams=[]){
  const abbr=String(data.leagueExtras?.calendarAnchorTeamAbbr||'SF').toUpperCase();
  const pool=teams?.length?teams:(data.teams||[]);
  return pool.find(t=>String(t?.abbr||'').toUpperCase()===abbr)||pool.find(t=>String(t?.city||'').toLowerCase().includes('san francisco'))||null;
}
export function isCalendarAnchorGame(game={},data={},teams=[]){
  const anchor=getCalendarAnchorTeam(data,teams);
  if(!anchor)return false;
  return game?.homeTeamId===anchor.id||game?.awayTeamId===anchor.id;
}
export function anchorRegularFinals(data={},teams=[]){
  return (data.games||[]).filter(g=>g?.status==='Final'&&(g.gameType||'regular')!=='playoff'&&(g.seasonName||data.activeSeasonName)===(data.activeSeasonName||g.seasonName)&&isCalendarAnchorGame(g,data,teams));
}

export function emptySeasonCalendar(){return Array.from({length:SEASON_SLOTS},()=>null)};
export function calendarNumbers(value){
  if(value&&typeof value==='object'&&Array.isArray(value.gameNumbers))return value.gameNumbers.map(Number).filter(n=>n>=1&&n<=SEASON_GAMES);
  if(value&&typeof value==='object'&&value.gameNumber)return [Number(value.gameNumber)].filter(n=>n>=1&&n<=SEASON_GAMES);
  const n=Number(value||0); return n>=1&&n<=SEASON_GAMES?[n]:[];
}
export function normalizeSeasonCalendar(data={}){
  const raw=data.leagueExtras?.seasonCalendar;
  const out=emptySeasonCalendar();
  if(Array.isArray(raw)) raw.slice(0,SEASON_SLOTS).forEach((v,i)=>{const nums=calendarNumbers(v);if(nums.length)out[i]=nums.length>1?{gameNumbers:nums}:nums[0]});
  else if(raw&&typeof raw==='object') Object.entries(raw).forEach(([k,v])=>{const idx=safe(k);const nums=calendarNumbers(v);if(idx>=0&&idx<SEASON_SLOTS&&nums.length)out[idx]=nums.length>1?{gameNumbers:nums}:nums[0]});
  return out;
}
export function scheduledGameCount(data={}){return normalizeSeasonCalendar(data).reduce((sum,cell)=>sum+calendarNumbers(cell).length,0)}
export function nextUnscheduledGame(data={}){const used=new Set(normalizeSeasonCalendar(data).flatMap(calendarNumbers));for(let n=1;n<=SEASON_GAMES;n++)if(!used.has(n))return n;return null}
export function resequenceSeasonCalendar(calendar=[]){
  let game=1;
  return Array.from({length:SEASON_SLOTS},(_,i)=>{const count=calendarNumbers(calendar[i]).length;if(!count)return null;const nums=Array.from({length:count},()=>game++).filter(n=>n<=SEASON_GAMES);return nums.length>1?{gameNumbers:nums}:nums[0]||null});
}
export function toggleCalendarGameDay(data={},slotIndex){
  const calendar=normalizeSeasonCalendar(data); const idx=Number(slotIndex);
  if(idx<0||idx>=SEASON_SLOTS)return calendar;
  if(calendar[idx])calendar[idx]=null;
  else if(calendar.filter(Boolean).length<SEASON_GAMES)calendar[idx]=1;
  // Game numbers always follow chronological calendar order. Moving/removing a date
  // automatically resequences every later game so the 40-game schedule order stays intact.
  return resequenceSeasonCalendar(calendar);
}
export function autoFiveGameWeeks(){
  const out=emptySeasonCalendar(); let game=1;
  // V6.7 uses calendar weeks with varied density and two true doubleheaders.
  // Thirty-eight occupied dates plus two doubleheader dates still produce 40 games.
  const patterns=[[0,2,4,6],[0,1,3,4,6],[0,1,2,4,5],[1,2,4,6],[0,1,3,4,5],[0,2,3,4,5],[0,1,3,5,6],[1,2,3,5,6]];
  const doubleDays=new Set(['2-4','6-2']);
  patterns.forEach((days,w)=>days.forEach(day=>{if(game<=SEASON_GAMES){const count=doubleDays.has(`${w+1}-${day}`)?2:1;out[w*7+day]=count===2?{gameNumbers:[game,game+1]}:game;game+=count;}}));
  return out;
}
export function getScheduleEntry(data={},gameNumber){
  const entry=(data.leagueExtras?.seasonSchedule||[]).find(x=>safe(x?.gameNumber)===safe(gameNumber));
  return entry||null;
}
export function parseCompactSchedule(text=''){
  const tokens=String(text).split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
  return tokens.slice(0,SEASON_GAMES).map((token,i)=>{
    const lower=token.toLowerCase().replace(/\s+/g,' ').trim();
    const away=/^(a |@)/.test(lower); const abbr=lower.replace(/^(a |@)/,'').trim().toUpperCase();
    return {gameNumber:i+1,opponentAbbr:abbr,location:away?'away':'home',raw:token};
  });
}
export function scheduleEntryLabel(entry){if(!entry)return 'Matchup TBD';return `${entry.location==='away'?'@':'vs'} ${entry.opponentAbbr||'TBD'}`}
export function buildSeasonCalendar(data={},teams=[]){
  const calendar=normalizeSeasonCalendar(data); const start=data.leagueExtras?.seasonStartMonday||'';
  const promoMap=data.leagueExtras?.gameNightSchedule||{};
  const dayEventMap=data.leagueExtras?.dayEventSchedule||{};
  const regularFinals=anchorRegularFinals(data,teams);
  const resultByNumber=new Map();
  // The franchise calendar follows the anchor club's own season sequence, not the
  // total order of every streamed league game. This also repairs older games that
  // may have inherited a global seasonGameNumber in pre-4.13 builds.
  [...regularFinals]
    .sort((a,b)=>(Date.parse(a.finalizedAt||a.date||'')||0)-(Date.parse(b.finalizedAt||b.date||'')||0))
    .slice(0,SEASON_GAMES)
    .forEach((g,i)=>resultByNumber.set(i+1,g));
  return Array.from({length:SEASON_SLOTS},(_,slotIndex)=>{
    const week=Math.floor(slotIndex/7)+1,dayIndex=slotIndex%7,gameNumbers=calendarNumbers(calendar[slotIndex]),gameNumber=gameNumbers[0]||null,extraGameNumbers=gameNumbers.slice(1);
    const schedule=gameNumber?getScheduleEntry(data,gameNumber):null; const promo=gameNumber?promoMap[String(gameNumber)]||null:null; const result=gameNumber?resultByNumber.get(gameNumber)||null:null;
    const date=start?addDays(start,slotIndex):'';
    const leagueDay=leagueDayMeta(slotIndex);
    const dayEvent=dayEventMap[String(slotIndex)]||null;
    return {slotIndex,week,dayIndex,weekday:WEEKDAYS[dayIndex],date,dateLabel:fmtDate(date),gameNumber,gameNumbers,extraGameNumbers,schedule,extraSchedules:extraGameNumbers.map(n=>getScheduleEntry(data,n)),promo,promoEntries:gameNumbers.map(n=>promoMap[String(n)]||null).filter(Boolean),result,extraResults:extraGameNumbers.map(n=>resultByNumber.get(n)||null),dayEvent,...leagueDay};
  });
}
export function inferredLeagueDayIndex(data={},teams=[]){
  const slots=buildSeasonCalendar(data,teams);
  const rawValue=data.leagueExtras?.seasonDayIndex;
  const raw=Number(rawValue);
  if(rawValue!==null&&rawValue!==undefined&&rawValue!==''&&Number.isInteger(raw)&&raw>=0&&raw<SEASON_SLOTS)return raw;
  const nextGame=slots.find(s=>s.gameNumber&&!s.result);
  if(nextGame)return nextGame.slotIndex;
  const latestFinal=[...slots].reverse().find(s=>s.result);
  return latestFinal?Math.min(SEASON_SLOTS-1,latestFinal.slotIndex+1):0;
}
export function currentLeagueDay(data={},teams=[]){
  const slots=buildSeasonCalendar(data,teams);
  return slots[inferredLeagueDayIndex(data,teams)]||slots[0]||null;
}
export function canAdvanceLeagueDay(data={},teams=[]){
  const day=currentLeagueDay(data,teams);
  if(!day||day.slotIndex>=SEASON_SLOTS-1)return false;
  if(day.gameNumber&&!day.result)return false;
  return true;
}
export function nextLeagueDayIndex(data={},teams=[]){
  const day=currentLeagueDay(data,teams);
  if(!day)return 0;
  return Math.min(SEASON_SLOTS-1,day.slotIndex+1);
}

export function currentSeasonDay(data={},teams=[]){
  const slots=buildSeasonCalendar(data,teams);
  const finals=anchorRegularFinals(data,teams);
  const completed=Math.min(SEASON_GAMES,finals.length);
  if(completed>=SEASON_GAMES)return null;
  const nextGame=completed+1;
  return slots.find(s=>s.gameNumber===nextGame)||slots.find(s=>s.gameNumber&&!s.result)||null;
}
export function currentSeasonSlotIndex(data={},teams=[]){
  return currentSeasonDay(data,teams)?.slotIndex ?? null;
}
export function currentLeagueSlotIndex(data={},teams=[]){
  return currentLeagueDay(data,teams)?.slotIndex ?? null;
}
export function calendarSummary(data={}){const cal=normalizeSeasonCalendar(data);const scheduled=cal.reduce((sum,cell)=>sum+calendarNumbers(cell).length,0);return {scheduled,remaining:SEASON_GAMES-scheduled,openDays:SEASON_SLOTS-cal.filter(Boolean).length,doubleheaders:cal.filter(cell=>calendarNumbers(cell).length>1).length}}
