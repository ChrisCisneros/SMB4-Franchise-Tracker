import { buildV4TeamMetrics, personalityForMetric } from './v4Utils';
import { buildHeadToHead } from './historyUtils';

const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const gp=(t)=>Number(t?.wins||0)+Number(t?.losses||0);
const pct=(t)=>gp(t)?Number(t.wins||0)/gp(t):.5;
const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const seeded=(s)=>{const x=Math.sin(hash(s))*10000;return x-Math.floor(x)};

export function getSeasonPulse(data={},teams=[]){
  const gameCounts=teams.map(gp).filter(Number.isFinite);
  const avg=gameCounts.length?gameCounts.reduce((a,b)=>a+b,0)/gameCounts.length:0;
  const day=Math.max(1,Math.min(40,Math.floor(avg)+1));
  const week=Math.max(1,Math.min(8,Math.ceil(day/5)));
  const dayInWeek=((day-1)%5)+1;
  const completed=Math.max(0,Math.min(40,Math.floor(avg)));
  const allStar=completed>=20&&completed<21;
  const phase=completed===0?'OPENING DAY':completed<10?'FIRST IMPRESSIONS':completed<20?'CONTENDERS & PRETENDERS':completed===20?'ALL-STAR BREAK':completed<30?'SECOND-HALF PUSH':completed<36?'PLAYOFF PRESSURE':completed<40?'PENNANT RACE':'REGULAR SEASON COMPLETE';
  return {avgGames:avg,completed,day,week,dayInWeek,allStar,phase,progress:completed/40};
}

function priorSeasonTeam(history,teamId){
  const latest=[...(history||[])].sort((a,b)=>(Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0))[0];
  return latest?.teams?.find(t=>t.id===teamId)||null;
}

export function buildFanUniverse(data={},teams=[],playoffPicture=[]){
  const metrics=buildV4TeamMetrics(data,teams,playoffPicture);
  const history=data.seasonHistory||[];
  const games=(data.games||[]).filter(g=>g?.status==='Final');
  const h2h=buildHeadToHead(games,teams,history);
  const teamStates=metrics.map(m=>{
    const prior=priorSeasonTeam(history,m.team.id);
    const expected=prior&&Number(prior.wins||0)+Number(prior.losses||0)?Number(prior.wins||0)/(Number(prior.wins||0)+Number(prior.losses||0)):.5;
    const actual=pct(m.team);
    const performance=(actual-expected)*160;
    const historyRow=history.reduce((acc,s)=>{const b=s.playoffBracket||{}; const champ=(s.championTeamId===m.team.id)||(b.finals?.winnerTeamId===m.team.id); return {titles:acc.titles+(champ?1:0),playoffs:acc.playoffs+((s.playoffBracket&&JSON.stringify(s.playoffBracket).includes(m.team.id))?1:0)};},{titles:0,playoffs:0});
    const hype=clamp(35+(actual-.5)*90+Number(m.team.runDiff||0)*.55+(m.momentum-50)*.45+historyRow.titles*8);
    const approval=clamp(52+performance+(m.momentum-50)*.4+historyRow.titles*3);
    const bandwagon=clamp(hype*.62+historyRow.titles*7+Math.max(0,Number(m.team.streak?.replace('W','')||0))*3);
    const heat=clamp(hype*.72+historyRow.playoffs*3);
    const mood=approval>=82?'EUPHORIC':approval>=68?'BUZZING':approval>=57?'CONFIDENT':approval>=45?'NERVOUS':approval>=32?'FRUSTRATED':approval>=18?'FURIOUS':'HOPELESS';
    const atmosphere=heat>=82?'ELECTRIC':heat>=68?'PACKED HOUSE':heat>=52?'LOUD':heat>=36?'GOOD CROWD':'QUIET';
    return {...m,expected,actual,hype,approval,bandwagon,marketHeat:heat,mood,atmosphere,personality:personalityForMetric(m),history:historyRow};
  });
  const rivalryRows=h2h.map(r=>{const close=r.games?1-Math.abs(r.teamAWins-r.teamBWins)/r.games:0;const heat=clamp(r.games*7+r.postseasonGames*15+close*20);return {...r,heat,label:heat>=80?'BLOOD FEUD':heat>=60?'HEATED':heat>=40?'RIVALRY':'FAMILIAR FOES'};}).sort((a,b)=>b.heat-a.heat);
  const avgParity=teamStates.length?teamStates.reduce((s,x)=>s+Math.abs(x.actual-.5),0)/teamStates.length:0;
  const leagueMood=avgParity<.08?'ANYBODY CAN WIN':teamStates[0]?.actual>=.72?'CAN ANYONE STOP THEM?':'THE RACE IS ON';
  return {teamStates,rivalries:rivalryRows,leagueMood};
}

export const NETWORK_PERSONALITIES=[
  {id:'maya',name:'Maya Cruz',role:'Numbers Desk',style:'analytics',initials:'MC'},
  {id:'tommy',name:'Tommy Lane',role:'Clubhouse Live',style:'momentum',initials:'TL'},
  {id:'renee',name:'Renee Park',role:'October Watch',style:'history',initials:'RP'},
  {id:'dex',name:'Dex Morgan',role:'Hot Take Line',style:'chaos',initials:'DM'},
];

export function buildAnalystDesk(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const awayId=data.currentGame?.awayTeamId,homeId=data.currentGame?.homeTeamId;
  const away=teamStates.find(x=>x.team.id===awayId),home=teamStates.find(x=>x.team.id===homeId);
  if(!away||!home)return [];
  return NETWORK_PERSONALITIES.map(a=>{
    let av=away.playoffProbability+away.momentum*.35+away.team.runDiff*.12, hv=home.playoffProbability+home.momentum*.35+home.team.runDiff*.12+3;
    if(a.style==='analytics'){av+=away.sos*8;hv+=home.sos*8;}
    if(a.style==='momentum'){av+=away.momentum*.3;hv+=home.momentum*.3;}
    if(a.style==='history'){av+=away.history.titles*4;hv+=home.history.titles*4;}
    if(a.style==='chaos'){av+=(seeded(`${a.id}-${away.team.id}-${Date.now()>>20}`)-.5)*18;hv+=(seeded(`${a.id}-${home.team.id}-${Date.now()>>20}`)-.5)*18;}
    const pick=av>hv?away:home;
    const reason=a.style==='analytics'?'The numbers lean this way.':a.style==='momentum'?'I am riding the hotter club.':a.style==='history'?'Big-game DNA matters to me.':'Baseball is chaos. Give me the fun pick.';
    return {...a,pick:pick.team,reason};
  });
}

export function buildFanPoll(data={},teams=[],playoffPicture=[],now=Date.now()){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const top=[...teamStates].sort((a,b)=>(b.hype+b.playoffProbability)-(a.hype+a.playoffProbability)).slice(0,4);
  const bucket=Math.floor(now/120000);
  const raw=top.map((x,i)=>Math.max(4,x.hype+x.playoffProbability*.6+(seeded(`${bucket}-${x.team.id}-${i}`)-.5)*16));
  const total=raw.reduce((a,b)=>a+b,0)||1;
  let used=0;
  const options=top.map((x,i)=>{let v=i===top.length-1?100-used:Math.round(raw[i]/total*100);used+=v;return {team:x.team,pct:v};});
  const questions=["Who would you trust most in a playoff series?","Who is the team to beat right now?","Which club has the loudest bandwagon?","Who would you least want to face tonight?"];
  return {question:questions[bucket%questions.length],options,votes:1240+Math.floor(seeded(`votes-${bucket}`)*6800),bucket};
}

export function buildSocialChatter(data={},teams=[],playoffPicture=[],now=Date.now()){
  const {teamStates,leagueMood}=buildFanUniverse(data,teams,playoffPicture);
  const top=[...teamStates].sort((a,b)=>b.hype-a.hype).slice(0,3);
  const cold=[...teamStates].sort((a,b)=>a.approval-b.approval)[0];
  const latest=(data.games||[]).find(g=>g?.status==='Final');
  const lines=[];
  top.forEach((x,i)=>lines.push({handle:["@BleacherBobby","@DiamondDiehard","@TheUpperDeck"][i],team:x.team.abbr,text:x.mood==='EUPHORIC'?`${x.team.abbr} fans are starting to talk like the parade route is already booked. 😂`:`${x.team.abbr} is getting VERY hard to ignore right now.`,tone:'up'}));
  if(cold)lines.push({handle:'@PainInThePen',team:cold.team.abbr,text:`Being a ${cold.team.abbr} fan currently builds character. Too much character.`,tone:'down'});
  if(latest){const aw=teams.find(t=>t.id===latest.awayTeamId),hm=teams.find(t=>t.id===latest.homeTeamId);lines.push({handle:'@FinalOut',team:'LEAGUE',text:`Still thinking about ${aw?.abbr||'AWY'} ${latest.awayScore} – ${hm?.abbr||'HME'} ${latest.homeScore}. Baseball, man.`,tone:'neutral'});}
  lines.push({handle:'@SMBFanPulse',team:'LEAGUE',text:`League mood: ${leagueMood}. Nobody is normal about this season anymore.`,tone:'neutral'});
  const bucket=Math.floor(now/90000); return lines.sort((a,b)=>seeded(`${bucket}-${a.handle}`)-seeded(`${bucket}-${b.handle}`));
}

export function buildMerch(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const products=[];
  teamStates.forEach(x=>{
    products.push({id:`${x.team.id}-cap`,team:x.team,type:'CAP',name:`${x.team.abbr} Franchise Cap`,tag:x.marketHeat>=70?'TRENDING':'TEAM STORE'});
    products.push({id:`${x.team.id}-jersey`,team:x.team,type:'JERSEY',name:`${x.team.abbr} Home Jersey`,tag:x.hype>=75?'BEST SELLER':'AUTHENTIC'});
    if(x.team.streak?.startsWith('W')&&Number(x.team.streak.slice(1)||0)>=3)products.push({id:`${x.team.id}-streak`,team:x.team,type:'TEE',name:`${x.team.streak} Heat Check Tee`,tag:'JUST DROPPED'});
    if(x.history.titles)products.push({id:`${x.team.id}-champ`,team:x.team,type:'CHAMPIONS',name:`${x.team.abbr} Championship Legacy Collection`,tag:`${x.history.titles}× CHAMPS`});
  });
  (data.leagueExtras?.retiredNumbers||[]).forEach(x=>{const team=teams.find(t=>t.abbr===x.teamAbbr);if(team)products.push({id:`ret-${x.id}`,team,type:'LEGACY',name:`${x.name} ${x.title} Retirement Collection`,tag:'LEGACY DROP'});});
  return products;
}

export function buildProgramming(pulse,now=new Date()){
  const h=now.getHours();
  const daypart=h<11?'Morning':h<16?'Midday':h<19?'Pregame':'Primetime';
  const shows= daypart==='Morning'?[['First Pitch','Overnight results, standings and fan pulse'],['Numbers Desk','What changed after the latest games']]
    :daypart==='Midday'?[['Diamond Debate','Polls, hot takes and contender arguments'],['Clubhouse Live','Team mood and storylines']]
    :daypart==='Pregame'?[['Pregame Central','Games that matter, picks and rivalry heat'],['The Lineup','What fans are watching tonight']]
    :[['SMB Tonight','Live league stories and GameCast'],['Final Out','Postgame reactions, grades and instant classics']];
  return {daypart,shows,headline:`Week ${pulse.week}, Day ${pulse.dayInWeek} · ${pulse.phase}`};
}

export function weeklyMediaPackage(data={},teams=[],playoffPicture=[]){
  const pulse=getSeasonPulse(data,teams); const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const sorted=[...teamStates].sort((a,b)=>b.momentum-a.momentum);
  return {pulse,teamOfWeek:sorted[0]||null,falling:sorted[sorted.length-1]||null,powerFive:[...teamStates].sort((a,b)=>b.currentRank-a.currentRank).slice(-5).reverse()};
}
