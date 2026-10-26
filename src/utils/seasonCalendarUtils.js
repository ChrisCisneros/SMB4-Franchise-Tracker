export const WEEKDAYS=['MON','TUE','WED','THU','FRI','SAT','SUN'];
export const SEASON_WEEKS=8;
export const SEASON_SLOTS=SEASON_WEEKS*7;
export const SEASON_GAMES=40;

const safe=n=>Number(n||0);
const dateOnly=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))?String(s):'';
const addDays=(iso,days)=>{if(!dateOnly(iso))return '';const [y,m,d]=iso.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d+days));return dt.toISOString().slice(0,10)};
const fmtDate=iso=>{if(!dateOnly(iso))return '';const [y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)))};


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
export function normalizeSeasonCalendar(data={}){
  const raw=data.leagueExtras?.seasonCalendar;
  const out=emptySeasonCalendar();
  if(Array.isArray(raw)) raw.slice(0,SEASON_SLOTS).forEach((v,i)=>{const n=safe(typeof v==='object'?v?.gameNumber:v);if(n>=1&&n<=SEASON_GAMES)out[i]=n});
  else if(raw&&typeof raw==='object') Object.entries(raw).forEach(([k,v])=>{const idx=safe(k);const n=safe(typeof v==='object'?v?.gameNumber:v);if(idx>=0&&idx<SEASON_SLOTS&&n>=1&&n<=SEASON_GAMES)out[idx]=n});
  return out;
}
export function scheduledGameCount(data={}){return normalizeSeasonCalendar(data).filter(Boolean).length}
export function nextUnscheduledGame(data={}){const used=new Set(normalizeSeasonCalendar(data).filter(Boolean));for(let n=1;n<=SEASON_GAMES;n++)if(!used.has(n))return n;return null}
export function resequenceSeasonCalendar(calendar=[]){
  let game=1;
  return Array.from({length:SEASON_SLOTS},(_,i)=>calendar[i]?game++:null).map(n=>n<=SEASON_GAMES?n:null);
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
  // Five games each week, varied rest days so the calendar looks organic.
  const patterns=[[0,1,3,4,5],[0,2,3,5,6],[1,2,3,4,6],[0,1,2,4,5],[1,2,4,5,6],[0,2,3,4,6],[0,1,3,5,6],[1,2,3,5,6]];
  patterns.forEach((days,w)=>days.forEach(day=>{if(game<=SEASON_GAMES)out[w*7+day]=game++}));
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
    const week=Math.floor(slotIndex/7)+1,dayIndex=slotIndex%7,gameNumber=calendar[slotIndex];
    const schedule=gameNumber?getScheduleEntry(data,gameNumber):null; const promo=gameNumber?promoMap[String(gameNumber)]||null:null; const result=gameNumber?resultByNumber.get(gameNumber)||null:null;
    const date=start?addDays(start,slotIndex):'';
    return {slotIndex,week,dayIndex,weekday:WEEKDAYS[dayIndex],date,dateLabel:fmtDate(date),gameNumber,schedule,promo,result};
  });
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
export function calendarSummary(data={}){const cal=normalizeSeasonCalendar(data);return {scheduled:cal.filter(Boolean).length,remaining:SEASON_GAMES-cal.filter(Boolean).length,openDays:SEASON_SLOTS-cal.filter(Boolean).length}}
