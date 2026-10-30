import { buildFanUniverse, getSeasonPulse } from './fandomUtils';
import { buildFanClubs, buildFanTraditions } from './livingWorldUtils';
import { buildSeasonScrapbook, buildFanbaseGrudges, buildHotColdBoard } from './mediaMemoryUtils';
import { currentSeasonDay } from './seasonCalendarUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);
const pct=t=>gp(t)?n(t.wins)/gp(t):0;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const hash=(s='')=>[...String(s)].reduce((h,c)=>((h*33)^c.charCodeAt(0))>>>0,5381);
const pick=(arr,key='')=>arr?.length?arr[hash(key)%arr.length]:'';

const OUTLETS=[
  {id:'diamond-desk',name:'Diamond Desk',type:'National TV',tone:'measured',bias:'Big games, playoff races and context',credibility:88,heat:46},
  {id:'extra-innings',name:'Extra Innings AM',type:'Morning Radio',tone:'chaotic',bias:'Streaks, callers and overreactions',credibility:67,heat:84},
  {id:'long-read',name:'The Long Read',type:'Magazine',tone:'thoughtful',bias:'History, culture and franchise identity',credibility:93,heat:24},
  {id:'night-cap',name:'The Night Cap',type:'Late Show',tone:'snarky',bias:'Receipts, rivalries and internet nonsense',credibility:61,heat:91},
  {id:'numbers-room',name:'The Numbers Room',type:'Analytics Desk',tone:'dry',bias:'Run differential, pace and probability',credibility:90,heat:18},
  {id:'ballpark-live',name:'Ballpark Live',type:'Pregame / Postgame',tone:'local',bias:'Crowds, tickets, traditions and atmosphere',credibility:76,heat:58},
];

const BROADCASTERS=[
  {name:'Ray Maddox',role:'Play-by-play',style:'Big voice, bigger moments',trait:'Can make a routine double sound like a civic event.'},
  {name:'Nina Vale',role:'Analyst',style:'Calm and surgical',trait:'Loves context, hates lazy narratives.'},
  {name:'Tommy Lane',role:'Radio host',style:'Restless chaos',trait:'Has never met a two-game streak he could not overreact to.'},
  {name:'Renee Park',role:'Feature reporter',style:'Story-first',trait:'Finds the weird human detail everybody else missed.'},
  {name:'Maya Cruz',role:'Studio anchor',style:'Sharp and skeptical',trait:'Keeps receipts and reads them on air.'},
];

export function buildMediaOutlets(data={},teams=[],playoffPicture=[]){
  const {hot,cold}=buildHotColdBoard(teams);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const rivalry=universe.rivalries?.[0];
  return OUTLETS.map((o,i)=>{
    const subject=i%3===0&&hot[0]?`${hot[0].abbr} ${hot[0].streak}`:i%3===1&&rivalry?`${rivalry.teamA?.abbr}/${rivalry.teamB?.abbr}`:cold[0]?`${cold[0].abbr} ${cold[0].streak}`:'the shape of the season';
    const stance=pick([
      `Buying the noise around ${subject}.`,
      `Still wants more evidence on ${subject}.`,
      `Thinks everybody is talking about ${subject} for the wrong reason.`,
      `Has made ${subject} tonight's lead segment.`
    ],`${o.id}-${subject}-${getSeasonPulse(data,teams).week}`);
    return {...o,stance};
  });
}

export function buildBroadcastBooth(data={},teams=[]){
  const pulse=getSeasonPulse(data,teams);
  return BROADCASTERS.map((b,i)=>({...b,onAir:i<3,assignment:i===0?`${pulse.phase} lead booth`:i===1?'National analyst desk':i===2?'League call-in show':'Features'}));
}

export function buildTopicLifecycles(data={},teams=[],playoffPicture=[]){
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const {hot,cold}=buildHotColdBoard(teams);
  const slot=currentSeasonDay(data,teams);
  const raw=[];
  if(hot[0])raw.push({topic:`${hot[0].abbr} ${hot[0].streak}`,weight:78+n(String(hot[0].streak).slice(1))*3,source:'streak'});
  if(cold[0])raw.push({topic:`${cold[0].abbr} skid`,weight:65+n(String(cold[0].streak).slice(1))*4,source:'streak'});
  if(universe.rivalries?.[0])raw.push({topic:`${universe.rivalries[0].teamA?.abbr}/${universe.rivalries[0].teamB?.abbr} rivalry`,weight:55+n(universe.rivalries[0].heat)*.4,source:'rivalry'});
  if(slot?.promo)raw.push({topic:slot.promo.name,weight:64+n(slot.promo.hype)*3,source:'event'});
  if(slot?.gameNumber)raw.push({topic:`Game ${slot.gameNumber} tonight`,weight:58,source:'schedule'});
  (data.leagueExtras?.worldMoments||[]).slice(-3).forEach((m,i)=>raw.push({topic:m.title||'League moment',weight:70-i*8,source:'world'}));
  return raw.slice(0,7).map((x,i)=>{
    const age=(hash(`${x.topic}-${getSeasonPulse(data,teams).week}`)%5);
    const score=clamp(Math.round(x.weight-age*7));
    const stage=score>=82?'TRENDING':score>=66?'EMERGING':score>=48?'SATURATED':score>=30?'FADING':'DORMANT';
    const fatigue=stage==='SATURATED'?'Media fatigue rising':stage==='FADING'?'Cooling unless something new happens':stage==='TRENDING'?'Owning the baseball conversation':'Still building';
    return {...x,score,stage,fatigue};
  });
}

export function buildPredictionReceipts(data={},teams=[]){
  const sorted=[...teams].sort((a,b)=>pct(b)-pct(a)||n(b.runDiff)-n(a.runDiff));
  const receipts=[];
  sorted.slice(0,3).forEach((t,i)=>{
    const seed=hash(`${t.id}-${data.activeSeasonName||'season'}`);
    const oldTake=pick(['“Not convinced yet.”','“Probably a middle-of-the-pack club.”','“The run differential will come back to earth.”','“Circle back in two weeks.”'],seed);
    receipts.push({team:t,verdict:'AGING BADLY',oldTake,now:`Now: ${t.wins}-${t.losses}${t.streak?` · ${t.streak}`:''}`,score:85-i*8});
  });
  sorted.slice(-2).reverse().forEach((t,i)=>receipts.push({team:t,verdict:'RECEIPT PENDING',oldTake:pick(['“Sneaky contender.”','“This club could surprise people.”','“The ceiling is higher than people think.”'],`${t.id}-cold`),now:`Now: ${t.wins}-${t.losses}${t.streak?` · ${t.streak}`:''}`,score:58-i*7}));
  return receipts;
}

export function buildFanRelationships(data={},teams=[],playoffPicture=[]){
  const clubs=buildFanClubs(data,teams,playoffPicture);
  const grudges=buildFanbaseGrudges(data,teams);
  const out=[];
  clubs.slice(0,18).forEach((club,i)=>{
    const other=clubs[(i+3)%Math.max(1,clubs.length)];
    if(!other||other.id===club.id)return;
    const same=club.team?.id===other.team?.id;
    const grudge=grudges.find(g=>[g.teamAId,g.teamBId].includes(club.team?.id)&&[g.teamAId,g.teamBId].includes(other.team?.id));
    const relation=same?pick(['FRIENDS','REPLY GUYS','GROUP CHAT','MUTUALS'],club.id):grudge?.intensity>=60?pick(['BEEF','MUTED','BLOCKED-ish','RECEIPTS'],`${club.id}-${other.id}`):pick(['RIVALS','BANTER','SIDE-EYE'],`${club.id}-${other.id}`);
    out.push({a:club,b:other,relation,heat:clamp((grudge?.intensity||28)+(same?-18:8)+(hash(club.id)%19))});
  });
  return out.slice(0,12);
}

export function buildFranchiseReputations(data={},teams=[]){
  const history=data.seasonHistory||[];
  return teams.map(team=>{
    const archived=history.map(s=>(s.teams||[]).find(t=>t.id===team.id||t.abbr===team.abbr)).filter(Boolean);
    const titles=history.filter(s=>s.championId===team.id||s.championAbbr===team.abbr).length;
    const playoffYears=archived.filter(x=>x.playoffSeed||x.madePlayoffs||x.playoffResult).length;
    const currentPct=pct(team);
    const labels=[];
    if(titles>=2)labels.push('DYNASTY DNA'); else if(titles===1)labels.push('CHAMPIONSHIP PEDIGREE');
    if(playoffYears>=2)labels.push('OCTOBER REGULAR');
    if(currentPct>=.65)labels.push('CURRENT POWER');
    if(String(team.streak||'').startsWith('W')&&n(String(team.streak).slice(1))>=4)labels.push('HEAT CHECK');
    if(String(team.streak||'').startsWith('L')&&n(String(team.streak).slice(1))>=4)labels.push('SNAKEBITTEN');
    if(!labels.length)labels.push(pick(['CHAOS CLUB','SLEEPING GIANT','CULT FAVORITE','UNDERDOG ENERGY','WILD CARD'],team.id));
    return {team,labels:labels.slice(0,3),score:clamp(Math.round(currentPct*55+titles*18+playoffYears*5+n(team.runDiff)*.15+20)),era:titles>=2?'CONTENDER ERA':currentPct>=.6?'RISING ERA':currentPct<.4?'SEARCHING ERA':'OPEN ERA'};
  }).sort((a,b)=>b.score-a.score);
}

export function buildStadiumFolklore(data={},teams=[]){
  const games=(data.games||[]).filter(g=>g.status==='Final');
  return teams.map(team=>{
    const home=games.filter(g=>g.homeTeamId===team.id);
    const walkoffs=home.filter(g=>g.walkoff).length;
    const extras=home.filter(g=>n(g.inning||g.innings)>9).length;
    const lore=[
      pick(['Section 112 refuses to sit during rallies.','The third-base concourse has become the unofficial meetup spot.','Fans insist the upper deck gets louder in close games.','The home radio booth swears the park has a late-inning echo.'],`${team.id}-lore`),
      walkoffs?`${walkoffs} tracked walk-off${walkoffs===1?' has':'s have'} added to the building mythology.`:'The first true walk-off legend is still waiting to be written.',
      extras?`${extras} extra-inning home game${extras===1?'':'s'} already live in fan memory.`:'No extra-inning ghost stories yet.'
    ];
    return {team,lore,legend:pick(['Lucky Gate','Rally Row','The Loud Corner','Orange Hour','The Long Walk','The No-Jinx Stairwell'],team.id),superstition:pick(['Nobody says “easy win” after the sixth.','The same entrance gets used during win streaks.','Fans blame seat changes for broken rallies.','A certain concession order is considered good luck.'],`${team.id}-super`)};
  });
}

export function buildTeamTraditionFiles(data={},teams=[],playoffPicture=[]){
  const existing=buildFanTraditions(data,teams,playoffPicture);
  return teams.map(team=>{
    const base=existing.find(x=>x.team?.id===team.id);
    return {team,chant:base?.chant||pick([`LET'S GO ${team.abbr}!`,`${team.abbr}! ${team.abbr}!`,`${team.city?.toUpperCase()||team.abbr} BASEBALL!`],team.id),ritual:base?.ritual||pick(['Fans stand until the first hit.','A late-inning clap builds from the outfield.','Regulars refuse to leave during a rally inning.','The concourse empties when the tying run reaches base.'],`${team.id}-ritual`),postWin:pick(['Victory posts flood the fan district before the final graphic clears.','The same victory meme returns after every home win.','Fans linger online for one more round of highlights.'],`${team.id}-win`)};
  });
}

export function buildOffDayWorld(data={},teams=[],playoffPicture=[]){
  const slot=currentSeasonDay(data,teams);
  const pulse=getSeasonPulse(data,teams);
  const reps=buildFranchiseReputations(data,teams);
  const {hot,cold}=buildHotColdBoard(teams);
  const isOff=!slot?.gameNumber;
  const items=[
    {icon:'🎙️',title:'Radio arguments continue',detail:hot[0]?`${hot[0].abbr} ${hot[0].streak} is carrying the morning shows.`:'The morning shows are ranking contenders again.'},
    {icon:'🧢',title:'Merch and collector watch',detail:'Fans are comparing drops, giveaways and resale prices while the field is quiet.'},
    {icon:'📚',title:'Archive hour',detail:`${reps[0]?.team?.abbr||'League'} history is getting pulled back into the conversation.`},
    {icon:'⚔️',title:'Rivalry discourse never sleeps',detail:'Old clips, receipts and grudges are doing the work tonight.'},
    {icon:'📈',title:'Tomorrow starts now',detail:cold[0]?`${cold[0].abbr} gets the “response game” treatment next time out.`:`Week ${pulse.week} storylines are already shifting.`},
  ];
  return {isOff,label:isOff?'OFF-DAY MODE':'BETWEEN PITCHES',items};
}

export function buildDefiningMoments(data={},teams=[]){
  const scrapbook=buildSeasonScrapbook(data,teams);
  const recentGames=(data.games||[]).filter(g=>g?.status==='Final');
  const ageById=new Map(recentGames.map((g,i)=>[`game-${g.id}`,i]));
  return scrapbook.map(x=>{
    const age=ageById.has(x.id)?ageById.get(x.id):0;
    const base=n(x.score)+((x.detail||'').includes('WALK-OFF')?25:0)+((x.detail||'').includes('POSTSEASON')?30:0);
    // The archive keeps the true magnitude, while the newsroom ranking cools after a few games.
    const freshnessPenalty=x.kind==='GAME'?Math.max(0,age-2)*11:0;
    const importance=clamp(Math.round(base-freshnessPenalty));
    return {...x,importance,archiveImportance:clamp(Math.round(base)),ageGames:age};
  }).sort((a,b)=>b.importance-a.importance||b.archiveImportance-a.archiveImportance).slice(0,12).map((x,i)=>({...x,tier:x.archiveImportance>=90?'LEGENDARY':x.archiveImportance>=70?'CLASSIC':x.archiveImportance>=50?'MEMORABLE':'NOTEWORTHY',rank:i+1}));
}

export function buildLeagueMainCharacter(data={},teams=[],playoffPicture=[]){
  const topics=buildTopicLifecycles(data,teams,playoffPicture);
  const reps=buildFranchiseReputations(data,teams);
  const top=topics[0];
  return {label:'MAIN CHARACTER OF THE DAY',title:top?.topic||`${reps[0]?.team?.abbr||'The league'} has the floor`,detail:top?.fatigue||'The conversation is still deciding what matters most.',heat:top?.score||reps[0]?.score||50};
}
