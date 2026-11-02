import { buildV4TeamMetrics, personalityForMetric } from './v4Utils';
import { buildHeadToHead } from './historyUtils';
import { getPostseasonStatus } from './standingsUtils';

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
  const price=(seed,min,max)=>Math.round(min+seeded(seed)*(max-min));
  const stock=(seed,min=18,max=240)=>Math.round(min+seeded(`stock-${seed}`)*(max-min));
  const leagueTeam={id:'league-store',abbr:'NMLB',city:"Nicky's Major League",name:'Baseball'};
  const leaguePalette={main:'#1f0554',alt:'#ffffff',border:'#000000',text:'#ffffff'};
  const teamStateById=new Map(teamStates.map(x=>[x.team.id,x]));
  const leagueHeat=teamStates.length?teamStates.reduce((sum,x)=>sum+(Number(x.marketHeat)||50),0)/teamStates.length:50;
  const scopeMultiplier={team:1,league:1.12,meme:1.7,postseason:4.2,championship:2.35,archive:.82};
  const typeBase={CAP:52,JERSEY:38,HOODIE:31,JACKET:18,TEE:44,SOCKS:26,PENNANT:21,BALL:24,'SIGNED BALL':9,RING:7,FRAME:6,PLUSH:22};
  const salesFor=(x)=>{
    const state=teamStateById.get(x.team?.id);
    const team=x.team||{};
    const gp=(Number(team.wins)||0)+(Number(team.losses)||0);
    const pct=gp?Number(team.wins||0)/gp:.5;
    const streakText=String(team.streak||'');
    const streakN=Number(streakText.replace(/\D/g,''))||0;
    const streakBoost=streakText.startsWith('W')?Math.min(28,streakN*5):streakText.startsWith('L')?-Math.min(24,streakN*5):0;
    const heat=state?Number(state.marketHeat)||50:leagueHeat;
    const hype=state?Number(state.hype)||50:50;
    const demand=Math.max(12,Math.min(100,Math.round(48+(pct-.5)*95+(heat-50)*.38+(hype-50)*.24+streakBoost)));
    const base=typeBase[String(x.type||'TEE').toUpperCase()]||28;
    const scope=scopeMultiplier[x.scope]||1;
    const seasonal=x.scope==='postseason'?1.4:x.scope==='championship'?1.18:x.scope==='meme'?1.25:1;
    const variance=.82+seeded(`${x.id}-sales`)*.36;
    const sales7d=Math.max(1,Math.round(base*(.55+demand/58)*scope*seasonal*variance));
    const salesToday=Math.max(0,Math.round(sales7d*(.11+seeded(`${x.id}-today`)*.11)));
    const rawTrend=Math.round((demand-50)*1.45+streakBoost*1.7+(x.scope==='postseason'?85:0)+(x.scope==='championship'?32:0)+(x.scope==='meme'?22:0));
    const trendPct=Math.max(-72,Math.min(260,rawTrend));
    const demandLabel=demand>=86?'WHITE HOT':demand>=72?'SURGING':demand>=58?'STRONG':demand>=44?'STEADY':demand>=30?'COOLING':'COLD';
    return {demand,sales7d,salesToday,trendPct,demandLabel,weeklyRevenue:sales7d*Number(x.price||0)};
  };
  const add=(x)=>products.push({rating:(4.5+seeded(x.id)*.5).toFixed(1),reviews:Math.round(14+seeded(`${x.id}-reviews`)*980),stock:stock(x.id),...x,...salesFor(x)});

  teamStates.forEach(x=>{
    const t=x.team, hot=x.marketHeat>=70;
    const streakN=Number(String(t.streak||'').replace(/\D/g,''))||0;
    [
      ['CAP',`${t.abbr} Authentic On-Field 59FIFTY`,hot?'TRENDING NOW':'AUTHENTIC COLLECTION',34,48,'ON-FIELD','team','Pro-cut crown with raised team mark and contrast underbrim.'],
      ['JERSEY',`${t.abbr} Home Authentic Jersey`,x.hype>=75?'BEST SELLER':'AUTHENTIC COLLECTION',104,149,'AUTHENTIC','team','Full-button home jersey with stitched chest mark, sleeve trim and player-ready detailing.'],
      ['SOCKS',`${t.abbr} Stirrups & Game Socks`, 'BALLPARK CLASSIC',22,34,'GAME DAY','team','Throwback stirrup profile with team-color stripe package.'],
      ['PENNANT',`${t.abbr} Heritage Wool Pennant`,'HERITAGE WALL',24,38,'HERITAGE','team','Heavy felt pennant with stitched-look lettering and vintage ballpark proportions.'],
      ['PLUSH',`${t.abbr} Ballpark Buddy Plush`,'FAMILY FAVORITE',28,44,'BALLPARK','team','Soft mascot-inspired clubhouse plush wearing a tiny team cap.'],
      ['JACKET',`${t.abbr} Dugout Bomber Jacket`,hot?'HOT ITEM':'DUGOUT COLLECTION',96,148,'DUGOUT','team','Satin-look dugout jacket with ribbed collar, snap front and embroidered chest mark.'],
      ['HOODIE',`${t.abbr} Heavyweight Clubhouse Hoodie`,'COLD WEATHER',58,84,'CLUBHOUSE','team','Heavy fleece pullover with oversized stitched crest and sleeve hit.'],
      ['BALL',`${t.abbr} Official Logo Baseball`,'DESK & SHELF',18,29,'OFFICIAL','team','Display baseball with team stamp, red seams and acrylic-style presentation stand.'],
    ].forEach(([type,name,tag,lo,hi,edition,scope,description])=>add({id:`${t.id}-${type.toLowerCase()}`,team:t,type,name,tag,price:price(`${t.id}-${type}`,lo,hi),edition,scope,collection:'TEAM SHOP',description,rarity:'CORE'}));
    if(streakN>=3&&String(t.streak||'').startsWith('W')) add({id:`${t.id}-streak`,team:t,type:'TEE',name:`${t.abbr} ${t.streak} “KEEP IT ROLLING” Tee`,tag:'48 HOUR DROP',price:price(`${t.id}-streak`,29,39),edition:'LIMITED',scope:'meme',collection:'MEME DROP',memeText:'KEEP IT ROLLING',memeSub:`${t.streak} AND COUNTING`,description:`A blink-and-you-miss-it shirt celebrating the current ${t.streak} heater.`,rarity:'LIMITED',stock:stock(`${t.id}-streak`,8,64)});
    if(x.approval<38) add({id:`${t.id}-pain`,team:t,type:'TEE',name:`${t.abbr} “I SURVIVED THIS WEEK” Tee`,tag:'FAN THERAPY',price:32,edition:'MEME',scope:'meme',collection:'MEME DROP',memeText:'I SURVIVED THIS WEEK',memeSub:`${t.abbr} BASEBALL`,description:'For the fanbase that has seen enough and will absolutely be back tomorrow.',rarity:'LIMITED'});

    const pic=playoffPicture.find(p=>p.league===t.league);
    const ps=pic?getPostseasonStatus(t,pic):null;
    if(['z','y','w','x'].includes(ps?.marker)){
      add({id:`${t.id}-post-cap`,team:t,type:'CAP',name:`${t.abbr} Postseason Locker Room Cap`,tag:'POSTSEASON',price:42,edition:ps.marker==='z'?'#1 SEED':ps.marker==='y'?'DIVISION CHAMPS':ps.marker==='w'?'WILD CARD':'PLAYOFFS',scope:'postseason',collection:'POSTSEASON',description:'October-style cap with metallic postseason side patch and locker-room color treatment.',rarity:'SEASONAL',stock:stock(`${t.id}-post-cap`,20,110)});
      add({id:`${t.id}-post-hoodie`,team:t,type:'HOODIE',name:`${t.abbr} Postseason Bound Hoodie`,tag:'OCTOBER COLLECTION',price:72,edition:'POSTSEASON',scope:'postseason',collection:'POSTSEASON',description:'Heavyweight postseason hoodie made for nervous scoreboard watching.',rarity:'SEASONAL'});
    }
  });

  // League-wide house brand.
  [
    ['CAP','NMLB Authentic League Cap','LEAGUE ESSENTIAL',38,'NMLB'],
    ['JERSEY','NMLB League Jersey','LEAGUE COLLECTION',96,'NMLB'],
    ['HOODIE','NMLB Heavyweight Clubhouse Hoodie','LEAGUE ESSENTIAL',72,'NMLB'],
    ['PENNANT','NMLB League Pennant','LEAGUE OFFICE',32,'NMLB'],
    ['BALL','Official NMLB League Baseball','OFFICIAL BALL',26,'NMLB'],
    ['JACKET','NMLB Commissioner Jacket','PREMIUM',128,'NMLB'],
  ].forEach(([type,name,tag,pr,edition])=>add({id:`league-${type.toLowerCase()}`,team:leagueTeam,palette:leaguePalette,type,name,tag,price:pr,edition,scope:'league',collection:'LEAGUE SHOP',description:"Official NMLB league issue in royal purple, white and black.",rarity:type==='JACKET'?'PREMIUM':'CORE'}));

  // Championship archive: every archived champion gets a season-specific vault capsule.
  (data.seasonHistory||[]).forEach((season,index)=>{
    const bracket=season?.playoffBracket||{};
    const champId=season?.championTeamId||bracket?.finals?.winnerTeamId;
    const champ=(season?.teams||[]).find(t=>t.id===champId)||teams.find(t=>t.id===champId);
    if(!champ)return;
    const seasonName=season?.name||`Season ${index+1}`;
    const shortSeason=seasonName.replace(/^Season\s*/i,'S');
    const vault=[
      ['CAP',`${champ.abbr} ${seasonName} World Champions Cap`,46,'CHAMPIONS LOCKER ROOM'],
      ['JACKET',`${champ.abbr} ${seasonName} Champions Satin Jacket`,154,'CHAMPIONS VAULT'],
      ['PENNANT',`${champ.abbr} ${seasonName} World Champions Pennant`,38,'CHAMPIONS VAULT'],
      ['BALL',`${champ.abbr} ${seasonName} Commemorative Championship Baseball`,42,'COMMEMORATIVE'],
      ['RING',`${champ.abbr} ${seasonName} Replica Championship Ring`,189,'COLLECTOR SERIES'],
      ['FRAME',`${champ.abbr} ${seasonName} Champions Newspaper Shadowbox`,219,'ARCHIVE EDITION'],
    ];
    vault.forEach(([type,name,pr,edition],i)=>add({id:`champ-${index}-${champ.id}-${type}`,team:champ,type,name,tag:i<2?'WORLD SERIES CHAMPIONS':'CHAMPIONS ARCHIVE',price:pr,edition,scope:'championship',collection:'CHAMPIONS VAULT',season:seasonName,seasonCode:shortSeason,championshipLabel:'WORLD CHAMPIONS',pennantLabel:'WS CHAMPS',description:`Official-looking commemorative piece honoring ${champ.abbr}'s ${seasonName} championship run.`,rarity:i>=4?'NUMBERED':'ARCHIVE',stock:stock(`champ-${index}-${type}`,i>=4?4:12,i>=4?40:120)}));

    const leagueChamps=[['AL', bracket?.al?.lc?.winnerTeamId], ['NL', bracket?.nl?.lc?.winnerTeamId]];
    leagueChamps.forEach(([league,teamId])=>{
      const lc=(season?.teams||[]).find(t=>t.id===teamId)||teams.find(t=>t.id===teamId);
      if(!lc||lc.id===champ.id)return;
      add({id:`leaguechamp-${index}-${league}-${lc.id}-pennant`,team:lc,type:'PENNANT',name:`${lc.abbr} ${seasonName} ${league} Champions Pennant`,tag:`${league} CHAMPIONS`,price:34,edition:'LEAGUE CHAMPIONS',scope:'championship',collection:'CHAMPIONS VAULT',season:seasonName,seasonCode:shortSeason,championshipLabel:`${league} CHAMPIONS`,pennantLabel:`${league} CHAMPS`,description:`League-championship felt pennant celebrating ${lc.abbr}'s ${seasonName} ${league} pennant.`,rarity:'ARCHIVE',stock:stock(`leaguechamp-${index}-${league}-${lc.id}`,18,120)});
      add({id:`leaguechamp-${index}-${league}-${lc.id}-tee`,team:lc,type:'TEE',name:`${lc.abbr} ${seasonName} ${league} Champions Tee`,tag:`${league} CHAMPIONS`,price:38,edition:'LEAGUE CHAMPIONS',scope:'championship',collection:'CHAMPIONS VAULT',season:seasonName,seasonCode:shortSeason,championshipLabel:`${league} CHAMPIONS`,memeText:`${league} CHAMPIONS`,memeSub:seasonName.toUpperCase(),description:`Team-color league championship tee honoring the road to the World Series.`,rarity:'ARCHIVE',stock:stock(`leaguechamptee-${index}-${league}-${lc.id}`,20,140)});
    });
  });

  (data.leagueExtras?.retiredNumbers||[]).forEach(x=>{const team=teams.find(t=>t.abbr===x.teamAbbr);if(team){
    add({id:`ret-${x.id}`,team,type:'FRAME',name:`${x.name} ${x.title} Retirement Shadowbox`,tag:'LEGENDS COLLECTION',price:185,edition:'RETIREMENT',scope:'archive',collection:'LEGENDS & ARCHIVE',description:'Framed retirement-night display with plaque, signature panel and team-color matting.',rarity:'NUMBERED',stock:stock(`ret-${x.id}`,6,48)});
    add({id:`ret-ball-${x.id}`,team,type:'SIGNED BALL',name:`${x.name} Commemorative Signed Baseball`,tag:'LEGENDS COLLECTION',price:135,edition:'SIGNATURE',scope:'archive',collection:'LEGENDS & ARCHIVE',description:'Display ball celebrating a permanent place in franchise history.',rarity:'COLLECTOR'});
  }});

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
