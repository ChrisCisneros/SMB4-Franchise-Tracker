import { buildNMLBPowerIndex } from './nmlbUniverseUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);
const hash=s=>[...String(s||'')].reduce((h,c)=>((h*33)^c.charCodeAt(0))>>>0,5381);
const pick=(arr,key)=>arr?.length?arr[hash(key)%arr.length]:null;

export const NMLB_TRADITIONS=[
  {id:'opening',name:'Opening Day',window:'Week 1',tag:'EVERYTHING STARTS HERE',detail:'Bunting, defending-champion recognition, first-pitch ceremony and the first NMLB Network national window.'},
  {id:'rivalry',name:'Rivalry Week',window:'Weeks 3–6',tag:'THIS ONE IS PERSONAL',detail:'Historic matchups receive rivalry packages, fan receipts, rivalry-temperature graphics and special Network debate coverage.'},
  {id:'midseason',name:'Midseason Celebration',window:'Week 4',tag:'HALFWAY, NOT FINISHED',detail:'Power Index review, first-half report cards, magazine issue, fan pulse and second-half predictions.'},
  {id:'pennant',name:'Pennant Race',window:'Weeks 7–8',tag:'EVERY SCORE MATTERS',detail:'Scoreboard watching, clinch math, spoiler coverage and NMLB Network postseason predictions take over the league.'},
  {id:'awards',name:'NMLB Awards Night',window:'After Regular Season',tag:'THE LEAGUE HONORS ITS BEST',detail:'Nominees, reveals, reactions, snubs and permanent award history become a full league event.'},
  {id:'hall',name:'Hall Weekend',window:'Offseason',tag:'THE LEAGUE REMEMBERS',detail:'Inductions, documentaries, old highlights, fan memories and commissioner-curated history share one weekend.'},
  {id:'finale',name:'Fan Appreciation Finale',window:'Week 8',tag:'FOR THE FANS',detail:'Giveaways, Fan Fest energy, fireworks and thank-you celebrations close the regular-season calendar.'},
  {id:'series',name:'NMLB World Series',window:'Postseason',tag:'FOR THE COMMISSIONER’S TROPHY',detail:'Purple, black and championship gold take over the entire league presentation until one club remains.'},
];

export const NMLB_NETWORK_PERSONALITIES=[
  {name:'Mara Vega',role:'Morning Anchor',voice:'calm, sharp, deadline-first',signature:'“Here is what matters before first pitch.”'},
  {name:'Theo Grant',role:'Historian',voice:'context, history, old receipts',signature:'“The league has seen this movie before.”'},
  {name:'Nina Vale',role:'Power Index Analyst',voice:'numbers, movement, skepticism',signature:'“The record is real. The résumé is still under review.”'},
  {name:'Marcus Reed',role:'Former Player',voice:'clubhouse, pressure, postseason instincts',signature:'“October exposes everything.”'},
  {name:'Cole Briggs',role:'Debate Host',voice:'loud, theatrical, permanently unconvinced',signature:'“I am not buying it. Not yet.”'},
  {name:'Jo Santos',role:'Culture Reporter',voice:'fans, cities, parks, traditions',signature:'“Baseball feels different in this city tonight.”'},
  {name:'Vince Calder',role:'Late-Night Host',voice:'receipts, jokes, bad predictions',signature:'“Roll the tape. Somebody said this with confidence.”'},
];

export const NMLB_SEGMENTS=[
  ['The Power Board','Who moved, who fell and who has to prove it tonight.'],
  ['Pressure Meter','The clubs carrying the most pennant-race stress.'],
  ['Fraud Watch','A deliberately obnoxious check on teams whose record may be outrunning the résumé.'],
  ['Receipts','Old predictions meet new reality.'],
  ['One Game That Matters','The single result with the biggest league-wide consequence.'],
  ['History Lesson','A current storyline connected to NMLB history.'],
  ['Around the NMLB','Fast hits from every city, park and fanbase.'],
  ['The Panic Button','A struggling contender gets five minutes of national overreaction.'],
];

export const NMLB_POSTSEASON_SPONSORS=[
  {name:'Crownline Motors',tag:'Official Automotive Partner of the NMLB Postseason'},
  {name:'Northstar Wireless',tag:'Keeping the NMLB Connected'},
  {name:'Grandstand Grill',tag:'Official Ballpark Flavor of October'},
  {name:'Summit Air',tag:'Official Airline of the Road to the World Series'},
  {name:'Diamond State Bank',tag:'Presenting Partner of the NMLB Bracket'},
];

export function seriesBroadcastPackage(seriesId='series'){
  const sponsor=pick(NMLB_POSTSEASON_SPONSORS,seriesId)||NMLB_POSTSEASON_SPONSORS[0];
  const windows=['NMLB NETWORK','NMLB NETWORK · PRIMETIME','NMLB+ · NATIONAL STREAM','NMLB NETWORK · LATE WINDOW'];
  const radio=['NMLB RADIO NETWORK','NMLB AUDIO · NATIONAL CALL','LOCAL RADIO + NMLB AUDIO'];
  return {sponsor,watch:pick(windows,`${seriesId}-watch`),radio:pick(radio,`${seriesId}-radio`)};
}

function leagueCandidates(power,league){
  return power.filter(x=>String(x.team?.league||'').toUpperCase()===league).slice(0,8);
}

export function predictionPhase(data={},teams=[]){
  const avg=teams.length?teams.reduce((s,t)=>s+gp(t),0)/teams.length:0;
  const bracket=data.playoffBracket||{};
  const playoffStarted=Boolean((data.games||[]).some(g=>g?.gameType==='playoff'&&g?.status==='Final') || bracket?.al?.qf1?.awayTeamId || bracket?.nl?.qf1?.awayTeamId || bracket?.finals?.awayTeamId);
  if(playoffStarted)return {id:'locked',label:'PICKS LOCKED',detail:'The postseason has started. Nobody gets to move the goalposts now.',week:8,locked:true};
  if(avg>=35)return {id:'final',label:'FINAL CALLS',detail:'The regular season is closing. Final bracket calls are being filed before the postseason begins.',week:8,locked:false};
  if(avg>=30)return {id:'forecast',label:'PREDICTION SEASON',detail:'Picks are live, the field is taking shape and every result can still move the board.',week:7,locked:false};
  return {id:'preview',label:'TOO EARLY TO LOCK IT IN',detail:'NMLB Network will begin its formal postseason picks when the field is ready.',week:Math.max(1,Math.ceil(avg/5)),locked:false};
}

export function buildNMLBPostseasonPredictions(data={},teams=[],playoffPicture=[]){
  const stored=data.leagueExtras?.nmlbLockedPredictions;
  if(stored?.analysts?.length)return {...stored,phase:{id:'locked',label:'PICKS LOCKED',detail:'These were the official NMLB Network calls when the postseason began.',locked:true}};
  const power=buildNMLBPowerIndex(data,teams,playoffPicture);
  const al=leagueCandidates(power,'AL');
  const nl=leagueCandidates(power,'NL');
  const all=[...power];
  const analysts=NMLB_NETWORK_PERSONALITIES.slice(0,6).map((person,i)=>{
    const alPick=al[Math.min(al.length-1,(i*2+hash(person.name))%Math.max(1,Math.min(4,al.length)))]?.team||al[0]?.team||null;
    const nlPick=nl[Math.min(nl.length-1,(i+hash(`${person.name}-nl`))%Math.max(1,Math.min(4,nl.length)))]?.team||nl[0]?.team||null;
    const finalists=[alPick,nlPick].filter(Boolean);
    const champ=finalists.length?finalists.sort((a,b)=>(power.find(x=>x.team.id===b.id)?.score||0)-(power.find(x=>x.team.id===a.id)?.score||0))[i%finalists.length]:all[i%Math.max(1,all.length)]?.team||null;
    return {name:person.name,role:person.role,al:alPick?.abbr||'TBD',nl:nlPick?.abbr||'TBD',champion:champ?.abbr||'TBD',note:i===0?'Power Index favorite':i===1?'October experience pick':i===2?'Upset-minded bracket':i===3?'Best current form':i===4?'Ballpark and pressure pick':'The chaos bracket'};
  });
  const championCounts=analysts.reduce((m,a)=>(m[a.champion]=(m[a.champion]||0)+1,m),{});
  const consensus=Object.entries(championCounts).sort((a,b)=>b[1]-a[1])[0];
  const phase=predictionPhase(data,teams);
  return {season:data.activeSeasonName||'Current Season',createdAt:new Date().toISOString(),phase,analysts,consensus:consensus?{abbr:consensus[0],votes:consensus[1]}:null,powerTop:power.slice(0,5).map(x=>({abbr:x.team.abbr,score:x.score,rank:x.rank}))};
}

export function predictionSnapshot(predictions){
  if(!predictions)return null;
  return {season:predictions.season,lockedAt:new Date().toISOString(),analysts:predictions.analysts||[],consensus:predictions.consensus||null,powerTop:predictions.powerTop||[]};
}

export function buildNMLBCulture(data={},teams=[],playoffPicture=[]){
  const phase=predictionPhase(data,teams);
  const avg=teams.length?teams.reduce((s,t)=>s+gp(t),0)/teams.length:0;
  const activeTraditions=NMLB_TRADITIONS.filter(t=>
    (t.id==='opening'&&avg<=5)||(t.id==='midseason'&&avg>=18&&avg<=22)||(t.id==='pennant'&&avg>=30)||(t.id==='finale'&&avg>=35)||(t.id==='series'&&phase.locked)
  );
  return {traditions:NMLB_TRADITIONS,activeTraditions,personalities:NMLB_NETWORK_PERSONALITIES,segments:NMLB_SEGMENTS,predictions:buildNMLBPostseasonPredictions(data,teams,playoffPicture),week:Math.max(1,Math.min(8,Math.ceil(avg/5)||1))};
}
