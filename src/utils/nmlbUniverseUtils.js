import { getPlayoffMarker } from './standingsUtils';
import { buildPlayerCareerBoard } from './historyUtils';
import { buildV6LivingLeague } from './v6LivingLeagueUtils';
import { buildLeagueRecords } from './recordsUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);
const pct=t=>gp(t)?n(t.wins)/gp(t):0;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const finalGames=data=>(data.games||[]).filter(g=>g?.status==='Final');
const hash=s=>[...String(s||'')].reduce((h,c)=>((h*33)^c.charCodeAt(0))>>>0,5381);
const pick=(a,k)=>a?.length?a[hash(k)%a.length]:'';
const teamMap=teams=>new Map(teams.map(t=>[t.id,t]));
const streakValue=t=>{const m=String(t?.streak||'').match(/([WL])(\d+)/i);return m?(m[1].toUpperCase()==='W'?1:-1)*n(m[2]):0};
const maxWins=t=>n(t.wins)+Math.max(0,40-gp(t));
const scoreDiff=g=>Math.abs(n(g.awayScore)-n(g.homeScore));

function playoffMarker(team,playoffPicture=[]){
  const p=playoffPicture.find(x=>x.league===team.league);
  const leader=p?.divisionLeaders?.find(x=>x.division===team.division);
  return p?getPlayoffMarker(team,p,leader):'';
}

export function buildNMLBPowerIndex(data={},teams=[],playoffPicture=[]){
  const games=finalGames(data);
  const rows=teams.map(team=>{
    const teamGames=games.filter(g=>g.awayTeamId===team.id||g.homeTeamId===team.id).slice(-8);
    const recentWins=teamGames.filter(g=>g.awayTeamId===team.id?n(g.awayScore)>n(g.homeScore):n(g.homeScore)>n(g.awayScore)).length;
    const recentPct=teamGames.length?recentWins/teamGames.length:pct(team);
    const rdPerGame=gp(team)?n(team.runDiff)/gp(team):0;
    const streak=streakValue(team);
    const marker=playoffMarker(team,playoffPicture);
    const postseasonBoost=marker==='z'?11:marker==='y'?8:marker==='w'?6:marker==='x'?4:marker==='e'?-8:0;
    const score=clamp(Math.round(pct(team)*48+recentPct*24+clamp(50+rdPerGame*11)*.18+clamp(50+streak*7)*.10+postseasonBoost));
    return {team,score,recentPct,rdPerGame,streak,marker,label:score>=86?'ELITE':score>=74?'CONTENDER':score>=62?'DANGEROUS':score>=50?'LIVE':score>=38?'SHAKY':'REBUILDING'};
  }).sort((a,b)=>b.score-a.score||pct(b.team)-pct(a.team));
  return rows.map((x,i)=>({...x,rank:i+1,previousRank:Math.max(1,Math.min(rows.length,i+1+(hash(`${x.team.id}-${gp(x.team)-1}`)%5)-2)),movement:0})).map(x=>({...x,movement:x.previousRank-x.rank}));
}

export function buildRecordChaseDrama(data={},teams=[]){
  const extras=data.leagueExtras||{};
  const records=extras.majorPlayerRecords||[];
  const careers=buildPlayerCareerBoard(data.players||[],data.seasonHistory||[]);
  const defs=[
    {id:'hits',label:'HITS',key:'careerHits',icon:'⚾'},
    {id:'hr',label:'HOME RUNS',key:'careerHR',icon:'💥'},
    {id:'strikeouts',label:'STRIKEOUTS',key:'careerStrikeouts',icon:'K'},
  ];
  const out=[];
  defs.forEach(def=>{
    const rec=records.find(r=>r.stat===def.id); if(!rec)return;
    careers.filter(p=>n(p[def.key])>0).forEach(p=>{
      const current=n(p[def.key]); const remaining=n(rec.value)-current;
      const progress=n(rec.value)?current/n(rec.value):0;
      if(progress<.55)return;
      const team=teams.find(t=>t.id===p.teamId);
      const urgency=remaining<=0?'RECORD BROKEN':remaining<=5?'HISTORY TONIGHT':remaining<=15?'ON THE DOORSTEP':remaining<=50?'CLOSING FAST':'IN THE HUNT';
      out.push({id:`${def.id}-${p.id}`,stat:def.id,label:def.label,icon:def.icon,player:p,team,holder:rec.holder,target:n(rec.value),current,remaining:Math.max(0,remaining),progress:clamp(Math.round(progress*100)),urgency});
    });
  });
  (extras.careerRecordWatches||[]).forEach((w,i)=>out.push({id:`manual-${w.id||i}`,stat:'watch',label:w.title||'CAREER RECORD',icon:'◎',player:{name:w.playerName},team:teams.find(t=>t.abbr===w.teamAbbr),holder:'NMLB RECORD',target:n(w.target),current:n(w.current),remaining:Math.max(0,n(w.target)-n(w.current)),progress:w.target?clamp(Math.round(n(w.current)/n(w.target)*100)):0,urgency:n(w.target)-n(w.current)<=5?'HISTORY TONIGHT':'RECORD WATCH'}));
  return out.sort((a,b)=>a.remaining-b.remaining||b.progress-a.progress).slice(0,10);
}

export function buildNMLBNetwork(data={},teams=[],playoffPicture=[]){
  const power=buildNMLBPowerIndex(data,teams,playoffPicture);
  const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now());
  const leader=power[0]?.team;
  const race=power.find(x=>!['z','y','w','x','e'].includes(x.marker));
  const slots=[
    ['6:00 AM','NMLB First Pitch','Morning headlines, overnight receipts and the day ahead.','Mara Vega · Theo Grant'],
    ['10:00 AM','The Power Board','Power Index movement, fraud alerts and contender checks.','Nina Vale · Marcus Reed'],
    ['1:00 PM','Clubhouse Live','City reports, ballpark life, road trips and fan culture.','Jo Santos · rotating local desks'],
    ['4:00 PM','Diamond Debate','The league argument show. Nobody leaves calm.','Cole Briggs · panel'],
    ['7:00 PM','NMLB Primetime','Pregame desk, scoreboard watch, clinch math and live look-ins.','National booth'],
    ['11:00 PM','The Night Cap','Finals, call-ins, receipts, tomorrow and nonsense.','Vince Calder'],
  ];
  const breaking=v6.aftermath?.[0]?.type==='clinch'?`${v6.aftermath[0].team.abbr} POSTSEASON CLINCH`:v6.aftermath?.[0]?.type==='eliminated'?`${v6.aftermath[0].team.abbr} ELIMINATED`:leader?`${leader.abbr} TOPS THE POWER INDEX`:'THE NMLB DAY IS FORMING';
  return {network:'NMLB NETWORK',breaking,slots,lead:`${leader?.abbr||'NMLB'} owns the top line today`,debate:race?`Is ${race.team.abbr} a real contender or a standings mirage?`:'Who is actually built for October?',v6};
}

export function buildNMLBDocumentaries(data={},teams=[],playoffPicture=[]){
  const map=teamMap(teams); const hist=data.seasonHistory||[]; const games=finalGames(data);
  const docs=[];
  hist.slice(-6).reverse().forEach((s,i)=>{
    const champ=map.get(s.championTeamId)||s.teams?.find(t=>t.id===s.championTeamId);
    if(champ)docs.push({id:`champ-${s.id||i}`,type:'NMLB FILMS',title:`${s.name||`Season ${hist.length-i}`}: ${champ.abbr} Forever`,dek:`The championship run, the pressure points, the celebrations and the moments that became league memory.`,tag:'CHAMPIONSHIP FILM'});
  });
  const wild=[...games].sort((a,b)=>(scoreDiff(a)-scoreDiff(b))||(n(b.inning||b.innings)-n(a.inning||a.innings))).slice(0,3);
  wild.forEach((g,i)=>{const a=map.get(g.awayTeamId),h=map.get(g.homeTeamId);docs.push({id:`game-${g.id||i}`,type:'NMLB FILMS',title:`Inside ${a?.abbr||'AWY'}–${h?.abbr||'HME'}: The Night It Wouldn't End`,dek:`A documentary treatment of ${a?.abbr||'AWY'} ${g.awayScore}, ${h?.abbr||'HME'} ${g.homeScore} and why the league still remembers it.`,tag:'CLASSIC GAME'});});
  const rival=(buildV6LivingLeague(data,teams,playoffPicture,Date.now()).conversations||[])[0];
  if(rival)docs.unshift({id:'rivalry-film',type:'NMLB FILMS',title:`The Rivalry: ${rival.a.team.abbr} vs ${rival.b.team.abbr}`,dek:`History, grudges, fan receipts and the games that made this matchup personal.`,tag:'RIVALRY SERIES'});
  return docs.slice(0,8);
}

export function buildNMLBMagazine(data={},teams=[],playoffPicture=[]){
  const power=buildNMLBPowerIndex(data,teams,playoffPicture); const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now());
  const cover=power[0]?.team; const issue=Math.max(1,Math.round(teams.reduce((s,t)=>s+gp(t),0)/Math.max(1,teams.length)));
  return {issue,cover,coverLine:cover?pick([`${cover.abbr}: THE TEAM TO BEAT`,`WHY ${cover.abbr} WON'T GO AWAY`,`${cover.abbr} AND THE SHAPE OF THE PENNANT RACE`],`${cover.id}-${issue}`):'THE NMLB TAKES SHAPE',secondary:[v6.hottestTopic,`${v6.chaos.label} · CHAOS ${v6.chaos.chaos}`,v6.namedGames?.[0]?.name].filter(Boolean)};
}

export function buildNMLBFrontPages(data={},teams=[],playoffPicture=[]){
  const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now()); const pages=[];
  v6.aftermath?.slice(0,3).forEach((x,i)=>pages.push({id:`aft-${i}`,city:x.team.city||x.team.abbr,masthead:`THE ${x.team.abbr} DAILY`,headline:x.type==='clinch'?'PUNCHED.':'NOT DONE YET.',dek:x.detail||x.label,tone:x.type==='clinch'?'celebrate':'somber'}));
  const game=v6.namedGames?.[0]; if(game)pages.push({id:'classic',city:'NMLB',masthead:'THE DAILY DIAMOND',headline:game.name.toUpperCase(),dek:game.score,tone:'historic'});
  if(!pages.length)pages.push({id:'daily',city:'NMLB',masthead:'THE DAILY DIAMOND',headline:(v6.headline||'THE LEAGUE MOVES').toUpperCase(),dek:v6.hottestTopic||v6.leagueMood,tone:'daily'});
  return pages;
}

export function buildNMLBBusiness(data={},teams=[],playoffPicture=[]){
  const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now());
  const power=buildNMLBPowerIndex(data,teams,playoffPicture);
  const rows=teams.map((team,i)=>{
    const state=v6.moods.find(x=>x.team.id===team.id); const p=power.find(x=>x.team.id===team.id);
    const attendance=Math.round(15000+clamp(p?.score||50)*260+clamp(state?.hope||50)*95+(playoffMarker(team,playoffPicture)?3800:0)+(hash(team.id)%2700));
    const capacity=39000+(hash(`${team.id}-cap`)%9000); const sellPct=clamp(Math.round(attendance/capacity*100),0,100);
    const merch=Math.round(1200+(p?.score||50)*44+(state?.hope||50)*17+Math.max(0,streakValue(team))*310+(playoffMarker(team,playoffPicture)?2600:0));
    const growth=Math.round((p?.score||50)-50+streakValue(team)*4+(hash(`${team.id}-${gp(team)}`)%15)-7);
    return {team,attendance:Math.min(capacity,attendance),capacity,sellPct,merch,growth,market:merch>6200?'WHITE HOT':merch>4500?'SURGING':merch>3000?'HEALTHY':merch>1900?'STEADY':'COOL'};
  }).sort((a,b)=>b.merch-a.merch);
  const totalAttendance=rows.reduce((s,x)=>s+x.attendance,0); const totalMerch=rows.reduce((s,x)=>s+x.merch,0);
  return {rows,totalAttendance,totalMerch,topMarket:rows[0],sellouts:rows.filter(x=>x.sellPct>=98).length};
}

export function buildNMLBGameCanon(data={},teams=[]){
  const map=teamMap(teams); const games=finalGames(data);
  const rows=games.map(g=>{
    const a=map.get(g.awayTeamId),h=map.get(g.homeTeamId); const margin=scoreDiff(g), total=n(g.awayScore)+n(g.homeScore), innings=n(g.inning||g.innings||9);
    const drama=clamp(Math.round(30+(margin<=1?25:margin<=2?14:0)+(g.walkoff?28:0)+(innings>9?Math.min(20,(innings-9)*5):0)+Math.min(18,total)));
    const heartbreak=clamp(Math.round((g.walkoff?30:0)+(margin<=1?18:0)+(innings>9?12:0)+(g.gameType==='playoff'?28:0)));
    const comeback=clamp(Math.round((g.comebackRuns||0)*14+(g.walkoff?15:0)+(margin<=1?8:0)));
    return {game:g,away:a,home:h,drama,heartbreak,comeback,title:`${a?.abbr||'AWY'} ${g.awayScore} – ${h?.abbr||'HME'} ${g.homeScore}`,label:drama>=90?'IMMORTAL':drama>=78?'INSTANT CLASSIC':drama>=65?'MUST REMEMBER':'NOTABLE'};
  });
  return {classics:[...rows].sort((a,b)=>b.drama-a.drama).slice(0,10),heartbreak:[...rows].sort((a,b)=>b.heartbreak-a.heartbreak).slice(0,8),comebacks:[...rows].sort((a,b)=>b.comeback-a.comeback).slice(0,8)};
}

export function buildNMLBFranchiseTrajectory(data={},teams=[]){
  const history=data.seasonHistory||[];
  return teams.map(team=>{
    const seasons=history.map(s=>s.teams?.find(t=>t.id===team.id)).filter(Boolean);
    const recent=[...seasons].slice(-3); const titleCount=history.filter(s=>s.championTeamId===team.id).length;
    const historic=recent.length?recent.reduce((s,t)=>s+pct(t),0)/recent.length:.5; const current=pct(team); const delta=current-historic;
    const state=titleCount>=2&&current>=.6?'DYNASTY':current>=.65?'POWERHOUSE':current>=.56?'CONTENDER':delta>.08?'RISING':current<.4?'REBUILDING':delta<-.08?'DECLINING':'STEADY';
    const legacy=clamp(Math.round(titleCount*18+seasons.reduce((s,t)=>s+pct(t)*5,0)+current*25));
    return {team,state,legacy,titleCount,delta};
  }).sort((a,b)=>b.legacy-a.legacy);
}

export function buildNMLBScheduleStories(data={},teams=[]){
  const v6=buildV6LivingLeague(data,teams,[],Date.now());
  return (v6.travel||[]).map(x=>({team:x.team,kicker:x.currentSide==='road'?'ROAD FILE':'HOME FILE',headline:x.currentSide==='road'?`${x.team.abbr} is living out of a suitcase`:`${x.team.abbr} owns the home calendar`,detail:`${x.tripLabel} · ${x.recentRecord} · ${x.stretchGames||0} games in the current stretch`,importance:(x.stretchGames||0)>=4?'GRIND':(x.stretchGames||0)>=2?'SERIES RHYTHM':'TURNING POINT'})).slice(0,10);
}

export function buildNMLBSpectacle(data={},teams=[],playoffPicture=[]){
  const chases=buildRecordChaseDrama(data,teams); const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now());
  const top=chases[0];
  if(top?.remaining===0)return {tone:'history',kicker:'NMLB HISTORY',headline:`${top.player.name} OWNS THE RECORD`,detail:`${top.current.toLocaleString()} ${top.label.toLowerCase()} — the old mark belongs to history now.`};
  if(top?.remaining<=5)return {tone:'history',kicker:'HISTORY WATCH',headline:`${top.player.name}: ${top.remaining} FROM IMMORTALITY`,detail:`Every appearance now carries record-book weight.`};
  if(v6.aftermath?.[0]?.type==='clinch')return {tone:'clinch',kicker:'POSTSEASON BOUND',headline:`${v6.aftermath[0].team.abbr} HAS PUNCHED ITS TICKET`,detail:v6.aftermath[0].detail||'The city gets to celebrate tonight.'};
  if(v6.chaos.chaos>=85)return {tone:'chaos',kicker:'NMLB CHAOS',headline:'THE LEAGUE HAS LOST THE PLOT',detail:`Chaos ${v6.chaos.chaos}/100 · ${v6.chaos.detail}`};
  return {tone:'league',kicker:'NMLB TODAY',headline:v6.headline||'THE LEAGUE MOVES',detail:v6.hottestTopic||v6.leagueMood};
}


export function buildNMLBSeasonNarrative(data={},teams=[],playoffPicture=[]){
  const games=finalGames(data); const power=buildNMLBPowerIndex(data,teams,playoffPicture); const v6=buildV6LivingLeague(data,teams,playoffPicture,Date.now());
  const avg=teams.length?teams.reduce((s,t)=>s+gp(t),0)/teams.length:0;
  const timeline=[
    {label:'OPENING DAY',done:avg>=1,detail:'Every club started at zero. The first version of the season story appeared.'},
    {label:'FIRST IDENTITY',done:avg>=8,detail:`${power[0]?.team.abbr||'The early leader'} began separating from the pack.`},
    {label:'MIDSEASON',done:avg>=20,detail:`The league reached the midpoint with chaos at ${v6.chaos.chaos}/100.`},
    {label:'PENNANT RACE',done:avg>=30,detail:'Clinch math, elimination pressure and scoreboard watching became daily life.'},
    {label:'POSTSEASON',done:teams.some(t=>['x','w','y','z'].includes(playoffMarker(t,playoffPicture))),detail:'October identities are being written.'},
    {label:'WORLD SERIES',done:Boolean(data.playoffBracket?.finals?.awayTeamId&&data.playoffBracket?.finals?.homeTeamId),detail:'The entire NMLB turns toward one series.'},
  ];
  const era=v6.chaos.chaos>=82?'THE CHAOS SEASON':power[0]?.score>=90?'THE POWERHOUSE YEAR':teams.filter(t=>pct(t)>=.58).length>=7?'THE GREAT PENNANT RACE':v6.namedGames?.length>=5?'THE YEAR OF THE CLASSIC':'THE LIVING LEAGUE YEAR';
  return {era,timeline,progress:clamp(Math.round(avg/40*100)),summary:`${data.activeSeasonName||'This season'} is currently remembered as ${era.toLowerCase()}.`};
}

export function buildNMLBPostseasonTakeover(data={},teams=[],playoffPicture=[]){
  const qualified=teams.filter(t=>['x','w','y','z'].includes(playoffMarker(t,playoffPicture))).map(t=>({team:t,marker:playoffMarker(t,playoffPicture)}));
  const eliminated=teams.filter(t=>playoffMarker(t,playoffPicture)==='e');
  const finals=data.playoffBracket?.finals||{}; const map=teamMap(teams); const a=map.get(finals.awayTeamId),h=map.get(finals.homeTeamId);
  const championId=data.championTeamId||finals.winnerTeamId; const champion=map.get(championId)||null;
  const stage=champion?'CHAMPIONSHIP AFTERMATH':a&&h?'WORLD SERIES TAKEOVER':qualified.length?'POSTSEASON TAKEOVER':'PENNANT RACE BUILDUP';
  const headline=champion?`${champion.abbr} RULES THE NMLB`:a&&h?`${a.abbr} vs ${h.abbr} · FOR THE WORLD SERIES`:qualified.length?`${qualified.length} TICKETS PUNCHED`:'OCTOBER IS GETTING CLOSER';
  return {stage,headline,qualified,eliminated,a,h,champion,paradeReady:Boolean(champion),detail:champion?'Parade day, championship merch, documentaries and the permanent museum now own the aftermath.':a&&h?'Network, fan culture, merch and history all shift into World Series mode.':qualified.length?'Clinches now create league-wide media, retail and fan waves.':'Every remaining result can still reshape the field.'};
}

export function buildNMLBUniverse(data={},teams=[],playoffPicture=[]){
  return {
    power:buildNMLBPowerIndex(data,teams,playoffPicture),
    chases:buildRecordChaseDrama(data,teams),
    network:buildNMLBNetwork(data,teams,playoffPicture),
    documentaries:buildNMLBDocumentaries(data,teams,playoffPicture),
    magazine:buildNMLBMagazine(data,teams,playoffPicture),
    frontPages:buildNMLBFrontPages(data,teams,playoffPicture),
    business:buildNMLBBusiness(data,teams,playoffPicture),
    canon:buildNMLBGameCanon(data,teams),
    trajectory:buildNMLBFranchiseTrajectory(data,teams),
    schedule:buildNMLBScheduleStories(data,teams),
    spectacle:buildNMLBSpectacle(data,teams,playoffPicture),
    narrative:buildNMLBSeasonNarrative(data,teams,playoffPicture),
    postseason:buildNMLBPostseasonTakeover(data,teams,playoffPicture),
    records:buildLeagueRecords(data.seasonHistory||[],teams),
  };
}
