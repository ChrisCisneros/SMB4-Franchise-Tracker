import { getSeasonPulse, buildFanUniverse } from './fandomUtils';
import { getCurrentGameNight } from './gameNightUtils';

const safe=n=>Number(n||0);
const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const seeded=s=>{const x=Math.sin(hash(String(s)))*10000;return x-Math.floor(x)};
const pick=(arr,key)=>arr?.length?arr[Math.floor(seeded(key)*arr.length)%arr.length]:null;
const fmtMoney=n=>`$${Math.max(4,Math.round(n))}`;

const BUSINESS_TYPES=[
  ['Dugout Pizza','Pizza & watch parties'],['Ninth Inning Pub','Sports bar'],['Diamond Cards','Cards & memorabilia'],
  ['Rally Grill','Game-day food'],['Clubhouse Coffee','Pregame coffee'],['The Pennant Shop','Vintage baseball goods']
];

export function buildBallparkCulture(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  return teamStates.map((s,i)=>{
    const loud=Math.round(Math.min(100,30+s.hype*.35+s.marketHeat*.3+s.history.playoffs*5));
    const friendly=Math.round(38+seeded(`${s.team.id}-friendly`)*52);
    const food=Math.round(48+seeded(`${s.team.id}-food`)*47);
    const identity=s.history.titles>=2?'Title Town':s.history.playoffs>=2?'October City':loud>76?'Baseball-Crazy':s.approval<38?'Long-Suffering':'Loyal Locals';
    return {team:s.team,loud,friendly,food,identity,atmosphere:s.atmosphere,loyalty:Math.round(Math.min(100,45+s.history.playoffs*6+s.history.titles*10+(100-s.bandwagon)*.2))};
  });
}

export function buildLocalBusinesses(teams=[]){
  return teams.flatMap((team,ti)=>Array.from({length:2},(_,i)=>{
    const [base,type]=BUSINESS_TYPES[(hash(team.id)+i)%BUSINESS_TYPES.length];
    return {id:`biz-${team.id}-${i}`,team,name:`${team.city||team.abbr} ${base}`,handle:`@${team.abbr}${base.replace(/\W/g,'')}`,type,
      text:pick([
        `${team.abbr} wins tonight and tomorrow's special gets a little sweeter.`,
        `Game-day crowd is rolling in. Jerseys everywhere. We love this time of year.`,
        `Showing the game all night. First pitch to final out.`,
        `New ${team.abbr} memorabilia hit the wall this morning. Come argue about which season was best.`
      ],`${team.id}-${i}`)};
  }));
}

export function buildGiveawayMarket(data={},teams=[]){
  const schedule=data.leagueExtras?.gameNightSchedule||{};
  const current=Object.values(schedule).filter(Boolean).map(p=>({...p,seasonName:data.activeSeasonName||'Current Season',archived:false}));
  const archived=(data.games||[]).filter(g=>g?.promotion).map(g=>({...g.promotion,gameNumber:g.seasonGameNumber||g.promotion?.gameNumber,seasonName:g.seasonName||'Archived Season',archived:true,playedAt:g.finalizedAt||g.date||''}));
  const unique=new Map();
  [...archived,...current].forEach((promo,i)=>{
    const key=`${promo.seasonName}-${promo.gameNumber}-${promo.id||promo.name}`;
    if(!unique.has(key))unique.set(key,promo);
  });
  return [...unique.values()].map((promo,i)=>{
    const base=promo.type==='giveaway'?18:9;
    const ageBoost=promo.archived?8+Math.min(18,(data.seasonHistory||[]).length*3):0;
    const demand=safe(promo.hype)*5+safe(promo.attendance)*4+seeded(`${promo.id}-${promo.gameNumber}-${promo.seasonName}`)*35+ageBoost;
    const value=base+demand*1.4;
    const scarcity=demand>72?'COLLECTOR':demand>52?'HOT':demand>32?'LIMITED':'COMMON';
    return {...promo,marketValue:fmtMoney(value),scarcity,listings:Math.max(4,Math.round(10+seeded(`list-${promo.gameNumber}-${promo.seasonName}`)*70))};
  }).sort((a,b)=>(b.archived?1:0)-(a.archived?1:0)||safe(b.hype)+safe(b.attendance)-safe(a.hype)-safe(a.attendance));
}

export function buildWorldState(data={},teams=[],playoffPicture=[],now=Date.now()){
  const pulse=getSeasonPulse(data,teams);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const promo=getCurrentGameNight(data,teams);
  const top=[...universe.teamStates].sort((a,b)=>(b.hype+b.marketHeat)-(a.hype+a.marketHeat))[0];
  const rival=universe.rivalries?.[0];
  const bucket=Math.floor(now/60000);
  const moments=(data.leagueExtras?.worldMoments||[]).slice(0,2).map(x=>({type:x.type||'WORLD MOMENT',icon:x.icon||'✨',title:x.title||'League moment',detail:x.detail||''}));
  if(promo)moments.push({type:'PROMOTION',icon:promo.icon||'🎟️',title:promo.name,detail:promo.giveaway||'Special game-day event'});
  if(top)moments.push({type:'FAN HEAT',icon:'🔥',title:`${top.team.abbr} is driving the conversation`,detail:`${top.mood} fanbase · ${Math.round(top.hype)} hype`});
  if(rival?.teamA&&rival?.teamB)moments.push({type:'RIVALRY',icon:'⚔️',title:`${rival.teamA.abbr} / ${rival.teamB.abbr}`,detail:`Rivalry heat ${Math.round(rival.heat||0)}`});
  const extras=[
    {type:'AROUND THE PARK',icon:'🌭',title:'Concourse chatter is picking up',detail:'Food, merch and seat-section debates are alive.'},
    {type:'SOCIAL',icon:'#',title:`#Week${pulse.week}Baseball`,detail:`Week ${pulse.week} · Day ${pulse.dayInWeek} of 5`},
    {type:'CULTURE',icon:'📻',title:'Call-in lines are open',detail:'Reasonable baseball opinions remain optional.'}
  ];
  moments.push(extras[bucket%extras.length]);
  return {pulse,leagueMood:universe.leagueMood,promo,top,rival,moments,trending:[`#Week${pulse.week}Baseball`,top?`#${top.team.abbr}Baseball`:null,rival?`#${rival.teamA?.abbr}vs${rival.teamB?.abbr}`:null].filter(Boolean)};
}

export function buildCultureAwards(data={},teams=[],playoffPicture=[]){
  const culture=buildBallparkCulture(data,teams,playoffPicture);
  const top=(key)=>[...culture].sort((a,b)=>b[key]-a[key])[0];
  return [
    {award:'Loudest Crowd',winner:top('loud'),value:`${top('loud')?.loud||0}/100`},
    {award:'Most Loyal',winner:top('loyalty'),value:`${top('loyalty')?.loyalty||0}/100`},
    {award:'Best Ballpark Food Buzz',winner:top('food'),value:`${top('food')?.food||0}/100`},
    {award:'Friendliest Park',winner:top('friendly'),value:`${top('friendly')?.friendly||0}/100`},
  ];
}

export function buildTeamCultureProfiles(data={},teams=[],playoffPicture=[]){
  const {teamStates,rivalries}=buildFanUniverse(data,teams,playoffPicture);
  const players=data.players||[];
  return teamStates.map(state=>{
    const team=state.team;
    const rs=(rivalries||[]).filter(r=>r.teamA?.id===team.id||r.teamB?.id===team.id).sort((a,b)=>safe(b.heat)-safe(a.heat));
    const hottest=rs[0]||null;
    const foe=hottest?(hottest.teamA?.id===team.id?hottest.teamB:hottest.teamA):null;
    const teamPlayers=players.filter(p=>p.teamId===team.id);
    const hero=[...teamPlayers].sort((a,b)=>(safe(b.seasonHR)*4+safe(b.seasonHits)+safe(b.seasonWins)*5)-(safe(a.seasonHR)*4+safe(a.seasonHits)+safe(a.seasonWins)*5))[0]||null;
    const rivalPlayers=foe?players.filter(p=>p.teamId===foe.id):[];
    const villain=[...rivalPlayers].sort((a,b)=>(safe(b.seasonHR)*4+safe(b.seasonHits)+safe(b.seasonWins)*5)-(safe(a.seasonHR)*4+safe(a.seasonHits)+safe(a.seasonWins)*5))[0]||null;
    return {team,identity:state.history.titles>=2?'Championship Standard':state.history.playoffs>=2?'October Hungry':state.approval<36?'Long-Suffering Faithful':state.marketHeat>70?'Baseball-Crazy Town':'Loyal Locals',favoriteOpponent:foe,hatedOpponent:foe,rivalry:hottest,hero,villain,bandwagon:state.bandwagon,mood:state.mood,hype:state.hype};
  });
}

export function buildTicketMarket(data={},teams=[],playoffPicture=[]){
  const {teamStates,rivalries}=buildFanUniverse(data,teams,playoffPicture);
  const current=data.currentGame||{};
  const promo=getCurrentGameNight(data,teams);
  return teamStates.map(state=>{
    const home=state.team;
    const rivalry=(rivalries||[]).find(r=>(r.teamA?.id===home.id||r.teamB?.id===home.id)&&safe(r.heat)>25);
    let demand=30+state.marketHeat*.32+state.hype*.25+safe(rivalry?.heat)*.15+safe(promo?.attendance)*1.2;
    if(current.homeTeamId===home.id&&current.gameType==='playoff')demand+=24;
    demand=Math.round(Math.min(100,demand));
    const visiting=current.homeTeamId===home.id?teams.find(t=>t.id===current.awayTeamId):null;
    const roadInvasion=visiting?Math.round(Math.min(100,20+(teams.find(t=>t.id===visiting.id)?.wins||0)*1.4+seeded(`${home.id}-${visiting.id}`)*28)):0;
    const selloutStreak=demand>=78?Math.max(1,Math.round((demand-70)/4)):0;
    return {team:home,demand,roadInvasion,selloutStreak,label:demand>=88?'SCORCHING':demand>=72?'HIGH':demand>=52?'HEALTHY':demand>=35?'SOFT':'LOW'};
  });
}

export function buildSocialGrowth(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  return teamStates.map(s=>{
    const base=3500+(hash(s.team.id)%17000);
    const followers=Math.round(base*(.75+s.marketHeat/100+s.hype/180));
    const weekly=Math.round((s.hype-45)*18+(s.momentum||50)*9);
    return {team:s.team,followers,weekly,viralScore:Math.round(Math.min(100,s.hype*.55+s.marketHeat*.35+(s.history.titles||0)*8)),reputation:s.history.titles?'ESTABLISHED':s.hype>70?'TRENDING':s.approval<35?'CHAOS ACCOUNT':'GROWING'};
  }).sort((a,b)=>b.followers-a.followers);
}

export function buildFanSurvey(data={},teams=[],playoffPicture=[]){
  const culture=buildBallparkCulture(data,teams,playoffPicture);
  const {teamStates,rivalries}=buildFanUniverse(data,teams,playoffPicture);
  const by=(key)=>[...culture].sort((a,b)=>b[key]-a[key])[0];
  const hot=[...teamStates].sort((a,b)=>b.hype-a.hype)[0];
  const chaos=[...teamStates].sort((a,b)=>b.bandwagon-a.bandwagon)[0];
  const rival=[...(rivalries||[])].sort((a,b)=>safe(b.heat)-safe(a.heat))[0];
  return [
    {q:'Favorite Ballpark Atmosphere',winner:by('loud')?.team?.abbr||'—',detail:'Fan-voted simulated atmosphere'},
    {q:'Best Food Buzz',winner:by('food')?.team?.abbr||'—',detail:'Concourse reputation'},
    {q:'Most Loyal Fanbase',winner:by('loyalty')?.team?.abbr||'—',detail:'History + loyalty model'},
    {q:'Hottest Team Online',winner:hot?.team?.abbr||'—',detail:'Current hype leader'},
    {q:'Most Chaotic Fanbase',winner:chaos?.team?.abbr||'—',detail:'Bandwagon/volatility index'},
    {q:'Best Rivalry',winner:rival?`${rival.teamA?.abbr}/${rival.teamB?.abbr}`:'—',detail:rival?`${Math.round(rival.heat||0)} rivalry heat`:'Waiting for history'},
  ];
}

export function buildCultureTrends(data={},teams=[],playoffPicture=[]){
  const profiles=buildTeamCultureProfiles(data,teams,playoffPicture);
  const world=buildWorldState(data,teams,playoffPicture,Date.now());
  const top=[...profiles].sort((a,b)=>b.hype-a.hype)[0];
  const low=[...profiles].sort((a,b)=>a.hype-b.hype)[0];
  return [
    top&&{tag:`#${top.team.abbr}HeatCheck`,status:'RISING',detail:`${top.team.abbr} hype is driving league chatter.`},
    world.rival&&{tag:`#${world.rival.teamA?.abbr}vs${world.rival.teamB?.abbr}`,status:'HOT',detail:'Rivalry posts are spilling into neutral feeds.'},
    low&&{tag:`#KeepTheFaith${low.team.abbr}`,status:'NICHE',detail:`Diehards are keeping the ${low.team.abbr} timeline alive.`},
    {tag:`#Week${world.pulse.week}Baseball`,status:'ACTIVE',detail:`The league is in ${world.pulse.phase}.`}
  ].filter(Boolean);
}

export function buildGameThreadArchive(data={},teams=[]){
  const map=new Map(teams.map(t=>[t.id,t]));
  return (data.games||[]).filter(g=>g?.status==='Final').slice().reverse().slice(0,12).map((g,i)=>{
    const away=map.get(g.awayTeamId),home=map.get(g.homeTeamId);
    const diff=Math.abs(safe(g.awayScore)-safe(g.homeScore));
    const drama=(g.walkoff?45:0)+(safe(g.inning)>9?25:0)+(diff<=1?18:diff<=2?8:0)+(safe(g.awayScore)+safe(g.homeScore)>=15?10:0);
    const peak=Math.round(5000+drama*420+seeded(g.id||`${i}`)*12000);
    return {id:g.id||`thread-${i}`,away,home,score:`${away?.abbr||'AWY'} ${g.awayScore} – ${home?.abbr||'HME'} ${g.homeScore}`,label:g.walkoff?'WALK-OFF THREAD':safe(g.inning)>9?'EXTRA-INNING THREAD':drama>=28?'INSTANT-CLASSIC THREAD':'GAME THREAD',peak,drama};
  });
}

export function buildAnalystRecords(data={},teams=[]){
  const analysts=[
    {id:'maya',name:'Maya Cruz',style:'numbers'},
    {id:'tommy',name:'Tommy Lane',style:'momentum'},
    {id:'rico',name:'Rico Hayes',style:'history'},
    {id:'cole',name:'Cole Briggs',style:'hot-take'},
  ];
  const teamMap=new Map(teams.map(t=>[t.id,t]));
  const finals=(data.games||[]).filter(g=>g?.status==='Final'&&g.awayTeamId&&g.homeTeamId);
  return analysts.map(a=>{
    let wins=0,losses=0;
    const receipts=[];
    finals.forEach(g=>{
      const away=teamMap.get(g.awayTeamId),home=teamMap.get(g.homeTeamId);if(!away||!home)return;
      const lean=seeded(`${a.id}-${g.id||g.finalizedAt||g.date}`);
      let pickTeam=lean<.5?away:home;
      if(a.style==='numbers')pickTeam=(safe(away.runDiff)>=safe(home.runDiff)?away:home);
      if(a.style==='momentum')pickTeam=(String(away.streak||'').startsWith('W')&&!String(home.streak||'').startsWith('W'))?away:(String(home.streak||'').startsWith('W')&&!String(away.streak||'').startsWith('W'))?home:pickTeam;
      const winnerId=g.winnerTeamId||(safe(g.awayScore)>safe(g.homeScore)?g.awayTeamId:g.homeTeamId);
      const hit=pickTeam.id===winnerId; if(hit)wins++; else losses++;
      if(receipts.length<5)receipts.push({gameId:g.id,pick:pickTeam.abbr,winner:teamMap.get(winnerId)?.abbr||'—',hit,score:`${away.abbr} ${g.awayScore} – ${home.abbr} ${g.homeScore}`});
    });
    return {...a,wins,losses,pct:wins+losses?wins/(wins+losses):0,receipts};
  }).sort((a,b)=>b.pct-a.pct||b.wins-a.wins);
}

export function buildCultureDebates(data={},teams=[],playoffPicture=[]){
  if(!teams.length)return [];
  const sorted=[...teams].sort((a,b)=>safe(b.wins)/(safe(b.wins)+safe(b.losses)||1)-safe(a.wins)/(safe(a.wins)+safe(a.losses)||1));
  const rd=[...teams].sort((a,b)=>safe(b.runDiff)-safe(a.runDiff));
  const profiles=buildTeamCultureProfiles(data,teams,playoffPicture);
  const rival=[...profiles].filter(x=>x.rivalry).sort((a,b)=>safe(b.rivalry?.heat)-safe(a.rivalry?.heat))[0];
  const hype=[...profiles].sort((a,b)=>safe(b.hype)-safe(a.hype))[0];
  const out=[];
  if(sorted[0]&&rd[0]&&sorted[0].id!==rd[0].id)out.push({topic:'POWER-RANKING ARGUMENT',title:`Who is actually better: ${sorted[0].abbr} or ${rd[0].abbr}?`,detail:`${sorted[0].abbr} owns the record; ${rd[0].abbr} owns the run-differential case.`});
  if(rival?.rivalry){const foe=rival.hatedOpponent;out.push({topic:'RIVALRY DEBATE',title:`Does ${rival.team.abbr}-${foe?.abbr||'???'} deserve a rivalry name yet?`,detail:`${Math.round(rival.rivalry.heat||0)} heat across ${rival.rivalry.games||0} recorded meetings.`});}
  if(hype)out.push({topic:'CONTENDER OR HYPE?',title:`Are you buying the ${hype.team.abbr} buzz?`,detail:`Fan hype is ${Math.round(hype.hype||0)}/100. The timeline has opinions.`});
  const bubble=(playoffPicture||[]).find(x=>x.rank===8)||(playoffPicture||[])[7];
  if(bubble?.team)out.push({topic:'PLAYOFF FORMAT',title:`Is ${bubble.team.abbr} really the line between October and home?`,detail:'Bubble-team discourse has officially entered the chat.'});
  return out.slice(0,4);
}
